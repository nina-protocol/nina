const idl = {
  "version": "0.1.0",
  "name": "nina",
  "instructions": [
    {
      "name": "releaseInitProtected",
      "accounts": [
        {
          "name": "release",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "releaseSigner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "releaseMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "authorityTokenAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "paymentMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "royaltyTokenAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "config",
          "type": {
            "defined": "ReleaseConfig"
          }
        },
        {
          "name": "bumps",
          "type": {
            "defined": "ReleaseBumps"
          }
        }
      ]
    },
    {
      "name": "releaseInitWithCredit",
      "accounts": [
        {
          "name": "release",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "releaseSigner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "releaseMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authorityTokenAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "authorityPublishingCreditTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "publishingCreditMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "paymentMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "royaltyTokenAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "config",
          "type": {
            "defined": "ReleaseConfig"
          }
        },
        {
          "name": "bumps",
          "type": {
            "defined": "ReleaseBumps"
          }
        }
      ]
    },
    {
      "name": "releaseInitViaHub",
      "accounts": [
        {
          "name": "release",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "releaseSigner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "hubArtist",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "hub",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "hubRelease",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "hubCurator",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "hubCuratorUsdcTokenAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "releaseMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authorityTokenAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "paymentMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "royaltyTokenAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "config",
          "type": {
            "defined": "ReleaseConfig"
          }
        },
        {
          "name": "bumps",
          "type": {
            "defined": "ReleaseBumps"
          }
        }
      ]
    },
    {
      "name": "releasePurchase",
      "accounts": [
        {
          "name": "payer",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "purchaser",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "release",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "releaseSigner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "payerTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "purchaserReleaseTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "royaltyTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "releaseMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "clock",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "releaseRevenueShareCollect",
      "accounts": [
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "authorityTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "royaltyTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "releaseSigner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "release",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "releaseRevenueShareTransfer",
      "accounts": [
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "authorityTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "royaltyTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "releaseSigner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "release",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "newRoyaltyRecipient",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "newRoyaltyRecipientTokenAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "transferShare",
          "type": "u64"
        }
      ]
    },
    {
      "name": "releaseAirdrop",
      "accounts": [
        {
          "name": "payer",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "release",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "releaseSigner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "recipient",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "recipientReleaseTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "releaseMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "clock",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "releaseUpdateMetadata",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "release",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "releaseSigner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "metadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "releaseMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenMetadataProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "metadataData",
          "type": {
            "defined": "ReleaseMetadataData"
          }
        }
      ]
    },
    {
      "name": "redeemableInit",
      "accounts": [
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "release",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "redeemable",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "redeemableSigner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "redeemableMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "redeemedMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "config",
          "type": {
            "defined": "RedeemableConfig"
          }
        },
        {
          "name": "bumps",
          "type": {
            "defined": "RedeemableBumps"
          }
        }
      ]
    },
    {
      "name": "redeemableUpdateConfig",
      "accounts": [
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "release",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "redeemable",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "redeemableSigner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "redeemableMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "redeemedMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "config",
          "type": {
            "defined": "RedeemableConfig"
          }
        }
      ]
    },
    {
      "name": "redeemableRedeem",
      "accounts": [
        {
          "name": "redeemer",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "redeemableMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "redeemedMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "redeemable",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "redeemableSigner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "release",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "redemptionRecord",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "redeemerRedeemableTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "redeemerRedeemedTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "encryptionPublicKey",
          "type": "bytes"
        },
        {
          "name": "address",
          "type": "bytes"
        },
        {
          "name": "iv",
          "type": "bytes"
        }
      ]
    },
    {
      "name": "redeemableShippingUpdate",
      "accounts": [
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "redeemable",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "redemptionRecord",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "shipper",
          "type": "bytes"
        },
        {
          "name": "trackingNumber",
          "type": "bytes"
        }
      ]
    },
    {
      "name": "exchangeInit",
      "accounts": [
        {
          "name": "initializer",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "releaseMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "initializerExpectedTokenAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "initializerExpectedMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "initializerSendingMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "exchange",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "initializerSendingTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "exchangeEscrowTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "exchangeSigner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "release",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "config",
          "type": {
            "defined": "ExchangeConfig"
          }
        },
        {
          "name": "bump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "exchangeCancel",
      "accounts": [
        {
          "name": "initializer",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "initializerSendingTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "exchange",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "exchangeEscrowTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "exchangeSigner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "exchangeCancelSol",
      "accounts": [
        {
          "name": "initializer",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "exchange",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "exchangeEscrowTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "exchangeSigner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "exchangeAccept",
      "accounts": [
        {
          "name": "taker",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "initializer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "initializerExpectedTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "takerExpectedTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "takerSendingTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "exchangeEscrowTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "exchangeSigner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "exchange",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vaultTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vault",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "royaltyTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "exchangeHistory",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "release",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": "ExchangeAcceptParams"
          }
        }
      ]
    },
    {
      "name": "vaultInit",
      "accounts": [
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vaultSigner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "usdcVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "wrappedSolVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "usdcMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "wrappedSolMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumps",
          "type": {
            "defined": "VaultBumps"
          }
        }
      ]
    },
    {
      "name": "vaultWithdraw",
      "accounts": [
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "vault",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "vaultSigner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "withdrawTarget",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "withdrawDestination",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "withdrawMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "hubInit",
      "accounts": [
        {
          "name": "curator",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "hub",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "hubSigner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "usdcTokenAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "hubArtist",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "usdcMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": "HubInitParams"
          }
        }
      ]
    },
    {
      "name": "hubAddArtist",
      "accounts": [
        {
          "name": "curator",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "hub",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "hubArtist",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "artist",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "hubAddRelease",
      "accounts": [
        {
          "name": "curator",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "hub",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "hubRelease",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "release",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "hubRemoveArtist",
      "accounts": [
        {
          "name": "curator",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "hub",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "hubArtist",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "artist",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "hubRemoveRelease",
      "accounts": [
        {
          "name": "curator",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "hub",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "hubRelease",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "release",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "Exchange",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "initializer",
            "type": "publicKey"
          },
          {
            "name": "release",
            "type": "publicKey"
          },
          {
            "name": "releaseMint",
            "type": "publicKey"
          },
          {
            "name": "initializerExpectedTokenAccount",
            "type": "publicKey"
          },
          {
            "name": "initializerSendingTokenAccount",
            "type": "publicKey"
          },
          {
            "name": "initializerSendingMint",
            "type": "publicKey"
          },
          {
            "name": "initializerExpectedMint",
            "type": "publicKey"
          },
          {
            "name": "exchangeSigner",
            "type": "publicKey"
          },
          {
            "name": "exchangeEscrowTokenAccount",
            "type": "publicKey"
          },
          {
            "name": "expectedAmount",
            "type": "u64"
          },
          {
            "name": "initializerAmount",
            "type": "u64"
          },
          {
            "name": "isSelling",
            "type": "bool"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "ExchangeHistory",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "release",
            "type": "publicKey"
          },
          {
            "name": "seller",
            "type": "publicKey"
          },
          {
            "name": "buyer",
            "type": "publicKey"
          },
          {
            "name": "datetime",
            "type": "u64"
          },
          {
            "name": "price",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "Hub",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "curator",
            "type": "publicKey"
          },
          {
            "name": "hubSigner",
            "type": "publicKey"
          },
          {
            "name": "usdcTokenAccount",
            "type": "publicKey"
          },
          {
            "name": "fee",
            "type": "u64"
          },
          {
            "name": "name",
            "type": {
              "array": [
                "u8",
                100
              ]
            }
          },
          {
            "name": "uri",
            "type": {
              "array": [
                "u8",
                200
              ]
            }
          }
        ]
      }
    },
    {
      "name": "HubRelease",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "hub",
            "type": "publicKey"
          },
          {
            "name": "release",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "HubArtist",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "hub",
            "type": "publicKey"
          },
          {
            "name": "artist",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "Redeemable",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "release",
            "type": "publicKey"
          },
          {
            "name": "redeemableSigner",
            "type": "publicKey"
          },
          {
            "name": "redeemableMint",
            "type": "publicKey"
          },
          {
            "name": "redeemedMint",
            "type": "publicKey"
          },
          {
            "name": "encryptionPublicKey",
            "type": {
              "array": [
                "u8",
                120
              ]
            }
          },
          {
            "name": "redeemedCount",
            "type": "u64"
          },
          {
            "name": "redeemedMax",
            "type": "u64"
          },
          {
            "name": "description",
            "type": {
              "array": [
                "u8",
                280
              ]
            }
          },
          {
            "name": "bumps",
            "type": {
              "defined": "RedeemableBumps"
            }
          }
        ]
      }
    },
    {
      "name": "RedemptionRecord",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "redeemer",
            "type": "publicKey"
          },
          {
            "name": "redeemable",
            "type": "publicKey"
          },
          {
            "name": "release",
            "type": "publicKey"
          },
          {
            "name": "encryptionPublicKey",
            "type": {
              "array": [
                "u8",
                120
              ]
            }
          },
          {
            "name": "iv",
            "type": {
              "array": [
                "u8",
                16
              ]
            }
          },
          {
            "name": "address",
            "type": {
              "array": [
                "u8",
                272
              ]
            }
          },
          {
            "name": "shipper",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "trackingNumber",
            "type": {
              "array": [
                "u8",
                64
              ]
            }
          }
        ]
      }
    },
    {
      "name": "Release",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "payer",
            "type": "publicKey"
          },
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "authorityTokenAccount",
            "type": "publicKey"
          },
          {
            "name": "releaseSigner",
            "type": "publicKey"
          },
          {
            "name": "releaseMint",
            "type": "publicKey"
          },
          {
            "name": "releaseDatetime",
            "type": "i64"
          },
          {
            "name": "royaltyTokenAccount",
            "type": "publicKey"
          },
          {
            "name": "paymentMint",
            "type": "publicKey"
          },
          {
            "name": "totalSupply",
            "type": "u64"
          },
          {
            "name": "remainingSupply",
            "type": "u64"
          },
          {
            "name": "price",
            "type": "u64"
          },
          {
            "name": "resalePercentage",
            "type": "u64"
          },
          {
            "name": "totalCollected",
            "type": "u64"
          },
          {
            "name": "saleCounter",
            "type": "u64"
          },
          {
            "name": "exchangeSaleCounter",
            "type": "u64"
          },
          {
            "name": "saleTotal",
            "type": "u64"
          },
          {
            "name": "exchangeSaleTotal",
            "type": "u64"
          },
          {
            "name": "bumps",
            "type": {
              "defined": "ReleaseBumps"
            }
          },
          {
            "name": "head",
            "type": "u64"
          },
          {
            "name": "tail",
            "type": "u64"
          },
          {
            "name": "royaltyRecipients",
            "type": {
              "array": [
                {
                  "defined": "RoyaltyRecipient"
                },
                10
              ]
            }
          }
        ]
      }
    },
    {
      "name": "Vault",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "vaultSigner",
            "type": "publicKey"
          },
          {
            "name": "usdcVault",
            "type": "publicKey"
          },
          {
            "name": "wrappedSolVault",
            "type": "publicKey"
          },
          {
            "name": "bumps",
            "type": {
              "defined": "VaultBumps"
            }
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "ExchangeConfig",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "expectedAmount",
            "type": "u64"
          },
          {
            "name": "initializerAmount",
            "type": "u64"
          },
          {
            "name": "isSelling",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "ExchangeAcceptParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "expectedAmount",
            "type": "u64"
          },
          {
            "name": "initializerAmount",
            "type": "u64"
          },
          {
            "name": "resalePercentage",
            "type": "u64"
          },
          {
            "name": "datetime",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "HubInitParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "fee",
            "type": "u64"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "uri",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "RedeemableBumps",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "redeemable",
            "type": "u8"
          },
          {
            "name": "signer",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "RedeemableConfig",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "encryptionPublicKey",
            "type": "bytes"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "redeemedMax",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "RoyaltyRecipient",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "recipientAuthority",
            "type": "publicKey"
          },
          {
            "name": "recipientTokenAccount",
            "type": "publicKey"
          },
          {
            "name": "percentShare",
            "type": "u64"
          },
          {
            "name": "owed",
            "type": "u64"
          },
          {
            "name": "collected",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "ReleaseBumps",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "release",
            "type": "u8"
          },
          {
            "name": "signer",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "ReleaseConfig",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "amountTotalSupply",
            "type": "u64"
          },
          {
            "name": "amountToArtistTokenAccount",
            "type": "u64"
          },
          {
            "name": "amountToVaultTokenAccount",
            "type": "u64"
          },
          {
            "name": "resalePercentage",
            "type": "u64"
          },
          {
            "name": "price",
            "type": "u64"
          },
          {
            "name": "releaseDatetime",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "ReleaseMetadataData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "symbol",
            "type": "string"
          },
          {
            "name": "uri",
            "type": "string"
          },
          {
            "name": "sellerFeeBasisPoints",
            "type": "u16"
          }
        ]
      }
    },
    {
      "name": "VaultBumps",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "vault",
            "type": "u8"
          },
          {
            "name": "signer",
            "type": "u8"
          },
          {
            "name": "usdc",
            "type": "u8"
          },
          {
            "name": "wsol",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "AuthorityType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "MintTokens"
          },
          {
            "name": "FreezeAccount"
          },
          {
            "name": "AccountOwner"
          },
          {
            "name": "CloseAccount"
          }
        ]
      }
    }
  ],
  "events": [
    {
      "name": "ExchangeAdded",
      "fields": [
        {
          "name": "releaseMint",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "release",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "initializer",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "expectedAmount",
          "type": "u64",
          "index": false
        },
        {
          "name": "initializerAmount",
          "type": "u64",
          "index": false
        },
        {
          "name": "publicKey",
          "type": "publicKey",
          "index": true
        }
      ]
    },
    {
      "name": "ExchangeCompleted",
      "fields": [
        {
          "name": "taker",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "publicKey",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "datetime",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "ExchangeCancelled",
      "fields": [
        {
          "name": "publicKey",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "RedeemableCreated",
      "fields": [
        {
          "name": "authority",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "mint",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "redeemedMint",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "release",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "publicKey",
          "type": "publicKey",
          "index": true
        }
      ]
    },
    {
      "name": "RedeemableRedeemed",
      "fields": [
        {
          "name": "authority",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "release",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "publicKey",
          "type": "publicKey",
          "index": true
        }
      ]
    },
    {
      "name": "ReleaseCreated",
      "fields": [
        {
          "name": "authority",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "date",
          "type": "i64",
          "index": false
        },
        {
          "name": "mint",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "publicKey",
          "type": "publicKey",
          "index": true
        }
      ]
    },
    {
      "name": "RoyaltyRecipientAdded",
      "fields": [
        {
          "name": "authority",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "publicKey",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "ReleaseSold",
      "fields": [
        {
          "name": "publicKey",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "date",
          "type": "i64",
          "index": true
        }
      ]
    },
    {
      "name": "ReleaseMetadataUpdated",
      "fields": [
        {
          "name": "publicKey",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "metadataPublicKey",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "uri",
          "type": "string",
          "index": false
        }
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "WrongAmount",
      "msg": "Amount sent does not match price"
    },
    {
      "code": 6001,
      "name": "InvalidRoyaltyRecipient",
      "msg": "Provided Public Key Is Not A Royalty Recipient On This Royalty Account"
    },
    {
      "code": 6002,
      "name": "RoyaltyTransferTooLarge",
      "msg": "Cannot transfer royalty share larger than current share"
    },
    {
      "code": 6003,
      "name": "MaximumAmountOfRevenueShares",
      "msg": "Cannot have more than 10 Revenue Share Holders"
    },
    {
      "code": 6004,
      "name": "RoyaltyExceeds100Percent",
      "msg": "Royalty exceeds 100%"
    },
    {
      "code": 6005,
      "name": "RoyaltyPercentageIncorrect",
      "msg": "Royalty percentage provided is incorrect"
    },
    {
      "code": 6006,
      "name": "SoldOut",
      "msg": "Sold out"
    },
    {
      "code": 6007,
      "name": "InvalidAmountMintToArtist",
      "msg": "Invalid amount to mint to artist on publish"
    },
    {
      "code": 6008,
      "name": "InvalidVaultFee",
      "msg": "Invalid Vault Fee Supplied"
    },
    {
      "code": 6009,
      "name": "InvalidRoyaltyRecipientAuthority",
      "msg": "Invalid royalty recipient authority"
    },
    {
      "code": 6010,
      "name": "NoMoreRedeemablesAvailable",
      "msg": "No more redeemables available"
    },
    {
      "code": 6011,
      "name": "ReleaseNotLive",
      "msg": "Release is not live yet"
    },
    {
      "code": 6012,
      "name": "WrongMintForExchange",
      "msg": "Wrong mint provided for exchange"
    },
    {
      "code": 6013,
      "name": "PriceTooLow",
      "msg": "Offer price must be greater than 0"
    },
    {
      "code": 6014,
      "name": "ExpectedAmountMismatch",
      "msg": "Exchange Expected Amounts Do Not Match"
    },
    {
      "code": 6015,
      "name": "ExchangeAcceptTooLow",
      "msg": "Exchange Accept Price too Low"
    },
    {
      "code": 6016,
      "name": "ExchangeCancelAmountMismatch",
      "msg": "Exchange Cancel Amount Does Not Match"
    },
    {
      "code": 6017,
      "name": "InitializerAmountMismatch",
      "msg": "Initializer Amounts Do Not Match"
    },
    {
      "code": 6018,
      "name": "NotUsingTemporaryTokenAccount",
      "msg": "Not using a temporary token account for sending wrapped SOL"
    },
    {
      "code": 6019,
      "name": "VaultWithdrawAmountTooHigh",
      "msg": "Cant withdraw more than deposited"
    },
    {
      "code": 6020,
      "name": "VaultWithdrawAmountMustBeGreaterThanZero",
      "msg": "Withdraw amount must be greater than 0"
    }
  ],
  "metadata": {
    "address": "ninaN2tm9vUkxoanvGcNApEeWiidLMM2TdBX8HoJuL4"
  }
}

export default idl
