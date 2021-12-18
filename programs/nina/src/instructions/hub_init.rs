use anchor_lang::prelude::*;
use anchor_spl::token::{TokenAccount, Mint};
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
        space = 412
    )]
    pub hub: AccountLoader<'info, Hub>,
    #[account(
        seeds = [b"nina-hub-signer".as_ref(), hub.key().as_ref()],
        bump,
    )]
    pub hub_signer: UncheckedAccount<'info>,
    #[account(
        constraint = usdc_token_account.owner == curator.key(),
        constraint = usdc_token_account.mint == usdc_mint.key(),
    )]
    pub usdc_token_account: Account<'info, TokenAccount>,
    #[account(
        init,
        seeds = [b"nina-hub-artist".as_ref(), hub.key().as_ref(), curator.key().as_ref()],
        bump,
        payer = curator,
    )]
    pub hub_artist: Account<'info, HubArtist>,
    pub usdc_mint: Box<Account<'info, Mint>>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler (
    ctx: Context<HubInit>,
    params: HubInitParams,
) -> ProgramResult {
    let mut hub = ctx.accounts.hub.load_init()?;
    hub.curator = *ctx.accounts.curator.to_account_info().key;
    hub.hub_signer = *ctx.accounts.hub_signer.to_account_info().key;
    hub.usdc_token_account = *ctx.accounts.usdc_token_account.to_account_info().key;
    hub.fee = params.fee;

    let mut name_array = [0u8; 100];
    name_array[..params.name.len()].copy_from_slice(&params.name.as_bytes());
    hub.name = name_array;

    let mut uri_array = [0u8; 200];
    uri_array[..params.uri.len()].copy_from_slice(&params.uri.as_bytes());
    hub.uri = uri_array;

    let hub_artist = &mut ctx.accounts.hub_artist;
    hub_artist.hub = ctx.accounts.hub.key();
    hub_artist.artist = ctx.accounts.curator.key();

    Ok(())
}