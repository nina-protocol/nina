use anchor_lang::prelude::*;
use crate::state::*;
use crate::utils::{dispatcher_account};

#[derive(Accounts)]
pub struct SubscriptionSubscribeAccountDelegated<'info> {
    #[account(
        mut,
        address = dispatcher_account::ID,
    )]
    pub payer: Signer<'info>,
    /// CHECK: This is safe because we trust the payer
    pub from: UncheckedAccount<'info>,
    #[account(
        init,
        seeds = [b"nina-subscription", from.key().as_ref(), to.key().as_ref()],
        bump,
        payer = payer,
        space = 113
    )]
    pub subscription: Account<'info, Subscription>,
    /// CHECK: This is safe because we don't need to verify anything about
    ///        an account being subscribed to
    pub to: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<SubscriptionSubscribeAccountDelegated>) -> Result<()> {
    let subscription = &mut ctx.accounts.subscription;
    subscription.from = ctx.accounts.from.key();
    subscription.to = ctx.accounts.to.key();
    subscription.subscription_type = SubscriptionType::Account;
    subscription.datetime = Clock::get()?.unix_timestamp;

    emit!(SubscriptionSubscribed {
        public_key: subscription.key(),
        from: subscription.from,
        to: subscription.to,
        subscription_type: subscription.subscription_type,
        datetime: subscription.datetime,
    });

    Ok(())
}
