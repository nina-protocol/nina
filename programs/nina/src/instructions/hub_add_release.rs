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
        seeds = [b"nina-hub-release".as_ref(), hub.key().as_ref(), release.key().as_ref()],
        bump,
        payer = payer,
    )]
    pub hub_release: Box<Account<'info, HubRelease>>,
    #[account(
        seeds = [b"nina-hub-collaborator".as_ref(), hub.key().as_ref(), authority.key().as_ref()],
        bump,
    )]
    pub hub_collaborator: Box<Account<'info, HubCollaborator>>,
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
    
    Hub::hub_release_create_handler(
        ctx.accounts.hub.clone(),
        &mut ctx.accounts.hub_release,
        ctx.accounts.release.clone(),
        ctx.accounts.authority.clone(),
        false,
    )?;

    emit!(HubReleaseAdded {
        public_key: ctx.accounts.hub_release.key(),
        hub: ctx.accounts.hub.key(),
        release: ctx.accounts.release.key(),
    });

    Ok(())
}
