#[starknet::interface]
pub trait IDigitalRightsManagement<TContractState> {
    fn upload_content(self: @TContractState, price: u32, expiration: u64, title: felt252, ipfs_hash: felt252) -> u64; fn issue_license(self: @TContractState, content_id: u64) -> bool;
    fn revoke_license(self: @TContractState, content_id: u64, user: ContractAddress) -> bool;
    fn renew_license(self: @TContractState, content_id: u64, additional_time: u64) -> bool;
    fn get_content_details(self: @TContractState, content_id: u64) -> (u32, u64, u32, u32, ContractAddress, felt252, felt252);
    fn get_license_status(self: @TContractState, content_id: u64, user: ContractAddress) -> bool;
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
        content_counter: u64,
        content: map<u64, ContentDetails>,
        license_owners: map<(u64, ContractAddress), bool>,
        token_address: ContractAddress,
    }

    #[derive(Drop, starknet::Event)]
    struct ContentUploaded {
        content_id: u64,
        title: felt252,
        ipfs_hash: felt252,
    }

    #[derive(Drop, starknet::Event)]
    struct LicenseIssued {
        content_id: u64,
        user: ContractAddress,
    }

    #[derive(Drop, starknet::Event)]
    struct LicenseRevoked {
        content_id: u64,
        user: ContractAddress,
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