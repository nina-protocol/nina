use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Mint};
use crate::state::*;
use crate::utils::{wrapped_sol};

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
        space = 388
    )]
    pub hub: AccountLoader<'info, Hub>,
    #[account(
        seeds = [b"nina-hub-signer".as_ref(), hub.key().as_ref()],
        bump,
    )]
    pub hub_signer: UncheckedAccount<'info>,
    #[account(
        init,
        seeds = [b"nina-hub-artist".as_ref(), hub.key().as_ref(), curator.key().as_ref()],
        bump,
        payer = curator,
    )]
    pub hub_artist: Account<'info, HubArtist>,
    #[account(
        constraint = usdc_vault.mint == usdc_mint.key(),
        constraint = usdc_vault.owner == *hub_signer.key
    )]
    pub usdc_vault: Box<Account<'info, TokenAccount>>,
    #[account(
        constraint = wrapped_sol_vault.mint == wrapped_sol_mint.key(),
        constraint = wrapped_sol_vault.owner == *hub_signer.key
    )]
    pub wrapped_sol_vault: Box<Account<'info, TokenAccount>>,
    pub usdc_mint: Account<'info, Mint>,
    #[account(address = wrapped_sol::ID)]
    pub wrapped_sol_mint: Account<'info, Mint>,
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
    hub.publish_fee = params.publish_fee;
    hub.referral_fee = params.referral_fee;

    let mut name_array = [0u8; 100];
    name_array[..params.name.len()].copy_from_slice(&params.name.as_bytes());
    hub.name = name_array;

    let mut uri_array = [0u8; 200];
    uri_array[..params.uri.len()].copy_from_slice(&params.uri.as_bytes());
    hub.uri = uri_array;

    let hub_artist = &mut ctx.accounts.hub_artist;
    hub_artist.hub = ctx.accounts.hub.key();
    hub_artist.artist = ctx.accounts.curator.key();
    hub_artist.can_add_release = true;

    Ok(())
}