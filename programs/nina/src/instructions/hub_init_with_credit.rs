use anchor_lang::prelude::*;
use anchor_spl::token::{self, Burn, Token, TokenAccount, Mint};
use crate::state::*;
use crate::utils::{wrapped_sol, nina_hub_credit_mint};

#[derive(Accounts)]
#[instruction(params: HubInitParams)]
pub struct HubInitWithCredit<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        init,
        seeds = [b"nina-hub".as_ref(), params.handle.as_bytes()],
        bump,
        payer = authority,
        space = 337
    )]
    pub hub: AccountLoader<'info, Hub>,
    /// CHECK: This is safe because we are deriving the PDA from hub - which is initialized above
    #[account(
        seeds = [b"nina-hub-signer".as_ref(), hub.key().as_ref()],
        bump,
    )]
    pub hub_signer: UncheckedAccount<'info>,
    #[account(
        init,
        seeds = [b"nina-hub-collaborator".as_ref(), hub.key().as_ref(), authority.key().as_ref()],
        bump,
        payer = authority,
        space = 147,
    )]
    pub hub_collaborator: Account<'info, HubCollaborator>,
    #[account(
        mut,
        constraint = authority_hub_credit_token_account.owner == authority.key(),
        constraint = authority_hub_credit_token_account.mint == hub_credit_mint.key(),
    )]
    pub authority_hub_credit_token_account: Box<Account<'info, TokenAccount>>,
    #[account(mut)]
    #[cfg_attr(
        not(feature = "test"),
        account(address = nina_hub_credit_mint::ID),
    )]
    pub hub_credit_mint: Account<'info, Mint>,
    pub system_program: Program<'info, System>,
    #[account(address = token::ID)]
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler (
    ctx: Context<HubInitWithCredit>,
    params: HubInitParams,
) -> Result<()> {
    Hub::check_hub_fees(
        params.publish_fee,
        params.referral_fee
    )?;

    // Authority burn hub credit
    let cpi_program = ctx.accounts.token_program.to_account_info().clone();
    let cpi_accounts = Burn {
        mint: ctx.accounts.hub_credit_mint.to_account_info(),
        from: ctx.accounts.authority_hub_credit_token_account.to_account_info(),
        authority: ctx.accounts.authority.to_account_info().clone(),
    };
    let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
    token::burn(cpi_ctx, 1)?;
    
    let mut hub = ctx.accounts.hub.load_init()?;
    hub.authority = *ctx.accounts.authority.to_account_info().key;
    hub.hub_signer = *ctx.accounts.hub_signer.to_account_info().key;
    hub.publish_fee = params.publish_fee;
    hub.referral_fee = params.referral_fee;
    hub.total_fees_earned = 0;
    hub.datetime = Clock::get()?.unix_timestamp;
    hub.hub_signer_bump = params.hub_signer_bump;

    let mut handle_array = [0u8; 100];
    handle_array[..params.handle.len()].copy_from_slice(&params.handle.as_bytes());
    hub.handle = handle_array;

    let mut uri_array = [0u8; 100];
    uri_array[..params.uri.len()].copy_from_slice(&params.uri.as_bytes());
    hub.uri = uri_array;

    let hub_collaborator = &mut ctx.accounts.hub_collaborator;
    hub_collaborator.hub = ctx.accounts.hub.key();
    hub_collaborator.collaborator = ctx.accounts.authority.key();
    hub_collaborator.can_add_content = true;
    hub_collaborator.can_add_collaborator = true;
    hub_collaborator.allowance = -1;
    hub_collaborator.datetime = hub.datetime;

    Ok(())
}
