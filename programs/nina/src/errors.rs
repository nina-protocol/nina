use anchor_lang::error;

#[error]
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
    #[msg("HubArtist Cannot Add Release To Hub Unauthorized")]
    HubArtistCannotAddReleaseToHubUnauthorized,
    #[msg("HubArtist Cannot Be Removed From Hub Unauthorized")]
    HubArtistCannotBeRemovedFromHubUnauthorized,
    #[msg("HubArtist Cannot Remove Curator From Hub")]
    HubArtistCannotRemoveCuratorFromHub,
    #[msg("HubRelease Cannot Be Removed From Hub Unauthorized")]
    HubReleaseCannotBeRemovedFromHubUnauthorized,
}