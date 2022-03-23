use anchor_lang::prelude::*;

use crate::state::*;
use crate::errors::ErrorCode;

#[derive(Accounts)]
#[instruction(hub_handle: String)]
pub struct HubRemoveRelease<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(
        seeds = [b"nina-hub".as_ref(), hub_handle.as_bytes()],
        bump,
    )]
    pub hub: AccountLoader<'info, Hub>,
    #[account(
        mut,
        seeds = [b"nina-hub-release".as_ref(), hub.key().as_ref(), release.key().as_ref()],
        bump,
        close = payer,
    )]
    pub hub_release: Account<'info, HubRelease>,
    #[account(
        constraint = release.key() == hub_release.release,
    )]
    pub release: AccountLoader<'info, Release>,
    pub system_program: Program<'info, System>,
}

pub fn handler (
    ctx: Context<HubRemoveRelease>,
    _hub_handle: String,
) -> Result<()> {
    let hub = ctx.accounts.hub.load()?;
    let release = ctx.accounts.release.load()?;

    // Only hub curator and release authority can remove a hub release
    if *ctx.accounts.payer.to_account_info().key != hub.authority &&
       *ctx.accounts.payer.to_account_info().key != release.authority {
        return Err(error!(ErrorCode::HubReleaseCannotBeRemovedFromHubUnauthorized));
    }

    emit!(HubReleaseRemoved {
        public_key: ctx.accounts.hub_release.key(),
        hub: ctx.accounts.hub.key(),
        release: ctx.accounts.release.key(),
    });

    Ok(())
}
