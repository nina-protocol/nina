use anchor_lang::prelude::*;

use crate::state::*;
use crate::errors::ErrorCode;

#[derive(Accounts)]
#[instruction(hub_name: String)]
pub struct HubAddRelease<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(
        seeds = [b"nina-hub".as_ref(), hub_name.as_bytes()],
        bump,
    )]
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
    _hub_name: String,
) -> Result<()> {
    let hub_artist = &mut ctx.accounts.hub_artist;

    if !hub_artist.can_add_release {
        return Err(error!(ErrorCode::HubArtistCannotAddReleaseToHubUnauthorized))
    }

    let hub_release = &mut ctx.accounts.hub_release;
    hub_release.authority = ctx.accounts.payer.key();
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
