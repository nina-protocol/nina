use anchor_lang::prelude::*;
use anchor_spl::token::{self, TokenAccount, Transfer, Token};

use crate::state::*;
use crate::errors::*;

#[derive(Accounts)]
pub struct ReleaseRevenueShareTransfer<'info> {
    pub authority: Signer<'info>,
    #[account(
        mut,
        constraint = authority_token_account.owner == *authority.key
    )]
    pub authority_token_account: Box<Account<'info, TokenAccount>>,
    #[account(
        mut,
        constraint = royalty_token_account.owner == *release_signer.to_account_info().key,
        constraint = royalty_token_account.mint == release.load()?.payment_mint,
    )]
    pub royalty_token_account: Box<Account<'info, TokenAccount>>,
    #[account(
        seeds = [release.to_account_info().key.as_ref()],
        bump = release.load()?.bumps.signer,
    )]
    pub release_signer: UncheckedAccount<'info>,
    #[account(
        mut,
        has_one = release_signer,
        has_one = royalty_token_account,
        seeds = [b"nina-release".as_ref(), release.load()?.release_mint.as_ref()],
        bump = release.load()?.bumps.release,
    )]
    pub release: AccountLoader<'info, Release>,
    pub new_royalty_recipient: UncheckedAccount<'info>,
    #[account(
        constraint = new_royalty_recipient_token_account.owner == *new_royalty_recipient.key,
    )]
    pub new_royalty_recipient_token_account: Box<Account<'info, TokenAccount>>,
    #[account(address = token::ID)]
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler(
    ctx: Context<ReleaseRevenueShareTransfer>,
    transfer_share: u64,
) -> ProgramResult {
    // Collect Royalty so transferring user has no pending royalties
    Release::release_revenue_share_collect_handler(
        &ctx.accounts.release,
        ctx.accounts.release_signer.to_account_info().clone(),
        ctx.accounts.royalty_token_account.to_account_info(),
        *ctx.accounts.authority.to_account_info().key,
        ctx.accounts.authority_token_account.to_account_info(),
        ctx.accounts.token_program.to_account_info().clone(),
    )?;

    let mut release = ctx.accounts.release.load_mut()?;

    let seeds = &[
        ctx.accounts.release.to_account_info().key.as_ref(),
        &[release.bumps.signer],
    ];
    let signer = &[&seeds[..]];

    let mut royalty_recipient = match release.find_royalty_recipient(*ctx.accounts.authority.to_account_info().key) {
        Some(royalty_recipient) => royalty_recipient,
        None => return Err(ErrorCode::InvalidRoyaltyRecipientAuthority.into())
    };

    // Add New Royalty Recipient
    if transfer_share > royalty_recipient.percent_share {
        return Err(ErrorCode::RoyaltyTransferTooLarge.into())
    };

    // Take share from current user
    royalty_recipient.percent_share -= transfer_share;

    let existing_royalty_recipient = release.find_royalty_recipient(*ctx.accounts.new_royalty_recipient.to_account_info().key);
    // If new_royalty_recipient doesn't already have a share, add them as a new recipient
    if existing_royalty_recipient.is_none() {
        release.append_royalty_recipient({
            RoyaltyRecipient {
                recipient_authority: *ctx.accounts.new_royalty_recipient.to_account_info().key,
                recipient_token_account: *ctx.accounts.new_royalty_recipient_token_account.to_account_info().key,
                percent_share: transfer_share,
                owed: 0 as u64,
                collected: 0 as u64,
            }
        })?;
    } else {
        // new_royalty_recipient already has a share of the release, so collect royalties and append share
        let existing_royalty_recipient_unwrapped = existing_royalty_recipient.unwrap();
        if existing_royalty_recipient_unwrapped.owed > 0 {
            // Transfer Royalties from the existing royalty account to the existing user receiving more royalty share
            let cpi_accounts = Transfer {
                from: ctx.accounts.royalty_token_account.to_account_info(),
                to: ctx.accounts.new_royalty_recipient_token_account.to_account_info(),
                authority: ctx.accounts.release_signer.to_account_info().clone(),
            };
            let cpi_program = ctx.accounts.token_program.to_account_info().clone();
            let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
            token::transfer(cpi_ctx, existing_royalty_recipient_unwrapped.owed as u64)?;
        }
        existing_royalty_recipient_unwrapped.percent_share += transfer_share;
    }

    // Make sure royalty shares of all recipients does not exceed 1000000
    if release.royalty_equals_1000000() {

        emit!(RoyaltyRecipientAdded {
            authority: *ctx.accounts.new_royalty_recipient.to_account_info().key,
            public_key: *ctx.accounts.release.to_account_info().key,
        });
        Ok(())
    } else {
        return Err(ErrorCode::RoyaltyExceeds100Percent.into())
    }
}