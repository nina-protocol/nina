use anchor_lang::prelude::*;
use std::default::Default;
use crate::state::*;

#[account(zero_copy)]
#[repr(packed)]
pub struct Post {
    pub author: Pubkey,
    pub created_at: i64,
    pub slug: [u8; 100],
	pub uri:  [u8; 100],
	pub published_through_hub: Pubkey,
}