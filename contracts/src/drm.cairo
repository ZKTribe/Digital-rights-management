use starknet::ContractAddress;

#[derive(Copy, Drop, starknet::Store, Serde, PartialEq)]
enum LicenseType {
    OneMonth,
    SixMonths,
    TwelveMonths,
}

#[derive(Copy, Drop, starknet::Store, PartialEq)]
struct LicensePrice {
    content_id: u64, // ID of the content this license is for
    price: u32,      // Price of the license
    license_type: LicenseType
}

#[derive(Copy, Drop, starknet::Store, Serde, PartialEq)]
struct ContentInfo {
    id: u64,
    title: felt252,
    ipfs_hash: felt252,
    creator: ContractAddress,
    creation_timestamp: u64,
    is_active: bool
}

// Represents a single license issued for a piece of content
  #[derive(Copy, Drop, starknet::Store, Serde, PartialEq)]
    struct License {
        license_id: u64,              // Unique identifier for this license
        content_id: u64,              // ID of the content this license is for
        license_type: LicenseType,    // Type of license (e.g., OneMonth, SixMonths, TwelveMonths)
        license_price: u256,          // Price paid for this license
        licensee: ContractAddress,    // Address of the user who holds the license
        start_timestamp: u64,         // Timestamp when the license becomes valid
        end_timestamp: u64,           // Timestamp when the license expires (0 for perpetual)
        current_usage_count: u64,     // Number of times the license has been used
        is_active: bool,              // Whether the license is currently active (can be revoked)
    }

#[starknet::interface]
pub trait IDigitalRightsManagement<TContractState> {
    fn upload_content(ref self: TContractState, title: felt252, ipfs_hash: felt252) -> u64;
    
    fn set_license_price(ref self: TContractState, content_id: u64, license_type: LicenseType, price: u32) -> bool;
    
    fn issue_license(ref self: TContractState, content_id: u64, license_type: LicenseType) -> u64;
    
    fn revoke_license(ref self: TContractState, license_id: u64, user: ContractAddress) -> bool;
    
    fn renew_license(ref self: TContractState,  license_id: u64, additional_time: u64) -> bool;
    
    // View functions
    fn get_license_price(self: @TContractState, content_id: u64, license_type: LicenseType) -> u32;
    
     fn get_content_details(self: @TContractState,content_id: u64) -> (u64, felt252, felt252, ContractAddress, u64);

    fn get_license_status(self: @TContractState, license_id: u64,  user: ContractAddress) -> bool;
    
    fn process_payment_for_content(ref self: TContractState, content_id: u64, amount_paid: u256) -> bool;
    
    fn withdraw_creator_earnings(ref self: ContractState, content_id: u64, total_withdrawal_amount) -> bool;

    fn withdraw_platform_royalties(ref self: ContractState, total_withdrawal_amount) -> bool;

    fn get_creator_balance(self: @TContractState,creator: ContractAddress) -> u256;
    
    fn get_platform_royalties_balance(self: @TContractState) -> u256;

    fn get_royalty_rates(self: @TContractState) -> (u8, u8);

    fn set_royalty_rates(ref self: TContractState,creator_percentage: u8, platform_percentage: u8) -> bool;

     fn set_payment_token(ref self: TContractState,token_address: ContractAddress) -> bool;

     fn transfer_content_ownership(ref self: TContractState, content_id: u64, new_owner: ContractAddress) -> bool;
    
    // fn check_access(self: @TContractState, content_id: u64, user: ContractAddress)->bool;
    
}


#[starknet::interface]
pub trait IERC20<TContractState> {
    fn transfer_from(self: @TContractState, sender: ContractAddress, recipient: ContractAddress, amount: u256) -> bool;
}

#[starknet::contract]
mod DRMContract {
    use OwnableComponent::InternalTrait;
    use starknet::{ContractAddress, get_caller_address, get_block_timestamp};
    use openzeppelin_access::ownable::OwnableComponent;
    use core::option::OptionTrait;
     use core::starknet::storage::{
        Map, StoragePointerReadAccess, StoragePointerWriteAccess,StorageMapWriteAccess, StorageMapReadAccess,
    };
    use super::{IDigitalRightsManagement, IERC20, ContentInfo, License, LicenseType, LicensePrice};
    use core::Default::default;
    

    // Define the IERC20Contract struct for interface calls
    #[derive(Copy, Drop)]
    struct IERC20Contract {
        contract_address: ContractAddress,
    }

    component!(path: OwnableComponent, storage: ownable, event: OwnableEvent);

   #[storage]
    struct Storage {
        // System configuration
        owner: ContractAddress,                          // Contract owner address
        payment_token: ContractAddress,                  // ERC20 token used for payments
        creator_royalty_percentage: u8,                  // Percentage paid to creators (default 90)
        platform_royalty_percentage: u8,                 // Percentage kept by platform (default 10)
        
        // Content management
        content_counter: u64,                            // Counter for unique content IDs
        content_info: Map<u64, ContentInfo>,             // Maps content ID to content details
        content_creator: Map<u64, ContractAddress>,      // Maps content ID to creator address
        creator_content_mapping: Map<(ContractAddress, u64), u64>,// Maps (creator, index) to content ID
        creator_content_count: Map<ContractAddress, u64>,// Number of contents per creator
        
        // License management
        license_counter: u64,                            // Counter for unique license IDs
        licenses: Map<u64, License>,                     // Maps license ID to license details
        content_licenses:  Map<(u64, u64), bool>,          // Maps content ID to license IDs
        user_licenses: Map<(ContractAddress, u64), u64>, // Maps user address to their license IDs
        license_prices: Map<(u64, LicenseType), u256>,   // Maps (content ID, license type) to price
        
        // Financial accounting
        creator_balances: Map<ContractAddress, u256>,    // Maps creator address to their balance
        platform_royalties_balance: u256,                // Total platform royalties collected
        
        // Access tracking
        license_access_count: Map<u64, u64>,             // Tracks number of times a license is used

        #[substorage(v0)]
        ownable: OwnableComponent::Storage,
    }

      // Events
    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        ContentUploaded: ContentUploaded,
        LicensePriceSet: LicensePriceSet,
        LicenseIssued: LicenseIssued,
        LicenseRevoked: LicenseRevoked,
        LicenseRenewed: LicenseRenewed,
        PaymentProcessed: PaymentProcessed,
        CreatorWithdrawal: CreatorWithdrawal,
        PlatformWithdrawal: PlatformWithdrawal,
        RoyaltyRatesChanged: RoyaltyRatesChanged,
        TransferContentOwnership: TransferContentOwnership,
        PaymentTokenChanged: PaymentTokenChanged,
        #[flat]
        OwnableEvent: OwnableComponent::Event,
    }

    #[derive(Drop, starknet::Event)]
    struct ContentUploaded {
        content_id: u64,
        creator: ContractAddress,
        title: felt252,
        timestamp: u64,
    }

    #[derive(Drop, starknet::Event)]
    struct LicensePriceSet {
        content_id: u64,
        license_type: LicenseType,
        price: u256,
    }

    #[derive(Drop, starknet::Event)]
    struct LicenseIssued {
        license_id: u64,
        content_id: u64,
        license_type: LicenseType,
        licensee: ContractAddress,
        price: u256,
        start_timestamp: u64,
        end_timestamp: u64,
    }

     #[derive(Drop, starknet::Event)]
    struct LicenseRevoked {
        license_id: u64,
        content_id: u64,
        licensee: ContractAddress,
    }

     #[derive(Drop, starknet::Event)]
    struct LicenseRenewed {
        license_id: u64,
        new_end_timestamp: u64,
    }

    #[derive(Drop, starknet::Event)]
    struct PaymentProcessed {
        content_id: u64,
        license_type: LicenseType,
        payer: ContractAddress,
        amount: u256,
        creator_amount: u256,
        platform_amount: u256,
    }

     #[derive(Drop, starknet::Event)]
    struct CreatorWithdrawal {
        creator: ContractAddress,
        amount: u256,
    }

     #[derive(Drop, starknet::Event)]
    struct PlatformWithdrawal {
        owner: ContractAddress,
        amount: u256,
    }

     #[derive(Drop, starknet::Event)]
    struct RoyaltyRatesChanged {
        creator_percentage: u8,
        platform_percentage: u8,
    }

    #[derive(Drop, starknet::Event)]
struct TransferContentOwnership {
    content_id: u64,
    previous_owner: ContractAddress,
    new_owner: ContractAddress,
    timestamp: u64,
}

struct PaymentTokenChanged {
    old_token_address: ContractAddress,
    new_token_address: ContractAddress,
}


    #[constructor]
    fn constructor(ref self: ContractState, payment_token: ContractAddress,  owner: ContractAddress) {
        // Initialize counters
        self.content_counter.write(0);
        self.license_counter.write(0);
        
        // Set payment token
        self.payment_token.write(payment_token);
        
        // Set owner
        self.owner.write(owner);
        
        // Initialize default royalty split (90% to creators, 10% to platform)
        self.creator_royalty_percentage.write(90_u8);
        self.platform_royalty_percentage.write(10_u8);
        
        // Initialize platform royalties balance
        self.platform_royalties_balance.write(0_u256);
    }

     #[abi(embed_v0)]
    impl DRMImpl of IDigitalRightsManagement<ContractState> {

        fn upload_content(ref self: ContractState, title: felt252, ipfs_hash: felt252) -> u64 {

    // 1. Get the caller's address, which will be registered as the content creator
    let creator = get_caller_address();
    
    // 2. Increment the content counter to generate a new unique content ID
    let content_id = self.content_counter.read() + 1;
    self.content_counter.write(content_id);
    
    // 3. Create a ContentInfo struct with provided data and current timestamp
    let current_timestamp = get_block_timestamp();
    let content_info = ContentInfo {
        id: content_id,
        title: title,
        ipfs_hash: ipfs_hash,
        creator: creator,
        creation_timestamp: current_timestamp,
        is_active: true,
    };
    
    // 4. Store the content info in the contract's storage
    self.content_info.write(content_id, content_info);
    
    // 5. Map the content to its creator
    self.content_creator.write(content_id, creator);
    
   // 6. Add this content ID to the creator's list of contents
   let current_creator_content_count = self.creator_content_count.read(creator);
            self.creator_content_mapping.write((creator, current_creator_content_count), content_id);
            self.creator_content_count.write(creator, current_creator_content_count + 1);
    
    // 7. Emit a ContentUploaded event
    self.emit(ContentUploaded {
        content_id: content_id,
        creator: creator,
        title: title,
        timestamp: current_timestamp,
    });
    
    // 8. Return the newly created content ID
    content_id
         
}

fn set_license_price(ref self: ContractState, content_id: u64, license_type: LicenseType, price: u32) -> bool {
    // 1. Verify the caller is the content creator/owner
    let caller = get_caller_address();
    let content_creator = self.content_creator.read(content_id);
    assert!(caller == content_creator, "Only creator can set price");
    
    // 2. Check if the content exists
    let content_info = self.content_info.read(content_id);
    assert!(content_info.is_active, "Content does not exist");
    
    // 3 & 4. Create a mapping from (content_id, license_type) -> price and store it
    // Convert u32 price to u256 as that's what's used in the storage
    let price_u256: u256 = price.into();
    self.license_prices.write((content_id, license_type), price_u256);
    
    // 5. Emit a LicensePriceSet event
    self.emit(LicensePriceSet {
        content_id: content_id,
        license_type: license_type,
        price: price_u256,
    });
    
    // 6. Return true if successful
    true
 }
   fn issue_license(ref self: ContractState, content_id: u64, license_type: LicenseType) -> u64 {
        // 1. Get the caller's address (the licensee)
        let licensee = get_caller_address();

        // 2. Check if the content exists and has a price set for the requested license type
        let price_key = (content_id, license_type);
        let price = self.license_prices.read(price_key);
        assert(price > 0_u256, 'License price not set');

        // 3. Process payment (could be called separately or internally)
        let payment_success = self.process_payment_for_content(content_id, price);
        assert(payment_success, 'Payment failed');

        // 4. Calculate license duration based on license type
        let start_timestamp = get_block_timestamp();
        let duration = match license_type {
            LicenseType::OneMonth => 30_u64 * 24_u64 * 60_u64 * 60_u64,       // 30 days
            LicenseType::SixMonths => 180_u64 * 24_u64 * 60_u64 * 60_u64,     // 6 months
            LicenseType::TwelveMonths => 365_u64 * 24_u64 * 60_u64 * 60_u64,  // 12 months
        };
        let end_timestamp = start_timestamp + duration;

        // 5. Increment license counter to generate a new unique license ID
        let license_id = self.license_counter.read() + 1_u64;
        self.license_counter.write(license_id);

        // 6. Create License struct with all necessary details
        let license = License {
            license_id,
            content_id,
            license_type,
            license_price: price,
            licensee,
            start_timestamp,
            end_timestamp,
            current_usage_count: 0_u64,
            is_active: true,
        };

        // 7. Store the license in storage
        self.licenses.write(license_id, license);

        // 8. Add license ID to user's licenses list
        let user_license_count = self.user_licenses.read((licensee, 0_u64));
        self.user_licenses.write((licensee, user_license_count), license_id);
        self.user_licenses.write((licensee, 0_u64), user_license_count + 1_u64);

        // 9. Add license ID to content's licenses list (if needed, otherwise remove this if not used)
        let content_licenses = self.content_licenses.read((content_id, license_id));
        self.content_licenses.write((content_id, license_id), true);

        // 10. Emit a LicenseIssued event
        self.emit(LicenseIssued {
            license_id,
            content_id,
            license_type,
            licensee,
            price,
            start_timestamp,
            end_timestamp,
        });

        // 11. Return the new license ID
        license_id
    }
            // The payment splits 90% to content creator and 10% to platform
        }


fn revoke_license(ref self: ContractState, license_id: u64, user: ContractAddress) -> bool {
             // Purpose: Allows content owners to revoke licenses (in case of violations, etc.)
            //
            // Process:
            // 1. Get the caller's address
            let caller = get_caller_address();

            // 2. Check if the license exists
            let license = self.licenses.read(license_id);

            assert!(license.license_id != 0_u64, "License does not exist");

            // 3. Get the content ID from the license
            let content_id = license.content_id;

            // 4. Verify caller is either the content creator or platform owner
            let content_creator = self.content_creator.read(content_id);
            assert!(caller == content_creator || caller == self.owner.read(), "Caller is not authorized to revoke this license");

            // 5. Check if the license is active
            assert!(license.is_active, "License is already revoked");

            // 6. Set the license's is_active field to false
            let updated_license = License {
                is_active: false,
                ..license
            };
            self.licenses.write(license_id, updated_license);

            let license_owner = license.licensee;

            // 7. Emit a LicenseRevoked event
            self.emit(LicenseRevoked {
                license_id: license_id,
                content_id: content_id,
                licensee: license_owner,
            });

            // 8. Return true if successful
            true

            //
            // Only the content creator or platform owner should be able to revoke licenses
            // Revoked licenses will still exist but will no longer grant access to content
            
        }


        fn renew_license(ref self: ContractState, license_id: u64, additional_time: u64) -> bool {
            // Purpose: Allows users to extend their license duration
            //
            // Process:
            // 1. Get the caller's address
            let caller = get_caller_address();
        
            // 2. Check if the license exists
            let license = self.licenses.read(license_id);
            assert!(license.license_id != 0_u64, "License does not exist");
        
            // 3. Verify it belongs to the caller
            assert!(caller == license.licensee, "License doesn't belong to you");
        
            // 4. Verify the license is active
            assert!(license.is_active, "License is expired");
        
            // 5. Calculate the new end timestamp by adding additional_time to current end_timestamp
            let new_end_timestamp = license.end_timestamp + additional_time;
        
            // 6. Update the license's end_timestamp
            let updated_license = License {
                end_timestamp: new_end_timestamp,
                ..license
            };
            self.licenses.write(license_id, updated_license);
        
            // 7. Emit a LicenseRenewed event
            self.emit(LicenseRenewed {
                license_id: license_id,
                new_end_timestamp: new_end_timestamp,
            });
        
            // 8. Return true if successful
            true
        }
        // View functions
        fn get_license_price(self: @ContractState, content_id: u64, license_type: LicenseType) -> u32 {
           // Purpose: Returns the price for a specific license type for given content
            //
            // Process:
            // 1. Check if content exists
            let content = self.content_info.read(content_id);

            assert!(content != Default::default(), "Content does not exist");

            // 2. Return the stored price for the (content_id, license_type) pair
            let license_price = self.license_prices.read((content_id, license_type));

            // 3. If no price is set, return 0
            if !license_price {
                return 0;
            } else {
                return license_price;
            }
            //
            // A read-only function that doesn't modify state
            // Used by frontend to display prices to users
        }
      fn get_content_details(self: @ContractState,content_id: u64) -> (u64, felt252, felt252, ContractAddress, u64) {
        let content = self.content_info.read(content_id);
        assert!(content.is_active, "Content does not exist or is inactive");

    (
        content.id,
        content.title,
        content.ipfs_hash,
        content.creator,
        content.creation_timestamp
    )
}


        fn get_license_status(self: @ContractState, license_id: u64, user: ContractAddress) -> bool {
        // Purpose: Checks if a license is currently active
            //
            // Process:
            // 1. Check if the license exists
            let license = self.licenses.read(license_id);
            assert!(license.license_id != 0_u64, "License does not exist");
            // 2. Verify if the license is marked as active
            assert!(license.is_active, "License is not active");
            // 3. Check if the current time is before the license expiration time
            let current_time = get_block_timestamp();
            assert!(current_time < license.end_timestamp, "License has expired");
            // 4. Check if the license belongs to the user
            assert!(license.licensee == user, "License does not belong to this user");
            // 4. Return true if both conditions are met, false otherwise
            true
            //
            // Used to quickly check if a license is valid without retrieving all details
        }
        fn process_payment_for_content(ref self: ContractState, content_id: u64, amount_paid: u256) -> bool {
              // Purpose: Processes payment for licensing content and splits revenue
            //
            // Process:
            // 1. Get the caller's address (payer)
            let payer = get_caller_address();
            // 2. Check if content exists and has a price for the requested license type
            let content = self.content_info.read(content_id);
            assert!( content != Default::default() && content.is_active, "Content does not exist or is inactive");
            // 3. Get the content creator's address
            let creator = self.content_creator.read(content_id);
            // 4. Get the price for the requested license type

            assert!(amount_paid > 0_u256, "Payment amount must be greater than zero");
            // 5. Calculate the split:
            let creator_percentage = self.creator_royalty_percentage.read();
            let platform_percentage = self.platform_royalty_percentage.read();
            let creator_amount = (amount_paid * creator_percentage.into()) / 100_u256;
            let platform_amount = (amount_paid * platform_percentage.into()) / 100_u256;
            //    - Creator amount = price * creator_royalty_percentage / 100
            //    - Platform amount = price * platform_royalty_percentage / 100
            // 6. Transfer the total amount from the user to this contract
             let payment_token = self.payment_token.read();
            let contract_address = starknet::get_contract_address();
             //    - Transfer the total amount from the user to this contract    
            //    (requires approval from the user first)
           // Use the IERC20 dispatcher to call the ERC20 contract
            let erc20_dispatcher = IERC20Dispatcher { contract_address: payment_token };

            // Check if the payer has enough balance
            let payer_balance = erc20_dispatcher.balance_of(payer);
            assert!(payer_balance >= amount_paid, "Insufficient balance");

            // Transfer the amount from the payer to the contract
            let success = erc20_dispatcher.transfer_from(payer, contract_address, amount_paid);
             assert!(success, "Payment transfer failed");
           
            // 7. Update the creator's balance by adding the creator amount
            let current_creator_balance = self.creator_balances.read(creator);
            self.creator_balances.write(creator, current_creator_balance + creator_amount);
            // 8. Update the platform royalties balance
            let current_platform_balance = self.platform_royalties_balance.read();
            self.platform_royalties_balance.write(current_platform_balance + platform_amount);
            // 9. Emit a PaymentProcessed event
            self.emit(PaymentProcessed {
                content_id: content_id,
                license_type: LicenseType::OneMonth, 
                payer: payer,
                amount: amount_paid,
                creator_amount: creator_amount,
                platform_amount: platform_amount,
            });     
            // 10. Return true if successful
            true
            //
            // This function handles the financial transactions
            // The 90/10 split is applied here
            // No actual license is issued here - that's handled by issue_license
        }
        fn withdraw_creator_earnings(ref self: ContractState, content_id: u64, total_withdrawal_amount) -> bool {
                // Purpose: Allows content creators to withdraw their earnings
            //
            // Process:
            // 1. Get the caller's address (creator)
            let creator = get_caller_address();
            // 2. Initialize a total withdrawal amount to 0
            // let mut total_withdrawal_amount: u256 = 0_u256;
            // 3. For each content ID in the array:
            //    - Verify the caller is the creator of that content
            //    - Add the earnings for that content to the total withdrawal amount
            // 3. Verify the caller is the creator of the content and add earnings
            //  let content_creator = self.content_creator.read(content_id);
            //  assert!(creator == content_creator, "Only the content creator can withdraw earnings");
            // 4. If total withdrawal amount is 0, return 0
            let creator_balance = self.creator_balances.read(creator);
    
            // 5. Clear the creator's balance for the specified content IDs
            // 4. If total withdrawal amount is 0, return early
             if total_withdrawal_amount == 0_u256 {
                return false
              };

              let new_creator_balance = creator_balance - total_withdrawal_amount;
                assert!(new_creator_balance >= 0_u256, "Insufficient balance");
                // 5. Update the creator's balance
                self.creator_balances.write(creator, new_creator_balance);
            // 6. Transfer the total amount from the contract to the creator
            let payment_token = self.payment_token.read();

            let contract_address = starknet::get_contract_address();
            // Use the IERC20 dispatcher to call the ERC20 contract
            let erc20_dispatcher = IERC20Dispatcher { contract_address: payment_token };
            // Check if the contract has enough balance
            let contract_balance = erc20_dispatcher.balance_of(contract_address);
            assert!(contract_balance >= total_withdrawal_amount, "Contract has insufficient balance");
            // Transfer the amount from the contract to the creator

            let transfer_success =  erc20_dispatcher.transfer_from(contract_address, creator, total_withdrawal_amount);
            // Check if the transfer was successful
            assert!(transfer_success, "Transfer failed");
    
             // 7. Emit a CreatorWithdrawal event
             self.emit(CreatorWithdrawal {
            creator: creator,
            amount: total_withdrawal_amount,
             });
    
             // 8. Return success status
             true
            //
            // Creators can withdraw earnings from multiple contents at once
            // Only the actual creator can withdraw earnings for their content
        }

        fn withdraw_platform_royalties(ref self: ContractState, total_withdrawal_amount) -> bool {
             // Purpose: Allows the platform owner to withdraw accumulated royalties
            //
            // Process:
            // 1. Get the caller's address
            let caller = get_caller_address();
            // 2. Verify the caller is the platform owner
            let owner = self.owner.read();
            // 3. Get the current platform royalties balance
            let platform_royalties_balance = self.platform_royalties_balance.read();
            assert!(caller == owner, "Only the platform owner can withdraw royalties");
            // 4. If balance is 0, return 0
            if platform_royalties_balance == 0_u256 {
                return false;
            }

            let new_platform_royalties_balance = platform_royalties_balance - total_withdrawal_amount;
            assert!(new_platform_royalties_balance >= 0_u256, "Insufficient balance");


            // 5. Reset the platform royalties balance to 0
            self.platform_royalties_balance.write(new_platform_royalties_balance);

            // 6. Transfer the amount from the contract to the platform owner
            let contract_address = starknet::get_contract_address();

            // Use the IERC20 dispatcher to call the ERC20 contract
            let payment_token = self.payment_token.read();
            let erc20_dispatcher = IERC20Dispatcher { contract_address: payment_token };
            
            // Check if the contract has enough balance
            let contract_balance = erc20_dispatcher.balance_of(contract_address);
            assert!(contract_balance >= total_withdrawal_amount, "Contract has insufficient balance");
            let transfer_success = erc20_dispatcher.transfer_from(payer, contract_address, amount_paid);
            let transfer_success = self._erc20_transfer(payment_token, owner, platform_royalties_balance);
            // 
            assert!(transfer_success, "Transfer failed");
            // 7. Emit a PlatformWithdrawal event
            self.emit(PlatformWithdrawal {
                amount: platform_royalties_balance,
            });
            // 8. Return the withdrawn amount
            platform_royalties_balance
            //
            // Only the platform owner can withdraw platform royalties
            // This collects the 10% fee from all license payments
        }
        fn get_creator_balance(self: @ContractState, creator: ContractAddress) -> u256 {
             // Purpose: Returns the current unwithdrawn balance of a creator
            //
            // Process:
            // 1. Read the creator's balance from storage
            let creator_balance = self.creator_balances.read(creator);
            // 2. Return the balance
            creator_balance
            //
            // A read-only function for creators to check their earnings
            // Used by frontend to display earnings information
        }
        fn get_platform_royalties_balance(self: @ContractState) -> u256 {
              // Purpose: Returns the current unwithdrawn platform royalties balance
            //
            // Process:
            // 1. Read the platform_royalties_balance from storage
            let platform_royalties_balance = self.platform_royalties_balance.read();
            // 2. Return the balance
            platform_royalties_balance
            //
            // A read-only function for the platform owner
            // Used for financial monitoring and planning
        }
        fn get_royalty_rates(self: @ContractState) -> (u8, u8) {
             // Purpose: Returns the current royalty rate split between creators and platform
            //
            // Process:
            // 1. Read the creator_royalty_percentage from storage
            let creator_percentage = self.creator_royalty_percentage.read();
            // 2. Read the platform_royalty_percentage from storage
            let platform_percentage = self.platform_royalty_percentage.read();

            // 3. Return them as a tuple: (creator_percentage, platform_percentage)
            (creator_percentage, platform_percentage)

            // A read-only function to check the current revenue split configuration
            // By default, returns (90, 10) for 90% to creators, 10% to platform
        }
        fn set_royalty_rates(ref self: ContractState, creator_percentage: u8, platform_percentage: u8) -> bool {
               // Purpose: Allows platform owner to change the royalty split percentages
            //
            // Process:
            // 1. Get the caller's address
            let caller = get_caller_address();
            // 2. Verify the caller is the platform owner
            let owner = self.owner.read();
            assert!(caller == owner, "Only the platform owner can change royalty rates");
            // 3. Ensure creator_percentage + platform_percentage = 100
            assert!(creator_percentage + platform_percentage == 100, "Royalty percentages must sum to 100");
            // 4. Update the creator_royalty_percentage
            self.creator_royalty_percentage.write(creator_percentage);
            // 5. Update the platform_royalty_percentage
            self.platform_royalty_percentage.write(platform_percentage);
            // 6. Emit a RoyaltyRatesChanged event
            self.emit(RoyaltyRatesChanged {
                creator_percentage: creator_percentage,
                platform_percentage: platform_percentage,
            });
            // 7. Return true if successful
            true
            //
            // Only the platform owner can change royalty rates
            // The sum of percentages must be exactly 100
        }
        fn set_payment_token(ref self: ContractState, token_address: ContractAddress) -> bool {
             // Purpose: Allows platform owner to change the payment token
            //
            // Process:
            // 1. Get the caller's address
            let caller = get_caller_address();
            // 2. Verify the caller is the platform owner
            let owner = self.owner.read();
            // 3. Store the old token address for the event
            let old_token_address = self.payment_token.read();
            assert!(caller == owner, "Only the platform owner can change payment token");
            // 4. Update the payment_token in storage
            self.payment_token.write(token_address);
            // 5. Emit a PaymentTokenChanged event
            self.emit(PaymentTokenChanged {
                old_token_address: old_token_address,
                new_token_address: token_address,
            });
            // 6. Return true if successful
            true
            //
            // Only the platform owner can change the payment token
            // Be cautious with this function as it affects all payments
            // Make sure to handle existing balances properly when changing tokens
        }

        fn transfer_content_ownership(ref self: ContractState, content_id: u64, new_owner: ContractAddress) -> bool {
    // Purpose: Allows content creators to transfer ownership of their content to another user
    //
    // Process:
    // 1. Get the caller's address (current owner)
    let caller = get_caller_address();
    // 2. Check if the content exists
    let content_info = self.content_info.read(content_id);
    // 3. Verify the caller is the current content owner
    let current_owner = self.content_creator.read(content_id);
    assert!(caller == current_owner, "Only the content owner can transfer ownership");
    // 4. Check that the new owner is not the zero address
    assert!(new_owner != ContractAddress::zero(), "New owner cannot be zero address");
    // 5. Get current content info
    assert!(content_info.is_active, "Content does not exist or is inactive");
    // 6. Update content creator mapping
    self.content_creator.write(content_id, new_owner);
    // 7. Update creator_contents mappings for both old and new owner
    self.creator_content_mapping.write((current_owner, self.creator_content_count.read(current_owner) - 1), content_id);
    self.creator_content_mapping.write((new_owner, self.creator_content_count.read(new_owner)), content_id);
    // 8. Update content_info with new creator
    let updated_content_info = ContentInfo {
        creator: new_owner,
        ..content_info
    };
    self.content_info.write(content_id, updated_content_info);
    // 9. Emit a TransferContentOwnership event
    self.emit(TransferContentOwnership {
        content_id: content_id,
        previous_owner: current_owner,
        new_owner: new_owner,
        timestamp: get_block_timestamp(),
    });
    // 10. Return true if successful
    true

        }

      

    }

