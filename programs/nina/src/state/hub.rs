use anchor_lang::prelude::*;
use std::default::Default;
use crate::state::*;

#[account(zero_copy)]
#[repr(packed)]
pub struct Hub {
	pub authority: Pubkey,
	pub hub_wallet: Pubkey,
	pub hub_signer: Pubkey,
	pub hub_funding_wallet: Pubkey,
	pub handle: [u8; 100],
	pub uri: [u8; 100],
	pub publish_fee: u64,
	pub referral_fee: u64,
	pub total_fees_earned: u64,
	pub hub_signer_bump: u8
}

impl Hub {
	#[inline(never)]
	pub fn hub_release_create_handler<'info> (
		hub: AccountLoader<'info, Hub>,
		hub_content: &mut Box<Account<'info, HubContent>>,
		hub_release: &mut Box<Account<'info, HubRelease>>,
		release: AccountLoader<'info, Release>,
		authority: Signer<'info>,
	) -> Result<()> {
    hub_content.hub = hub.key();
    hub_content.added_by = authority.key();
    hub_content.content_type = HubContentType::ReleaseV1;
    hub_content.datetime = Clock::get()?.unix_timestamp;

		hub_release.hub = hub.key();
    hub_release.release = release.key();
    hub_release.published_through_hub = true;
    hub_release.sales = 0;

		emit!(HubReleaseAdded {
        public_key: hub_release.key(),
        hub: hub.key(),
        release: release.key(),
    });

		Ok(())
	}
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Copy, Debug)]
pub enum HubContentType {
	ReleaseV1 = 0,
	Post = 1,
}

impl Default for HubContentType {
	fn default() -> Self {
		HubContentType::ReleaseV1
	}
}

#[account]
#[derive(Default)]
pub struct HubContent {
	pub added_by: Pubkey,
	pub hub: Pubkey,
	pub content_type: HubContentType,
	pub datetime: i64,
}

#[account]
#[derive(Default)]
pub struct HubContentComment {
	pub hub: Pubkey,
	pub hub_content: Pubkey,
	pub hub_post: Pubkey,
}

#[account]
#[derive(Default)]
pub struct HubRelease {
	pub hub: Pubkey,
	pub release: Pubkey,
	pub sales: u64,
	pub published_through_hub: bool,
}

#[account(zero_copy)]
#[repr(packed)]
pub struct HubPost {
	pub hub: Pubkey,
	pub uri:  [u8; 100],
	pub is_comment: bool,
}

#[account]
#[derive(Default)]
pub struct HubCollaborator {
	pub added_by: Pubkey,
	pub hub: Pubkey,
	pub collaborator: Pubkey,
	pub can_add_content: bool,
	pub can_add_collaborator: bool,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default)]
pub struct HubInitParams {
	pub publish_fee: u64,
	pub handle: String,
	pub uri: String,
	pub referral_fee: u64,
	pub hub_signer_bump: u8,
}

#[event]
pub struct HubCreated {
	#[index]
	pub public_key: Pubkey,
	pub hub_collaborator: Pubkey,
	pub collaborator: Pubkey,
}

#[event]
pub struct HubCollaboratorAdded {
	#[index]
	pub public_key: Pubkey,
	pub hub: Pubkey,
	pub collaborator: Pubkey,
}

#[event]
pub struct HubCollaboratorRemoved {
	#[index]
	pub public_key: Pubkey,
	pub hub: Pubkey,	
	pub collaborator: Pubkey,
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

#[event]
pub struct HubUriUpdated {
	#[index]
	pub public_key: Pubkey,
	pub uri: String,
}