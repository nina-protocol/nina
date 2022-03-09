use anchor_lang::prelude::*;

use crate::state::*;
use crate::errors::ErrorCode;

#[derive(Accounts)]
#[instruction(hub_name: String)]
pub struct HubRemoveArtist<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(
        seeds = [b"nina-hub".as_ref(), hub_name.as_bytes()],
        bump,
    )]
    pub hub: AccountLoader<'info, Hub>,
    #[account(
        mut,
        seeds = [b"nina-hub-artist".as_ref(), hub.key().as_ref(), artist.key().as_ref()],
        bump,
        close = payer
    )]
    pub hub_artist: Account<'info, HubArtist>,
    /// CHECK: This is safe because it is checked against hub_artist which verifies the HubArtistV1 by seeds
    #[account(
        constraint = artist.key() == hub_artist.artist,
    )]
    pub artist: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}

pub fn handler (
    ctx: Context<HubRemoveArtist>,
    _hub_name: String,
) -> Result<()> {
    let hub = ctx.accounts.hub.load()?;
    
    // Only curator of hub and artist in the HubArtist account can remove the account
    if ctx.accounts.payer.to_account_info().key != ctx.accounts.artist.to_account_info().key && 
        *ctx.accounts.payer.to_account_info().key != hub.curator {
        return Err(error!(ErrorCode::HubArtistCannotBeRemovedFromHubUnauthorized));
    }

    // Curator cannot remove themself
    if *ctx.accounts.artist.to_account_info().key == hub.curator {
        return Err(error!(ErrorCode::HubArtistCannotRemoveCuratorFromHub));
    }

    emit!(HubArtistRemoved {
        public_key: ctx.accounts.hub_artist.key(),
        hub: ctx.accounts.hub.key(),
        artist: ctx.accounts.artist.key(),
    });

    Ok(())
}
