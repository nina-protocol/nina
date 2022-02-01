use anchor_lang::prelude::*;

use crate::state::*;
use crate::errors::*;

#[derive(Accounts)]
pub struct HubAddRelease<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    pub hub: AccountLoader<'info, Hub>,
    #[account(
        init,
        seeds = [b"nina-hub-release".as_ref(), hub.key().as_ref(), release.key().as_ref()],
        bump,
        payer = payer,
    )]
    pub hub_release: Account<'info, HubRelease>,
    #[account(
        seeds = [b"nina-hub-artist".as_ref(), hub.key().as_ref(), payer.key().as_ref()],
        bump,
    )]
    pub hub_artist: Account<'info, HubArtist>,
    pub release: AccountLoader<'info, Release>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler (
    ctx: Context<HubAddRelease>,
) -> ProgramResult {
    let hub_artist = &mut ctx.accounts.hub_artist;
    if !hub_artist.can_add_release {
        return Err(ErrorCode::HubArtistCannotAddReleaseToHub.into())
    }

    let hub_release = &mut ctx.accounts.hub_release;
    hub_release.hub = ctx.accounts.hub.key();
    hub_release.release = ctx.accounts.release.key();
    hub_release.published_through_hub = false;
    hub_release.sales = 0;
    
    Ok(())
}