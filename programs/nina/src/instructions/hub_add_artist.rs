use anchor_lang::prelude::*;

use crate::state::*;

#[derive(Accounts)]
#[instruction(
    _can_add_release: bool,
    hub_name: String
)]
pub struct HubAddArtist<'info> {
    #[account(mut)]
    pub curator: Signer<'info>,
    #[account(
        constraint = hub.load()?.curator == curator.key(),
        seeds = [b"nina-hub".as_ref(), hub_name.as_bytes()],
        bump,
    )]
    pub hub: AccountLoader<'info, HubV1>,
    #[account(
        init,
        seeds = [b"nina-hub-artist".as_ref(), hub.key().as_ref(), artist.key().as_ref()],
        bump,
        payer = curator,
    )]
    pub hub_artist: Account<'info, HubArtistV1>,
    /// CHECK: This is safe because we are initializing the HubArtistV1 account with this value
    pub artist: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler (
    ctx: Context<HubAddArtist>,
    can_add_release: bool,
    _hub_name: String,
) -> Result<()> {
    let hub_artist = &mut ctx.accounts.hub_artist;
    hub_artist.hub = ctx.accounts.hub.key();
    hub_artist.artist = ctx.accounts.artist.key();
    hub_artist.can_add_release = can_add_release;

    emit!(HubArtistAdded {
        public_key: ctx.accounts.hub_artist.key(),
        hub: ctx.accounts.hub.key(),
        artist: ctx.accounts.artist.key(),
    });
    
    Ok(())
}
