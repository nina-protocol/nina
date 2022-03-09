use anchor_lang::prelude::*;

use crate::state::*;
use crate::errors::ErrorCode;

#[derive(Accounts)]
#[instruction(
    _can_add_release: bool,
    _can_add_artist: bool,
    hub_name: String,
)]
pub struct HubAddArtist<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(
        seeds = [b"nina-hub-artist".as_ref(), hub.key().as_ref(), payer.key().as_ref()],
        bump,
    )]
    pub payer_hub_artist: Account<'info, HubArtist>,
    #[account(
        seeds = [b"nina-hub".as_ref(), hub_name.as_bytes()],
        bump,
    )]
    pub hub: AccountLoader<'info, Hub>,
    #[account(
        init,
        seeds = [b"nina-hub-artist".as_ref(), hub.key().as_ref(), artist.key().as_ref()],
        bump,
        payer = payer,
    )]
    pub hub_artist: Account<'info, HubArtist>,
    /// CHECK: This is safe because we are initializing the HubArtistV1 account with this value
    pub artist: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler (
    ctx: Context<HubAddArtist>,
    can_add_release: bool,
    can_add_artist: bool,
    _hub_name: String,
) -> Result<()> {
    let payer_hub_artist = &ctx.accounts.payer_hub_artist;

    if !payer_hub_artist.can_add_artist {
        return Err(error!(ErrorCode::HubArtistCannotAddArtist));
    }
    
    let hub_artist = &mut ctx.accounts.hub_artist;
    hub_artist.authority = ctx.accounts.payer.key();
    hub_artist.hub = ctx.accounts.hub.key();
    hub_artist.artist = ctx.accounts.artist.key();
    hub_artist.can_add_release = can_add_release;
    hub_artist.can_add_artist = can_add_artist;

    emit!(HubArtistAdded {
        public_key: ctx.accounts.hub_artist.key(),
        hub: ctx.accounts.hub.key(),
        artist: ctx.accounts.artist.key(),
    });
    
    Ok(())
}
