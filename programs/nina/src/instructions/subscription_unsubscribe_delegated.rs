use anchor_lang::prelude::*;
use crate::state::*;
use crate::utils::{dispatcher_account};

#[derive(Accounts)]
pub struct SubscriptionUnsubscribeDelegated<'info> {
    #[account(
        mut,
        address = dispatcher_account::ID,
    )]
    pub payer: Signer<'info>,
    /// CHECK: This is safe because we trust the payer
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
    ctx: Context<SubscriptionUnsubscribeDelegated>
) -> Result<()> {

    emit!(SubscriptionUnsubscribed {
        public_key: ctx.accounts.subscription.key(),
    });

    Ok(())
}
