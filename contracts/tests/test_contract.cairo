use openzeppelin_token::erc20::interface::IERC20DispatcherTrait;
use contracts::drm::{
    IDigitalRightsManagementDispatcher, IDigitalRightsManagementDispatcherTrait,
    IDigitalRightsManagementSafeDispatcher,
    LicenseType,
};
use snforge_std::{
    ContractClassTrait, DeclareResultTrait, declare, start_cheat_caller_address,
    stop_cheat_caller_address,
};
use starknet::ContractAddress;
use openzeppelin_token::erc20::interface::IERC20Dispatcher;

// Test constants
fn OWNER() -> ContractAddress {
    'OWNER'.try_into().unwrap()
}

fn CREATOR() -> ContractAddress {
    'CREATOR'.try_into().unwrap()
}

fn USER() -> ContractAddress {
    'USER'.try_into().unwrap()
}

fn OTHER_USER() -> ContractAddress {
    'OTHER_USER'.try_into().unwrap()
}

fn PAYMENT_TOKEN() -> ContractAddress {
    'PAYMENT_TOKEN'.try_into().unwrap()
}

fn NEW_OWNER() -> ContractAddress {
    'NEW_OWNER'.try_into().unwrap()
}

const ONE_MONTH_SECONDS: u64 = 30 * 24 * 60 * 60;

fn __deploy__() -> (IDigitalRightsManagementDispatcher, IDigitalRightsManagementSafeDispatcher) {
    let contract_class = declare("DRMContract").expect('failed to declare').contract_class();

    let mut calldata: Array<felt252> = array![];
    PAYMENT_TOKEN().serialize(ref calldata);
    OWNER().serialize(ref calldata);

    let (contract_address, _) = contract_class.deploy(@calldata).expect('failed to deploy');

    let drm = IDigitalRightsManagementDispatcher { contract_address };
    let safe_dispatcher = IDigitalRightsManagementSafeDispatcher { contract_address };
    (drm, safe_dispatcher)
}

// Setup helper function
fn setup_content(drm: IDigitalRightsManagementDispatcher) -> u64 {
    start_cheat_caller_address(drm.contract_address, CREATOR());
    let content_id = drm.upload_content('Test Content', 'ipfs_hash_123');
    drm.set_license_price(content_id, LicenseType::OneMonth, 100);
    stop_cheat_caller_address(drm.contract_address);
    content_id
}

// ========== DEPLOYMENT TESTS ==========

#[test]
fn test_drm_deployment() {
    let (drm, _) = __deploy__();

    let (creator_percentage, platform_percentage) = drm.get_royalty_rates();
    let platform_balance = drm.get_platform_royalties_balance();

    assert!(creator_percentage == 90_u8, "creator percentage not set");
    assert!(platform_percentage == 10_u8, "platform percentage not set");
    assert!(platform_balance == 0_u256, "platform balance should be 0");
}


// ========== CONTENT MANAGEMENT TESTS ==========

#[test]
fn test_upload_content() {
    let (drm, _) = __deploy__();

    start_cheat_caller_address(drm.contract_address, CREATOR());
    let content_id = drm.upload_content('Test Content', 'ipfs_hash_123');
    stop_cheat_caller_address(drm.contract_address);

    assert!(content_id == 1_u64, "content id should be 1");

    let (id, title, ipfs_hash, creator, timestamp) = drm.get_content_details(content_id);
    assert!(id == 1_u64, "content id mismatch");
    assert!(title == 'Test Content', "title mismatch");
    assert!(ipfs_hash == 'ipfs_hash_123', "ipfs hash mismatch");
    assert!(creator == CREATOR(), "creator mismatch");
    assert!(timestamp > 0_u64, "timestamp should be set");
}

#[test]
#[should_panic(expected: ('Content does not exist',))]
fn test_get_nonexistent_content() {
    let (drm, _) = __deploy__();
    drm.get_content_details(999_u64);
}

// ========== LICENSE MANAGEMENT TESTS ==========

#[test]
fn test_set_license_price() {
    let (drm, _) = __deploy__();
    let content_id = setup_content(drm);

    let price = drm.get_license_price(content_id, LicenseType::OneMonth);
    assert!(price == 100_u32, "price should be 100");
}


#[test]
#[should_panic(expected: ('Only creator can set price',))]
fn test_set_license_price_non_creator() {
    let (drm, _) = __deploy__();
    let content_id = setup_content(drm);

    start_cheat_caller_address(drm.contract_address, USER());
    drm.set_license_price(content_id, LicenseType::OneMonth, 100);
    stop_cheat_caller_address(drm.contract_address);
}

#[test]
fn test_issue_license() {
    let (drm, _) = __deploy__();
    let content_id = setup_content(drm);

    // Setup payment token balance
    let erc20 = IERC20Dispatcher { contract_address: PAYMENT_TOKEN() };
    start_cheat_caller_address(PAYMENT_TOKEN(), OWNER());
    erc20.transfer(USER(), 1000);
    stop_cheat_caller_address(PAYMENT_TOKEN());

    start_cheat_caller_address(drm.contract_address, USER());
    let license_id = drm.issue_license(content_id, LicenseType::OneMonth);
    stop_cheat_caller_address(drm.contract_address);

    assert!(license_id == 1_u64, "license id should be 1");
}

#[test]
fn test_revoke_license() {
    let (drm, _) = __deploy__();
    let content_id = setup_content(drm);

    // Issue license first
    start_cheat_caller_address(drm.contract_address, USER());
    let license_id = drm.issue_license(content_id, LicenseType::OneMonth);
    stop_cheat_caller_address(drm.contract_address);

    // Revoke license
    start_cheat_caller_address(drm.contract_address, CREATOR());
    let success = drm.revoke_license(license_id, USER());
    stop_cheat_caller_address(drm.contract_address);

    assert!(success, "license revocation should succeed");
}

#[test]
fn test_renew_license() {
    let (drm, _) = __deploy__();
    let content_id = setup_content(drm);

    // Issue license first
    start_cheat_caller_address(drm.contract_address, USER());
    let license_id = drm.issue_license(content_id, LicenseType::OneMonth);
    stop_cheat_caller_address(drm.contract_address);

    // Renew license
    start_cheat_caller_address(drm.contract_address, USER());
    let success = drm.renew_license(license_id, ONE_MONTH_SECONDS);
    stop_cheat_caller_address(drm.contract_address);

    assert!(success, "license renewal should succeed");
}

// ========== PAYMENT TESTS ==========

#[test]
fn test_process_payment() {
    let (drm, _) = __deploy__();
    let content_id = setup_content(drm);

    start_cheat_caller_address(drm.contract_address, USER());
    let success = drm.process_payment_for_content(content_id, 100);
    stop_cheat_caller_address(drm.contract_address);

    assert!(success, "payment processing should succeed");

    let creator_balance = drm.get_creator_balance(CREATOR());
    let platform_balance = drm.get_platform_royalties_balance();
    
    assert!(creator_balance == 90, "creator should receive 90%");
    assert!(platform_balance == 10, "platform should receive 10%");
}

// ========== OWNERSHIP TESTS ==========

#[test]
fn test_transfer_content_ownership() {
    let (drm, _) = __deploy__();
    let content_id = setup_content(drm);

    start_cheat_caller_address(drm.contract_address, CREATOR());
    let success = drm.transfer_content_ownership(content_id, NEW_OWNER());
    stop_cheat_caller_address(drm.contract_address);

    assert!(success, "ownership transfer should succeed");

    let (_, _, _, creator, _) = drm.get_content_details(content_id);
    assert!(creator == NEW_OWNER(), "ownership not transferred");
}

#[test]
#[should_panic(expected: "Only the content owner can transfer ownership")]
fn test_transfer_content_ownership_non_owner() {
    let (drm, _) = __deploy__();
    let content_id = setup_content(drm);

    start_cheat_caller_address(drm.contract_address, USER());
    drm.transfer_content_ownership(content_id, NEW_OWNER());
    stop_cheat_caller_address(drm.contract_address);
}

// ========== WITHDRAWAL TESTS ==========

#[test]
fn test_withdraw_creator_earnings() {
    let (drm, _) = __deploy__();
    let content_id = setup_content(drm);

    // Process payment first
    start_cheat_caller_address(drm.contract_address, USER());
    drm.process_payment_for_content(content_id, 100);
    stop_cheat_caller_address(drm.contract_address);

    start_cheat_caller_address(drm.contract_address, CREATOR());
    let success = drm.withdraw_creator_earnings(content_id, 90);
    stop_cheat_caller_address(drm.contract_address);

    assert!(success, "withdrawal should succeed");
}

#[test]
fn test_withdraw_platform_royalties() {
    let (drm, _) = __deploy__();
    let content_id = setup_content(drm);

    // Process payment first
    start_cheat_caller_address(drm.contract_address, USER());
    drm.process_payment_for_content(content_id, 100);
    stop_cheat_caller_address(drm.contract_address);

    start_cheat_caller_address(drm.contract_address, OWNER());
    let success = drm.withdraw_platform_royalties(10);
    stop_cheat_caller_address(drm.contract_address);

    assert!(success, "withdrawal should succeed");
}

// ========== SETTINGS TESTS ==========

#[test]
fn test_set_royalty_rates() {
    let (drm, _) = __deploy__();

    start_cheat_caller_address(drm.contract_address, OWNER());
    let success = drm.set_royalty_rates(80, 20);
    stop_cheat_caller_address(drm.contract_address);

    assert!(success, "setting royalty rates should succeed");

    let (creator_percentage, platform_percentage) = drm.get_royalty_rates();
    assert!(creator_percentage == 80, "creator percentage should be 80");
    assert!(platform_percentage == 20, "platform percentage should be 20");
}

#[test]
fn test_set_payment_token() {
    let (drm, _) = __deploy__();
    let new_token: ContractAddress = 'NEW_TOKEN'.try_into().unwrap();

    start_cheat_caller_address(drm.contract_address, OWNER());
    let success = drm.set_payment_token(new_token);
    stop_cheat_caller_address(drm.contract_address);

    assert!(success, "setting payment token should succeed");
}
