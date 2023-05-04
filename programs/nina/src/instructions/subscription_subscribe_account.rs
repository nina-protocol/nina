use anchor_lang::prelude::*;
use crate::state::*;

#[derive(Accounts)]
pub struct SubscriptionSubscribeAccount<'info> {
    #[account(mut)]
    pub from: Signer<'info>,
    #[account(
        init,
        seeds = [b"nina-subscription", from.key().as_ref(), to.key().as_ref()],
        bump,
        payer = from,
        space = 113
    )]
    pub subscription: Account<'info, Subscription>,
    /// CHECK: This is safe because we don't need to verify anything about
    ///        an account being subscribed to
    pub to: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<SubscriptionSubscribeAccount>) -> Result<()> {
    let subscription = &mut ctx.accounts.subscription;
    subscription.from = ctx.accounts.from.key();
    subscription.to = ctx.accounts.to.key();
    subscription.subscription_type = SubscriptionType::Account;
    subscription.datetime = Clock::get()?.unix_timestamp;

    Ok(())
}
