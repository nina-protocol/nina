use crate::state::*;

use anchor_lang::prelude::*;
use crate::utils::{dispatcher_account};

#[derive(Accounts)]
#[instruction(hub_handle: String)]
pub struct SubscriptionSubscribeHubDelegated<'info> {
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
        space = 121
    )]
    pub subscription: Account<'info, Subscription>,
    #[account(
        seeds = [b"nina-hub", hub_handle.as_bytes()],
        bump,
    )]
    pub to: AccountLoader<'info, Hub>,
    pub system_program: Program<'info, System>,
}

pub fn handler(
  ctx: Context<SubscriptionSubscribeHubDelegated>,
  _hub_handle: String,
) -> Result<()> {
    let subscription = &mut ctx.accounts.subscription;
    subscription.from = ctx.accounts.from.key();
    subscription.to = ctx.accounts.to.key();
    subscription.subscription_type = SubscriptionType::Hub;
    subscription.datetime = Clock::get()?.unix_timestamp;
    
    Ok(())
}
