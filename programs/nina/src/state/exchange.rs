use anchor_lang::prelude::*;
use anchor_lang::solana_program::{
    program::{invoke_signed},
};
use spl_token::instruction::{close_account};

use crate::errors::ErrorCode;

#[account]
pub struct Exchange {
    pub initializer: Pubkey,
    pub release: Pubkey,
    pub release_mint: Pubkey,
    pub initializer_expected_token_account: Pubkey,
    pub initializer_sending_token_account: Pubkey,
    pub initializer_sending_mint: Pubkey,
    pub initializer_expected_mint: Pubkey,
    pub exchange_signer: Pubkey,
    pub exchange_escrow_token_account: Pubkey,
    pub expected_amount: u64,
    pub initializer_amount: u64,
    pub is_selling: bool,
    pub bump: u8,
}

impl Exchange {
    pub fn cancel_amount_validation(
        exchange: &Exchange,
        amount: u64,
    ) -> ProgramResult {
        if exchange.initializer_amount != amount {
            return Err(ErrorCode::ExchangeCancelAmountMismatch.into());
        }

        Ok(())
    }

    pub fn close_escrow_token_account<'info>(
        initializer: AccountInfo<'info>,
        exchange: &Account<'info, Exchange>,
        exchange_signer: AccountInfo<'info>,
        exchange_escrow_token_account: AccountInfo<'info>,
        token_program: AccountInfo<'info>,
    ) -> ProgramResult {
        // Close exchange_escrow_token_account transferring all lamports back to initializer
        let seeds = &[
            exchange.to_account_info().key.as_ref(),
            &[exchange.bump],
        ];
        let signer = &[&seeds[..]];

        invoke_signed(
            &close_account(
                token_program.key,
                exchange_escrow_token_account.key,
                initializer.key,
                exchange_signer.key,
                &[],
            )?,
            &[
                exchange_signer.clone(),
                exchange_escrow_token_account.clone(),
                initializer.clone(),
                token_program.clone(),
            ],
            signer
        )?;
        Ok(())
    }
}

#[account]
pub struct ExchangeHistory {
    pub release: Pubkey,
    pub seller: Pubkey,
    pub buyer: Pubkey,
    pub datetime: u64,
    pub price: u64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default)]
pub struct ExchangeConfig {
    pub expected_amount: u64,
    pub initializer_amount: u64,
    pub is_selling: bool,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default)]
pub struct ExchangeAcceptParams {
    pub expected_amount: u64,
    pub initializer_amount: u64,
    pub resale_percentage: u64,
    pub datetime: u64,
}

