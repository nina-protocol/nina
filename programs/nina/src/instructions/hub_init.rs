use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token};

use crate::state::*;

#[derive(Accounts)]
#[instruction(params: HubInitParams)]
pub struct HubInit<'info> {
    #[account(mut)]
    pub curator: Signer<'info>,
    #[account(
        init,
        seeds = [b"nina-hub".as_ref(), params.name.as_bytes()],
        bump,
        payer = curator,
        space = 408
    )]
    pub hub: Loader<'info, Hub>,
    #[account(
        seeds = [b"nina-hub-signer".as_ref(), hub.key().as_ref()],
        bump,
    )]
    pub hub_signer: UncheckedAccount<'info>,
    #[account(
        seeds = [b"nina-hub-treasury".as_ref(), hub.key().as_ref()],
        bump,
    )]
    pub treasury: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
    #[account(address = token::ID)]
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler (
    ctx: Context<HubInit>,
    params: HubInitParams,
) -> ProgramResult {
    let mut hub = ctx.accounts.hub.load_init()?;
    hub.curator = *ctx.accounts.curator.to_account_info().key;
    hub.hub_signer = *ctx.accounts.hub_signer.to_account_info().key;
    hub.treasury = *ctx.accounts.treasury.to_account_info().key;
    hub.primary_fee = params.primary_fee;
    hub.secondary_fee = params.secondary_fee;

    let mut name_array = [0u8; 100];
    name_array[..params.name.len()].copy_from_slice(&params.name.as_bytes());
    hub.name = name_array;

    let mut uri_array = [0u8; 200];
    uri_array[..params.uri.len()].copy_from_slice(&params.uri.as_bytes());
    hub.uri = uri_array;

    Ok(())
}