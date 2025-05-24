// Get the ABI for the DRM contract
import { Abi } from 'starknet';
export const ABI: Abi = [
  {
    "type": "impl",
    "name": "DRMImpl",
    "interface_name": "contracts::drm::IDigitalRightsManagement"
  },
  {
    "type": "enum",
    "name": "contracts::drm::LicenseType",
    "variants": [
      {
        "name": "OneMonth",
        "type": "()"
      },
      {
        "name": "SixMonths",
        "type": "()"
      },
      {
        "name": "OneYear",
        "type": "()"
      }
    ]
  },
  {
    "type": "enum",
    "name": "core::bool",
    "variants": [
      {
        "name": "False",
        "type": "()"
      },
      {
        "name": "True",
        "type": "()"
      }
    ]
  },
  {
    "type": "struct",
    "name": "core::integer::u256",
    "members": [
      {
        "name": "low",
        "type": "core::integer::u128"
      },
      {
        "name": "high",
        "type": "core::integer::u128"
      }
    ]
  },
  {
    "type": "interface",
    "name": "contracts::drm::IDigitalRightsManagement",
    "items": [
      {
        "type": "function",
        "name": "upload_content",
        "inputs": [
          {
            "name": "title",
            "type": "core::felt252"
          },
          {
            "name": "ipfs_hash",
            "type": "core::felt252"
          }
        ],
        "outputs": [
          {
            "type": "core::integer::u64"
          }
        ],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "set_license_price",
        "inputs": [
          {
            "name": "content_id",
            "type": "core::integer::u64"
          },
          {
            "name": "license_type",
            "type": "contracts::drm::LicenseType"
          },
          {
            "name": "price",
            "type": "core::integer::u32"
          }
        ],
        "outputs": [
          {
            "type": "core::bool"
          }
        ],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "issue_license",
        "inputs": [
          {
            "name": "content_id",
            "type": "core::integer::u64"
          },
          {
            "name": "license_type",
            "type": "contracts::drm::LicenseType"
          }
        ],
        "outputs": [
          {
            "type": "core::integer::u64"
          }
        ],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "revoke_license",
        "inputs": [
          {
            "name": "license_id",
            "type": "core::integer::u64"
          },
          {
            "name": "user",
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "outputs": [
          {
            "type": "core::bool"
          }
        ],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "renew_license",
        "inputs": [
          {
            "name": "license_id",
            "type": "core::integer::u64"
          },
          {
            "name": "additional_time",
            "type": "core::integer::u64"
          }
        ],
        "outputs": [
          {
            "type": "core::bool"
          }
        ],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "get_license_price",
        "inputs": [
          {
            "name": "content_id",
            "type": "core::integer::u64"
          },
          {
            "name": "license_type",
            "type": "contracts::drm::LicenseType"
          }
        ],
        "outputs": [
          {
            "type": "core::integer::u32"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "get_content_details",
        "inputs": [
          {
            "name": "content_id",
            "type": "core::integer::u64"
          }
        ],
        "outputs": [
          {
            "type": "(core::integer::u64, core::felt252, core::felt252, core::starknet::contract_address::ContractAddress, core::integer::u64)"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "get_license_status",
        "inputs": [
          {
            "name": "license_id",
            "type": "core::integer::u64"
          },
          {
            "name": "user",
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "outputs": [
          {
            "type": "core::bool"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "process_payment_for_content",
        "inputs": [
          {
            "name": "content_id",
            "type": "core::integer::u64"
          },
          {
            "name": "amount_paid",
            "type": "core::integer::u256"
          }
        ],
        "outputs": [
          {
            "type": "core::bool"
          }
        ],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "withdraw_creator_earnings",
        "inputs": [
          {
            "name": "content_id",
            "type": "core::integer::u64"
          },
          {
            "name": "total_withdrawal_amount",
            "type": "core::integer::u256"
          }
        ],
        "outputs": [
          {
            "type": "core::bool"
          }
        ],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "withdraw_platform_royalties",
        "inputs": [
          {
            "name": "total_withdrawal_amount",
            "type": "core::integer::u256"
          }
        ],
        "outputs": [
          {
            "type": "core::bool"
          }
        ],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "get_creator_balance",
        "inputs": [
          {
            "name": "creator",
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "outputs": [
          {
            "type": "core::integer::u256"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "get_platform_royalties_balance",
        "inputs": [],
        "outputs": [
          {
            "type": "core::integer::u256"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "get_royalty_rates",
        "inputs": [],
        "outputs": [
          {
            "type": "(core::integer::u8, core::integer::u8)"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "set_royalty_rates",
        "inputs": [
          {
            "name": "creator_percentage",
            "type": "core::integer::u8"
          },
          {
            "name": "platform_percentage",
            "type": "core::integer::u8"
          }
        ],
        "outputs": [
          {
            "type": "core::bool"
          }
        ],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "set_payment_token",
        "inputs": [
          {
            "name": "token_address",
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "outputs": [
          {
            "type": "core::bool"
          }
        ],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "transfer_content_ownership",
        "inputs": [
          {
            "name": "content_id",
            "type": "core::integer::u64"
          },
          {
            "name": "new_owner",
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "outputs": [
          {
            "type": "core::bool"
          }
        ],
        "state_mutability": "external"
      }
    ]
  },
  {
    "type": "constructor",
    "name": "constructor",
    "inputs": [
      {
        "name": "payment_token",
        "type": "core::starknet::contract_address::ContractAddress"
      },
      {
        "name": "owner",
        "type": "core::starknet::contract_address::ContractAddress"
      }
    ]
  },
  {
    "type": "event",
    "name": "contracts::drm::DRMContract::ContentUploaded",
    "kind": "struct",
    "members": [
      {
        "name": "content_id",
        "type": "core::integer::u64",
        "kind": "data"
      },
      {
        "name": "creator",
        "type": "core::starknet::contract_address::ContractAddress",
        "kind": "data"
      },
      {
        "name": "title",
        "type": "core::felt252",
        "kind": "data"
      },
      {
        "name": "timestamp",
        "type": "core::integer::u64",
        "kind": "data"
      }
    ]
  },
  {
    "type": "event",
    "name": "contracts::drm::DRMContract::LicensePriceSet",
    "kind": "struct",
    "members": [
      {
        "name": "content_id",
        "type": "core::integer::u64",
        "kind": "data"
      },
      {
        "name": "license_type",
        "type": "contracts::drm::LicenseType",
        "kind": "data"
      },
      {
        "name": "price",
        "type": "core::integer::u256",
        "kind": "data"
      }
    ]
  },
  {
    "type": "event",
    "name": "contracts::drm::DRMContract::LicenseIssued",
    "kind": "struct",
    "members": [
      {
        "name": "license_id",
        "type": "core::integer::u64",
        "kind": "data"
      },
      {
        "name": "content_id",
        "type": "core::integer::u64",
        "kind": "data"
      },
      {
        "name": "license_type",
        "type": "contracts::drm::LicenseType",
        "kind": "data"
      },
      {
        "name": "licensee",
        "type": "core::starknet::contract_address::ContractAddress",
        "kind": "data"
      },
      {
        "name": "price",
        "type": "core::integer::u256",
        "kind": "data"
      },
      {
        "name": "start_timestamp",
        "type": "core::integer::u64",
        "kind": "data"
      },
      {
        "name": "end_timestamp",
        "type": "core::integer::u64",
        "kind": "data"
      }
    ]
  },
  {
    "type": "event",
    "name": "contracts::drm::DRMContract::LicenseRevoked",
    "kind": "struct",
    "members": [
      {
        "name": "license_id",
        "type": "core::integer::u64",
        "kind": "data"
      },
      {
        "name": "content_id",
        "type": "core::integer::u64",
        "kind": "data"
      },
      {
        "name": "licensee",
        "type": "core::starknet::contract_address::ContractAddress",
        "kind": "data"
      }
    ]
  },
  {
    "type": "event",
    "name": "contracts::drm::DRMContract::LicenseRenewed",
    "kind": "struct",
    "members": [
      {
        "name": "license_id",
        "type": "core::integer::u64",
        "kind": "data"
      },
      {
        "name": "new_end_timestamp",
        "type": "core::integer::u64",
        "kind": "data"
      }
    ]
  },
  {
    "type": "event",
    "name": "contracts::drm::DRMContract::PaymentProcessed",
    "kind": "struct",
    "members": [
      {
        "name": "content_id",
        "type": "core::integer::u64",
        "kind": "data"
      },
      {
        "name": "license_type",
        "type": "contracts::drm::LicenseType",
        "kind": "data"
      },
      {
        "name": "payer",
        "type": "core::starknet::contract_address::ContractAddress",
        "kind": "data"
      },
      {
        "name": "amount",
        "type": "core::integer::u256",
        "kind": "data"
      },
      {
        "name": "creator_amount",
        "type": "core::integer::u256",
        "kind": "data"
      },
      {
        "name": "platform_amount",
        "type": "core::integer::u256",
        "kind": "data"
      }
    ]
  },
  {
    "type": "event",
    "name": "contracts::drm::DRMContract::CreatorWithdrawal",
    "kind": "struct",
    "members": [
      {
        "name": "creator",
        "type": "core::starknet::contract_address::ContractAddress",
        "kind": "data"
      },
      {
        "name": "amount",
        "type": "core::integer::u256",
        "kind": "data"
      }
    ]
  },
  {
    "type": "event",
    "name": "contracts::drm::DRMContract::PlatformWithdrawal",
    "kind": "struct",
    "members": [
      {
        "name": "owner",
        "type": "core::starknet::contract_address::ContractAddress",
        "kind": "data"
      },
      {
        "name": "amount",
        "type": "core::integer::u256",
        "kind": "data"
      }
    ]
  },
  {
    "type": "event",
    "name": "contracts::drm::DRMContract::RoyaltyRatesChanged",
    "kind": "struct",
    "members": [
      {
        "name": "creator_percentage",
        "type": "core::integer::u8",
        "kind": "data"
      },
      {
        "name": "platform_percentage",
        "type": "core::integer::u8",
        "kind": "data"
      }
    ]
  },
  {
    "type": "event",
    "name": "contracts::drm::DRMContract::TransferContentOwnership",
    "kind": "struct",
    "members": [
      {
        "name": "content_id",
        "type": "core::integer::u64",
        "kind": "data"
      },
      {
        "name": "previous_owner",
        "type": "core::starknet::contract_address::ContractAddress",
        "kind": "data"
      },
      {
        "name": "new_owner",
        "type": "core::starknet::contract_address::ContractAddress",
        "kind": "data"
      },
      {
        "name": "timestamp",
        "type": "core::integer::u64",
        "kind": "data"
      }
    ]
  },
  {
    "type": "event",
    "name": "contracts::drm::DRMContract::PaymentTokenChanged",
    "kind": "struct",
    "members": [
      {
        "name": "old_token_address",
        "type": "core::starknet::contract_address::ContractAddress",
        "kind": "data"
      },
      {
        "name": "new_token_address",
        "type": "core::starknet::contract_address::ContractAddress",
        "kind": "data"
      }
    ]
  },
  {
    "type": "event",
    "name": "openzeppelin_access::ownable::ownable::OwnableComponent::OwnershipTransferred",
    "kind": "struct",
    "members": [
      {
        "name": "previous_owner",
        "type": "core::starknet::contract_address::ContractAddress",
        "kind": "key"
      },
      {
        "name": "new_owner",
        "type": "core::starknet::contract_address::ContractAddress",
        "kind": "key"
      }
    ]
  },
  {
    "type": "event",
    "name": "openzeppelin_access::ownable::ownable::OwnableComponent::OwnershipTransferStarted",
    "kind": "struct",
    "members": [
      {
        "name": "previous_owner",
        "type": "core::starknet::contract_address::ContractAddress",
        "kind": "key"
      },
      {
        "name": "new_owner",
        "type": "core::starknet::contract_address::ContractAddress",
        "kind": "key"
      }
    ]
  },
  {
    "type": "event",
    "name": "openzeppelin_access::ownable::ownable::OwnableComponent::Event",
    "kind": "enum",
    "variants": [
      {
        "name": "OwnershipTransferred",
        "type": "openzeppelin_access::ownable::ownable::OwnableComponent::OwnershipTransferred",
        "kind": "nested"
      },
      {
        "name": "OwnershipTransferStarted",
        "type": "openzeppelin_access::ownable::ownable::OwnableComponent::OwnershipTransferStarted",
        "kind": "nested"
      }
    ]
  },
  {
    "type": "event",
    "name": "contracts::drm::DRMContract::Event",
    "kind": "enum",
    "variants": [
      {
        "name": "ContentUploaded",
        "type": "contracts::drm::DRMContract::ContentUploaded",
        "kind": "nested"
      },
      {
        "name": "LicensePriceSet",
        "type": "contracts::drm::DRMContract::LicensePriceSet",
        "kind": "nested"
      },
      {
        "name": "LicenseIssued",
        "type": "contracts::drm::DRMContract::LicenseIssued",
        "kind": "nested"
      },
      {
        "name": "LicenseRevoked",
        "type": "contracts::drm::DRMContract::LicenseRevoked",
        "kind": "nested"
      },
      {
        "name": "LicenseRenewed",
        "type": "contracts::drm::DRMContract::LicenseRenewed",
        "kind": "nested"
      },
      {
        "name": "PaymentProcessed",
        "type": "contracts::drm::DRMContract::PaymentProcessed",
        "kind": "nested"
      },
      {
        "name": "CreatorWithdrawal",
        "type": "contracts::drm::DRMContract::CreatorWithdrawal",
        "kind": "nested"
      },
      {
        "name": "PlatformWithdrawal",
        "type": "contracts::drm::DRMContract::PlatformWithdrawal",
        "kind": "nested"
      },
      {
        "name": "RoyaltyRatesChanged",
        "type": "contracts::drm::DRMContract::RoyaltyRatesChanged",
        "kind": "nested"
      },
      {
        "name": "TransferContentOwnership",
        "type": "contracts::drm::DRMContract::TransferContentOwnership",
        "kind": "nested"
      },
      {
        "name": "PaymentTokenChanged",
        "type": "contracts::drm::DRMContract::PaymentTokenChanged",
        "kind": "nested"
      },
      {
        "name": "OwnableEvent",
        "type": "openzeppelin_access::ownable::ownable::OwnableComponent::Event",
        "kind": "flat"
      }
    ]
  }
]