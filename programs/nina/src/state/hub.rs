use anchor_lang::prelude::*;

#[account(zero_copy)]
#[repr(C)]
pub struct Hub {
	pub curator: Pubkey,
	pub hub_signer: Pubkey,
	pub treasury: Pubkey,
	pub primary_fee: u16,
	pub secondary_fee: u16,
	pub name: [u8; 100],
	pub uri: [u8; 200],
}

#[account]
pub struct HubRelease {
	pub hub: Pubkey,
	pub release_mint: Pubkey
}

#[account]
pub struct HubArtist {
	pub hub: Pubkey,
	pub artist: Pubkey,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default)]
pub struct HubInitParams {
    pub primary_fee: u16,
    pub secondary_fee: u16,
    pub name: String,
	pub uri: String,
}
