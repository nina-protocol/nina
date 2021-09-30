use anchor_lang::prelude::*;

#[account]
#[derive(Default)]
pub struct Vault {
    pub authority: Pubkey,
    pub vault_signer: Pubkey,
    pub usdc_vault: Pubkey,
    pub wrapped_sol_vault: Pubkey,
    pub bumps: VaultBumps,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default)]
pub struct VaultBumps {
    pub vault: u8,
    pub signer: u8,
    pub usdc: u8,
    pub wsol: u8,
}
