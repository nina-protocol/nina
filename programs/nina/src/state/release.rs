use anchor_lang::prelude::*;
use anchor_lang::solana_program::{
    program::{invoke, invoke_signed},
};
use mpl_token_metadata::{
    self,
    state::{Creator, DataV2},
    instruction::{create_metadata_accounts_v3, update_metadata_accounts_v2},
};
use anchor_spl::token::{self, TokenAccount, MintTo, Transfer, Token, Mint, SetAuthority};
use spl_token::instruction::{close_account};
use crate::utils::{wrapped_sol};

use crate::errors::ErrorCode;

#[account(zero_copy)]
#[repr(packed)]
#[derive(Default)]
pub struct Release {
    pub payer: Pubkey,
    pub authority: Pubkey,
    pub authority_token_account: Pubkey,
    pub release_signer: Pubkey,
    pub release_mint: Pubkey,
    pub release_datetime: i64,
    pub royalty_token_account: Pubkey,
    pub payment_mint: Pubkey,
    pub total_supply: u64,
    pub remaining_supply: u64,
    pub price: u64,
    pub resale_percentage: u64,
    pub total_collected: u64,
    pub sale_counter: u64,
    pub exchange_sale_counter: u64,
    pub sale_total: u64,
    pub exchange_sale_total: u64,
    pub bumps: ReleaseBumps,
    pub head: u64,
    pub tail: u64,
    pub royalty_recipients: [RoyaltyRecipient; 10],
}

impl Release {
    pub fn release_purchase_handler<'info> (
        payer: Signer<'info>,
        receiver: UncheckedAccount<'info>,
        release_loader: &AccountLoader<'info, Release>,
        release_signer: UncheckedAccount<'info>,
        payer_token_account: Box<Account<'info, TokenAccount>>,
        receiver_release_token_account: Box<Account<'info, TokenAccount>>,
        royalty_token_account: Box<Account<'info, TokenAccount>>,
        release_mint: Account<'info, Mint>,
        token_program: Program<'info, Token>,
        amount: u64,
    ) -> Result<()> {
        let mut release = release_loader.load_mut()?;

        if receiver.key() != receiver_release_token_account.owner {
            return Err(error!(ErrorCode::ReleasePurchaseWrongReceiver));
        }
        
        if !(release.release_datetime < Clock::get()?.unix_timestamp) {
            return Err(error!(ErrorCode::ReleaseNotLive));
        }
    
        if release.remaining_supply == 0 {
            return Err(error!(ErrorCode::SoldOut));
        }
    
        if amount != release.price {
            return Err(error!(ErrorCode::WrongAmount));
        };
    
        // Transfer USDC from Payer to Royalty USDC Account
        let cpi_accounts = Transfer {
            from: payer_token_account.to_account_info(),
            to: royalty_token_account.to_account_info(),
            authority: payer.to_account_info().clone(),
        };
        let cpi_program = token_program.to_account_info().clone();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::transfer(cpi_ctx, amount)?;
    
        // Update Sales Counters
        release.total_collected = u64::from(release.total_collected)
            .checked_add(amount)
            .unwrap();
        release.sale_counter = u64::from(release.sale_counter)
            .checked_add(1)
            .unwrap();  
        release.sale_total = u64::from(release.sale_total)
            .checked_add(amount)
            .unwrap();
        release.remaining_supply = u64::from(release.remaining_supply)
            .checked_sub(1)
            .unwrap();
    
        //Update Royalty Recipent Counters
        release.update_royalty_recipients_owed(amount);
    
        //MintTo PurchaserReleaseTokenAccount
        let cpi_accounts = MintTo {
            mint: release_mint.to_account_info(),
            to: receiver_release_token_account.to_account_info(),
            authority: release_signer.to_account_info().clone(),
        };
        let cpi_program = token_program.to_account_info().clone();
    
        let seeds = &[
            release_loader.to_account_info().key.as_ref(),
            &[release.bumps.signer],
        ];
        let signer = &[&seeds[..]];
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
        token::mint_to(cpi_ctx, 1)?;
        
        if release.payment_mint == wrapped_sol::ID {
            invoke(
                &close_account(
                    token_program.to_account_info().key,
                    payer_token_account.to_account_info().key,
                    payer.to_account_info().key,
                    payer.to_account_info().key,
                    &[],
                )?,
                &[
                    payer.to_account_info().clone(),
                    payer_token_account.to_account_info().clone(),
                    payer.to_account_info().clone(),
                    token_program.to_account_info().clone(),
                ]
            )?;
        }
    
        Ok(())
    }

	#[inline(never)]
    pub fn release_revenue_share_transfer_handler<'info> (
        release_loader: &AccountLoader<'info, Release>,
        release_signer: AccountInfo<'info>,
        royalty_token_account: AccountInfo<'info>,
        authority: Pubkey,
        new_royalty_recipient: Pubkey,
        new_royalty_recipient_token_account: AccountInfo<'info>,
        token_program: AccountInfo<'info>,
        transfer_share: u64,
        is_init: bool,
    ) -> Result<()> {

        let mut release;
        if is_init {
            release = release_loader.load_init()?;
        } else {
            release = release_loader.load_mut()?;
        }

        let seeds = &[
            release_loader.to_account_info().key.as_ref(),
            &[release.bumps.signer],
        ];
        let signer = &[&seeds[..]];

        let mut royalty_recipient = match release.find_royalty_recipient(authority) {
            Some(royalty_recipient) => royalty_recipient,
            None => return Err(error!(ErrorCode::InvalidRoyaltyRecipientAuthority)),
        };

        // Add New Royalty Recipient
        if transfer_share > royalty_recipient.percent_share {
            return Err(error!(ErrorCode::RoyaltyTransferTooLarge));
        };

        // Take share from current user
        royalty_recipient.percent_share = u64::from(royalty_recipient.percent_share)
            .checked_sub(transfer_share)
            .unwrap();
        let existing_royalty_recipient = release.find_royalty_recipient(new_royalty_recipient);
        // If new_royalty_recipient doesn't already have a share, add them as a new recipient
        if existing_royalty_recipient.is_none() {
            release.append_royalty_recipient({
                RoyaltyRecipient {
                    recipient_authority: new_royalty_recipient,
                    recipient_token_account: new_royalty_recipient_token_account.key(),
                    percent_share: transfer_share,
                    owed: 0 as u64,
                    collected: 0 as u64,
                }
            })?;
        } else {
            // new_royalty_recipient already has a share of the release, so collect royalties and append share
            let existing_royalty_recipient_unwrapped = existing_royalty_recipient.unwrap();
            if existing_royalty_recipient_unwrapped.owed > 0 {
                // Transfer Royalties from the existing royalty account to the existing user receiving more royalty share
                let cpi_accounts = Transfer {
                    from: royalty_token_account,
                    to: new_royalty_recipient_token_account,
                    authority: release_signer,
                };
                let cpi_program = token_program;
                let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
                token::transfer(cpi_ctx, existing_royalty_recipient_unwrapped.owed as u64)?;
            }
            existing_royalty_recipient_unwrapped.percent_share = u64::from(existing_royalty_recipient_unwrapped.percent_share)
                .checked_add(transfer_share)
                .unwrap();
        }

        // Make sure royalty shares of all recipients does not exceed 1000000
        if release.royalty_equals_1000000() {
            if !is_init {
                emit!(RoyaltyRecipientAdded {
                    authority: new_royalty_recipient,
                    public_key: release_loader.key(),
                });
            }
            Ok(())
        } else {
            return Err(error!(ErrorCode::RoyaltyExceeds100Percent));
        }
    }

    pub fn release_revenue_share_collect_handler<'info> (
        release_loader: &AccountLoader<'info, Release>,
        release_signer: AccountInfo<'info>,
        royalty_token_account: AccountInfo<'info>,
        authority: Pubkey,
        authority_token_account: AccountInfo<'info>,
        token_program: AccountInfo<'info>,
    ) -> Result<()> {
        let mut release = release_loader.load_mut()?;

        let seeds = &[
            release_loader.to_account_info().key.as_ref(),
            &[release.bumps.signer],
        ];
        let signer = &[&seeds[..]];

        let mut royalty_recipient = match release.find_royalty_recipient(authority) {
            Some(royalty_recipient) => royalty_recipient,
            None => return Err(error!(ErrorCode::InvalidRoyaltyRecipientAuthority)),
        };

        // Transfer Royalties from the royalty account to the user collecting
        let cpi_accounts = Transfer {
            from: royalty_token_account,
            to: authority_token_account,
            authority: release_signer,
        };
        let cpi_ctx = CpiContext::new_with_signer(token_program, cpi_accounts, signer);
        token::transfer(cpi_ctx, royalty_recipient.owed as u64)?;

        // Update Royalty Recipient's Counters
        royalty_recipient.collected = u64::from(royalty_recipient.collected)
            .checked_add(royalty_recipient.owed)
            .unwrap();
        royalty_recipient.owed = 0;

        Ok(())
    }
    
    #[inline(never)]
    pub fn create_metadata_handler<'info>(
        release_signer: AccountInfo<'info>,
        metadata: AccountInfo<'info>,
        release_mint: Box<Account<'info, Mint>>,
        authority: Signer<'info>,
        metadata_program: AccountInfo<'info>,
        token_program: Program<'info, Token>,
        system_program: Program<'info, System>,
        rent: Sysvar<'info, Rent>,
        release: AccountLoader<'info, Release>,
        metadata_data: ReleaseMetadataData,
        bumps: ReleaseBumps,
    ) -> Result<()> {
        let creators: Vec<Creator> =
        vec![Creator {
            address: *release_signer.to_account_info().key,
            verified: true,
            share: 100,
        }];

        let metadata_infos = vec![
            metadata.clone(),
            release_mint.to_account_info().clone(),
            release_signer.clone(),
            authority.to_account_info().clone(),
            metadata_program.clone(),
            token_program.to_account_info().clone(),
            system_program.to_account_info().clone(),
            rent.to_account_info().clone(),
            release.to_account_info().clone(),
        ];

        let seeds = &[
            release.to_account_info().key.as_ref(),
            &[bumps.signer],
        ];
    
        invoke_signed(
            &create_metadata_accounts_v3(
                metadata_program.key(),
                metadata.key(),
                release_mint.key(),
                release_signer.key(),
                authority.key(),
                release_signer.key(),
                metadata_data.name,
                metadata_data.symbol,
                metadata_data.uri.clone(),
                Some(creators),
                metadata_data.seller_fee_basis_points,
                true,
                true,
                None,
                None,
                None
            ),
            metadata_infos.as_slice(),
            &[seeds],
        )?;
    
        Ok(())
    }
    
    #[inline(never)]
    pub fn update_metadata_handler<'info>(
        release_signer: AccountInfo<'info>,
        metadata: AccountInfo<'info>,
        release_mint: Box<Account<'info, Mint>>,
        authority: Signer<'info>,
        metadata_program: AccountInfo<'info>,
        token_program: Program<'info, Token>,
        system_program: Program<'info, System>,
        rent: Sysvar<'info, Rent>,
        release: AccountLoader<'info, Release>,
        metadata_data: ReleaseMetadataData,
        bumps: ReleaseBumps,
    ) -> Result<()> {
        let creators: Vec<Creator> =
        vec![Creator {
            address: *release_signer.to_account_info().key,
            verified: true,
            share: 100,
        }];

        let metadata_infos = vec![
            metadata.clone(),
            release_mint.to_account_info().clone(),
            release_signer.clone(),
            authority.to_account_info().clone(),
            metadata_program.clone(),
            token_program.to_account_info().clone(),
            system_program.to_account_info().clone(),
            rent.to_account_info().clone(),
            release.to_account_info().clone(),
        ];

        let seeds = &[
            release.to_account_info().key.as_ref(),
            &[bumps.signer],
        ];
    
        invoke_signed(
            &update_metadata_accounts_v2(
                metadata_program.key(),
                metadata.key(),
                release_signer.key(),
                None,
                Some(DataV2 {
                    name: metadata_data.name,
                    symbol: metadata_data.symbol,
                    uri: metadata_data.uri.clone(),
                    seller_fee_basis_points: metadata_data.seller_fee_basis_points,
                    creators: Some(creators),
                    collection: None,
                    uses: None
                }),
                None,
                None
            ),
            metadata_infos.as_slice(),
            &[seeds],
        )?;
    
        Ok(())
    }

    #[inline(never)]
    pub fn release_init_handler<'info>(
        release_loader: &AccountLoader<'info, Release>,
        release_signer: AccountInfo<'info>,
        release_mint: AccountInfo<'info>,
        payment_mint: AccountInfo<'info>,
        payer: AccountInfo<'info>,
        authority: AccountInfo<'info>,
        authority_token_account: AccountInfo<'info>,
        royalty_token_account: AccountInfo<'info>,
        token_program: AccountInfo<'info>,
        config: ReleaseConfig,
        bumps: ReleaseBumps,
    ) -> Result<()> {
        let mut release = release_loader.load_init()?;
        release.authority = *authority.to_account_info().key;
        release.payer = *payer.to_account_info().key;
        release.release_signer = *release_signer.to_account_info().key;
        release.release_mint = *release_mint.to_account_info().key;
        release.authority_token_account = *authority_token_account.to_account_info().key;
        release.royalty_token_account = *royalty_token_account.to_account_info().key;
        release.payment_mint = *payment_mint.to_account_info().key;

        release.price = config.price;
        release.total_supply = config.amount_total_supply;
        release.remaining_supply = config.amount_total_supply;
        release.resale_percentage = config.resale_percentage;
        release.release_datetime = config.release_datetime;

        release.total_collected = 0;
        release.sale_counter = 0;
        release.sale_total = 0;
        release.exchange_sale_counter = 0;
        release.exchange_sale_total = 0;
        release.bumps = bumps;

        release.append_royalty_recipient({
            RoyaltyRecipient {
                recipient_authority: *authority.to_account_info().key,
                recipient_token_account: *authority_token_account.to_account_info().key,
                percent_share: 1000000,
                owed: 0,
                collected: 0,
            }
        })?;

        //Transfer Mint Authority To release_signer PDA
        // Need to do this for Metaplex
        let cpi_accounts = SetAuthority {
            current_authority: payer.to_account_info(),
            account_or_mint: release_mint.to_account_info()
        };
        let cpi_program = token_program.to_account_info().clone();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::set_authority(cpi_ctx, AuthorityType::MintTokens.into(), Some(release.release_signer))?;
        
        Ok(())
    }

    pub fn update_royalty_recipients_owed(&mut self, amount: u64) {
        for royalty_recipient in self.royalty_recipients.iter_mut() {
            if royalty_recipient.percent_share > 0 {
                royalty_recipient.owed = u64::from(royalty_recipient.owed)
                    .checked_add(
                        amount
                            .checked_mul(royalty_recipient.percent_share)
                            .unwrap()
                            .checked_div(1000000)
                            .unwrap()
                    )
                    .unwrap();
            }
        }
    }

    pub fn find_royalty_recipient(&mut self, pubkey: Pubkey) -> Option<&mut RoyaltyRecipient> {
        for royalty_recipient in self.royalty_recipients.iter_mut() {
            if royalty_recipient.recipient_authority == pubkey {
                return Some(royalty_recipient);
            };
        }
        return None
    }

    pub fn royalty_equals_1000000(&mut self) -> bool {
        let mut royalty_counter = 0;
        for royalty_recipient in self.royalty_recipients.iter_mut() {
            royalty_counter = u64::from(royalty_counter)
                .checked_add(royalty_recipient.percent_share)
                .unwrap();
        }

        if royalty_counter == 1000000 {
            return true
        } else {
            return false
        };

    }

    pub fn append_royalty_recipient(
        &mut self,
        royalty_recipient: RoyaltyRecipient
    ) -> Result<()> {
        self.royalty_recipients[Release::index_of(self.head)] = royalty_recipient;
        if Release::index_of(self.head.checked_add(1).unwrap()) == Release::index_of(self.tail) {
            self.tail = u64::from(self.tail)
                .checked_add(1)
                .unwrap();
        }
        self.head = u64::from(self.head)
            .checked_add(1)
            .unwrap();

        // Don't allow more than 10 revenue shares
        if self.head <= 10 {
            Ok(())
        } else {
            return Err(error!(ErrorCode::MaximumAmountOfRevenueShares));

        }
    }

    pub fn index_of(counter: u64) -> usize {
        std::convert::TryInto::try_into(counter % 10).unwrap()
    }

    pub fn is_exchange_valid(
        release: Release,
        initializer_sending_mint:Pubkey,
        initializer_expected_mint: Pubkey,
        is_selling: bool,
    ) -> Result<()> {

        if is_selling && initializer_expected_mint != release.payment_mint {
            return Err(error!(ErrorCode::WrongMintForExchange));
        }

        if !is_selling && initializer_sending_mint != release.payment_mint {
            return Err(error!(ErrorCode::WrongMintForExchange));
        }

        Ok(())
    } 
}

#[zero_copy]
#[repr(packed)]
#[derive(Default)]
pub struct RoyaltyRecipient {
    pub recipient_authority: Pubkey,
    pub recipient_token_account: Pubkey,
    pub percent_share: u64,
    pub owed: u64,
    pub collected: u64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default, Copy)]
pub struct ReleaseBumps {
    pub release: u8,
    pub signer: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default, Copy)]
pub struct ReleaseConfig {
    pub amount_total_supply: u64,
    pub amount_to_artist_token_account: u64,
    pub amount_to_vault_token_account: u64,
    pub resale_percentage: u64,
    pub price: u64,
    pub release_datetime: i64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default)]
pub struct ReleaseMetadataData {
    pub name: String,
    pub symbol: String,
    pub uri: String,
    pub seller_fee_basis_points: u16,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub enum AuthorityType {
    /// Authority to mint new tokens
    MintTokens,
    /// Authority to freeze any account associated with the Mint
    FreezeAccount,
    /// Owner of a given token account
    AccountOwner,
    /// Authority to close a token account
    CloseAccount,
}

impl From<AuthorityType> for spl_token::instruction::AuthorityType {
    fn from(authority_ty: AuthorityType) -> spl_token::instruction::AuthorityType {
        match authority_ty {
            AuthorityType::MintTokens => spl_token::instruction::AuthorityType::MintTokens,
            AuthorityType::FreezeAccount => spl_token::instruction::AuthorityType::FreezeAccount,
            AuthorityType::AccountOwner => spl_token::instruction::AuthorityType::AccountOwner,
            AuthorityType::CloseAccount => spl_token::instruction::AuthorityType::CloseAccount,
        }
    }
}

#[event]
pub struct ReleaseCreated {
    pub authority: Pubkey,
    pub datetime: i64,
    pub mint: Pubkey,
    #[index]
    pub public_key: Pubkey,
    pub metadata_public_key: Pubkey,
    pub uri: String,
}

#[event]
pub struct RoyaltyRecipientAdded {
    pub authority: Pubkey,
    pub public_key: Pubkey,
}

#[event]
pub struct ReleaseSold {
    pub public_key: Pubkey,
    pub purchaser: Pubkey,
    #[index]
    pub date: i64,
}

#[event]
pub struct ReleaseSoldViaHub {
    pub public_key: Pubkey,
    pub purchaser: Pubkey,
    pub hub: Pubkey,
    #[index]
    pub date: i64,
}


