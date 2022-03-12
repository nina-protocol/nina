use anchor_lang::prelude::*;

use crate::state::*;

#[derive(Accounts)]
#[instruction(
    _uri: String,
    hub_name: String,
)]
pub struct HubUpdateUri<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        mut,
        constraint = hub.load()?.authority == authority.key(),
        seeds = [b"nina-hub".as_ref(), hub_name.as_bytes()],
        bump,
    )]
    pub hub: AccountLoader<'info, Hub>,
}

pub fn handler (
    ctx: Context<HubUpdateUri>,
    uri: String,
    _hub_name: String,
) -> Result<()> {
    let mut hub = ctx.accounts.hub.load_mut()?;

    let mut uri_array = [0u8; 100];
    uri_array[..uri.len()].copy_from_slice(&uri.as_bytes());

    hub.uri = uri_array;

    emit!(HubUriUpdated {
        public_key: ctx.accounts.hub.key(),
        uri: uri,
    });
    
    Ok(())
}
