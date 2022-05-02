use anchor_lang::prelude::*;
use crate::state::*;

#[derive(Accounts)]
pub struct SubscriptionUnsubscribe<'info> {
    #[account(mut)]
    pub from: Signer<'info>,
    #[account(
        mut,
        seeds = [b"nina-subscription", from.key().as_ref(), to.key().as_ref()],
        bump,
        close = from,
    )]
    pub subscription: Account<'info, Subscription>,
    /// CHECK: This is safe because we check in subscription seed
    pub to: UncheckedAccount<'info>,
}

pub fn handler(
    ctx: Context<SubscriptionUnsubscribe>
) -> Result<()> {

    emit!(SubscriptionUnsubscribed {
        public_key: ctx.accounts.subscription.key(),
    });

    Ok(())
}
