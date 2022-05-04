use anchor_lang::prelude::*;
use std::default::Default;
use crate::state::*;
use crate::errors::ErrorCode;

#[account(zero_copy)]
#[repr(packed)]
// size = 8 + 32 + 32 + 100 + 100 + 8 + 8 + 8 + 1 + 8 (+ 32 extra) = 337
pub struct Hub {
	pub authority: Pubkey,
	pub hub_signer: Pubkey,
	pub handle: [u8; 100],
	pub uri: [u8; 100],
	pub publish_fee: u64,
	pub referral_fee: u64,
	pub total_fees_earned: u64,
	pub hub_signer_bump: u8,
	pub datetime: i64,
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
		hub_content.published_through_hub = is_published_through_hub;
		hub_content.visible = true;

		hub_release.hub = hub.key();
		hub_release.release = release.key();
		hub_release.sales = 0;

		Ok(())
	}

    pub fn check_hub_fees (
        publish_fee: u64,
        referral_fee: u64
    ) -> Result<()> {
        if publish_fee > 1000000 {
            return Err(error!(ErrorCode::HubPublishFeeInvalidValue))
        }
        
        if referral_fee > 1000000 {
            return Err(error!(ErrorCode::HubReferralFeeInvalidValue))
        }

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
// size = 8 + 32  + 32 + 8 (+ 40) = 120
pub struct HubRelease {
	pub hub: Pubkey,
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
// size = 8 + 32 + 32 + 32 + 1 + 8 + 1 + 1 (+ 38) = 153
pub struct HubContent {
	pub added_by: Pubkey,
	pub hub: Pubkey,
	pub child: Pubkey,
	pub content_type: HubContentType,
	pub datetime: i64,
	pub visible: bool,
	pub published_through_hub: bool,
}

#[account(zero_copy)]
#[repr(packed)]
// size = 8 + 32 + 32 + 32 + 100 + 1 (+ 39) = 244
pub struct HubPost {
	pub hub: Pubkey,
	pub post: Pubkey,
	pub reference_content: Option<Pubkey>,
	pub version_uri:  [u8; 100],
	pub reference_content_type: HubContentType,
}

#[account]
#[derive(Default)]
// size = 8 + 32 + 32 + 1 + 32 + 1 + 1 + 8 (+ 32) = 147
pub struct HubCollaborator {
	pub added_by: Pubkey,
	pub hub: Pubkey,
	/// If allowance == -1, allow adding unlimited content
	/// otherwise allowance == amount of posts user can make
	pub allowance: i8,
	pub collaborator: Pubkey,
	pub can_add_content: bool,
	pub can_add_collaborator: bool,
	pub datetime: i64,
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
	pub authority: Pubkey,
	pub handle: String,
	pub uri: String,
	pub datetime: i64,
	pub hub_collaborator: Pubkey,
}

#[event]
pub struct HubCollaboratorAdded {
	#[index]
	pub public_key: Pubkey,
	pub hub: Pubkey,
	pub collaborator: Pubkey,
    pub added_by: Pubkey,
	pub datetime: i64,
}

#[event]
pub struct HubCollaboratorUpdated {
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
	pub datetime: i64,
	pub hub_content: Pubkey,
	pub added_by: Pubkey,
	pub published_through_hub: bool,
}

#[event]
pub struct ReleaseInitializedViaHub {
	#[index]
	pub public_key: Pubkey,
	pub mint: Pubkey,
	pub authority: Pubkey,
	pub datetime: i64,
	pub hub: Pubkey,
	pub hub_release: Pubkey,
	pub metadata_public_key: Pubkey,
	pub uri: String,
	pub hub_content: Pubkey
}


#[event]
pub struct HubContentToggled {
	#[index]
	pub public_key: Pubkey,
	pub content_type: HubContentType,
	pub visible: bool,
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
	pub datetime: i64,
}