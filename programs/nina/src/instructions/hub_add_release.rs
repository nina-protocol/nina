use anchor_lang::prelude::*;

use crate::state::*;
use crate::errors::ErrorCode;

#[derive(Accounts)]
#[instruction(hub_handle: String)]
pub struct HubAddRelease<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    pub authority: Signer<'info>,
    #[account(
        seeds = [b"nina-hub".as_ref(), hub_handle.as_bytes()],
        bump,
    )]
    pub hub: AccountLoader<'info, Hub>,
    #[account(
        init,
        seeds = [b"nina-hub-content".as_ref(), hub.key().as_ref(), release.key().as_ref()],
        bump,
        payer = payer,
    )]
    pub hub_content: Account<'info, HubContent>,
    #[account(
        init,
        seeds = [b"nina-hub-release".as_ref(), hub.key().as_ref(), release.key().as_ref()],
        bump,
        payer = payer,
    )]
    pub hub_release: Account<'info, HubRelease>,
    #[account(
        seeds = [b"nina-hub-collaborator".as_ref(), hub.key().as_ref(), authority.key().as_ref()],
        bump,
    )]
    pub hub_collaborator: Account<'info, HubCollaborator>,
    pub release: AccountLoader<'info, Release>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler (
    ctx: Context<HubAddRelease>,
    _hub_handle: String,
) -> Result<()> {
    let hub_collaborator = &mut ctx.accounts.hub_collaborator;

    if !hub_collaborator.can_add_content {
        return Err(error!(ErrorCode::HubCollaboratorCannotAddReleaseToHubUnauthorized))
    }
    let hub_content = &mut ctx.accounts.hub_content;
    hub_content.hub = ctx.accounts.hub.key();
    hub_content.added_by = ctx.accounts.authority.key();
    hub_content.content_type = HubContentType::ReleaseV1;
    hub_content.datetime = Clock::get()?.unix_timestamp;

    let hub_release = &mut ctx.accounts.hub_release;
    hub_release.hub = ctx.accounts.hub.key();
    hub_release.release = ctx.accounts.release.key();
    hub_release.published_through_hub = false;
    hub_release.sales = 0;

    emit!(HubReleaseAdded {
        public_key: ctx.accounts.hub_release.key(),
        hub: ctx.accounts.hub.key(),
        release: ctx.accounts.release.key(),
    });

    Ok(())
}
