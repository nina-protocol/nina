use anchor_lang::prelude::*;

use crate::state::*;

#[derive(Accounts)]
pub struct HubRemoveRelease<'info> {
    #[account(mut)]
    pub curator: Signer<'info>,
    #[account(
        constraint = hub.load()?.curator == curator.key(),
    )]
    pub hub: AccountLoader<'info, Hub>,
    #[account(
        mut,
        seeds = [b"nina-hub-release".as_ref(), hub.key().as_ref(), release.key().as_ref()],
        bump,
        constraint = release.key() == hub_release.release.key(),
        close = curator,
    )]
    pub hub_release: Account<'info, HubRelease>,
    pub release: AccountLoader<'info, Release>,
    pub system_program: Program<'info, System>,
}

pub fn handler (
    _ctx: Context<HubRemoveRelease>,
) -> ProgramResult {
    Ok(())
}