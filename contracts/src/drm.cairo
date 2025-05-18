use starknet::ContractAddress;

#[derive(Copy, Drop, starknet::Store, Serde, PartialEq)]
enum LicenseType {
    OneMonth,
    SixMonths,
    TwelveMonths,
}

#[derive(Drop, starknet::Store, Serde)]
struct LicensePrice {
    content_id: u64, // ID of the content this license is for
    price: u32,      // Price of the license
    license_type: LicenseType
}

#[derive(Drop, starknet::Store, Serde)]
struct ContentInfo {
    title: felt252,
    ipfs_hash: felt252,
    creator: ContractAddress,
    creation_timestamp: u64,
    license_count: u32,
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
    
    fn issue_license(ref self: TContractState, content_id: u64, license_type: LicenseType) -> bool;
    
    fn revoke_license(ref self: TContractState, license_id: u64, user: ContractAddress) -> bool;
    
    fn renew_license(ref self: TContractState,  license_id: u64, additional_time: u64) -> bool;
    
    // View functions
    fn get_license_price(self: @TContractState, content_id: u64, license_type: LicenseType) -> u32;
    
    fn get_content_details(self: @TContractState, content_id: u64) -> (u32, u64, u32, u32, ContractAddress, felt252, felt252);

    fn get_license_status(self: @TContractState, license_id: u64,  user: ContractAddress) -> bool;
    
    fn process_payment_for_content(ref self: TContractState, content_id: u64, amount_paid: u256) -> bool;
    
    fn withdraw_creator_earnings(ref self: TContractState, content_id: u64) -> bool;

    fn withdraw_platform_royalties(ref self: TContractState) -> bool;

    fn get_creator_balance(self: @TContractState,creator: ContractAddress) -> u256;
    
    fn get_platform_royalties_balance(self: @TContractState) -> u256;

    fn get_royalty_rates(self: @TContractState) -> (u8, u8);

    fn set_royalty_rates(ref self: TContractState,creator_percentage: u8, platform_percentage: u8) -> bool;

     fn set_payment_token(ref self: TContractState,token_address: ContractAddress) -> bool;
    
    fn check_access(self: @TContractState, content_id: u64, user: ContractAddress)->bool;
    
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
        creator_contents: Map<ContractAddress, Array<u64>>, // Maps creator to their content IDs
        
        // License management
        license_counter: u64,                            // Counter for unique license IDs
        licenses: Map<u64, License>,                     // Maps license ID to license details
        content_licenses: Map<u64, Array<u64>>,          // Maps content ID to license IDs
        user_licenses: Map<ContractAddress, Array<u64>>, // Maps user address to their license IDs
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

             // Purpose: Allows content creators to upload and register their content on the platform
            //
            // Process:
            // 1. Get the caller's address, which will be registered as the content creator
            // 2. Increment the content counter to generate a new unique content ID
            // 3. Create a ContentInfo struct with provided data and current timestamp
            // 4. Store the content info in the contract's storage
            // 5. Map the content to its creator
            // 6. Add this content ID to the creator's list of contents
            // 7. Emit a ContentUploaded event
            // 8. Return the newly created content ID
            //
            // This function is the first step in the content lifecycle - creators upload content
            // before setting prices and making it available for licensing
         
        }

        fn set_license_price(ref self: ContractState, content_id: u64, license_type: LicenseType, price: u32) -> bool {
             // Purpose: Sets the price for a specific type of license for a given content
            //
            // Process:
            // 1. Verify the caller is the content creator/owner
            // 2. Check if the content exists
            // 3. Create a mapping from (content_id, license_type) -> price
            // 4. Store the price in the contract's storage
            // 5. Emit a LicensePriceSet event
            // 6. Return true if successful
            //
            // Each content can have different prices for different license types
            // (OneMonth, SixMonths, TwelveMonths)
            // Only the content creator should be able to set prices
        }
        fn issue_license(ref self: ContractState, content_id: u64, license_type: LicenseType) -> bool {
             // Purpose: Issues a license to a user after payment is confirmed
            //
            // Process:
            // 1. Get the caller's address (the licensee)
            // 2. Check if the content exists and has a price set for the requested license type
            // 3. Process payment (could be called separately or internally)
            // 4. Calculate license duration based on license type
            //    - OneMonth: current time + 30 days
            //    - SixMonths: current time + 180 days
            //    - TwelveMonths: current time + 365 days
            // 5. Increment license counter to generate a new unique license ID
            // 6. Create License struct with all necessary details
            // 7. Store the license in storage
            // 8. Add license ID to user's licenses list
            // 9. Add license ID to content's licenses list
            // 10. Increment the content's license count
            // 11. Emit a LicenseIssued event
            // 12. Return the new license ID
            //
            // This function both creates the license and handles payment logic
            // The payment splits 90% to content creator and 10% to platform
        }
        fn revoke_license(ref self: ContractState, license_id: u64, user: ContractAddress) -> bool {
             // Purpose: Allows content owners to revoke licenses (in case of violations, etc.)
            //
            // Process:
            // 1. Get the caller's address
            // 2. Check if the license exists
            // 3. Get the content ID from the license
            // 4. Verify caller is either the content creator or platform owner
            // 5. Set the license's is_active field to false
            // 6. Emit a LicenseRevoked event
            // 7. Return true if successful
            //
            // Only the content creator or platform owner should be able to revoke licenses
            // Revoked licenses will still exist but will no longer grant access to content
        }
        fn renew_license(ref self: ContractState, license_id: u64, additional_time: u64) -> bool {
              // Purpose: Allows users to extend their license duration
            //
            // Process:
            // 1. Get the caller's address
            // 2. Check if the license exists and belongs to the caller
            // 3. Verify the license is active
            // 4. Calculate the new end timestamp by adding additional_time to current end_timestamp
            // 5. Calculate price based on additional time (proportional to original license price)
            // 6. Process payment (same 90/10 split as original license)
            // 7. Update the license's end_timestamp
            // 8. Emit a LicenseRenewed event
            // 9. Return true if successful
            //
            // This allows users to extend licenses without creating new ones
            // Payment is handled similarly to initial license purchase
        }
        // View functions
        fn get_license_price(self: @ContractState, content_id: u64, license_type: LicenseType) -> u32 {
           // Purpose: Returns the price for a specific license type for given content
            //
            // Process:
            // 1. Check if content exists
            // 2. Return the stored price for the (content_id, license_type) pair
            // 3. If no price is set, return 0
            //
            // A read-only function that doesn't modify state
            // Used by frontend to display prices to users
        }
        fn get_content_details(self: @ContractState, content_id: u64) -> (u32, u64, u32, u32, ContractAddress, felt252, felt252) {
             // Purpose: Returns detailed information about a piece of content
            //
            // Process:
            // 1. Check if content exists
            // 2. Return the ContentInfo struct stored for this content ID
            //
            // A read-only function for retrieving content metadata
            // Used by frontend to display content information
        }

        fn get_license_status(self: @ContractState, license_id: u64, user: ContractAddress) -> bool {
        // Purpose: Checks if a license is currently active
            //
            // Process:
            // 1. Check if the license exists
            // 2. Verify if the license is marked as active
            // 3. Check if the current time is before the license expiration time
            // 4. Return true if both conditions are met, false otherwise
            //
            // Used to quickly check if a license is valid without retrieving all details
        }
        fn process_payment_for_content(ref self: ContractState, content_id: u64, amount_paid: u256) -> bool {
              // Purpose: Processes payment for licensing content and splits revenue
            //
            // Process:
            // 1. Get the caller's address (payer)
            // 2. Check if content exists and has a price for the requested license type
            // 3. Get the content creator's address
            // 4. Get the price for the requested license type
            // 5. Calculate the split:
            //    - Creator amount = price * creator_royalty_percentage / 100
            //    - Platform amount = price * platform_royalty_percentage / 100
            // 6. Transfer the total amount from the user to this contract
            //    (requires approval from the user first)
            // 7. Update the creator's balance by adding the creator amount
            // 8. Update the platform royalties balance by adding the platform amount
            // 9. Emit a PaymentProcessed event
            // 10. Return true if successful
            //
            // This function handles the financial transactions
            // The 90/10 split is applied here
            // No actual license is issued here - that's handled by issue_license
        }
        fn withdraw_creator_earnings(ref self: ContractState, content_id: u64) -> bool {
                // Purpose: Allows content creators to withdraw their earnings
            //
            // Process:
            // 1. Get the caller's address (creator)
            // 2. Initialize a total withdrawal amount to 0
            // 3. For each content ID in the array:
            //    - Verify the caller is the creator of that content
            //    - Add the earnings for that content to the total withdrawal amount
            // 4. If total withdrawal amount is 0, return 0
            // 5. Clear the creator's balance for the specified content IDs
            // 6. Transfer the total amount from the contract to the creator
            // 7. Emit a CreatorWithdrawal event
            // 8. Return the withdrawn amount
            //
            // Creators can withdraw earnings from multiple contents at once
            // Only the actual creator can withdraw earnings for their content
        }
        fn withdraw_platform_royalties(ref self: ContractState) -> bool {
             // Purpose: Allows the platform owner to withdraw accumulated royalties
            //
            // Process:
            // 1. Get the caller's address
            // 2. Verify the caller is the platform owner
            // 3. Get the current platform royalties balance
            // 4. If balance is 0, return 0
            // 5. Reset the platform royalties balance to 0
            // 6. Transfer the amount from the contract to the platform owner
            // 7. Emit a PlatformWithdrawal event
            // 8. Return the withdrawn amount
            //
            // Only the platform owner can withdraw platform royalties
            // This collects the 10% fee from all license payments
        }
        fn get_creator_balance(self: @ContractState, creator: ContractAddress) -> u256 {
             // Purpose: Returns the current unwithdrawn balance of a creator
            //
            // Process:
            // 1. Read the creator's balance from storage
            // 2. Return the balance
            //
            // A read-only function for creators to check their earnings
            // Used by frontend to display earnings information
        }
        fn get_platform_royalties_balance(self: @ContractState) -> u256 {
              // Purpose: Returns the current unwithdrawn platform royalties balance
            //
            // Process:
            // 1. Read the platform_royalties_balance from storage
            // 2. Return the balance
            //
            // A read-only function for the platform owner
            // Used for financial monitoring and planning
        }
        fn get_royalty_rates(self: @ContractState) -> (u8, u8) {
             // Purpose: Returns the current royalty rate split between creators and platform
            //
            // Process:
            // 1. Read the creator_royalty_percentage from storage
            // 2. Read the platform_royalty_percentage from storage
            // 3. Return them as a tuple: (creator_percentage, platform_percentage)
            //
            // A read-only function to check the current revenue split configuration
            // By default, returns (90, 10) for 90% to creators, 10% to platform
        }
        fn set_royalty_rates(ref self: ContractState, creator_percentage: u8, platform_percentage: u8) -> bool {
               // Purpose: Allows platform owner to change the royalty split percentages
            //
            // Process:
            // 1. Get the caller's address
            // 2. Verify the caller is the platform owner
            // 3. Ensure creator_percentage + platform_percentage = 100
            // 4. Update the creator_royalty_percentage
            // 5. Update the platform_royalty_percentage
            // 6. Emit a RoyaltyRatesChanged event
            // 7. Return true if successful
            //
            // Only the platform owner can change royalty rates
            // The sum of percentages must be exactly 100
        }
        fn set_payment_token(ref self: ContractState, token_address: ContractAddress) -> bool {
             // Purpose: Allows platform owner to change the payment token
            //
            // Process:
            // 1. Get the caller's address
            // 2. Verify the caller is the platform owner
            // 3. Store the old token address for the event
            // 4. Update the payment_token in storage
            // 5. Emit a PaymentTokenChanged event
            // 6. Return true if successful
            //
            // Only the platform owner can change the payment token
            // Be cautious with this function as it affects all payments
            // Make sure to handle existing balances properly when changing tokens
        }
        fn check_access(self: @ContractState, content_id: u64, user: ContractAddress) -> bool {
             // Purpose: Verifies if a user has access to a specific content
            //
            // Process:
            // 1. Get all licenses owned by the user
            // 2. For each license, check:
            //    - Does it match the requested content_id?
            //    - Is it currently active?
            //    - Is it not expired?
            // 3. If any valid license is found, return true
            // 4. Otherwise, return false
            //
            // This is the main access control function for the DRM system
            // Used by external applications to verify user access rights
        }

    }

}