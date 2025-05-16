#[starknet::interface]
pub trait IDigitalRightsManagement<TContractState> {
    fn upload_content(self: @TContractState, price: u32, expiration: u64, title: felt252, ipfs_hash: felt252) -> u64; fn issue_license(self: @TContractState, content_id: u64) -> bool;
    fn revoke_license(self: @TContractState, content_id: u64, user: ContractAddress) -> bool;
    fn renew_license(self: @TContractState, content_id: u64, additional_time: u64) -> bool;
    fn get_content_details(self: @TContractState, content_id: u64) -> (u32, u64, u32, u32, ContractAddress, felt252, felt252);
    fn get_license_status(self: @TContractState, content_id: u64, user: ContractAddress) -> bool;
    fn process_payment_for_content( ref self: ContractState, content_id: u64, amount_paid: u256) -> bool;
    fn withdraw_royalties(ref self: ContractState);
    fn check_access( self: @ContractState, content_id: u64, user: ContractAddress, required_permission: Permission) -> bool;
    fn get_license(self: @ContractState, license_id: u64) -> License;
}

// Represents different permissions a license can grant
#[derive(Drop, starknet::Store, Copy)]
enum Permission {
    View,        // Permission to view/access the content
    Listen,      // Permission to listen (for audio)
    Download,    // Permission to download
    Distribute,  // Permission for limited redistribution (e.g., in a project)
    Modify,      // Permission to create derivatives
// Add other permissions as needed
}

// Represents a single license issued for a piece of content
#[derive(Drop, starknet::Store)]
struct License {
    content_id: u64,              // ID of the content this license is for
    licensee: ContractAddress,    // Address of the user who holds the license
    permissions: Array<Permission>, // Array of permissions granted by this license
    start_timestamp: u64,         // Timestamp when the license becomes valid
    end_timestamp: u64,           // Timestamp when the license expires (0 for perpetual)
    usage_limit: u64,             // Max number of uses allowed (0 for unlimited)
    current_usage_count: u64,     // Number of times the license has been used
    is_active: bool,              // Whether the license is currently active (can be revoked)
}

#[starknet::interface]
pub trait IERC20<TContractState> {
    fn transfer_from(self: @TContractState, sender: ContractAddress, recipient: ContractAddress, amount: u256) -> bool;
}

#[starknet::contract]
mod DRMContract {
    use starknet::{ContractAddress, get_caller_address, get_block_timestamp};
    use openzeppelin_access::ownable::OwnableComponent;
    use super::{IDigitalRightsManagement, IERC20};

    component!(path: OwnableComponent, storage: ownable, event: OwnableEvent);

    #[storage]
    struct Storage {
        payment_token_address: ContractAddress, // Address of the ERC20 token contract used for payments
        royalties: u32, // Percentage of royalties to be paid to the content owner
        content_counter: u64, // Counter for unique content IDs
        content: Map<u64, ContentDetails>, // Map content ID to content details
        // license_owners: Map<(u64, ContractAddress), bool>,
        licenses: Map<u64, License>, // Map license ID to license details
        next_license_id: u64, // Counter for unique license IDs
        token_address: ContractAddress,
    }

    #[derive(Drop, starknet::Event)]
    struct ContentUploaded {
        content_id: u64,
        title: felt252,
        ipfs_hash: felt252,
    }

    // #[derive(Drop, starknet::Event)]
    // struct LicenseIssued {
    //     content_id: u64,
    //     user: ContractAddress,
    // }

    #[derive(Drop, starknet::Event)]
    struct LicenseIssued {
        license_id: u64,
        content_id: u64,
        licensee: ContractAddress,
        start_timestamp: u64,
        end_timestamp: u64,
        usage_limit: u64,
        issuer: ContractAddress,
    }

    // #[derive(Drop, starknet::Event)]
    // struct LicenseRevoked {
    //     content_id: u64,
    //     user: ContractAddress,
    // }

    #[derive(Drop, starknet::Event)]
    struct LicenseRevoked {
        license_id: u64,
        content_id: u64,
        revoker: ContractAddress,
    }

    struct ContentDetails {
        price: u32,
        expiration: u64,
        licenses_issued: u32,
        owner: ContractAddress,
        title: felt252,
        ipfs_hash: felt252,
    }

    #[constructor]
    fn constructor(ref self: ContractState, token_address: ContractAddress, owner: ContractAddress) {
        self.content_counter.write(0);
        self.token_address.write(token_address);
        self.ownable.initializer(owner);
    }