use anchor_lang::prelude::*;

#[account(zero_copy)]
#[repr(C)]
pub struct Hub {
	pub curator: Pubkey,
	pub hub_signer: Pubkey,
	pub usdc_token_account: Pubkey,
	pub fee: u64,
	pub name: [u8; 100],
	pub uri: [u8; 200],
}

#[account]
#[derive(Default)]
pub struct HubRelease {
	pub hub: Pubkey,
	pub release: Pubkey
}

#[account]
#[derive(Default)]
pub struct HubArtist {
	pub hub: Pubkey,
	pub artist: Pubkey,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default)]
pub struct HubInitParams {
    pub fee: u64,
    pub name: String,
	pub uri: String,
}
