use anchor_lang::prelude::*;

use crate::state::*;
use crate::errors::*;

#[derive(Accounts)]
pub struct HubRemoveArtist<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    pub hub: AccountLoader<'info, Hub>,
    #[account(
        mut,
        seeds = [b"nina-hub-artist".as_ref(), hub.key().as_ref(), artist.key().as_ref()],
        bump,
        constraint = artist.key() == hub_artist.artist.key(),
        close = payer
    )]
    pub hub_artist: Account<'info, HubArtist>,
    pub artist: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}

pub fn handler (
    ctx: Context<HubRemoveArtist>,
) -> ProgramResult {
    let hub = ctx.accounts.hub.load()?;
    
    // Only curator of hub and artist in the HubArtist account can remove the account
    if ctx.accounts.payer.to_account_info().key != ctx.accounts.artist.to_account_info().key && 
        *ctx.accounts.payer.to_account_info().key != hub.curator {
        return Err(ErrorCode::HubArtistCannotBeRemovedFromHubUnauthorized.into());
    }

    // Curator cannot remove themself
    if *ctx.accounts.artist.to_account_info().key == hub.curator {
        return Err(ErrorCode::HubArtistCannotRemoveCuratorFromHub.into());
    }

    Ok(())
}