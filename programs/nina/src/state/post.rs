use anchor_lang::prelude::*;

#[account(zero_copy)]
#[repr(packed)]
pub struct Post {
    pub author: Pubkey,
    pub created_at: i64,
    pub updated_at: i64,
    pub slug: [u8; 80],
	pub uri:  [u8; 80],
	pub published_through_hub: Pubkey,
}

#[event]
pub struct PostInitializedViaHub {
	#[index]
	pub public_key: Pubkey,
	pub hub: Pubkey,
	pub uri: String,
}

#[event]
pub struct PostInitializedViaHubWithReferenceContent {
	#[index]
	pub public_key: Pubkey,
	pub hub: Pubkey,
	pub uri: String,
}