use anchor_lang::prelude::*;

use crate::state::*;
use crate::errors::*;

#[derive(Accounts)]
pub struct HubRemoveRelease<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    pub hub: AccountLoader<'info, HubV1>,
    #[account(
        mut,
        seeds = [b"nina-hub-release".as_ref(), hub.key().as_ref(), release.key().as_ref()],
        bump,
        constraint = release.key() == hub_release.release.key(),
        close = payer,
    )]
    pub hub_release: Account<'info, HubReleaseV1>,
    pub release: AccountLoader<'info, Release>,
    pub system_program: Program<'info, System>,
}

pub fn handler (
    ctx: Context<HubRemoveRelease>,
) -> ProgramResult {
    let hub = ctx.accounts.hub.load()?;
    let release = ctx.accounts.release.load()?;

    // Only hub curator and release authority can remove a hub release
    if *ctx.accounts.payer.to_account_info().key != hub.curator &&
       *ctx.accounts.payer.to_account_info().key != release.authority {
        return Err(ErrorCode::HubReleaseCannotBeRemovedFromHubUnauthorized.into());
    }

    emit!(HubReleaseRemoved {
        public_key: ctx.accounts.hub_release.key(),
        hub: ctx.accounts.hub.key(),
        release: ctx.accounts.release.key(),
    });

    Ok(())
}
