use anchor_lang::prelude::*;

use crate::state::*;

#[derive(Accounts)]
pub struct HubAddRelease<'info> {
    #[account(mut)]
    pub curator: Signer<'info>,
    #[account(
        constraint = hub.load()?.curator == curator.key(),
    )]
    pub hub: AccountLoader<'info, Hub>,
    #[account(
        init,
        seeds = [b"nina-hub-release".as_ref(), hub.key().as_ref(), release.key().as_ref()],
        bump,
        payer = curator,
    )]
    pub hub_release: Account<'info, HubRelease>,
    pub release: AccountLoader<'info, Release>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler (
    ctx: Context<HubAddRelease>,
) -> ProgramResult {
    let hub_release = &mut ctx.accounts.hub_release;
    hub_release.hub = ctx.accounts.hub.key();
    hub_release.release = ctx.accounts.release.key();

    Ok(())
}