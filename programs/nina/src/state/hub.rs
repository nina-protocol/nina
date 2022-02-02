use anchor_lang::prelude::*;

#[account(zero_copy)]
#[repr(packed)]
pub struct Hub {
	pub curator: Pubkey,
	pub hub_signer: Pubkey,
	pub publish_fee: u64,
	pub name: [u8; 100],
	pub uri: [u8; 200],
	pub referral_fee: u64,
}

#[account]
#[derive(Default)]
pub struct HubRelease {
	pub hub: Pubkey,
	pub release: Pubkey,
	pub sales: u64,
	pub published_through_hub: bool,
}

#[account]
#[derive(Default)]
pub struct HubArtist {
	pub hub: Pubkey,
	pub artist: Pubkey,
	pub can_add_release: bool,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default)]
pub struct HubInitParams {
    pub publish_fee: u64,
    pub name: String,
	pub uri: String,
	pub referral_fee: u64,
}

#[event]
pub struct HubCreated {
	#[index]
	pub public_key: Pubkey,
	pub hub_artist: Pubkey,
	pub artist: Pubkey,
}

#[event]
pub struct HubArtistAdded {
	#[index]
	pub public_key: Pubkey,
	pub hub: Pubkey,
	pub artist: Pubkey,
}

#[event]
pub struct HubArtistRemoved {
	#[index]
	pub public_key: Pubkey,
	pub hub: Pubkey,	
	pub artist: Pubkey,
}

#[event]
pub struct HubReleaseAdded {
	#[index]
	pub public_key: Pubkey,
	pub hub: Pubkey,
	pub release: Pubkey,
}

#[event]
pub struct HubReleaseRemoved {
	#[index]
	pub public_key: Pubkey,
	pub hub: Pubkey,
	pub release: Pubkey,
}