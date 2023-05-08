use anchor_lang::prelude::*;
use crate::state::*;
use crate::utils::{dispatcher_account};
use crate::errors::ErrorCode;

#[derive(Accounts)]
pub struct SubscriptionUnsubscribe<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    /// CHECK: This is safe because we check from in the handler
    pub from: UncheckedAccount<'info>,
    #[account(
        mut,
        seeds = [b"nina-subscription", from.key().as_ref(), to.key().as_ref()],
        bump,
        close = payer,
    )]
    pub subscription: Account<'info, Subscription>,
    /// CHECK: This is safe because we check in subscription seed
    pub to: UncheckedAccount<'info>,
}

pub fn handler(
    ctx: Context<SubscriptionUnsubscribe>
) -> Result<()> {
    let subscription = &ctx.accounts.subscription;
    
    if ctx.accounts.payer.key() != ctx.accounts.from.key() {
        if ctx.accounts.payer.key() != dispatcher_account::ID {
            return Err(ErrorCode::SubscriptionPayerMismatch.into());
        }
    }

    if subscription.payer.is_some() {
        if ctx.accounts.payer.key() != subscription.payer.unwrap() {
            return Err(ErrorCode::SubscriptionDelegatedPayerMismatch.into());
        }
    }

    Ok(())
}
