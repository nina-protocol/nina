use anchor_lang::prelude::*;
use std::default::Default;
use crate::state::*;

#[account(zero_copy)]
#[repr(packed)]
pub struct Hub {
	pub authority: Pubkey,
	pub hub_signer: Pubkey,
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
		hub_release: &mut Box<Account<'info, HubRelease>>,
		release: AccountLoader<'info, Release>,
		authority: Signer<'info>,
		published_through_hub: bool,
	) -> Result<()> {
    hub_release.added_by = authority.key();
    hub_release.datetime = Clock::get()?.unix_timestamp;
		hub_release.hub = hub.key();
    hub_release.release = release.key();
    hub_release.published_through_hub = published_through_hub;
    hub_release.sales = 0;

		emit!(HubReleaseAdded {
        public_key: hub_release.key(),
        hub: hub.key(),
        release: release.key(),
    });

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

#[account(zero_copy)]
#[repr(packed)]
pub struct HubPost {
	pub added_by: Pubkey,
	pub datetime: i64,
	pub hub: Pubkey,
	pub hub_release: Option<Pubkey>,
	pub slug: [u8; 100],
	pub uri:  [u8; 100],
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
pub struct HubConfigUpdated {
	#[index]
	pub public_key: Pubkey,
	pub uri: String,
}