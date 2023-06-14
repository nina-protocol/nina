use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Amount sent does not match price")]
    WrongAmount,
    #[msg("Provided Public Key Is Not A Royalty Recipient On This Royalty Account")]
    InvalidRoyaltyRecipient,
    #[msg("Cannot transfer royalty share larger than current share")]
    RoyaltyTransferTooLarge,
    #[msg("Cannot have more than 10 Revenue Share Holders")]
    MaximumAmountOfRevenueShares,
    #[msg("Royalty exceeds 100%")]
    RoyaltyExceeds100Percent,
    #[msg("Royalty percentage provided is incorrect")]
    RoyaltyPercentageIncorrect,
    #[msg("Sold out")]
    SoldOut,
    #[msg("Invalid amount to mint to artist on publish")]
    InvalidAmountMintToArtist,
    #[msg("Invalid Vault Fee Supplied")]
    InvalidVaultFee,
    #[msg("Invalid royalty recipient authority")]
    InvalidRoyaltyRecipientAuthority,
    #[msg("No more redeemables available")]
    NoMoreRedeemablesAvailable,
    #[msg("Release is not live yet")]
    ReleaseNotLive,
    #[msg("Wrong mint provided for exchange")]
    WrongMintForExchange,
    #[msg("Offer price must be greater than 0")]
    PriceTooLow,
    #[msg("Exchange Expected Amounts Do Not Match")]
    ExpectedAmountMismatch,
    #[msg("Exchange Accept Price too Low")]
    ExchangeAcceptTooLow,
    #[msg("Exchange Cancel Amount Does Not Match")]
    ExchangeCancelAmountMismatch,
    #[msg("Initializer Amounts Do Not Match")]
    InitializerAmountMismatch,
    #[msg("Not using a temporary token account for sending wrapped SOL")]
    NotUsingTemporaryTokenAccount,
    #[msg("Cant withdraw more than deposited")]
    VaultWithdrawAmountTooHigh,
    #[msg("Withdraw amount must be greater than 0")]
    VaultWithdrawAmountMustBeGreaterThanZero,
    #[msg("HubCollaborator Cannot Add Release To Hub Unauthorized")]
    HubCollaboratorCannotAddReleaseToHubUnauthorized,
    #[msg("HubCollaborator Cannot Be Removed From Hub Unauthorized")]
    HubCollaboratorCannotBeRemovedFromHubUnauthorized,
    #[msg("HubCollaborator Cannot Remove Authority From Hub")]
    HubCollaboratorCannotRemoveAuthorityFromHub,
    #[msg("HubContent Cannot Be Toggled Unauthorized")]
    HubContentCannotBeToggledUnauthorized,
    #[msg("Hub Cant withdraw more than deposited")]
    HubWithdrawAmountTooHigh,
    #[msg("Hub Withdraw amount must be greater than 0")]
    HubWithdrawAmountMustBeGreaterThanZero,
    #[msg("Release Purchase Wrong Receiver")]
    ReleasePurchaseWrongReceiver,
    #[msg("HubCollaborator Cannot Add Collaborator")]
    HubCollaboratorCannotAddCollaborator,
    #[msg("HubCollaborator Cannot Init Post")]
    HubCollaboratorCannotInitPost,
    #[msg("HubCollaborator Cannot Add Release To Hub Allowance Used")]
    HubCollaboratorCannotAddReleaseToHubAllowanceUsed,
    #[msg("HubCollaborator Cannot Update HubCollaborator Unauthorized")]
    HubCollaboratorCannotUpdateHubCollaboratorUnauthorized,
    #[msg("HubPublishFeeInvalidValue must be between 0 and 1000000")]
    HubPublishFeeInvalidValue,
    #[msg("HubReferralFeeInvalidValue must be between 0 and 1000000")]
    HubReferralFeeInvalidValue,
    #[msg("ReleaseAlreadyOwned Cannot Claim Release Already Owned")]
    ReleaseAlreadyOwned,
    #[msg("Subscription Payer Mismatch")]
    SubscriptionPayerMismatch,
    #[msg("Subscription Delegated Payer Mismatch")]
    SubscriptionDelegatedPayerMismatch,
}