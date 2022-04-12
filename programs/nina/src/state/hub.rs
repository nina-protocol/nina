use anchor_lang::prelude::*;
use std::default::Default;
use crate::state::*;
use crate::errors::ErrorCode;

#[account(zero_copy)]
#[repr(packed)]
pub struct Hub {
	pub authority: Pubkey,
	pub hub_signer: Pubkey,
	pub handle: [u8; 80],
	pub uri: [u8; 80],
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
		is_published_through_hub: bool,
	) -> Result<()> {
    hub_content.added_by = authority.key();
    hub_content.hub = hub.key();
		hub_content.child = hub_release.key();
    hub_content.content_type = HubContentType::NinaReleaseV1;
    hub_content.datetime = Clock::get()?.unix_timestamp;

		hub_release.hub = hub.key();
    hub_release.release = release.key();
    hub_release.published_through_hub = is_published_through_hub;
    hub_release.sales = 0;

		emit!(HubReleaseAdded {
        public_key: hub_release.key(),
        hub: hub.key(),
        release: release.key(),
    });

		Ok(())
	}

	pub fn hub_collaborator_can_add_or_publish_content<'info> (
		hub_collaborator: &mut Account<'info, HubCollaborator>,
		is_publish: bool,
	) -> Result<()> {
    if !is_publish && !hub_collaborator.can_add_content {
        return Err(error!(ErrorCode::HubCollaboratorCannotAddReleaseToHubUnauthorized))
    }

    if hub_collaborator.allowance == 0 {
        return Err(error!(ErrorCode::HubCollaboratorCannotAddReleaseToHubAllowanceUsed))
    }

    if hub_collaborator.allowance > 0 {
        hub_collaborator.allowance = i8::from(hub_collaborator.allowance)
            .checked_sub(1)
            .unwrap();
    }

		Ok(())
	}
}

#[account]
#[derive(Default)]
pub struct HubRelease {
	pub added_by: Pubkey,
	pub datetime: i64,
	pub hub: Pubkey,
	pub published_through_hub: bool,
	pub release: Pubkey,
	pub sales: u64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Copy, Debug)]
pub enum HubContentType {
	NinaReleaseV1 = 0,
	Post = 1,
}

impl Default for HubContentType {
	fn default() -> Self {
		HubContentType::NinaReleaseV1
	}
}

#[account]
#[derive(Default)]
pub struct HubContent {
	pub added_by: Pubkey,
	pub hub: Pubkey,
	pub child: Pubkey,
	pub content_type: HubContentType,
	pub datetime: i64,
}

#[account(zero_copy)]
#[repr(packed)]
pub struct HubPost {
	pub hub: Pubkey,
	pub post: Pubkey,
	pub reference_hub_content: Option<Pubkey>,
	pub version_uri:  [u8; 80],
}

#[account]
#[derive(Default)]
pub struct HubCollaborator {
	pub added_by: Pubkey,
	pub hub: Pubkey,
	/// If allowance == -1, allow adding unlimited content
	/// otherwise allowance == amount of posts user can make
	pub allowance: i8,
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
pub struct HubConfigUpdated {
	#[index]
	pub public_key: Pubkey,
	pub uri: String,
}

#[event]
pub struct HubPostAdded {
	#[index]
	pub public_key: Pubkey,
	pub hub: Pubkey,
	pub uri: String,
}