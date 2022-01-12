use anchor_lang::prelude::*;

use crate::state::*;

#[derive(Accounts)]
pub struct HubRemoveArtist<'info> {
    #[account(mut)]
    pub curator: Signer<'info>,
    #[account(
        constraint = hub.load()?.curator == curator.key(),
    )]
    pub hub: AccountLoader<'info, Hub>,
    #[account(
        mut,
        seeds = [b"nina-hub-artist".as_ref(), hub.key().as_ref(), artist.key().as_ref()],
        bump,
        constraint = artist.key() == hub_artist.artist.key(),
        close = curator,
    )]
    pub hub_artist: Account<'info, HubArtist>,
    pub artist: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}

pub fn handler (
    _ctx: Context<HubRemoveArtist>,
) -> ProgramResult {
    Ok(())
}