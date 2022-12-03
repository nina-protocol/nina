use anchor_lang::prelude::*;

#[derive(Accounts)]

pub struct ReleaseCloseEdition<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        mut,
        seeds = [b"nina-release".as_ref(), release_mint.key().as_ref()],
        constraint = release.load()?.authority == authority.key(),
        bump,
    )]
    pub release: AccountLoader<'info, Release>,
    /// CHECK: This is safe because it is derived from release which is checked above
    #[account(
        seeds = [release.key().as_ref()],
        bump,
    )]
    pub release_signer: AccountInfo<'info>,
    #[account(
        mut,
        address = release.load()?.release_mint,
        constraint = release_mint.mint_authority == COption::Some(*release_signer.key),
    )]
    pub release_mint: Account<'info, Mint>,
}

pub fn handler(ctx: Context<ReleaseCloseEdition>) -> Result<()> {
    let release = ctx.accounts.release.load()?;
    release.total_supply = release.sale_counter;
    release.remaining_supply = 0;
    
    Ok(())
}