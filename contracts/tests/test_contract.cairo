use contracts::drm::{
 IDigitalRightsManagementDispatcher, IDigitalRightsManagementDispatcherTrait,
    IDigitalRightsManagementSafeDispatcher,
    LicenseType, IERC20Dispatcher, IERC20DispatcherTrait,
};
use snforge_std::{
    ContractClassTrait, DeclareResultTrait, declare, start_cheat_caller_address,
    stop_cheat_caller_address,
};
use starknet::ContractAddress;

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

const ONE_MONTH_SECONDS: u256 = 30 * 24 * 60 * 60;

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

// Helper function to setup initial token balances
fn setup_token_balances(token: IERC20Dispatcher, token_address: ContractAddress) {
    // Transfer tokens from owner to users for testing
    start_cheat_caller_address(token_address, OWNER());
    token.transfer(CREATOR(), 10000_u256);
    token.transfer(USER(), 10000_u256);
    token.transfer(OTHER_USER(), 10000_u256);
    stop_cheat_caller_address(token_address);
}

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
fn test_upload_multiple_content() {
    let (drm, _) = __deploy__();

    start_cheat_caller_address(drm.contract_address, CREATOR());
    let content_id_1 = drm.upload_content('Content 1', 'hash_1');
    let content_id_2 = drm.upload_content('Content 2', 'hash_2');
    stop_cheat_caller_address(drm.contract_address);

    assert!(content_id_1 == 1_u64, "first content id should be 1");
    assert!(content_id_2 == 2_u64, "second content id should be 2");
}

#[test]
fn test_set_license_price() {
    let (drm, _) = __deploy__();

    // Upload content first
    start_cheat_caller_address(drm.contract_address, CREATOR());
    let content_id = drm.upload_content('Test Content', 'ipfs_hash_123');
    
    // Set license price
    let success = drm.set_license_price(content_id, LicenseType::OneMonth, 100_u32);
    stop_cheat_caller_address(drm.contract_address);

    assert(success == true, 'price setting should succeed');

    let price = drm.get_license_price(content_id, LicenseType::OneMonth);
    assert!(price == 100_u32, "price should be 100");
}


#[test]
#[should_panic(expected: ('Only creator can set price',))]
fn test_set_license_price_non_creator() {
    let (drm, _) = __deploy__();

    // Upload content as creator
    start_cheat_caller_address(drm.contract_address, CREATOR());
    let content_id = drm.upload_content('Test Content', 'ipfs_hash_123');
    stop_cheat_caller_address(drm.contract_address);

    // Try to set price as different user
    start_cheat_caller_address(drm.contract_address, USER());
    drm.set_license_price(content_id, LicenseType::OneMonth, 100_u32);
    stop_cheat_caller_address(drm.contract_address);
}



#[test]
#[should_panic(expected: ('Content does not exist',))]
fn test_set_license_price_nonexistent_content() {
    let (drm, _) = __deploy__();

    start_cheat_caller_address(drm.contract_address, CREATOR());
    drm.set_license_price(999_u64, LicenseType::OneMonth, 100_u32);
    stop_cheat_caller_address(drm.contract_address);
}


#[test]
fn test_set_multiple_license_prices() {
    let (drm, _) = __deploy__();

    start_cheat_caller_address(drm.contract_address, CREATOR());
    let content_id = drm.upload_content('Test Content', 'ipfs_hash_123');
    
    drm.set_license_price(content_id, LicenseType::OneMonth, 100_u32);
    drm.set_license_price(content_id, LicenseType::SixMonths, 500_u32);
    drm.set_license_price(content_id, LicenseType::OneYear, 1000_u32);
    stop_cheat_caller_address(drm.contract_address);

    assert!(drm.get_license_price(content_id, LicenseType::OneMonth) == 100_u32, "one month price");
    assert!(drm.get_license_price(content_id, LicenseType::SixMonths) == 500_u32, "six months price");
    assert!(drm.get_license_price(content_id, LicenseType::OneYear) == 1000_u32, "one year price");
}

#[test]
fn test_issue_license() {
    let (drm, _) = __deploy__();

    // Upload content first
    start_cheat_caller_address(drm.contract_address, CREATOR());
    let content_id = drm.upload_content('Test Content', 'ipfs_hash_123');
    
    // Set license price
    drm.set_license_price(content_id, LicenseType::OneMonth, 100_u32);
    stop_cheat_caller_address(drm.contract_address);

    // Issue license
    start_cheat_caller_address(drm.contract_address, USER());
    drm.issue_license(content_id, LicenseType::OneMonth);
    stop_cheat_caller_address(drm.contract_address);

}

#[test]
#[should_panic(expected: ('License not purchased',))]
fn test_issue_license_non_purchased() {
    let (drm, _) = __deploy__();

    // Upload content first
    start_cheat_caller_address(drm.contract_address, CREATOR());
    let content_id = drm.upload_content('Test Content', 'ipfs_hash_123');
    
    // Set license price
    drm.set_license_price(content_id, LicenseType::OneMonth, 100_u32);
    stop_cheat_caller_address(drm.contract_address);

    // Try to issue license without purchasing
    start_cheat_caller_address(drm.contract_address, USER());
    drm.issue_license(content_id, LicenseType::OneMonth);
    stop_cheat_caller_address(drm.contract_address);    
}

#[test]
#[should_panic(expected: ('Content does not exist',))]
fn test_issue_license_nonexistent_content() {
    let (drm, _) = __deploy__();

    start_cheat_caller_address(drm.contract_address, USER());
    drm.issue_license(999_u64, LicenseType::OneMonth);
    stop_cheat_caller_address(drm.contract_address);
}

#[test]
fn test_revoke_license() {
    let (drm, _) = __deploy__();

    // Upload content first
    start_cheat_caller_address(drm.contract_address, CREATOR());
    let content_id = drm.upload_content('Test Content', 'ipfs_hash_123');
    
    // Set license price
    drm.set_license_price(content_id, LicenseType::OneMonth, 100_u32);
    stop_cheat_caller_address(drm.contract_address);

    // Issue license
    start_cheat_caller_address(drm.contract_address, USER());
    drm.issue_license(content_id, LicenseType::OneMonth);
    stop_cheat_caller_address(drm.contract_address);

    // Revoke license
    start_cheat_caller_address(drm.contract_address, CREATOR());
    let success = drm.revoke_license(content_id, CREATOR());
    stop_cheat_caller_address(drm.contract_address);

    assert!(success == true, "license revocation should succeed");
}

#[test]
#[should_panic(expected: ('Only the content owner can revoke license',))]
fn test_revoke_license_non_owner() {
    let (drm, _) = __deploy__();

    // Upload content first
    start_cheat_caller_address(drm.contract_address, CREATOR());
    let content_id = drm.upload_content('Test Content', 'ipfs_hash_123');
    
    // Set license price
    drm.set_license_price(content_id, LicenseType::OneMonth, 100_u32);
    stop_cheat_caller_address(drm.contract_address);

    // Issue license
    start_cheat_caller_address(drm.contract_address, USER());
    drm.issue_license(content_id, LicenseType::OneMonth);
    stop_cheat_caller_address(drm.contract_address);

    // Try to revoke as different user
    start_cheat_caller_address(drm.contract_address, OTHER_USER());
    drm.revoke_license(content_id, OTHER_USER());
    stop_cheat_caller_address(drm.contract_address);
}



#[test]
fn test_set_royalty_rates() {
    let (drm, _) = __deploy__();

    start_cheat_caller_address(drm.contract_address, OWNER());
    let success = drm.set_royalty_rates(80_u8, 20_u8);
    stop_cheat_caller_address(drm.contract_address);

    assert!(success == true, "setting royalty rates should succeed");

    let (creator_percentage, platform_percentage) = drm.get_royalty_rates();
    assert!(creator_percentage == 80_u8, "creator percentage should be 80");
    assert!(platform_percentage == 20_u8, "platform percentage should be 20");
}

#[test]
#[should_panic(expected: ('Only the platform owner can change royalty rates',))]
fn test_set_royalty_rates_non_owner() {
    let (drm, _) = __deploy__();

    start_cheat_caller_address(drm.contract_address, USER());
    drm.set_royalty_rates(80_u8, 20_u8);
    stop_cheat_caller_address(drm.contract_address);
}

#[test]
#[should_panic(expected: ('Royalty percentages must sum to 100',))]
fn test_set_invalid_royalty_rates() {
    let (drm, _) = __deploy__();

    start_cheat_caller_address(drm.contract_address, OWNER());
    drm.set_royalty_rates(80_u8, 30_u8); // Sum is 110, not 100
    stop_cheat_caller_address(drm.contract_address);
}


#[test]
fn test_set_payment_token() {
    let (drm, _) = __deploy__();
    let new_token: ContractAddress = 'NEW_TOKEN'.try_into().unwrap();

    start_cheat_caller_address(drm.contract_address, OWNER());
    let success = drm.set_payment_token(new_token);
    stop_cheat_caller_address(drm.contract_address);

    assert!(success == true, "setting payment token should succeed");
}


#[test]
#[should_panic(expected: ('Only the platform owner can change payment token',))]
fn test_set_payment_token_non_owner() {
    let (drm, _) = __deploy__();
    let new_token: ContractAddress = 'NEW_TOKEN'.try_into().unwrap();

    start_cheat_caller_address(drm.contract_address, USER());
    drm.set_payment_token(new_token);
    stop_cheat_caller_address(drm.contract_address);
}


#[test]
fn test_transfer_content_ownership() {
    let (drm, _) = __deploy__();

    // Upload content as creator
    start_cheat_caller_address(drm.contract_address, CREATOR());
    let content_id = drm.upload_content('Test Content', 'ipfs_hash_123');
    
    // Transfer ownership
    let success = drm.transfer_content_ownership(content_id, NEW_OWNER());
    stop_cheat_caller_address(drm.contract_address);

    assert!(success == true, "ownership transfer should succeed");

    // Verify new owner can set price
    start_cheat_caller_address(drm.contract_address, NEW_OWNER());
    let price_success = drm.set_license_price(content_id, LicenseType::OneMonth, 100_u32);
    stop_cheat_caller_address(drm.contract_address);

    assert!(price_success == true, "new owner should be able to set price");
}

#[test]
#[should_panic(expected: ('Only the content owner can transfer ownership',))]
fn test_transfer_content_ownership_non_owner() {
    let (drm, _) = __deploy__();

    // Upload content as creator
    start_cheat_caller_address(drm.contract_address, CREATOR());
    let content_id = drm.upload_content('Test Content', 'ipfs_hash_123');
    stop_cheat_caller_address(drm.contract_address);

    // Try to transfer as different user
    start_cheat_caller_address(drm.contract_address, USER());
    drm.transfer_content_ownership(content_id, NEW_OWNER());
    stop_cheat_caller_address(drm.contract_address);
}


#[test]
#[should_panic(expected: ('Content does not exist',))]
fn test_transfer_nonexistent_content_ownership() {
    let (drm, _) = __deploy__();

    start_cheat_caller_address(drm.contract_address, CREATOR());
    drm.transfer_content_ownership(999_u64, NEW_OWNER());
    stop_cheat_caller_address(drm.contract_address);
}


#[test]
#[should_panic(expected: ('DRM: New owner is current owner',))]
fn test_transfer_content_ownership_same_owner() {
    let (drm, _) = __deploy__();

    start_cheat_caller_address(drm.contract_address, CREATOR());
    let content_id = drm.upload_content('Test Content', 'ipfs_hash_123');
    drm.transfer_content_ownership(content_id, CREATOR()); // Same owner
    stop_cheat_caller_address(drm.contract_address);
}

// ========== VIEW FUNCTION TESTS ==========

#[test]
fn test_get_license_price_no_price_set() {
    let (drm, _) = __deploy__();

    start_cheat_caller_address(drm.contract_address, CREATOR());
    let content_id = drm.upload_content('Test Content', 'ipfs_hash_123');
    stop_cheat_caller_address(drm.contract_address);

    let price = drm.get_license_price(content_id, LicenseType::OneMonth);
    assert!(price == 0_u32, "price should be 0 when not set");
}

#[test]
#[should_panic(expected: ('Content does not exist',))]
fn test_get_content_details_nonexistent() {
    let (drm, _) = __deploy__();

    drm.get_content_details(999_u64);
}

#[test]
#[should_panic(expected: ('Content does not exist',))]
fn test_get_license_price_nonexistent_content() {
    let (drm, _) = __deploy__();

    drm.get_license_price(999_u64, LicenseType::OneMonth);
}

#[test]
fn test_get_content_details() {
    let (drm, _) = __deploy__();

    start_cheat_caller_address(drm.contract_address, CREATOR());
    let content_id = drm.upload_content('Test Content', 'ipfs_hash_123');
    stop_cheat_caller_address(drm.contract_address);

    let (id, _, _, _, _) = drm.get_content_details(content_id);
    assert!(id == content_id, "content id should match");
}

#[test]
fn test_get_royalty_rates() {
    let (drm, _) = __deploy__();

    start_cheat_caller_address(drm.contract_address, CREATOR());
    let (creator_percentage, platform_percentage) = drm.get_royalty_rates();
    stop_cheat_caller_address(drm.contract_address);

    assert!(creator_percentage == 90_u8, "creator percentage should be 90");
    assert!(platform_percentage == 10_u8, "platform percentage should be 10");
}

#[test]
fn test_get_platform_royalties_balance() {
    let (drm, _) = __deploy__();

    start_cheat_caller_address(drm.contract_address, CREATOR());
    let platform_balance = drm.get_platform_royalties_balance();
    stop_cheat_caller_address(drm.contract_address);

    assert!(platform_balance == 0_u256, "platform balance should be 0");
}

#[test]
fn test_get_creator_royalties_balance() {
    let (drm, _) = __deploy__();

    start_cheat_caller_address(drm.contract_address, CREATOR());
    let creator_balance = drm.get_creator_balance(CREATOR());
    stop_cheat_caller_address(drm.contract_address);

    assert!(creator_balance == 0_u256, "creator balance should be 0");
}

#[test]
fn test_renew_license() {
    let (drm, _) = __deploy__();

    // Upload content first
    start_cheat_caller_address(drm.contract_address, CREATOR());
    let content_id = drm.upload_content('Test Content', 'ipfs_hash_123');
    
    // Set license price
    drm.set_license_price(content_id, LicenseType::OneMonth, 100_u32);
    stop_cheat_caller_address(drm.contract_address);

    // Renew license
    start_cheat_caller_address(drm.contract_address, USER());
    let success = drm.renew_license(999_u64, 2592000_u64);
    stop_cheat_caller_address(drm.contract_address);

    assert(success == true, 'license renewal should succeed');
}

#[test]
#[should_panic(expected: ('License not purchased',))]
fn test_renew_license_not_purchased() {
    let (drm, _) = __deploy__();

    // Upload content first
    start_cheat_caller_address(drm.contract_address, CREATOR());
    let content_id = drm.upload_content('Test Content', 'ipfs_hash_123');
    
    // Set license price
    drm.set_license_price(content_id, LicenseType::OneMonth, 100_u32);
    stop_cheat_caller_address(drm.contract_address);

    // Try to renew without purchasing
    start_cheat_caller_address(drm.contract_address, USER());
    drm.renew_license(999_u64, 2592000_u64);
    stop_cheat_caller_address(drm.contract_address);    
}

#[test]
#[should_panic(expected: ('Content does not exist',))]
fn test_renew_license_nonexistent_content() {
    let (drm, _) = __deploy__();

    start_cheat_caller_address(drm.contract_address, USER());
    drm.renew_license(999_u64, 2592000_u64);
    stop_cheat_caller_address(drm.contract_address);
}

#[test]
fn test_process_payment_for_content() {
    let (drm, _) = __deploy__();

    // Upload content first
    start_cheat_caller_address(drm.contract_address, CREATOR());
    let content_id = drm.upload_content('Test Content', 'ipfs_hash_123');
    
    // Set license price
    drm.set_license_price(content_id, LicenseType::OneMonth, 100_u32);
    stop_cheat_caller_address(drm.contract_address);

    // Process payment
    start_cheat_caller_address(drm.contract_address, USER());
    let success = drm.process_payment_for_content(content_id, ONE_MONTH_SECONDS);
    stop_cheat_caller_address(drm.contract_address);

    assert!(success == true, "payment processing should succeed");
    
}

#[test]
#[should_panic(expected: ('Content does not exist',))]
fn test_process_payment_for_nonexistent_content() {
    let (drm, _) = __deploy__();

    start_cheat_caller_address(drm.contract_address, USER());
    drm.process_payment_for_content(999_u64, ONE_MONTH_SECONDS);
    stop_cheat_caller_address(drm.contract_address);
}

#[test]
#[should_panic(expected: ('Payment token not set',))]
fn test_process_payment_for_content_no_payment_token() {
    let (drm, _) = __deploy__();

    // Upload content first
    start_cheat_caller_address(drm.contract_address, CREATOR());
    let content_id = drm.upload_content('Test Content', 'ipfs_hash_123');
    
    // Set license price
    drm.set_license_price(content_id, LicenseType::OneMonth, 100_u32);
    stop_cheat_caller_address(drm.contract_address);

    // Try to process payment without setting payment token
    start_cheat_caller_address(drm.contract_address, USER());
    drm.process_payment_for_content(content_id, ONE_MONTH_SECONDS);
    stop_cheat_caller_address(drm.contract_address);
}

#[test]
fn test_withdraw_creator_earnings() {
    let (drm, _) = __deploy__();

    // Upload content first
    start_cheat_caller_address(drm.contract_address, CREATOR());
    let content_id = drm.upload_content('Test Content', 'ipfs_hash_123');
    
    // Set license price
    drm.set_license_price(content_id, LicenseType::OneMonth, 100_u32);
    stop_cheat_caller_address(drm.contract_address);

    // Process payment
    start_cheat_caller_address(drm.contract_address, USER());
    drm.process_payment_for_content(content_id, ONE_MONTH_SECONDS);
    stop_cheat_caller_address(drm.contract_address);

    // Withdraw earnings
    start_cheat_caller_address(drm.contract_address, CREATOR());
    let success = drm.withdraw_creator_earnings(content_id, 0_u256);
    stop_cheat_caller_address(drm.contract_address);

    assert!(success == true, "withdrawal should succeed");
}

#[test]
#[should_panic(expected: ('Only the content owner can withdraw earnings',))]
fn test_withdraw_creator_earnings_not_content_creator() {
    let (drm, _) = __deploy__();

    // Upload content first
    start_cheat_caller_address(drm.contract_address, CREATOR());
    let content_id = drm.upload_content('Test Content', 'ipfs_hash_123');
    
    // Set license price
    drm.set_license_price(content_id, LicenseType::OneMonth, 100_u32);
    stop_cheat_caller_address(drm.contract_address);

    // Process payment
    start_cheat_caller_address(drm.contract_address, USER());
    drm.process_payment_for_content(content_id, ONE_MONTH_SECONDS);
    stop_cheat_caller_address(drm.contract_address);

    // Try to withdraw as different user
    start_cheat_caller_address(drm.contract_address, OTHER_USER());
    drm.withdraw_creator_earnings(content_id, 0_u256);
    stop_cheat_caller_address(drm.contract_address);    
}

#[test]
fn test_withdraw_platform_royalties() {
    let (drm, _) = __deploy__();

    // Upload content first
    start_cheat_caller_address(drm.contract_address, CREATOR());
    let content_id = drm.upload_content('Test Content', 'ipfs_hash_123');
    
    // Set license price
    drm.set_license_price(content_id, LicenseType::OneMonth, 100_u32);
    stop_cheat_caller_address(drm.contract_address);

    // Process payment
    start_cheat_caller_address(drm.contract_address, USER());
    drm.process_payment_for_content(content_id, ONE_MONTH_SECONDS);
    stop_cheat_caller_address(drm.contract_address);

    // Withdraw platform royalties
    start_cheat_caller_address(drm.contract_address, OWNER());
    let success = drm.withdraw_platform_royalties(0_u256);
    stop_cheat_caller_address(drm.contract_address);

    assert!(success == true, "withdrawal should succeed");
}


#[test]
#[should_panic(expected: ('Only the platform owner can withdraw royalties',))]
fn test_withdraw_platform_royalties_non_platform_owner() {
    let (drm, _) = __deploy__();

    // Upload content first
    start_cheat_caller_address(drm.contract_address, CREATOR());
    let content_id = drm.upload_content('Test Content', 'ipfs_hash_123');
    
    // Set license price
    drm.set_license_price(content_id, LicenseType::OneMonth, 100_u32);
    stop_cheat_caller_address(drm.contract_address);

    // Process payment
    start_cheat_caller_address(drm.contract_address, USER());
    drm.process_payment_for_content(content_id, ONE_MONTH_SECONDS);
    stop_cheat_caller_address(drm.contract_address);

    // Try to withdraw as different user
    start_cheat_caller_address(drm.contract_address, OTHER_USER());
    drm.withdraw_platform_royalties(0_u256);
    stop_cheat_caller_address(drm.contract_address);    
}

