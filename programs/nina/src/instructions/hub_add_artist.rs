use anchor_lang::prelude::*;

use crate::state::*;

#[derive(Accounts)]
pub struct HubAddArtist<'info> {
    #[account(mut)]
    pub curator: Signer<'info>,
    #[account(
        constraint = hub.load()?.curator == curator.key(),
    )]
    pub hub: AccountLoader<'info, Hub>,
    #[account(
        init,
        seeds = [b"nina-hub-artist".as_ref(), hub.key().as_ref(), artist.key().as_ref()],
        bump,
        payer = curator,
    )]
    pub hub_artist: Account<'info, HubArtist>,
    pub artist: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler (
    ctx: Context<HubAddArtist>,
) -> ProgramResult {
    let hub_artist = &mut ctx.accounts.hub_artist;
    hub_artist.hub = ctx.accounts.hub.key();
    hub_artist.artist = ctx.accounts.artist.key();

    Ok(())
}