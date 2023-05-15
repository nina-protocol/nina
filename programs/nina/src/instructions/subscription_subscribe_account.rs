use anchor_lang::prelude::*;
use crate::state::*;
use crate::utils::{dispatcher_account};
use crate::errors::ErrorCode;

#[derive(Accounts)]
pub struct SubscriptionSubscribeAccount<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    /// CHECK: This is safe because we check from in the handler
    pub from: UncheckedAccount<'info>,
    #[account(
        init,
        seeds = [b"nina-subscription", from.key().as_ref(), to.key().as_ref()],
        bump,
        payer = payer,
        space = 121
    )]
    pub subscription: Account<'info, Subscription>,
    /// CHECK: This is safe because we don't need to verify anything about
    ///        an account being subscribed to
    pub to: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<SubscriptionSubscribeAccount>) -> Result<()> {

    if ctx.accounts.payer.key() != ctx.accounts.from.key() {
        if ctx.accounts.payer.key() != dispatcher_account::ID {
            return Err(ErrorCode::SubscriptionPayerMismatch.into());
        }
    }

    let subscription = &mut ctx.accounts.subscription;
    subscription.from = ctx.accounts.from.key();
    subscription.to = ctx.accounts.to.key();
    subscription.subscription_type = SubscriptionType::Account;
    subscription.datetime = Clock::get()?.unix_timestamp;
    subscription.payer = Some(ctx.accounts.payer.key());

    Ok(())
}
