use anchor_lang::prelude::*;
use anchor_spl::token::{self, TokenAccount, Token, Mint};

use crate::state::*;
use crate::utils::{wrapped_sol};

#[derive(Accounts)]
#[instruction(bumps: VaultBumps)]
pub struct VaultInitialize<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        init,
        seeds = [b"nina-vault".as_ref()],
        bump,
        payer = authority,
    )]
    pub vault: Account<'info, Vault>,
    /// CHECK: This is safe because we are initializing the vault
    #[account(
        seeds = [b"nina-vault-signer".as_ref(), vault.key().as_ref()],
        bump,
    )]
    pub vault_signer: UncheckedAccount<'info>,
    #[account(
        init,
        seeds = [b"nina-vault-token".as_ref(), vault.key().as_ref(), usdc_mint.key().as_ref()],
        bump,
        payer = authority,
        token::mint = usdc_mint,
        token::authority = vault_signer,
    )]
    pub usdc_vault: Box<Account<'info, TokenAccount>>,
    #[account(
        init,
        seeds = [b"nina-vault-token".as_ref(), vault.key().as_ref(), wrapped_sol_mint.key().as_ref()],
        bump,
        payer = authority,
        token::mint = wrapped_sol_mint,
        token::authority = vault_signer,
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

pub fn handler(
    ctx: Context<VaultInitialize>,
    bumps: VaultBumps,
) -> Result<()> {
    let vault = &mut ctx.accounts.vault;
    vault.authority = *ctx.accounts.authority.to_account_info().key;
    vault.vault_signer = *ctx.accounts.vault_signer.to_account_info().key;
    vault.usdc_vault = *ctx.accounts.usdc_vault.to_account_info().key;
    vault.wrapped_sol_vault = *ctx.accounts.wrapped_sol_vault.to_account_info().key;
    vault.bumps = bumps;

    Ok(())
}
