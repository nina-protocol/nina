const anchor = require('@project-serum/anchor');
const { Token, TOKEN_PROGRAM_ID } = require("@solana/spl-token");
const assert = require("assert");
const encrypt = require('./utils/encrypt');
const {
  getTokenAccount,
  createMint,
  createMintInstructions,
  mintToAccount,
  findOrCreateAssociatedTokenAccount,
  bnToDecimal,
  newAccount,
  wrapSol,
} = require("./utils");

let nina = anchor.workspace.Nina;
let provider = anchor.Provider.env();

//Users
let user1;
let user2;
let user3;
let vault;

// Mints
let usdcMint;
let wrappedSolMint = new anchor.web3.PublicKey('So11111111111111111111111111111111111111112');
let npcMint;
let nhcMint;
let releaseMint;
let releaseMint2;
let releaseMint3;

// Accounts
let release;
let releaseSigner;
let release2;
let releaseSigner2;
let release3;
let releaseSigner3;
let vaultUsdcTokenAccount;
let vaultWrappedSolTokenAccount;
let vaultSigner;
let usdcTokenAccount;
let royaltyTokenAccount;
let royaltyTokenAccount2;
let royaltyTokenAccount3;
let receiverReleaseTokenAccount;
let user2UsdcTokenAccount;
let authorityReleaseTokenAccount;
let authorityReleaseTokenAccount2;
let user1UsdcTokenAccount;
let wrappedSolTokenAccount;
let user1WrappedSolTokenAccount;
let receiverReleaseTokenAccount2;
let wrongReleaseTokenAccount;
let publishingCreditTokenAccount;
let publishingCreditTokenAccount2;
let hubCreditTokenAccount;

// Misc
let releasePrice = 10000000;
let expectedAmountExchangeSellOffer = 5000000;
let initializerAmount = 5000000;

let releaseSellOut

describe('Init', async () => {
  it('Set up USDC Mint + Users', async () => {
    user1 = await newAccount(provider);
    user2 = await newAccount(provider);
    user3 = await newAccount(provider);
    usdcMint = await createMint(provider, provider.wallet.publicKey, 6);
    npcMint = await createMint(provider, provider.wallet.publicKey, 0);
    nhcMint = await createMint(provider, provider.wallet.publicKey, 0);

    const [_usdcTokenAccount, usdcTokenAccountIx] = await findOrCreateAssociatedTokenAccount(
      provider,
      provider.wallet.publicKey,
      anchor.web3.SystemProgram.programId,
      anchor.web3.SYSVAR_RENT_PUBKEY,
      usdcMint,
    );
    usdcTokenAccount = _usdcTokenAccount;

    const [_wrappedSolTokenAccount, wrappedSolTokenAccountIx] = await findOrCreateAssociatedTokenAccount(
      provider,
      provider.wallet.publicKey,
      anchor.web3.SystemProgram.programId,
      anchor.web3.SYSVAR_RENT_PUBKEY,
      wrappedSolMint,
    );
    wrappedSolTokenAccount = _wrappedSolTokenAccount;

    let [_publishingCreditTokenAccount, publishingCreditTokenAccountIx] = await findOrCreateAssociatedTokenAccount(
      provider,
      provider.wallet.publicKey,
      anchor.web3.SystemProgram.programId,
      anchor.web3.SYSVAR_RENT_PUBKEY,
      npcMint,
    );
    publishingCreditTokenAccount = _publishingCreditTokenAccount;

    let [_hubCreditTokenAccount, hubCreditTokenAccountIx] = await findOrCreateAssociatedTokenAccount(
      provider,
      provider.wallet.publicKey,
      anchor.web3.SystemProgram.programId,
      anchor.web3.SYSVAR_RENT_PUBKEY,
      nhcMint,
    )
    hubCreditTokenAccount = _hubCreditTokenAccount

    const [_user1UsdcTokenAccount, user1UsdcTokenAccountIx] = await findOrCreateAssociatedTokenAccount(
      provider,
      user1.publicKey,
      anchor.web3.SystemProgram.programId,
      anchor.web3.SYSVAR_RENT_PUBKEY,
      usdcMint,
    );
    user1UsdcTokenAccount = _user1UsdcTokenAccount;

    const [_user1WrappedSolTokenAccount, user1WrappedSolTokenAccountIx] = await findOrCreateAssociatedTokenAccount(
      provider,
      user1.publicKey,
      anchor.web3.SystemProgram.programId,
      anchor.web3.SYSVAR_RENT_PUBKEY,
      wrappedSolMint,
    );
    user1WrappedSolTokenAccount = _user1WrappedSolTokenAccount;

    const tx = new anchor.web3.Transaction();
    tx.add(
      usdcTokenAccountIx,
      user1UsdcTokenAccountIx,
      wrappedSolTokenAccountIx,
      user1WrappedSolTokenAccountIx,
      publishingCreditTokenAccountIx,
      hubCreditTokenAccountIx
    );
    await provider.send(tx, []);

    await mintToAccount(
      provider,
      usdcMint,
      usdcTokenAccount,
      new anchor.BN(100000000),
      provider.wallet.publicKey,
    );

    await mintToAccount(
      provider,
      nhcMint,
      hubCreditTokenAccount,
      new anchor.BN(100),
      provider.wallet.publicKey,
    );

    await mintToAccount(
      provider,
      usdcMint,
      user1UsdcTokenAccount,
      new anchor.BN(100000000),
      provider.wallet.publicKey,
    );
  });

  it('Creates Vault and adds authority', async () => {
    const [_vault, vaultBump] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from(anchor.utils.bytes.utf8.encode("nina-vault"))],
      nina.programId
    );
    vault = _vault;

    const [_vaultSigner, vaultSignerBump] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("nina-vault-signer")),
        vault.toBuffer()
      ],
      nina.programId
    );
    vaultSigner = _vaultSigner;

    const [usdcVault, usdcVaultBump] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("nina-vault-token")),
        vault.toBuffer(),
        usdcMint.toBuffer()
      ],
      nina.programId
    );
    vaultUsdcTokenAccount = usdcVault;

    const [wrappedSolVault, wrappedSolVaultBump] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("nina-vault-token")),
        vault.toBuffer(),
        wrappedSolMint.toBuffer()
      ],
      nina.programId
    );
    vaultWrappedSolTokenAccount = wrappedSolVault;

    const bumps = {
      vault,
      signer: vaultSignerBump,
      usdc: usdcVaultBump,
      wsol: wrappedSolVaultBump,
    };

    await nina.rpc.vaultInit(bumps, {
      accounts: {
        vault,
        vaultSigner,
        usdcVault,
        wrappedSolVault,
        usdcMint,
        wrappedSolMint,
        authority: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      },
    });

    const vaultAfter = await nina.account.vault.fetch(vault);
    assert.ok(vaultAfter.authority.equals(provider.wallet.publicKey));
    assert.ok(vaultAfter.vaultSigner.equals(vaultSigner));
    assert.ok(vaultAfter.usdcVault.equals(usdcVault));
    assert.ok(vaultAfter.wrappedSolVault.equals(wrappedSolVault));
  });

  it('Fails when trying init another vault', async () => {

    const [vault2, vaultBump2] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from(anchor.utils.bytes.utf8.encode("nina-vault2"))],
      nina.programId
    );

    const [vaultSigner2, vaultSignerBump2] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("nina-vault-signer")),
        vault2.toBuffer()
      ],
      nina.programId
    );

    const [usdcVault2, usdcVaultBump2] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("nina-vault-token")),
        vault2.toBuffer(),
        usdcMint.toBuffer()
      ],
      nina.programId
    );

    const [wrappedSolVault2, wrappedSolVaultBump2] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("nina-vault-token")),
        vault2.toBuffer(),
        wrappedSolMint.toBuffer()
      ],
      nina.programId
    );

    const bumps = {
      vault: vaultBump2,
      signer: vaultSignerBump2,
      usdc: usdcVaultBump2,
      wsol: wrappedSolVaultBump2,
    };

    await assert.rejects(
      async () => {
        await nina.rpc.vaultInit(bumps, {
          accounts: {
            vault: vault2,
            vaultSigner: vaultSigner2,
            usdcVault: usdcVault2,
            wrappedSolVault: wrappedSolVault2,
            usdcMint,
            wrappedSolMint,
            authority: provider.wallet.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          },
        })
      },
      (err) => {
        assert.ok(err.toString().includes("Cross-program invocation with unauthorized signer or writable account"));
        return true;
      }
    );
  });

});

describe('Release', async () => {
  it('Initialize Release For Sale in USDC', async () => {
    const paymentMint = usdcMint;
    releaseMint = anchor.web3.Keypair.generate();
    const releaseMintIx = await createMintInstructions(
      provider,
      provider.wallet.publicKey,
      releaseMint.publicKey,
      0,
    );

    const [_release, releaseBump] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("nina-release")),
        releaseMint.publicKey.toBuffer(),
      ],
      nina.programId,
    );
    release = _release;

    const [_releaseSigner, releaseSignerBump] = await anchor.web3.PublicKey.findProgramAddress(
      [release.toBuffer()],
      nina.programId,
    );
    releaseSigner = _releaseSigner;

    let [_royaltyTokenAccount, royaltyTokenAccountIx] = await findOrCreateAssociatedTokenAccount(
      provider,
      releaseSigner,
      anchor.web3.SystemProgram.programId,
      anchor.web3.SYSVAR_RENT_PUBKEY,
      paymentMint,
    );
    royaltyTokenAccount = _royaltyTokenAccount;

    const config = {
      amountTotalSupply: new anchor.BN(1000),
      amountToArtistTokenAccount: new anchor.BN(0),
      amountToVaultTokenAccount: new anchor.BN(0),
      resalePercentage: new anchor.BN(200000),
      price: new anchor.BN(releasePrice),
      releaseDatetime: new anchor.BN((Date.now() / 1000) - 5),
    };

    const bumps = {
      release: releaseBump,
      signer: releaseSignerBump,
    }
    const instructions = [
      ...releaseMintIx,
      royaltyTokenAccountIx,
    ]

    await nina.rpc.releaseInitProtected(
      config,
      bumps, {
        accounts: {
          release,
          releaseSigner,
          releaseMint: releaseMint.publicKey,
          payer: provider.wallet.publicKey,
          authority: provider.wallet.publicKey,
          authorityTokenAccount: usdcTokenAccount,
          paymentMint,
          royaltyTokenAccount,
          systemProgram: anchor.web3.SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        },
        signers: [releaseMint],
        instructions,
      }
    );

    const releaseAfter = await nina.account.release.fetch(release);
    assert.ok(releaseAfter.remainingSupply.toNumber() === config.amountTotalSupply.toNumber() - config.amountToArtistTokenAccount.toNumber() -  config.amountToVaultTokenAccount.toNumber());
    assert.equal(bnToDecimal(releaseAfter.resalePercentage.toNumber()), .2)
    assert.equal(bnToDecimal(releaseAfter.royaltyRecipients[0].percentShare.toNumber()), 1)
  });

  it('Creates Metadata', async () => {
    const metadataProgram = new anchor.web3.PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s')
    const [metadata, metadataBump] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from('metadata'), metadataProgram.toBuffer(), releaseMint.publicKey.toBuffer()],
      metadataProgram,
    );

    const data = {
      name: `Nina with the Nina`,
      symbol: `NINA`,
      uri: `https://arweave.net`,
      sellerFeeBasisPoints: 2000,
    }

    await nina.rpc.releaseCreateMetadata(
      data, {
        accounts: {
          payer: provider.wallet.publicKey,
          release,
          releaseSigner,
          metadata,
          releaseMint: releaseMint.publicKey,
          tokenMetadataProgram: metadataProgram,
          systemProgram: anchor.web3.SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        },
      }
    )
  });
  
  it('Fails to Initialize Release For Sale in USDC with Publishing Credit if no publshing credits', async () => {

    const paymentMint = usdcMint;
    releaseMint = anchor.web3.Keypair.generate();
    const releaseMintIx = await createMintInstructions(
      provider,
      provider.wallet.publicKey,
      releaseMint.publicKey,
      0,
    );

    const [_release, releaseBump] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("nina-release")),
        releaseMint.publicKey.toBuffer(),
      ],
      nina.programId,
    );
    release = _release;

    const [_releaseSigner, releaseSignerBump] = await anchor.web3.PublicKey.findProgramAddress(
      [release.toBuffer()],
      nina.programId,
    );
    releaseSigner = _releaseSigner;

    let [_royaltyTokenAccount, royaltyTokenAccountIx] = await findOrCreateAssociatedTokenAccount(
      provider,
      releaseSigner,
      anchor.web3.SystemProgram.programId,
      anchor.web3.SYSVAR_RENT_PUBKEY,
      paymentMint,
    );
    royaltyTokenAccount = _royaltyTokenAccount;

    const config = {
      amountTotalSupply: new anchor.BN(1000),
      amountToArtistTokenAccount: new anchor.BN(0),
      amountToVaultTokenAccount: new anchor.BN(0),
      resalePercentage: new anchor.BN(200000),
      price: new anchor.BN(releasePrice),
      releaseDatetime: new anchor.BN((Date.now() / 1000) - 5),
    };

    const bumps = {
      release: releaseBump,
      signer: releaseSignerBump,
    }

    await assert.rejects(
      async () => {
        await nina.rpc.releaseInitWithCredit(
          config,
          bumps, {
            accounts: {
              release,
              releaseSigner,
              releaseMint: releaseMint.publicKey,
              payer: provider.wallet.publicKey,
              authority: provider.wallet.publicKey,
              authorityTokenAccount: usdcTokenAccount,
              authorityPublishingCreditTokenAccount: publishingCreditTokenAccount,
              publishingCreditMint: npcMint,
              paymentMint,
              royaltyTokenAccount,
              systemProgram: anchor.web3.SystemProgram.programId,
              tokenProgram: TOKEN_PROGRAM_ID,
              rent: anchor.web3.SYSVAR_RENT_PUBKEY,
            },
            signers: [releaseMint],
            instructions: [
              ...releaseMintIx,
              royaltyTokenAccountIx,
            ],
          }
        );
      },
      (err) => {
        assert.ok(err.toString().includes('0x1'))
        return true;
      }
    );
  });

  it('Initialize Release For Sale in USDC with Publishing Credit', async () => {

    await mintToAccount(
      provider,
      npcMint,
      publishingCreditTokenAccount,
      new anchor.BN(5),
      provider.wallet.publicKey,
    );

    const paymentMint = usdcMint;
    releaseMint = anchor.web3.Keypair.generate();
    const releaseMintIx = await createMintInstructions(
      provider,
      provider.wallet.publicKey,
      releaseMint.publicKey,
      0,
    );

    const [_release, releaseBump] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("nina-release")),
        releaseMint.publicKey.toBuffer(),
      ],
      nina.programId,
    );
    release = _release;

    const [_releaseSigner, releaseSignerBump] = await anchor.web3.PublicKey.findProgramAddress(
      [release.toBuffer()],
      nina.programId,
    );
    releaseSigner = _releaseSigner;

    let [_royaltyTokenAccount, royaltyTokenAccountIx] = await findOrCreateAssociatedTokenAccount(
      provider,
      releaseSigner,
      anchor.web3.SystemProgram.programId,
      anchor.web3.SYSVAR_RENT_PUBKEY,
      paymentMint,
    );
    royaltyTokenAccount = _royaltyTokenAccount;

    const authorityPublishingCreditTokenAccountBefore = await getTokenAccount(
      provider,
      publishingCreditTokenAccount,
    );

    const config = {
      amountTotalSupply: new anchor.BN(1000),
      amountToArtistTokenAccount: new anchor.BN(0),
      amountToVaultTokenAccount: new anchor.BN(0),
      resalePercentage: new anchor.BN(200000),
      price: new anchor.BN(releasePrice),
      releaseDatetime: new anchor.BN((Date.now() / 1000) - 5),
    };

    const bumps = {
      release: releaseBump,
      signer: releaseSignerBump,
    }

    await nina.rpc.releaseInitWithCredit(
      config,
      bumps, {
        accounts: {
          release,
          releaseSigner,
          releaseMint: releaseMint.publicKey,
          payer: provider.wallet.publicKey,
          authority: provider.wallet.publicKey,
          authorityTokenAccount: usdcTokenAccount,
          authorityPublishingCreditTokenAccount: publishingCreditTokenAccount,
          publishingCreditMint: npcMint,
          paymentMint,
          royaltyTokenAccount,
          systemProgram: anchor.web3.SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        },
        signers: [releaseMint],
        instructions: [
          ...releaseMintIx,
          royaltyTokenAccountIx,
        ],
      }
    );

    const releaseAfter = await nina.account.release.fetch(release);
    assert.ok(releaseAfter.remainingSupply.toNumber() === config.amountTotalSupply.toNumber() - config.amountToArtistTokenAccount.toNumber() -  config.amountToVaultTokenAccount.toNumber());
    assert.equal(bnToDecimal(releaseAfter.resalePercentage.toNumber()), .2)
    assert.equal(bnToDecimal(releaseAfter.royaltyRecipients[0].percentShare.toNumber()), 1)

    const authorityPublishingCreditTokenAccountAfter = await getTokenAccount(
      provider,
      publishingCreditTokenAccount,
    );
    assert.equal(authorityPublishingCreditTokenAccountBefore.amount.toNumber() - 1, authorityPublishingCreditTokenAccountAfter.amount.toNumber())

  });

  it('Initialize Release For Sale in wSOL', async () => {
    const paymentMint = wrappedSolMint;
    releaseMint2 = anchor.web3.Keypair.generate();
    const releaseMintIx = await createMintInstructions(
      provider,
      provider.wallet.publicKey,
      releaseMint2.publicKey,
      0,
    );

    const [_release, releaseBump] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("nina-release")),
        releaseMint2.publicKey.toBuffer(),
      ],
      nina.programId,
    );
    release2 = _release;

    const [_releaseSigner, releaseSignerBump] = await anchor.web3.PublicKey.findProgramAddress(
      [release2.toBuffer()],
      nina.programId,
    );
    releaseSigner2 = _releaseSigner;

    let [_royaltyTokenAccount, royaltyTokenAccountIx] = await findOrCreateAssociatedTokenAccount(
      provider,
      releaseSigner2,
      anchor.web3.SystemProgram.programId,
      anchor.web3.SYSVAR_RENT_PUBKEY,
      paymentMint,
    );
    royaltyTokenAccount2 = _royaltyTokenAccount;

    const config = {
      amountTotalSupply: new anchor.BN(1000),
      amountToArtistTokenAccount: new anchor.BN(0),
      amountToVaultTokenAccount: new anchor.BN(0),
      resalePercentage: new anchor.BN(200000),
      price: new anchor.BN(releasePrice),
      releaseDatetime: new anchor.BN((Date.now() / 1000) - 5),
    };

    const bumps = {
      release: releaseBump,
      signer: releaseSignerBump,
    }

    await nina.rpc.releaseInitProtected(
      config,
      bumps, {
        accounts: {
          release: release2,
          releaseSigner: releaseSigner2,
          releaseMint: releaseMint2.publicKey,
          payer: provider.wallet.publicKey,
          authority: provider.wallet.publicKey,
          authorityTokenAccount: wrappedSolTokenAccount,
          paymentMint,
          royaltyTokenAccount:royaltyTokenAccount2,
          systemProgram: anchor.web3.SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        },
        signers: [releaseMint2],
        instructions: [
          ...releaseMintIx,
          royaltyTokenAccountIx,
        ],
      }
    );

    const releaseAfter = await nina.account.release.fetch(release2);
    assert.ok(releaseAfter.remainingSupply.toNumber() === config.amountTotalSupply.toNumber() - config.amountToArtistTokenAccount.toNumber() -  config.amountToVaultTokenAccount.toNumber());
    assert.equal(bnToDecimal(releaseAfter.resalePercentage.toNumber()), .2)
    assert.equal(bnToDecimal(releaseAfter.royaltyRecipients[0].percentShare.toNumber()), 1)
  })

  it("Purchases a release with USDC", async () => {
    const usdcTokenAccountBefore = await getTokenAccount(
      provider,
      user1UsdcTokenAccount,
    );
    const usdcTokenAccountBeforeBalanceTx = usdcTokenAccountBefore.amount.toNumber();

    let [_receiverReleaseTokenAccount, receiverReleaseTokenAccountIx] = await findOrCreateAssociatedTokenAccount(
      provider,
      user1.publicKey,
      anchor.web3.SystemProgram.programId,
      anchor.web3.SYSVAR_RENT_PUBKEY,
      releaseMint.publicKey,
    );
    receiverReleaseTokenAccount = _receiverReleaseTokenAccount;

    const releaseBefore = await nina.account.release.fetch(release);

    await nina.rpc.releasePurchase(
      new anchor.BN(releasePrice), {
        accounts: {
          release,
          releaseSigner,
          payer: user1.publicKey,
          payerTokenAccount: user1UsdcTokenAccount,
          receiver: user1.publicKey,
          receiverReleaseTokenAccount,
          royaltyTokenAccount,
          releaseMint: releaseMint.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
          clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
        },
        signers: [user1],
        instructions: [receiverReleaseTokenAccountIx],
      }
    );

    const receiverReleaseTokenAccountAfter = await getTokenAccount(
      provider,
      receiverReleaseTokenAccount,
    );
    assert.ok(receiverReleaseTokenAccountAfter.amount.toNumber() === 1)

    const usdcTokenAccountAfter = await getTokenAccount(
      provider,
      user1UsdcTokenAccount,
    );
    assert.ok(usdcTokenAccountAfter.amount.toNumber() === usdcTokenAccountBeforeBalanceTx - releasePrice)

    const releaseAfter = await nina.account.release.fetch(release);
    assert.ok(releaseAfter.remainingSupply.toNumber() === releaseBefore.remainingSupply.toNumber() - 1);

    assert.equal(releaseAfter.saleCounter.toNumber(), 1);
    assert.equal(releaseAfter.totalCollected.toNumber(), releasePrice);

    const royaltyTokenAccountAfter = await getTokenAccount(
      provider,
      releaseAfter.royaltyTokenAccount,
    );
    assert.equal(royaltyTokenAccountAfter.amount.toNumber(), releasePrice);
  });

  it("Purchases a release with wSOL", async () => {
    const solBeforeBalance = await provider.connection.getBalance(user1.publicKey);
    const releaseBefore = await nina.account.release.fetch(release2);

    let [_receiverReleaseTokenAccount2, receiverReleaseTokenAccountIx] = await findOrCreateAssociatedTokenAccount(
      provider,
      user1.publicKey,
      anchor.web3.SystemProgram.programId,
      anchor.web3.SYSVAR_RENT_PUBKEY,
      releaseMint2.publicKey,
    );
    receiverReleaseTokenAccount2 = _receiverReleaseTokenAccount2;

    const {instructions, signers} = await wrapSol(
      provider,
      user1,
      new anchor.BN(releasePrice),
    );

    await nina.rpc.releasePurchase(
      new anchor.BN(releasePrice), {
        accounts: {
          release: release2,
          releaseMint: releaseMint2.publicKey,
          releaseSigner: releaseSigner2,
          payer: user1.publicKey,
          payerTokenAccount: signers[0].publicKey,
          receiver: user1.publicKey,
          receiverReleaseTokenAccount: receiverReleaseTokenAccount2,
          royaltyTokenAccount: royaltyTokenAccount2,
          tokenProgram: TOKEN_PROGRAM_ID,
          clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
        },
        signers: [user1, ...signers],
        instructions: [
          ...instructions,
          receiverReleaseTokenAccountIx,
        ],
      }
    );

    const receiverReleaseTokenAccountAfter = await getTokenAccount(
      provider,
      receiverReleaseTokenAccount,
    );
    assert.ok(receiverReleaseTokenAccountAfter.amount.toNumber() === 1)

    const solAfterBalance = await provider.connection.getBalance(user1.publicKey);
    assert.equal(solAfterBalance, solBeforeBalance - releasePrice);

    const releaseAfter = await nina.account.release.fetch(release);
    assert.ok(releaseAfter.remainingSupply.toNumber() === releaseBefore.remainingSupply.toNumber() - 1)

    assert.equal(releaseAfter.saleCounter.toNumber(), 1)
    assert.equal(releaseAfter.totalCollected.toNumber(), releasePrice)

    const royaltyTokenAccountAfter = await getTokenAccount(
      provider,
      releaseAfter.royaltyTokenAccount,
    );
    assert.equal(royaltyTokenAccountAfter.amount.toNumber(), releasePrice)
  });

  it("Purchases a second release with wSOL", async () => {
    const solBeforeBalance = await provider.connection.getBalance(user1.publicKey);
    const releaseBefore = await nina.account.release.fetch(release2);

    let [_receiverReleaseTokenAccount2, receiverReleaseTokenAccountIx] = await findOrCreateAssociatedTokenAccount(
      provider,
      user1.publicKey,
      anchor.web3.SystemProgram.programId,
      anchor.web3.SYSVAR_RENT_PUBKEY,
      releaseMint2.publicKey,
    );
    receiverReleaseTokenAccount2 = _receiverReleaseTokenAccount2;

    const {instructions, signers} = await wrapSol(
      provider,
      user1,
      new anchor.BN(releasePrice),
    );

    await nina.rpc.releasePurchase(
      new anchor.BN(releasePrice), {
        accounts: {
          release: release2,
          releaseMint: releaseMint2.publicKey,
          releaseSigner: releaseSigner2,
          payer: user1.publicKey,
          payerTokenAccount: signers[0].publicKey,
          receiver: user1.publicKey,
          receiverReleaseTokenAccount: receiverReleaseTokenAccount2,
          royaltyTokenAccount: royaltyTokenAccount2,
          tokenProgram: TOKEN_PROGRAM_ID,
          clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
        },
        signers: [user1, ...signers],
        instructions: [
          ...instructions,
        ],
      }
    );

    const receiverReleaseTokenAccountAfter = await getTokenAccount(
      provider,
      receiverReleaseTokenAccount,
    );
    assert.ok(receiverReleaseTokenAccountAfter.amount.toNumber() === 1)

    const solAfterBalance = await provider.connection.getBalance(user1.publicKey);
    assert.equal(solAfterBalance, solBeforeBalance - releasePrice);

    const releaseAfter = await nina.account.release.fetch(release2);
    assert.ok(releaseAfter.remainingSupply.toNumber() === releaseBefore.remainingSupply.toNumber() - 1)

    assert.equal(releaseAfter.saleCounter.toNumber(), releaseBefore.saleCounter.toNumber() + 1)
    assert.equal(releaseAfter.totalCollected.toNumber(), releasePrice * releaseAfter.saleCounter.toNumber())

    const royaltyTokenAccountAfter = await getTokenAccount(
      provider,
      releaseAfter.royaltyTokenAccount,
    );
    assert.equal(royaltyTokenAccountAfter.amount.toNumber(), releasePrice * releaseAfter.saleCounter.toNumber())
  });

  it('Fails to purchase a release if not sent enough USDC', async () => {
    await assert.rejects(
      async () => {
        await nina.rpc.releasePurchase(new anchor.BN(500), {
          accounts: {
            release,
            releaseSigner,
            payer: user1.publicKey,
            payerTokenAccount: user1UsdcTokenAccount,
            receiver: user1.publicKey,
            receiverReleaseTokenAccount,
            royaltyTokenAccount,
            releaseMint: releaseMint.publicKey,
            tokenProgram: TOKEN_PROGRAM_ID,
            clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
          },
          signers:[user1],
        })
      },
      (err) => {
        assert.equal(err.code, 6000);
        assert.equal(err.msg, "Amount sent does not match price");
        return true;
      }
    );
  });

  it('Will airdrop a release', async () => {

    const releaseBefore = await nina.account.release.fetch(release);

    const newUser = await newAccount(provider);
    let [recipientReleaseTokenAccount, recipientReleaseTokenAccountIx] = await findOrCreateAssociatedTokenAccount(
      provider,
      newUser.publicKey,
      anchor.web3.SystemProgram.programId,
      anchor.web3.SYSVAR_RENT_PUBKEY,
      releaseMint.publicKey,
    );
    
    await nina.rpc.releaseAirdrop({
      accounts: {
        release,
        releaseSigner,
        payer: provider.wallet.publicKey,
        recipient: newUser.publicKey,
        recipientReleaseTokenAccount,
        releaseMint: releaseMint.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
      },
      instructions:[recipientReleaseTokenAccountIx],
    })

    const releaseAfter = await nina.account.release.fetch(release);
    assert.ok(releaseAfter.remainingSupply.toNumber() === releaseBefore.remainingSupply.toNumber() - 1);

    const recipientReleaseTokenAccountAfter = await getTokenAccount(
      provider,
      recipientReleaseTokenAccount,
    );
    assert.ok(recipientReleaseTokenAccountAfter.amount.toNumber() === 1)
  });

  it('Fails to airdrop a release with wrong authority', async () => {

    const newUser = await newAccount(provider);
    let [recipientReleaseTokenAccount, recipientReleaseTokenAccountIx] = await findOrCreateAssociatedTokenAccount(
      provider,
      newUser.publicKey,
      anchor.web3.SystemProgram.programId,
      anchor.web3.SYSVAR_RENT_PUBKEY,
      releaseMint.publicKey,
    );

    await assert.rejects(
      async () => {
        await nina.rpc.releaseAirdrop({
          accounts: {
            release,
            releaseSigner,
            payer: newUser.publicKey,
            recipient: newUser.publicKey,
            recipientReleaseTokenAccount,
            releaseMint: releaseMint.publicKey,
            tokenProgram: TOKEN_PROGRAM_ID,
            clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
          },
          signers:[newUser],
          instructions:[recipientReleaseTokenAccountIx],
        })
      },
      (err) => {
        assert.equal(err.code, 2003);
        assert.equal(err.msg, "A raw constraint was violated");
        return true;
      }
    );
  });

  it('Will not sell a release if sold out', async () => {
    const paymentMint = usdcMint;
    const releaseMintSellOut = anchor.web3.Keypair.generate();
    const releaseMintIx = await createMintInstructions(
      provider,
      provider.wallet.publicKey,
      releaseMintSellOut.publicKey,
      0,
    );

    const [_releaseSellOut, releaseBump] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("nina-release")),
        releaseMintSellOut.publicKey.toBuffer(),
      ],
      nina.programId,
    );
      releaseSellOut = _releaseSellOut
    const [releaseSignerSellOut, releaseSignerBump] = await anchor.web3.PublicKey.findProgramAddress(
      [releaseSellOut.toBuffer()],
      nina.programId,
    );

    let [royaltyTokenAccountSellOut, royaltyTokenAccountIx] = await findOrCreateAssociatedTokenAccount(
      provider,
      releaseSignerSellOut,
      anchor.web3.SystemProgram.programId,
      anchor.web3.SYSVAR_RENT_PUBKEY,
      paymentMint,
    );

    let [receiverReleaseTokenAccountSellOut, receiverReleaseTokenAccountIx] = await findOrCreateAssociatedTokenAccount(
      provider,
      user1.publicKey,
      anchor.web3.SystemProgram.programId,
      anchor.web3.SYSVAR_RENT_PUBKEY,
      releaseMintSellOut.publicKey,
    );

    const releasePriceSellout = new anchor.BN(100);
    const config = {
      amountTotalSupply: new anchor.BN(4),
      amountToArtistTokenAccount: new anchor.BN(0),
      amountToVaultTokenAccount: new anchor.BN(0),
      resalePercentage: new anchor.BN(200000),
      price: releasePriceSellout,
      releaseDatetime: new anchor.BN((Date.now() / 1000) - 5),
    };
    const bumps = {
      release: releaseBump,
      signer: releaseSignerBump,
    }

    await nina.rpc.releaseInitProtected(
      config,
      bumps, {
        accounts: {
          release: releaseSellOut,
          releaseSigner: releaseSignerSellOut,
          releaseMint: releaseMintSellOut.publicKey,
          payer: provider.wallet.publicKey,
          authority: provider.wallet.publicKey,
          authorityTokenAccount: usdcTokenAccount,
          paymentMint,
          royaltyTokenAccount: royaltyTokenAccountSellOut,
          systemProgram: anchor.web3.SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        },
        signers: [releaseMintSellOut],
        instructions: [
          ...releaseMintIx,
          royaltyTokenAccountIx,
          receiverReleaseTokenAccountIx,
        ],
      }
    );

    const createGenerator = function*() {
      let i = 0;
      while(i < 5) {
        yield await Promise.resolve(i++);
      }
    }
    const generator = createGenerator();

    await assert.rejects(
      async () => {
        for await (let item of generator) {
          await nina.rpc.releasePurchase(
            releasePriceSellout, {
              accounts: {
                release: releaseSellOut,
                releaseSigner: releaseSignerSellOut,
                payer: user1.publicKey,
                payerTokenAccount: user1UsdcTokenAccount,
                receiver: user1.publicKey,
                receiverReleaseTokenAccount: receiverReleaseTokenAccountSellOut,
                royaltyTokenAccount: royaltyTokenAccountSellOut,
                releaseMint: releaseMintSellOut.publicKey,
                tokenProgram: TOKEN_PROGRAM_ID,
                clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
              },
              signers: [user1],
            }
          );
        }
      },
      (err) => {
        assert.equal(err.code, 6006);
        assert.equal(err.msg, "Sold out");
        return true;
      }
    );
  });

  it('Will not sell a release if release date not live', async () => {
    const paymentMint = usdcMint;
    const releaseMintTest = anchor.web3.Keypair.generate();
    const releaseMintIx = await createMintInstructions(
      provider,
      provider.wallet.publicKey,
      releaseMintTest.publicKey,
      0,
    );
    releaseMint3 = releaseMintTest;

    const [releaseTest, releaseBump] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("nina-release")),
        releaseMintTest.publicKey.toBuffer(),
      ],
      nina.programId,
    );
    release3 = releaseTest;

    const [releaseSignerTest, releaseSignerBump] = await anchor.web3.PublicKey.findProgramAddress(
      [releaseTest.toBuffer()],
      nina.programId,
    );
    releaseSigner3 = releaseSignerTest;

    let [royaltyTokenAccountTest, royaltyTokenAccountIx] = await findOrCreateAssociatedTokenAccount(
      provider,
      releaseSignerTest,
      anchor.web3.SystemProgram.programId,
      anchor.web3.SYSVAR_RENT_PUBKEY,
      paymentMint,
    );
    royaltyTokenAccount3 = royaltyTokenAccountTest;

    const releasePriceTest = new anchor.BN(100);
    const config = {
      amountTotalSupply: new anchor.BN(5),
      amountToArtistTokenAccount: new anchor.BN(0),
      amountToVaultTokenAccount: new anchor.BN(0),
      resalePercentage: new anchor.BN(200000),
      price: releasePriceTest,
      releaseDatetime: new anchor.BN((Date.now() / 1000) + 5),
    };
    const bumps = {
      release: releaseBump,
      signer: releaseSignerBump,
    }

    await nina.rpc.releaseInitProtected(
      config,
      bumps, {
        accounts: {
          release: releaseTest,
          releaseSigner: releaseSignerTest,
          releaseMint: releaseMintTest.publicKey,
          payer: provider.wallet.publicKey,
          authority: provider.wallet.publicKey,
          authorityTokenAccount: usdcTokenAccount,
          paymentMint,
          royaltyTokenAccount: royaltyTokenAccountTest,
          systemProgram: anchor.web3.SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        },
        signers: [releaseMintTest],
        instructions: [
          ...releaseMintIx,
          royaltyTokenAccountIx,
        ],
      }
    );

    await assert.rejects(
      async () => {
        let [receiverReleaseTokenAccountTest, receiverReleaseTokenAccountIx] = await findOrCreateAssociatedTokenAccount(
          provider,
          user1.publicKey,
          anchor.web3.SystemProgram.programId,
          anchor.web3.SYSVAR_RENT_PUBKEY,
          releaseMintTest.publicKey,
        );

        await nina.rpc.releasePurchase(
          releasePriceTest, {
            accounts: {
              release: releaseTest,
              releaseSigner: releaseSignerTest,
              payer: user1.publicKey,
              payerTokenAccount: user1UsdcTokenAccount,
              receiver: user1.publicKey,
              receiverReleaseTokenAccount: receiverReleaseTokenAccountTest,
              royaltyTokenAccount: royaltyTokenAccountTest,
              releaseMint: releaseMintTest.publicKey,
              tokenProgram: TOKEN_PROGRAM_ID,
              clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
            },
            signers: [user1],
            instructions: [receiverReleaseTokenAccountIx],
          }
        );
      },
      (err) => {
        assert.equal(err.code, 6011);
        assert.equal(err.msg, "Release is not live yet");
        return true;
      }
    );
  });
});

describe("Revenue Share", async () => {
  it('Collects Revenue Share USDC', async () => {
    const usdcTokenAccountBefore = await getTokenAccount(
      provider,
      usdcTokenAccount,
    );
    const usdcTokenAccountBeforeBalance = usdcTokenAccountBefore.amount.toNumber(); 

    const royaltyTokenAccountBefore = await getTokenAccount(
      provider,
      royaltyTokenAccount,
    );
    const royaltyTokenAccountBeforeBalance = royaltyTokenAccountBefore.amount.toNumber(); 

    const releaseBefore = await nina.account.release.fetch(release);
    const royaltyRecipientOwedBefore = releaseBefore.royaltyRecipients[0].owed.toNumber();

    await nina.rpc.releaseRevenueShareCollect({
      accounts: {
        authority: provider.wallet.publicKey,
        authorityTokenAccount: usdcTokenAccount,
        release,
        releaseSigner,
        releaseMint: releaseMint.publicKey,
        royaltyTokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
      },
    });

    const releaseAfter = await nina.account.release.fetch(release);
    assert.equal(releaseAfter.royaltyRecipients[0].owed.toNumber(), 0);
    assert.equal(
      releaseAfter.royaltyRecipients[0].collected.toNumber(),
      royaltyRecipientOwedBefore,
    )

    const royaltyTokenAccountAfter = await getTokenAccount(
      provider,
      releaseAfter.royaltyTokenAccount,
    );
    assert.equal(royaltyTokenAccountAfter.amount.toNumber(), 0)

    const usdcTokenAccountAfter = await getTokenAccount(
      provider,
      usdcTokenAccount,
    );
    assert.equal(
      usdcTokenAccountAfter.amount.toNumber(),
      royaltyRecipientOwedBefore + usdcTokenAccountBeforeBalance
    );
  });

  it('Fails to collect Revenue Share if user is not authority', async () => {
    await assert.rejects(
      async () => {
        await nina.rpc.releaseRevenueShareCollect({
          accounts: {
            authority: user1.publicKey,
            authorityTokenAccount: user1UsdcTokenAccount,
            release,
            releaseSigner,
            releaseMint: releaseMint.publicKey,
            royaltyTokenAccount,
            tokenProgram: TOKEN_PROGRAM_ID,
          },
          signers: [user1],
        });      
    },
      (err) => {
        assert.equal(err.code, 6009);
        assert.equal(err.msg, "Invalid royalty recipient authority");
        return true;
      }
    );
  });

  it('Collects Revenue Share wSOL', async () => {
    const wrappedSolTokenAccountAfter = await getTokenAccount(
      provider,
      wrappedSolTokenAccount,
    );
    const wrappedSolTokenAccountBeforeBalance = wrappedSolTokenAccountAfter.amount.toNumber(); 

    let royaltyTokenAccountBefore = await getTokenAccount(
      provider,
      royaltyTokenAccount2,
    );
    const royaltyTokenAccount2BeforeBalance = royaltyTokenAccountBefore.amount.toNumber(); 

    const releaseBefore = await nina.account.release.fetch(release2);
    const royaltyRecipientOwedBefore = releaseBefore.royaltyRecipients[0].owed.toNumber();

    await nina.rpc.releaseRevenueShareCollect({
      accounts: {
        authority: provider.wallet.publicKey,
        authorityTokenAccount: wrappedSolTokenAccount,
        release: release2,
        releaseMint: releaseMint2.publicKey,
        releaseSigner: releaseSigner2,
        royaltyTokenAccount: royaltyTokenAccount2,
        tokenProgram: TOKEN_PROGRAM_ID,
      },
    });

    const releaseAfter = await nina.account.release.fetch(release2);
    assert.equal(releaseAfter.royaltyRecipients[0].owed.toNumber(), 0);
    assert.equal(
      releaseAfter.royaltyRecipients[0].collected.toNumber(),
      royaltyRecipientOwedBefore,
    );

    const royaltyTokenAccountAfter = await getTokenAccount(
      provider,
      releaseAfter.royaltyTokenAccount,
    );
    assert.equal(royaltyTokenAccountAfter.amount.toNumber(), 0);

    const wrappedSolTokenAccountAfter = await getTokenAccount(
      provider,
      wrappedSolTokenAccount,
    );
    assert.equal(
      wrappedSolTokenAccountAfter.amount.toNumber(),
      royaltyRecipientOwedBefore + wrappedSolTokenAccountBeforeBalance,
    );
  });

  it('Transfers Revenue Share', async () => {
    const releaseBefore = await nina.account.release.fetch(release);
    const royaltyRecipientPercentShareBeforeTx = releaseBefore.royaltyRecipients[0].percentShare.toNumber();

    const [_user2UsdcTokenAccount, user2UsdcTokenAccountIx] = await findOrCreateAssociatedTokenAccount(
      provider,
      user2.publicKey,
      anchor.web3.SystemProgram.programId,
      anchor.web3.SYSVAR_RENT_PUBKEY,
      usdcMint,
    );
    user2UsdcTokenAccount = _user2UsdcTokenAccount;

    const amountToTransfer = 250000;
    await nina.rpc.releaseRevenueShareTransfer(
      new anchor.BN(amountToTransfer), {
      accounts: {
        authority: provider.wallet.publicKey,
        authorityTokenAccount: usdcTokenAccount,
        release,
        releaseSigner,
        releaseMint: releaseMint.publicKey,
        royaltyTokenAccount,
        newRoyaltyRecipient: user2.publicKey,
        newRoyaltyRecipientTokenAccount: user2UsdcTokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      },
      instructions: [user2UsdcTokenAccountIx]
    })

    const releaseAfter = await nina.account.release.fetch(release);
    assert.equal(
      releaseAfter.royaltyRecipients[0].percentShare.toNumber(),
      royaltyRecipientPercentShareBeforeTx - amountToTransfer,
    );
    assert.equal(
      releaseAfter.royaltyRecipients[1].percentShare.toNumber(),
      amountToTransfer,
    );
  });

  it('Fails to transfer Revenue Share if user doesnt have a share', async () => {
    const user3 = await newAccount(provider);
    const [user3UsdcTokenAccount, user3UsdcTokenAccountIx] = await findOrCreateAssociatedTokenAccount(
      provider,
      user3.publicKey,
      anchor.web3.SystemProgram.programId,
      anchor.web3.SYSVAR_RENT_PUBKEY,
      usdcMint,
    );

    const amountToTransfer = 1000;

    await assert.rejects(
      async () => {
        await nina.rpc.releaseRevenueShareTransfer(
          new anchor.BN(amountToTransfer), {
          accounts: {
            authority: user3.publicKey,
            authorityTokenAccount: user3UsdcTokenAccount,
            release,
            releaseSigner,
            releaseMint: releaseMint.publicKey,
            royaltyTokenAccount,
            newRoyaltyRecipient: user2.publicKey,
            newRoyaltyRecipientTokenAccount: user2UsdcTokenAccount,
            tokenProgram: TOKEN_PROGRAM_ID,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          },
          signers: [user3],
          instructions: [user3UsdcTokenAccountIx],
        })
      },
      (err) => {
        assert.equal(err.code, 6009);
        assert.equal(err.msg, "Invalid royalty recipient authority");
        return true;
      }
    );
  });

  it('Fails to transfer Revenue Share if greater than users share', async () => {
    const amountToTransfer = 800000;

    await assert.rejects(
      async () => {
        await nina.rpc.releaseRevenueShareTransfer(
          new anchor.BN(amountToTransfer), {
          accounts: {
            authority: provider.wallet.publicKey,
            authorityTokenAccount: usdcTokenAccount,
            release,
            releaseSigner,
            releaseMint: releaseMint.publicKey,
            royaltyTokenAccount,
            newRoyaltyRecipient: user2.publicKey,
            newRoyaltyRecipientTokenAccount: user2UsdcTokenAccount,
            tokenProgram: TOKEN_PROGRAM_ID,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          },
        })
      },
      (err) => {
        assert.equal(err.code, 6002);
        assert.equal(err.msg, "Cannot transfer royalty share larger than current share");
        return true;
      }
    );
  });

  it('Fails to transfer revenue share if revenue share users exceeds 10', async () => {

    await assert.rejects(
      async () => {
        const users = [];
        while (users.length < 10) {
          users.push(anchor.web3.Keypair.generate());
        };

        for (let user of users) {
          user = await newAccount(provider, 1e10, user)
          const [userUsdc, userUsdcIx] = await findOrCreateAssociatedTokenAccount(
            provider,
            user.publicKey,
            anchor.web3.SystemProgram.programId,
            anchor.web3.SYSVAR_RENT_PUBKEY,
            usdcMint,
          );
          const amountToTransfer = 500;
          await nina.rpc.releaseRevenueShareTransfer(
            new anchor.BN(amountToTransfer), {
            accounts: {
              authority: provider.wallet.publicKey,
              authorityTokenAccount: usdcTokenAccount,
              release,
              releaseSigner,
              releaseMint: releaseMint.publicKey,
              royaltyTokenAccount,
              newRoyaltyRecipient: user.publicKey,
              newRoyaltyRecipientTokenAccount: userUsdc,
              tokenProgram: TOKEN_PROGRAM_ID,
              rent: anchor.web3.SYSVAR_RENT_PUBKEY,
            },
            instructions: [userUsdcIx]
          })
        }      
      },
      (err) => {
        assert.equal(err.code, 6003);
        assert.equal(err.msg, "Cannot have more than 10 Revenue Share Holders");
        return true;
      }
    );
  });

  it('Appends Revenue Share transfer to user with existing share', async () => {
    let releaseBefore = await nina.account.release.fetch(release);
    const royaltyRecipient0PercentShareBeforeTx = releaseBefore.royaltyRecipients[0].percentShare.toNumber();
    const royaltyRecipient1PercentShareBeforeTx = releaseBefore.royaltyRecipients[1].percentShare.toNumber();
    
    const amountToTransfer = 250000;
    await nina.rpc.releaseRevenueShareTransfer(
      new anchor.BN(amountToTransfer), {
      accounts: {
        authority: provider.wallet.publicKey,
        authorityTokenAccount: usdcTokenAccount,
        release,
        releaseSigner,
        releaseMint: releaseMint.publicKey,
        royaltyTokenAccount,
        newRoyaltyRecipient: user2.publicKey,
        newRoyaltyRecipientTokenAccount: user2UsdcTokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      },
    });

    let releaseAfter = await nina.account.release.fetch(release);
    assert.equal(
      releaseAfter.royaltyRecipients[0].percentShare.toNumber(),
      royaltyRecipient0PercentShareBeforeTx - amountToTransfer,
    );
    assert.equal(
      releaseAfter.royaltyRecipients[1].percentShare.toNumber(),
      royaltyRecipient1PercentShareBeforeTx + amountToTransfer,
    );
  });
});

describe("Exchange", async () => {
  let exchange;
  let exchangeSigner = null;
  let exchangeEscrowTokenAccount  = null;

  it("Initializes a buy exchange USDC", async () => {
    exchange = anchor.web3.Keypair.generate();

    const [_exchangeSigner, bump] = await anchor.web3.PublicKey.findProgramAddress(
      [exchange.publicKey.toBuffer()],
      nina.programId
    );
    exchangeSigner = _exchangeSigner;

    let [_exchangeEscrowTokenAccount, exchangeEscrowTokenAccountIx] = await findOrCreateAssociatedTokenAccount(
      provider,
      exchangeSigner,
      anchor.web3.SystemProgram.programId,
      anchor.web3.SYSVAR_RENT_PUBKEY,
      usdcMint,
    );
    exchangeEscrowTokenAccount = _exchangeEscrowTokenAccount

    let [_authorityReleaseTokenAccount, authorityReleaseTokenAccountIx] = await findOrCreateAssociatedTokenAccount(
      provider,
      provider.wallet.publicKey,
      anchor.web3.SystemProgram.programId,
      anchor.web3.SYSVAR_RENT_PUBKEY,
      releaseMint.publicKey,
      false,
      true,
    );
    authorityReleaseTokenAccount = _authorityReleaseTokenAccount;

    const config = {
      expectedAmount: new anchor.BN(1),
      initializerAmount: new anchor.BN(initializerAmount),
      isSelling: false,
    }

    await nina.rpc.exchangeInit(
      config,
      bump, {
        accounts: {
          initializer: provider.wallet.publicKey,
          releaseMint: releaseMint.publicKey,
          initializerExpectedTokenAccount: authorityReleaseTokenAccount,
          initializerSendingTokenAccount: usdcTokenAccount,
          initializerExpectedMint: releaseMint.publicKey,
          initializerSendingMint: usdcMint,
          exchangeEscrowTokenAccount,
          exchangeSigner,
          exchange: exchange.publicKey,
          release,
          systemProgram: anchor.web3.SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        },
        signers:[exchange],
        instructions: [
          authorityReleaseTokenAccountIx,
          await nina.account.exchange.createInstruction(exchange),
          exchangeEscrowTokenAccountIx,
        ],
      }
    )

    const exchangeAfter = await nina.account.exchange.fetch(exchange.publicKey);
    const exchangeAccountEscrowTokenAccount = await getTokenAccount(
      provider,
      exchangeAfter.exchangeEscrowTokenAccount,
    );
    assert.ok(exchangeAccountEscrowTokenAccount.amount.toNumber() === config.initializerAmount.toNumber());
  });

  it('Fails to Cancel an existing exchange USDC if not the authority', async () => {
    await assert.rejects(
      async () => {
        await nina.rpc.exchangeCancel(
          new anchor.BN(initializerAmount), {
            accounts: {
              initializer: user1.publicKey,
              initializerSendingTokenAccount: user1UsdcTokenAccount,
              exchangeEscrowTokenAccount: exchangeEscrowTokenAccount,
              exchangeSigner,
              exchange: exchange.publicKey,
              tokenProgram: TOKEN_PROGRAM_ID,
            },
            signers: [user1],
          }
        );
      },
      (err) => {
        assert.equal(err.code, 2003);
        assert.equal(err.msg, "A raw constraint was violated");
        return true;
      }
    );
  });

  it('Cancels an existing exchange USDC', async () => {
    let usdcTokenAccountBefore = await getTokenAccount(
      provider,
      usdcTokenAccount,
    );
    const usdcTokenAccountBeforeBalanceTx = usdcTokenAccountBefore.amount.toNumber();

    await nina.rpc.exchangeCancel(
      new anchor.BN(initializerAmount), {
        accounts: {
          initializer: provider.wallet.publicKey,
          initializerSendingTokenAccount: usdcTokenAccount,
          exchangeEscrowTokenAccount: exchangeEscrowTokenAccount,
          exchangeSigner,
          exchange: exchange.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
        },
      }
    )
    const usdcTokenAccountAfter = await getTokenAccount(
      provider,
      usdcTokenAccount,
    );
    assert.ok(usdcTokenAccountAfter.amount.toNumber() === usdcTokenAccountBeforeBalanceTx + initializerAmount)

    await assert.rejects(
      async () => {
        await nina.account.exchange.fetch(exchange.publicKey);
      },
      (err) => {
        assert.ok(err.toString().includes("Account does not exist"));
        return true;
      }
    );
  });

  it("Initializes a second buy exchange USDC", async () => {
    exchange = anchor.web3.Keypair.generate();

    const [_exchangeSigner, bump] = await anchor.web3.PublicKey.findProgramAddress(
      [exchange.publicKey.toBuffer()],
      nina.programId
    );
    exchangeSigner = _exchangeSigner;

    let [_exchangeEscrowTokenAccount, exchangeEscrowTokenAccountIx] = await findOrCreateAssociatedTokenAccount(
      provider,
      exchangeSigner,
      anchor.web3.SystemProgram.programId,
      anchor.web3.SYSVAR_RENT_PUBKEY,
      usdcMint,
    );
    exchangeEscrowTokenAccount = _exchangeEscrowTokenAccount

    const config = {
      expectedAmount: new anchor.BN(1),
      initializerAmount: new anchor.BN(initializerAmount),
      isSelling: false,
    }

    await nina.rpc.exchangeInit(
      config,
      bump, {
        accounts: {
          initializer: provider.wallet.publicKey,
          releaseMint: releaseMint.publicKey,
          initializerExpectedTokenAccount: authorityReleaseTokenAccount,
          initializerSendingTokenAccount: usdcTokenAccount,
          initializerExpectedMint: releaseMint.publicKey,
          initializerSendingMint: usdcMint,
          exchangeEscrowTokenAccount,
          exchangeSigner,
          exchange: exchange.publicKey,
          release,
          systemProgram: anchor.web3.SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        },
        signers:[exchange],
        instructions: [
          await nina.account.exchange.createInstruction(exchange),
          exchangeEscrowTokenAccountIx,
        ],
      }
    )

    const exchangeAfter = await nina.account.exchange.fetch(exchange.publicKey);
    const exchangeAccountEscrowTokenAccount = await getTokenAccount(
      provider,
      exchangeAfter.exchangeEscrowTokenAccount,
    );
    assert.ok(exchangeAccountEscrowTokenAccount.amount.toNumber() === config.initializerAmount.toNumber());
  });

  it('Fails to Accept a existing buy exchange with wrong release', async () => {
    const releaseBefore = await nina.account.release.fetch(release);

    const params = {
      expectedAmount: new anchor.BN(1),
      initializerAmount: new anchor.BN(initializerAmount),
      resalePercentage: releaseBefore.resalePercentage,
      datetime: new anchor.BN(Date.now() / 1000),
    };

    const exchangeHistory = anchor.web3.Keypair.generate();
    const createExchangeHistoryIx = await nina.account.exchangeHistory.createInstruction(exchangeHistory)

    const releaseMintTest = anchor.web3.Keypair.generate();
    const releaseMintIx = await createMintInstructions(
      provider,
      provider.wallet.publicKey,
      releaseMintTest.publicKey,
      0,
    );
    // releaseMint3 = releaseMintTest;

    let [authorityReleaseTokenAccountTest, authorityReleaseTokenAccountIx] = await findOrCreateAssociatedTokenAccount(
      provider,
      provider.wallet.publicKey,
      anchor.web3.SystemProgram.programId,
      anchor.web3.SYSVAR_RENT_PUBKEY,
      releaseMintTest.publicKey,
      false,
      true,
    );
    wrongReleaseTokenAccount = authorityReleaseTokenAccountTest;

    await assert.rejects(
      async () => {
        await nina.rpc.exchangeAccept(
          params, {
            accounts: {
              initializer: provider.wallet.publicKey,
              initializerExpectedTokenAccount: authorityReleaseTokenAccount,
              takerExpectedTokenAccount: usdcTokenAccount,
              takerSendingTokenAccount: wrongReleaseTokenAccount,
              exchangeEscrowTokenAccount,
              exchangeSigner,
              taker: provider.wallet.publicKey,
              exchange: exchange.publicKey,
              exchangeHistory: exchangeHistory.publicKey,
              vault,
              vaultTokenAccount: vaultUsdcTokenAccount,
              release,
              royaltyTokenAccount: royaltyTokenAccount3,
              systemProgram: anchor.web3.SystemProgram.programId,
              tokenProgram: TOKEN_PROGRAM_ID,
              rent: anchor.web3.SYSVAR_RENT_PUBKEY,
            },
            signers: [releaseMintTest, exchangeHistory],
            instructions: [
              ...releaseMintIx,
              authorityReleaseTokenAccountIx,
              createExchangeHistoryIx
            ],
          }
        );
       
      },
      (err) => {
        assert.equal(err.toString(), "A raw constraint was violated");
        return true;
      }
    );
  });

  it('Fails to Accept an existing buy exchange if resale percentage wrong', async () => {
    const releaseBefore = await nina.account.release.fetch(release);

    const badResalePercentage = new anchor.BN(20);
    const params = {
      expectedAmount: new anchor.BN(1),
      initializerAmount: new anchor.BN(initializerAmount),
      resalePercentage: badResalePercentage,
      datetime: new anchor.BN(Date.now() / 1000),
    };
    const exchangeHistory = anchor.web3.Keypair.generate();
    const createExchangeHistoryIx = await nina.account.exchangeHistory.createInstruction(exchangeHistory)

    await assert.rejects(
      async () => {
        await nina.rpc.exchangeAccept(
          params, {
            accounts: {
              initializer: provider.wallet.publicKey,
              initializerExpectedTokenAccount: authorityReleaseTokenAccount,
              takerExpectedTokenAccount: user1UsdcTokenAccount,
              takerSendingTokenAccount: receiverReleaseTokenAccount,
              exchangeEscrowTokenAccount,
              exchangeSigner,
              taker: user1.publicKey,
              exchange: exchange.publicKey,
              exchangeHistory: exchangeHistory.publicKey,
              vault: vault,
              vaultTokenAccount: vaultUsdcTokenAccount,
              release,
              royaltyTokenAccount,
              systemProgram: anchor.web3.SystemProgram.programId,
              tokenProgram: TOKEN_PROGRAM_ID,
              rent: anchor.web3.SYSVAR_RENT_PUBKEY,
            },
            signers: [user1, exchangeHistory],
            instructions: [createExchangeHistoryIx],
          }
        );
      },
      (err) => {
        assert.equal(err.code, 6005)
        assert.equal(err.msg, "Royalty percentage provided is incorrect");
        return true;
      }
    );
  });

  it('Fails to Accept an existing buy exchange if initializerAmount wrong', async () => {
    const releaseBefore = await nina.account.release.fetch(release);

    const params = {
      expectedAmount: new anchor.BN(1),
      initializerAmount: new anchor.BN(111),
      resalePercentage: releaseBefore.resalePercentage,
      datetime: new anchor.BN(Date.now() / 1000),
    };
    const exchangeHistory = anchor.web3.Keypair.generate();
    const createExchangeHistoryIx = await nina.account.exchangeHistory.createInstruction(exchangeHistory)

    await assert.rejects(
      async () => {
        await nina.rpc.exchangeAccept(
          params, {
            accounts: {
              initializer: provider.wallet.publicKey,
              initializerExpectedTokenAccount: authorityReleaseTokenAccount,
              takerExpectedTokenAccount: user1UsdcTokenAccount,
              takerSendingTokenAccount: receiverReleaseTokenAccount,
              exchangeEscrowTokenAccount,
              exchangeSigner,
              taker: user1.publicKey,
              exchange: exchange.publicKey,
              exchangeHistory: exchangeHistory.publicKey,
              vault: vault,
              vaultTokenAccount: vaultUsdcTokenAccount,
              release,
              royaltyTokenAccount,
              systemProgram: anchor.web3.SystemProgram.programId,
              tokenProgram: TOKEN_PROGRAM_ID,
              rent: anchor.web3.SYSVAR_RENT_PUBKEY,
            },
            signers: [user1, exchangeHistory],
            instructions: [createExchangeHistoryIx],
          }
        );
      },
      (err) => {
        assert.equal(err.code, 6017)
        assert.equal(err.msg, "Initializer Amounts Do Not Match");
        return true;
      }
    );
  });

  it('Fails to Accept an existing buy exchange if expectedAmount wrong', async () => {
    const releaseBefore = await nina.account.release.fetch(release);

    const params = {
      expectedAmount: new anchor.BN(5),
      initializerAmount: new anchor.BN(initializerAmount),
      resalePercentage: releaseBefore.resalePercentage,
      datetime: new anchor.BN(Date.now() / 1000),
    };
    const exchangeHistory = anchor.web3.Keypair.generate();
    const createExchangeHistoryIx = await nina.account.exchangeHistory.createInstruction(exchangeHistory)

    await assert.rejects(
      async () => {
        await nina.rpc.exchangeAccept(
          params, {
            accounts: {
              initializer: provider.wallet.publicKey,
              initializerExpectedTokenAccount: authorityReleaseTokenAccount,
              takerExpectedTokenAccount: user1UsdcTokenAccount,
              takerSendingTokenAccount: receiverReleaseTokenAccount,
              exchangeEscrowTokenAccount,
              exchangeSigner,
              taker: user1.publicKey,
              exchange: exchange.publicKey,
              exchangeHistory: exchangeHistory.publicKey,
              vault: vault,
              vaultTokenAccount: vaultUsdcTokenAccount,
              release,
              royaltyTokenAccount,
              systemProgram: anchor.web3.SystemProgram.programId,
              tokenProgram: TOKEN_PROGRAM_ID,
              rent: anchor.web3.SYSVAR_RENT_PUBKEY,
            },
            signers: [user1, exchangeHistory],
            instructions: [createExchangeHistoryIx],
          }
        );
      },
      (err) => {
        assert.equal(err.code, 6014)
        assert.equal(err.msg, "Exchange Expected Amounts Do Not Match");
        return true;
      }
    );
  });


  it('Accepts an existing buy exchange USDC', async () => {
    const user1UsdcTokenAccountBefore = await getTokenAccount(
      provider,
      user1UsdcTokenAccount,
    );
    const user1UsdcTokenAccountBeforeBalance = user1UsdcTokenAccountBefore.amount.toNumber();

    const receiverReleaseTokenAccountBefore = await getTokenAccount(
      provider,
      receiverReleaseTokenAccount,
    );
    const receiverReleaseTokenAccountBeforeBalance = receiverReleaseTokenAccountBefore.amount.toNumber();

    const authorityReleaseTokenAccountBefore = await getTokenAccount(
      provider,
      authorityReleaseTokenAccount,
    );
    const authorityReleaseTokenAccountBeforeBalance = authorityReleaseTokenAccountBefore.amount.toNumber();

    const royaltyTokenAccountBefore = await getTokenAccount(
      provider,
      royaltyTokenAccount,
    );
    const royaltyTokenAccountBeforeBalance = royaltyTokenAccountBefore.amount.toNumber();

    const vaultUsdcTokenAccountBefore = await getTokenAccount(
      provider,
      vaultUsdcTokenAccount,
    );
    const vaultUsdcTokenAccountBeforeBalance = vaultUsdcTokenAccountBefore.amount.toNumber();

    const releaseBefore = await nina.account.release.fetch(release);

    const params = {
      expectedAmount: new anchor.BN(1),
      initializerAmount: new anchor.BN(initializerAmount),
      resalePercentage: releaseBefore.resalePercentage,
      datetime: new anchor.BN(Date.now() / 1000),
    };

    const exchangeHistory = anchor.web3.Keypair.generate();
    const createExchangeHistoryIx = await nina.account.exchangeHistory.createInstruction(exchangeHistory)

    await nina.rpc.exchangeAccept(
      params, {
        accounts: {
          initializer: provider.wallet.publicKey,
          initializerExpectedTokenAccount: authorityReleaseTokenAccount,
          takerExpectedTokenAccount: user1UsdcTokenAccount,
          takerSendingTokenAccount: receiverReleaseTokenAccount,
          exchangeEscrowTokenAccount,
          exchangeSigner,
          taker: user1.publicKey,
          exchange: exchange.publicKey,
          exchangeHistory: exchangeHistory.publicKey,
          vault: vault,
          vaultTokenAccount: vaultUsdcTokenAccount,
          release,
          royaltyTokenAccount,
          systemProgram: anchor.web3.SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        },
        signers: [user1, exchangeHistory],
        instructions: [createExchangeHistoryIx],
      }
    );

    const user1UsdcTokenAccountAfter = await getTokenAccount(
      provider,
      user1UsdcTokenAccount,
    );
    const user1UsdcTokenAccountAfterBalance = user1UsdcTokenAccountAfter.amount.toNumber();

    const receiverReleaseTokenAccountAfter = await getTokenAccount(
      provider,
      receiverReleaseTokenAccount,
    );
    const receiverReleaseTokenAccountAfterBalance = receiverReleaseTokenAccountAfter.amount.toNumber();

    const authorityReleaseTokenAccountAfter = await getTokenAccount(
      provider,
      authorityReleaseTokenAccount,
    );
    const authorityReleaseTokenAccountAfterBalance = authorityReleaseTokenAccountAfter.amount.toNumber();

    const royaltyTokenAccountAfter = await getTokenAccount(
      provider,
      royaltyTokenAccount,
    );
    const royaltyTokenAccountAfterBalance = royaltyTokenAccountAfter.amount.toNumber();

    const vaultUsdcTokenAccountAfter = await getTokenAccount(
      provider,
      vaultUsdcTokenAccount,
    );
    const vaultUsdcTokenAccountAfterBalance = vaultUsdcTokenAccountAfter.amount.toNumber();

    const expectedVaultFee = 62500
    const expectedRoyaltyFee = 1000000

    assert.ok(user1UsdcTokenAccountAfterBalance === user1UsdcTokenAccountBeforeBalance + initializerAmount - expectedVaultFee - expectedRoyaltyFee)
    assert.ok(authorityReleaseTokenAccountAfterBalance === authorityReleaseTokenAccountBeforeBalance + 1);
    assert.ok(royaltyTokenAccountAfterBalance === royaltyTokenAccountBeforeBalance + expectedRoyaltyFee);
    assert.ok(vaultUsdcTokenAccountAfterBalance === vaultUsdcTokenAccountBeforeBalance + expectedVaultFee);

    const releaseAfter = await nina.account.release.fetch(release);
    assert.ok(releaseAfter.exchangeSaleCounter.toNumber() === releaseBefore.exchangeSaleCounter.toNumber() + 1);
    assert.ok(releaseAfter.exchangeSaleTotal.toNumber() === releaseBefore.exchangeSaleTotal.toNumber() + expectedRoyaltyFee);
    assert.ok(releaseAfter.totalCollected.toNumber() === releaseBefore.totalCollected.toNumber() + expectedRoyaltyFee);
    assert.ok(releaseAfter.royaltyRecipients[0].owed.toNumber() === (expectedRoyaltyFee * releaseAfter.royaltyRecipients[0].percentShare.toNumber()) / 1000000);
    assert.ok(releaseAfter.royaltyRecipients[1].owed.toNumber() === (expectedRoyaltyFee * releaseAfter.royaltyRecipients[1].percentShare.toNumber()) / 1000000);
 
    const exchangeHistoryAfter = await nina.account.exchangeHistory.fetch(exchangeHistory.publicKey);
    assert.ok(exchangeHistoryAfter.release.toBase58() === release.toBase58());
    assert.ok(exchangeHistoryAfter.seller.toBase58() === user1.publicKey.toBase58());
    assert.ok(exchangeHistoryAfter.buyer.toBase58() === provider.wallet.publicKey.toBase58());
    assert.ok(exchangeHistoryAfter.price.toNumber() === params.initializerAmount.toNumber());
   
    await assert.rejects(
      async () => {
        await nina.account.exchange.fetch(exchange.publicKey);
      },
      (err) => {
        assert.ok(err.toString().includes("Account does not exist"));
        return true;
      }
    );
  });

  it("Initializes a sell exchange USDC", async () => {
    exchange = anchor.web3.Keypair.generate();
    
    const authorityReleaseTokenAccountBefore = await getTokenAccount(
      provider,
      authorityReleaseTokenAccount,
    );
    const authorityReleaseTokenAccountBeforeBalance = authorityReleaseTokenAccountBefore.amount.toNumber();

    const [_exchangeSigner, bump] = await anchor.web3.PublicKey.findProgramAddress(
      [exchange.publicKey.toBuffer()],
      nina.programId
    );
    exchangeSigner = _exchangeSigner;

    let [_exchangeEscrowTokenAccount, exchangeEscrowTokenAccountIx] = await findOrCreateAssociatedTokenAccount(
      provider,
      exchangeSigner,
      anchor.web3.SystemProgram.programId,
      anchor.web3.SYSVAR_RENT_PUBKEY,
      releaseMint.publicKey,
    );
    exchangeEscrowTokenAccount = _exchangeEscrowTokenAccount

    const config = {
      expectedAmount: new anchor.BN(expectedAmountExchangeSellOffer),
      initializerAmount: new anchor.BN(1),
      isSelling: true,
    }

    await nina.rpc.exchangeInit(
      config,
      bump, {
        accounts: {
          initializer: provider.wallet.publicKey,
          releaseMint: releaseMint.publicKey,
          initializerExpectedTokenAccount: usdcTokenAccount,
          initializerSendingTokenAccount: authorityReleaseTokenAccount,
          initializerExpectedMint: usdcMint,
          initializerSendingMint: releaseMint.publicKey,
          exchangeEscrowTokenAccount,
          exchangeSigner,
          exchange: exchange.publicKey,
          release,
          systemProgram: anchor.web3.SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        },
        signers:[exchange],
        instructions: [
          await nina.account.exchange.createInstruction(exchange),
          exchangeEscrowTokenAccountIx,
        ],
      }
    )

    const authorityReleaseTokenAccountAfter = await getTokenAccount(
      provider,
      authorityReleaseTokenAccount,
    );
    const authorityReleaseTokenAccountAfterBalance = authorityReleaseTokenAccountAfter.amount.toNumber();
    assert.ok(authorityReleaseTokenAccountAfterBalance === authorityReleaseTokenAccountBeforeBalance - 1);

    const exchangeAfter = await nina.account.exchange.fetch(exchange.publicKey);
    assert.ok(exchangeAfter.expectedAmount.toNumber() === expectedAmountExchangeSellOffer);
    const exchangeAccountEscrowTokenAccount = await getTokenAccount(
      provider,
      exchangeAfter.exchangeEscrowTokenAccount,
    );
    assert.ok(exchangeAccountEscrowTokenAccount.amount.toNumber() === 1);
  });

  it('Accepts an existing sell exchange USDC', async () => {
    const usdcTokenAccountBefore = await getTokenAccount(
      provider,
      usdcTokenAccount,
    );
    const usdcTokenAccountBeforeBalance = usdcTokenAccountBefore.amount.toNumber();

    const user1UsdcTokenAccountBefore = await getTokenAccount(
      provider,
      user1UsdcTokenAccount,
    );
    const user1UsdcTokenAccountBeforeBalance = user1UsdcTokenAccountBefore.amount.toNumber();

    const receiverReleaseTokenAccountBefore = await getTokenAccount(
      provider,
      receiverReleaseTokenAccount,
    );
    const receiverReleaseTokenAccountBeforeBalance = receiverReleaseTokenAccountBefore.amount.toNumber();

    const royaltyTokenAccountBefore = await getTokenAccount(
      provider,
      royaltyTokenAccount,
    );
    const royaltyTokenAccountBeforeBalance = royaltyTokenAccountBefore.amount.toNumber();

    const vaultUsdcTokenAccountBefore = await getTokenAccount(
      provider,
      vaultUsdcTokenAccount,
    );
    const vaultUsdcTokenAccountBeforeBalance = vaultUsdcTokenAccountBefore.amount.toNumber();

    const releaseBefore = await nina.account.release.fetch(release);

    const params = {
      expectedAmount: new anchor.BN(initializerAmount),
      initializerAmount: new anchor.BN(1),
      resalePercentage: releaseBefore.resalePercentage,
      datetime: new anchor.BN(Date.now() / 1000),
    };

    const exchangeHistory = anchor.web3.Keypair.generate();
    const createExchangeHistoryIx = await nina.account.exchangeHistory.createInstruction(exchangeHistory)

    await nina.rpc.exchangeAccept(
      params, {
        accounts: {
          initializer: provider.wallet.publicKey,
          initializerExpectedTokenAccount: usdcTokenAccount,
          takerExpectedTokenAccount: receiverReleaseTokenAccount,
          takerSendingTokenAccount: user1UsdcTokenAccount,
          exchangeEscrowTokenAccount,
          exchangeSigner,
          taker: user1.publicKey,
          exchange: exchange.publicKey,
          exchangeHistory: exchangeHistory.publicKey,
          vault,
          vaultTokenAccount: vaultUsdcTokenAccount,
          release,
          royaltyTokenAccount,
          systemProgram: anchor.web3.SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        },
        signers: [user1, exchangeHistory],
        instructions: [createExchangeHistoryIx],
      }
    );

    const usdcTokenAccountAfter = await getTokenAccount(
      provider,
      usdcTokenAccount,
    );
    const usdcTokenAccountAfterBalance = usdcTokenAccountAfter.amount.toNumber();

    const user1UsdcTokenAccountAfter = await getTokenAccount(
      provider,
      user1UsdcTokenAccount,
    );
    const user1UsdcTokenAccountAfterBalance = user1UsdcTokenAccountAfter.amount.toNumber();

    const receiverReleaseTokenAccountAfter = await getTokenAccount(
      provider,
      receiverReleaseTokenAccount,
    );
    const receiverReleaseTokenAccountAfterBalance = receiverReleaseTokenAccountAfter.amount.toNumber();

    const royaltyTokenAccountAfter = await getTokenAccount(
      provider,
      royaltyTokenAccount,
    );
    const royaltyTokenAccountAfterBalance = royaltyTokenAccountAfter.amount.toNumber();

    const vaultUsdcTokenAccountAfter = await getTokenAccount(
      provider,
      vaultUsdcTokenAccount,
    );
    const vaultUsdcTokenAccountAfterBalance = vaultUsdcTokenAccountAfter.amount.toNumber();

    const expectedVaultFee = 62500
    const expectedRoyaltyFee = 1000000

    assert.ok(usdcTokenAccountAfterBalance === usdcTokenAccountBeforeBalance + initializerAmount - expectedVaultFee - expectedRoyaltyFee)
    assert.ok(user1UsdcTokenAccountAfterBalance === user1UsdcTokenAccountBeforeBalance - initializerAmount);
    assert.ok(receiverReleaseTokenAccountAfterBalance === receiverReleaseTokenAccountBeforeBalance + 1);
    assert.ok(royaltyTokenAccountAfterBalance === royaltyTokenAccountBeforeBalance + expectedRoyaltyFee);
    assert.ok(vaultUsdcTokenAccountAfterBalance === vaultUsdcTokenAccountBeforeBalance + expectedVaultFee);

    const releaseAfter = await nina.account.release.fetch(release);
    assert.ok(releaseAfter.exchangeSaleCounter.toNumber() === releaseBefore.exchangeSaleCounter.toNumber() + 1);
    assert.ok(releaseAfter.exchangeSaleTotal.toNumber() === releaseBefore.exchangeSaleTotal.toNumber() + expectedRoyaltyFee);
    assert.ok(releaseAfter.totalCollected.toNumber() === releaseBefore.totalCollected.toNumber() + expectedRoyaltyFee);
    assert.ok(releaseAfter.royaltyRecipients[0].owed.toNumber() === releaseBefore.royaltyRecipients[0].owed.toNumber() + (expectedRoyaltyFee * releaseAfter.royaltyRecipients[0].percentShare.toNumber()) / 1000000);
    assert.ok(releaseAfter.royaltyRecipients[1].owed.toNumber() === releaseBefore.royaltyRecipients[1].owed.toNumber() + (expectedRoyaltyFee * releaseAfter.royaltyRecipients[1].percentShare.toNumber()) / 1000000);
 
    const exchangeHistoryAfter = await nina.account.exchangeHistory.fetch(exchangeHistory.publicKey);
    assert.ok(exchangeHistoryAfter.release.toBase58() === release.toBase58());
    assert.ok(exchangeHistoryAfter.seller.toBase58() === provider.wallet.publicKey.toBase58());
    assert.ok(exchangeHistoryAfter.buyer.toBase58() === user1.publicKey.toBase58());
    assert.ok(exchangeHistoryAfter.price.toNumber() === params.expectedAmount.toNumber());
   
    await assert.rejects(
      async () => {
        await nina.account.exchange.fetch(exchange.publicKey);
      },
      (err) => {
        assert.ok(err.toString().includes("Account does not exist"));
        return true;
      }
    );
  });

  it("Initializes a buy exchange wSOL", async () => {
    const solBeforeBalance = await provider.connection.getBalance(provider.wallet.publicKey);

    exchange = anchor.web3.Keypair.generate();

    const [_exchangeSigner, bump] = await anchor.web3.PublicKey.findProgramAddress(
      [exchange.publicKey.toBuffer()],
      nina.programId
    );
    exchangeSigner = _exchangeSigner;

    let [_exchangeEscrowTokenAccount, exchangeEscrowTokenAccountIx] = await findOrCreateAssociatedTokenAccount(
      provider,
      exchangeSigner,
      anchor.web3.SystemProgram.programId,
      anchor.web3.SYSVAR_RENT_PUBKEY,
      wrappedSolMint,
    );
    exchangeEscrowTokenAccount = _exchangeEscrowTokenAccount;

    let [_authorityReleaseTokenAccount, authorityReleaseTokenAccountIx] = await findOrCreateAssociatedTokenAccount(
      provider,
      provider.wallet.publicKey,
      anchor.web3.SystemProgram.programId,
      anchor.web3.SYSVAR_RENT_PUBKEY,
      releaseMint2.publicKey,
      false,
      true,
    );
    authorityReleaseTokenAccount2 = _authorityReleaseTokenAccount;

    const config = {
      expectedAmount: new anchor.BN(1),
      initializerAmount: new anchor.BN(initializerAmount),
      isSelling: false,
    };

    const {instructions, signers} = await wrapSol(
      provider,
      provider.wallet,
      new anchor.BN(initializerAmount),
    );

    const tx = await nina.rpc.exchangeInit(
      config,
      bump, {
        accounts: {
          initializer: provider.wallet.publicKey,
          releaseMint: releaseMint2.publicKey,
          initializerExpectedTokenAccount: authorityReleaseTokenAccount2,
          initializerSendingTokenAccount: signers[0].publicKey,
          initializerExpectedMint: releaseMint2.publicKey,
          initializerSendingMint: wrappedSolMint,
          exchangeEscrowTokenAccount,
          exchangeSigner,
          exchange: exchange.publicKey,
          release: release2,
          systemProgram: anchor.web3.SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        },
        signers:[exchange, ...signers],
        instructions: [
          authorityReleaseTokenAccountIx,
          await nina.account.exchange.createInstruction(exchange),
          exchangeEscrowTokenAccountIx,
          ...instructions,
        ],
      }
    )

    const exchangeAfter = await nina.account.exchange.fetch(exchange.publicKey);
    const exchangeAccountEscrowTokenAccount = await getTokenAccount(
      provider,
      exchangeAfter.exchangeEscrowTokenAccount,
    );
    assert.ok(exchangeAccountEscrowTokenAccount.amount.toNumber() === config.initializerAmount.toNumber());
  });

  it('Cancels an existing exchange wSOL', async () => {
    const solBeforeBalance = await provider.connection.getBalance(provider.wallet.publicKey);
    
    const exchangeBefore = await nina.account.exchange.fetch(exchange.publicKey);
    const exchangeAccountEscrowTokenAccountBefore = await getTokenAccount(
      provider,
      exchangeBefore.exchangeEscrowTokenAccount,
    );

    await nina.rpc.exchangeCancelSol(
      new anchor.BN(initializerAmount), {
        accounts: {
          initializer: provider.wallet.publicKey,
          exchangeEscrowTokenAccount: exchangeEscrowTokenAccount,
          exchangeSigner,
          exchange: exchange.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
        },
      }
    );

    const solAfterBalance = await provider.connection.getBalance(provider.wallet.publicKey);
    assert.ok(solAfterBalance > solBeforeBalance + initializerAmount)

    await assert.rejects(
      async () => {
        await nina.account.exchange.fetch(exchange.publicKey);
      },
      (err) => {
        assert.ok(err.toString().includes("Account does not exist"));
        return true;
      }
    );
  });

  it("Initializes a second buy exchange wSOL", async () => {
    const solBeforeBalance = await provider.connection.getBalance(provider.wallet.publicKey);

    exchange = anchor.web3.Keypair.generate();

    const [_exchangeSigner, bump] = await anchor.web3.PublicKey.findProgramAddress(
      [exchange.publicKey.toBuffer()],
      nina.programId
    );
    exchangeSigner = _exchangeSigner;

    let [_exchangeEscrowTokenAccount, exchangeEscrowTokenAccountIx] = await findOrCreateAssociatedTokenAccount(
      provider,
      exchangeSigner,
      anchor.web3.SystemProgram.programId,
      anchor.web3.SYSVAR_RENT_PUBKEY,
      wrappedSolMint,
    );
    exchangeEscrowTokenAccount = _exchangeEscrowTokenAccount;

    const config = {
      expectedAmount: new anchor.BN(1),
      initializerAmount: new anchor.BN(initializerAmount),
      isSelling: false,
    };

    const {instructions, signers} = await wrapSol(
      provider,
      provider.wallet,
      new anchor.BN(initializerAmount),
    );

    const tx = await nina.rpc.exchangeInit(
      config,
      bump, {
        accounts: {
          initializer: provider.wallet.publicKey,
          releaseMint: releaseMint2.publicKey,
          initializerExpectedTokenAccount: authorityReleaseTokenAccount2,
          initializerSendingTokenAccount: signers[0].publicKey,
          initializerExpectedMint: releaseMint2.publicKey,
          initializerSendingMint: wrappedSolMint,
          exchangeEscrowTokenAccount,
          exchangeSigner,
          exchange: exchange.publicKey,
          release: release2,
          systemProgram: anchor.web3.SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        },
        signers:[exchange, ...signers],
        instructions: [
          await nina.account.exchange.createInstruction(exchange),
          exchangeEscrowTokenAccountIx,
          ...instructions,
        ],
      }
    )

    const exchangeAfter = await nina.account.exchange.fetch(exchange.publicKey);
    const exchangeAccountEscrowTokenAccount = await getTokenAccount(
      provider,
      exchangeAfter.exchangeEscrowTokenAccount,
    );
    assert.ok(exchangeAccountEscrowTokenAccount.amount.toNumber() === config.initializerAmount.toNumber());
  });

  it('Accepts an existing buy exchange wSOL', async () => {
    const solBeforeBalance = await provider.connection.getBalance(user1.publicKey);

    const receiverReleaseTokenAccount2Before = await getTokenAccount(
      provider,
      receiverReleaseTokenAccount2,
    );
    const receiverReleaseTokenAccount2BeforeBalance = receiverReleaseTokenAccount2Before.amount.toNumber();

    const authorityReleaseTokenAccount2Before = await getTokenAccount(
      provider,
      authorityReleaseTokenAccount2,
    );
    const authorityReleaseTokenAccount2BeforeBalance = authorityReleaseTokenAccount2Before.amount.toNumber();

    const royaltyTokenAccount2Before = await getTokenAccount(
      provider,
      royaltyTokenAccount2,
    );
    const royaltyTokenAccount2BeforeBalance = royaltyTokenAccount2Before.amount.toNumber();

    const vaultWrappedSolTokenAccountBefore = await getTokenAccount(
      provider,
      vaultWrappedSolTokenAccount,
    );
    const vaultWrappedSolTokenAccountBeforeBalance = vaultWrappedSolTokenAccountBefore.amount.toNumber();

    const releaseBefore = await nina.account.release.fetch(release2);

    const params = {
      expectedAmount: new anchor.BN(1),
      initializerAmount: new anchor.BN(initializerAmount),
      resalePercentage: releaseBefore.resalePercentage,
      datetime: new anchor.BN(Date.now() / 1000),
    };

    const exchangeHistory = anchor.web3.Keypair.generate();
    const createExchangeHistoryIx = await nina.account.exchangeHistory.createInstruction(exchangeHistory);

    await nina.rpc.exchangeAccept(
      params, {
        accounts: {
          initializer: provider.wallet.publicKey,
          initializerExpectedTokenAccount: authorityReleaseTokenAccount2,
          takerExpectedTokenAccount: user1WrappedSolTokenAccount,
          takerSendingTokenAccount: receiverReleaseTokenAccount2,
          exchangeEscrowTokenAccount,
          exchangeSigner,
          taker: user1.publicKey,
          exchange: exchange.publicKey,
          exchangeHistory: exchangeHistory.publicKey,
          vault,
          vaultTokenAccount: vaultWrappedSolTokenAccount,
          release: release2,
          royaltyTokenAccount: royaltyTokenAccount2,
          systemProgram: anchor.web3.SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        },
        signers: [user1, exchangeHistory],
        instructions: [createExchangeHistoryIx],
      }
    );

    const solAfterBalance = await provider.connection.getBalance(user1.publicKey);

    const receiverReleaseTokenAccount2After = await getTokenAccount(
      provider,
      receiverReleaseTokenAccount2,
    );
    const receiverReleaseTokenAccount2AfterBalance = receiverReleaseTokenAccount2After.amount.toNumber();

    const authorityReleaseTokenAccount2After = await getTokenAccount(
      provider,
      authorityReleaseTokenAccount2,
    );
    const authorityReleaseTokenAccount2AfterBalance = authorityReleaseTokenAccount2After.amount.toNumber();

    const royaltyTokenAccount2After = await getTokenAccount(
      provider,
      royaltyTokenAccount2,
    );
    const royaltyTokenAccount2AfterBalance = royaltyTokenAccount2After.amount.toNumber();

    const vaultWrappedSolTokenAccountAfter = await getTokenAccount(
      provider,
      vaultWrappedSolTokenAccount,
    );
    const vaultWrappedSolTokenAccountAfterBalance = vaultWrappedSolTokenAccountAfter.amount.toNumber();

    const expectedVaultFee = 62500
    const expectedRoyaltyFee = 1000000

    assert.ok(solAfterBalance === solBeforeBalance + initializerAmount - expectedVaultFee - expectedRoyaltyFee);
    assert.ok(authorityReleaseTokenAccount2AfterBalance === authorityReleaseTokenAccount2BeforeBalance + 1);
    assert.ok(royaltyTokenAccount2AfterBalance === royaltyTokenAccount2BeforeBalance + expectedRoyaltyFee);
    assert.ok(vaultWrappedSolTokenAccountAfterBalance === vaultWrappedSolTokenAccountBeforeBalance + expectedVaultFee);

    const releaseAfter = await nina.account.release.fetch(release2);
    assert.ok(releaseAfter.exchangeSaleCounter.toNumber() === releaseBefore.exchangeSaleCounter.toNumber() + 1);
    assert.ok(releaseAfter.exchangeSaleTotal.toNumber() === releaseBefore.exchangeSaleTotal.toNumber() + expectedRoyaltyFee);
    assert.ok(releaseAfter.totalCollected.toNumber() === releaseBefore.totalCollected.toNumber() + expectedRoyaltyFee);
    assert.ok(releaseAfter.royaltyRecipients[0].owed.toNumber() === releaseBefore.royaltyRecipients[0].owed.toNumber() + (expectedRoyaltyFee * releaseAfter.royaltyRecipients[0].percentShare.toNumber()) / 1000000);
     assert.ok(releaseAfter.royaltyRecipients[1].owed.toNumber() === releaseBefore.royaltyRecipients[1].owed.toNumber() + (expectedRoyaltyFee * releaseAfter.royaltyRecipients[1].percentShare.toNumber()) / 1000000);

    const exchangeHistoryAfter = await nina.account.exchangeHistory.fetch(exchangeHistory.publicKey);
    assert.ok(exchangeHistoryAfter.release.toBase58() === release2.toBase58());
    assert.ok(exchangeHistoryAfter.seller.toBase58() === user1.publicKey.toBase58());
    assert.ok(exchangeHistoryAfter.buyer.toBase58() === provider.wallet.publicKey.toBase58());
    assert.ok(exchangeHistoryAfter.price.toNumber() === params.initializerAmount.toNumber());
   
    await assert.rejects(
      async () => {
        await nina.account.exchange.fetch(exchange.publicKey);
      },
      (err) => {
        assert.ok(err.toString().includes("Account does not exist"));
        return true;
      }
    );
  });

  it("Initializes a sell exchange wSOL", async () => {
    exchange = anchor.web3.Keypair.generate();
    
    const authorityReleaseTokenAccount2Before = await getTokenAccount(
      provider,
      authorityReleaseTokenAccount2,
    );
    const authorityReleaseTokenAccount2BeforeBalance = authorityReleaseTokenAccount2Before.amount.toNumber();

    const [_exchangeSigner, bump] = await anchor.web3.PublicKey.findProgramAddress(
      [exchange.publicKey.toBuffer()],
      nina.programId
    );
    exchangeSigner = _exchangeSigner;

    let [_exchangeEscrowTokenAccount, exchangeEscrowTokenAccountIx] = await findOrCreateAssociatedTokenAccount(
      provider,
      exchangeSigner,
      anchor.web3.SystemProgram.programId,
      anchor.web3.SYSVAR_RENT_PUBKEY,
      releaseMint2.publicKey,
    );
    exchangeEscrowTokenAccount = _exchangeEscrowTokenAccount

    const config = {
      expectedAmount: new anchor.BN(expectedAmountExchangeSellOffer),
      initializerAmount: new anchor.BN(1),
      isSelling: true,
    }

    await nina.rpc.exchangeInit(
      config,
      bump, {
        accounts: {
          initializer: provider.wallet.publicKey,
          releaseMint: releaseMint2.publicKey,
          initializerExpectedTokenAccount: wrappedSolTokenAccount,
          initializerSendingTokenAccount: authorityReleaseTokenAccount2,
          initializerExpectedMint: wrappedSolMint,
          initializerSendingMint: releaseMint2.publicKey,
          exchangeEscrowTokenAccount,
          exchangeSigner,
          exchange: exchange.publicKey,
          release: release2,
          systemProgram: anchor.web3.SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        },
        signers:[exchange],
        instructions: [
          await nina.account.exchange.createInstruction(exchange),
          exchangeEscrowTokenAccountIx,
        ],
      }
    )

    const authorityReleaseTokenAccount2After = await getTokenAccount(
      provider,
      authorityReleaseTokenAccount2,
    );
    const authorityReleaseTokenAccount2AfterBalance = authorityReleaseTokenAccount2After.amount.toNumber();
    assert.ok(authorityReleaseTokenAccount2AfterBalance === authorityReleaseTokenAccount2BeforeBalance - 1);

    const exchangeAfter = await nina.account.exchange.fetch(exchange.publicKey);
    assert.ok(exchangeAfter.expectedAmount.toNumber() === expectedAmountExchangeSellOffer);
    const exchangeAccountEscrowTokenAccount = await getTokenAccount(
      provider,
      exchangeAfter.exchangeEscrowTokenAccount,
    );
    assert.ok(exchangeAccountEscrowTokenAccount.amount.toNumber() === 1);
  });

  it('Accepts an existing sell exchange wSOL', async () => {
    const solBeforeBalance = await provider.connection.getBalance(provider.wallet.publicKey);

    const user1SolBeforeBalance = await provider.connection.getBalance(user1.publicKey);

    const receiverReleaseTokenAccountBefore = await getTokenAccount(
      provider,
      receiverReleaseTokenAccount2,
    );
    const receiverReleaseTokenAccountBeforeBalance = receiverReleaseTokenAccountBefore.amount.toNumber();

    const royaltyTokenAccountBefore = await getTokenAccount(
      provider,
      royaltyTokenAccount2,
    );
    const royaltyTokenAccountBeforeBalance = royaltyTokenAccountBefore.amount.toNumber();

    const vaultWrappedSolTokenAccountBefore = await getTokenAccount(
      provider,
      vaultWrappedSolTokenAccount,
    );
    const vaultWrappedSolTokenAccountBeforeBalance = vaultWrappedSolTokenAccountBefore.amount.toNumber();

    const releaseBefore = await nina.account.release.fetch(release2);

    const params = {
      expectedAmount: new anchor.BN(initializerAmount),
      initializerAmount: new anchor.BN(1),
      resalePercentage: releaseBefore.resalePercentage,
      datetime: new anchor.BN(Date.now() / 1000),
    };

    const exchangeHistory = anchor.web3.Keypair.generate();
    const createExchangeHistoryIx = await nina.account.exchangeHistory.createInstruction(exchangeHistory)

    const {instructions, signers} = await wrapSol(
      provider,
      user1,
      new anchor.BN(initializerAmount),
    );

    await nina.rpc.exchangeAccept(
      params, {
        accounts: {
          initializer: provider.wallet.publicKey,
          initializerExpectedTokenAccount: wrappedSolTokenAccount,
          takerExpectedTokenAccount: receiverReleaseTokenAccount2,
          takerSendingTokenAccount: signers[0].publicKey,
          exchangeEscrowTokenAccount,
          exchangeSigner,
          taker: user1.publicKey,
          exchange: exchange.publicKey,
          exchangeHistory: exchangeHistory.publicKey,
          vault,
          vaultTokenAccount: vaultWrappedSolTokenAccount,
          release: release2,
          royaltyTokenAccount: royaltyTokenAccount2,
          systemProgram: anchor.web3.SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        },
        signers: [user1, exchangeHistory, ...signers],
        instructions: [
          ...instructions,
          createExchangeHistoryIx,
        ],
      }
    );

    const solAfterBalance = await provider.connection.getBalance(provider.wallet.publicKey);

    const user1SolAfterBalance = await provider.connection.getBalance(user1.publicKey);

    const receiverReleaseTokenAccountAfter = await getTokenAccount(
      provider,
      receiverReleaseTokenAccount2,
    );
    const receiverReleaseTokenAccountAfterBalance = receiverReleaseTokenAccountAfter.amount.toNumber();

    const royaltyTokenAccountAfter = await getTokenAccount(
      provider,
      royaltyTokenAccount2,
    );
    const royaltyTokenAccountAfterBalance = royaltyTokenAccountAfter.amount.toNumber();

    const vaultWrappedSolTokenAccountAfter = await getTokenAccount(
      provider,
      vaultWrappedSolTokenAccount,
    );
    const vaultWrappedSolTokenAccountAfterBalance = vaultWrappedSolTokenAccountAfter.amount.toNumber();

    const expectedVaultFee = 62500
    const expectedRoyaltyFee = 1000000

    assert.ok(solAfterBalance > solBeforeBalance + initializerAmount - expectedVaultFee - expectedRoyaltyFee)
    assert.ok(user1SolAfterBalance === user1SolBeforeBalance - initializerAmount);
    assert.ok(receiverReleaseTokenAccountAfterBalance === receiverReleaseTokenAccountBeforeBalance + 1);
    assert.ok(royaltyTokenAccountAfterBalance === royaltyTokenAccountBeforeBalance + expectedRoyaltyFee);
    assert.ok(vaultWrappedSolTokenAccountAfterBalance === vaultWrappedSolTokenAccountBeforeBalance + expectedVaultFee);

    const releaseAfter = await nina.account.release.fetch(release2);
    assert.ok(releaseAfter.exchangeSaleCounter.toNumber() === releaseBefore.exchangeSaleCounter.toNumber() + 1);
    assert.ok(releaseAfter.exchangeSaleTotal.toNumber() === releaseBefore.exchangeSaleTotal.toNumber() + expectedRoyaltyFee);
    assert.ok(releaseAfter.totalCollected.toNumber() === releaseBefore.totalCollected.toNumber() + expectedRoyaltyFee);
    assert.ok(releaseAfter.royaltyRecipients[0].owed.toNumber() === releaseBefore.royaltyRecipients[0].owed.toNumber() + (expectedRoyaltyFee * releaseAfter.royaltyRecipients[0].percentShare.toNumber()) / 1000000);
    assert.ok(releaseAfter.royaltyRecipients[1].owed.toNumber() === releaseBefore.royaltyRecipients[1].owed.toNumber() + (expectedRoyaltyFee * releaseAfter.royaltyRecipients[1].percentShare.toNumber()) / 1000000);
 
    const exchangeHistoryAfter = await nina.account.exchangeHistory.fetch(exchangeHistory.publicKey);
    assert.ok(exchangeHistoryAfter.release.toBase58() === release2.toBase58());
    assert.ok(exchangeHistoryAfter.seller.toBase58() === provider.wallet.publicKey.toBase58());
    assert.ok(exchangeHistoryAfter.buyer.toBase58() === user1.publicKey.toBase58());
    assert.ok(exchangeHistoryAfter.price.toNumber() === params.expectedAmount.toNumber());
   
    await assert.rejects(
      async () => {
        await nina.account.exchange.fetch(exchange.publicKey);
      },
      (err) => {
        assert.ok(err.toString().includes("Account does not exist"));
        return true;
      }
    );
  });

  it("Fails to Initialize exchange if wrong mint", async () => {
    exchange = anchor.web3.Keypair.generate();

    const [_exchangeSigner, bump] = await anchor.web3.PublicKey.findProgramAddress(
      [exchange.publicKey.toBuffer()],
      nina.programId
    );
    exchangeSigner = _exchangeSigner;

    let [_exchangeEscrowTokenAccount, exchangeEscrowTokenAccountIx] = await findOrCreateAssociatedTokenAccount(
      provider,
      exchangeSigner,
      anchor.web3.SystemProgram.programId,
      anchor.web3.SYSVAR_RENT_PUBKEY,
      wrappedSolMint,
    );
    exchangeEscrowTokenAccount = _exchangeEscrowTokenAccount

    const config = {
      expectedAmount: new anchor.BN(1),
      initializerAmount: new anchor.BN(initializerAmount),
      isSelling: false,
    }

    await assert.rejects(
      async () => {
        await nina.rpc.exchangeInit(
          config,
          bump, {
            accounts: {
              initializer: provider.wallet.publicKey,
              releaseMint: releaseMint.publicKey,
              initializerExpectedTokenAccount: authorityReleaseTokenAccount,
              initializerSendingTokenAccount: wrappedSolTokenAccount,
              initializerExpectedMint: releaseMint.publicKey,
              initializerSendingMint: wrappedSolMint,
              exchangeEscrowTokenAccount,
              exchangeSigner,
              exchange: exchange.publicKey,
              release,
              systemProgram: anchor.web3.SystemProgram.programId,
              tokenProgram: TOKEN_PROGRAM_ID,
              rent: anchor.web3.SYSVAR_RENT_PUBKEY,
            },
            signers:[exchange],
            instructions: [
              await nina.account.exchange.createInstruction(exchange),
              exchangeEscrowTokenAccountIx,
            ],
          }
        )
      },
      (err) => {
        assert.equal(err.code, 6012);
        assert.equal(err.msg, "Wrong mint provided for exchange");
        return true;
      }
    );
  });

  it("Fails to Initialize exchange if expected amount too low", async () => {
    exchange = anchor.web3.Keypair.generate();

    const [_exchangeSigner, bump] = await anchor.web3.PublicKey.findProgramAddress(
      [exchange.publicKey.toBuffer()],
      nina.programId
    );
    exchangeSigner = _exchangeSigner;

    let [_exchangeEscrowTokenAccount, exchangeEscrowTokenAccountIx] = await findOrCreateAssociatedTokenAccount(
      provider,
      exchangeSigner,
      anchor.web3.SystemProgram.programId,
      anchor.web3.SYSVAR_RENT_PUBKEY,
      wrappedSolMint,
    );
    exchangeEscrowTokenAccount = _exchangeEscrowTokenAccount

    const config = {
      expectedAmount: new anchor.BN(0),
      initializerAmount: new anchor.BN(initializerAmount),
      isSelling: false,
    }

    await assert.rejects(
      async () => {
        await nina.rpc.exchangeInit(
          config,
          bump, {
            accounts: {
              initializer: provider.wallet.publicKey,
              releaseMint: releaseMint.publicKey,
              initializerExpectedTokenAccount: authorityReleaseTokenAccount,
              initializerSendingTokenAccount: wrappedSolTokenAccount,
              initializerExpectedMint: releaseMint.publicKey,
              initializerSendingMint: wrappedSolMint,
              exchangeEscrowTokenAccount,
              exchangeSigner,
              exchange: exchange.publicKey,
              release,
              systemProgram: anchor.web3.SystemProgram.programId,
              tokenProgram: TOKEN_PROGRAM_ID,
              rent: anchor.web3.SYSVAR_RENT_PUBKEY,
            },
            signers:[exchange],
            instructions: [
              await nina.account.exchange.createInstruction(exchange),
              exchangeEscrowTokenAccountIx,
            ],
          }
        )
      },
      (err) => {
        assert.equal(err.code, 6013);
        assert.equal(err.msg, "Offer price must be greater than 0");
        return true;
      }
    );
  });

  it("Fails to Initialize exchange if initializerAmount too low", async () => {
    exchange = anchor.web3.Keypair.generate();

    const [_exchangeSigner, bump] = await anchor.web3.PublicKey.findProgramAddress(
      [exchange.publicKey.toBuffer()],
      nina.programId
    );
    exchangeSigner = _exchangeSigner;

    let [_exchangeEscrowTokenAccount, exchangeEscrowTokenAccountIx] = await findOrCreateAssociatedTokenAccount(
      provider,
      exchangeSigner,
      anchor.web3.SystemProgram.programId,
      anchor.web3.SYSVAR_RENT_PUBKEY,
      wrappedSolMint,
    );
    exchangeEscrowTokenAccount = _exchangeEscrowTokenAccount

    const config = {
      expectedAmount: new anchor.BN(1),
      initializerAmount: new anchor.BN(0),
      isSelling: false,
    }

    await assert.rejects(
      async () => {
        await nina.rpc.exchangeInit(
          config,
          bump, {
            accounts: {
              initializer: provider.wallet.publicKey,
              releaseMint: releaseMint.publicKey,
              initializerExpectedTokenAccount: authorityReleaseTokenAccount,
              initializerSendingTokenAccount: wrappedSolTokenAccount,
              initializerExpectedMint: releaseMint.publicKey,
              initializerSendingMint: wrappedSolMint,
              exchangeEscrowTokenAccount,
              exchangeSigner,
              exchange: exchange.publicKey,
              release,
              systemProgram: anchor.web3.SystemProgram.programId,
              tokenProgram: TOKEN_PROGRAM_ID,
              rent: anchor.web3.SYSVAR_RENT_PUBKEY,
            },
            signers:[exchange],
            instructions: [
              await nina.account.exchange.createInstruction(exchange),
              exchangeEscrowTokenAccountIx,
            ],
          }
        )
      },
      (err) => {
        assert.equal(err.code, 6013);
        assert.equal(err.msg, "Offer price must be greater than 0");
        return true;
      }
    );
  });
});

describe('Redeemable', async () => {
  let redeemable = null;
  let redeemableSigner = null;
  let redeemableNonce = null;
  let redeemedMint = null;
  let publisherEncryptionPublicKey = null
  let publisherKeys = null;

  it('Initializes a redeemable', async () => {
    [publisherEncryptionPublicKey, publisherKeys] = await encrypt.exportPublicKey();
    const encryptionPublicKeyBuffer = new Buffer.from(publisherEncryptionPublicKey)
    const description = "1x LP album"
    redeemedMint = anchor.web3.Keypair.generate();

    const [_redeemable, redeemableBump] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from(anchor.utils.bytes.utf8.encode("nina-redeemable")), release.toBuffer(), redeemedMint.publicKey.toBuffer()],
      nina.programId
    );    
    redeemable = _redeemable
    const [_redeemableSigner, redeemableSignerBump] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from(anchor.utils.bytes.utf8.encode("nina-redeemable-signer")), redeemable.toBuffer()],
      nina.programId
    );    
    redeemableSigner = _redeemableSigner;

    const redeemedMintIx = await createMintInstructions(
      provider,
      provider.wallet.publicKey,
      redeemedMint.publicKey,
      0,
    );

    const bumps = {
      redeemable: redeemableBump,
      signer: redeemableSignerBump,
    };

    const config = {
      encryptionPublicKey: encryptionPublicKeyBuffer,
      description,
      redeemedMax: new anchor.BN(3),
    };

    await nina.rpc.redeemableInit(
      config,
      bumps, {
        accounts: {
          authority: provider.wallet.publicKey,
          release,
          redeemable,
          redeemableSigner,
          redeemableMint: releaseMint.publicKey,
          redeemedMint: redeemedMint.publicKey,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          systemProgram: anchor.web3.SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
        },
        signers: [redeemedMint],
        instructions: [
          ...redeemedMintIx,
        ]
      }
    )

    const redeemableAfter = await nina.account.redeemable.fetch(redeemable);
    let encryptionPublicKeyAfter = Buffer.from(redeemableAfter.encryptionPublicKey);
    encryptionPublicKeyAfter = encryptionPublicKeyAfter.buffer.slice(
      encryptionPublicKeyAfter.byteOffset,
      encryptionPublicKeyAfter.byteOffset + encryptionPublicKeyAfter.byteLength
    );
    assert.ok(redeemableAfter.redeemedCount.toNumber() === 0)
    assert.ok(redeemableAfter.redeemedMax.toNumber() === 3)
    assert.ok(encrypt.decode(redeemableAfter.description) === description)
    assert.deepEqual(encryptionPublicKeyAfter, publisherEncryptionPublicKey)
  });

  const redemptionRecord = anchor.web3.Keypair.generate();
  let redeemerEncryptionPublicKey = null;
  let redeemerKeys = null;
  let iv = null;
  
  it('Redeems a redeemable', async () => {
    [redeemerEncryptionPublicKey, redeemerKeys] = await encrypt.exportPublicKey();
    const redeemerEncryptionPublicKeyBuffer = new Buffer.from(redeemerEncryptionPublicKey)

    let [redeemedTokenAccount, redeemedTokenAccountIx] = await findOrCreateAssociatedTokenAccount(
      provider,
      user1.publicKey,
      anchor.web3.SystemProgram.programId,
      anchor.web3.SYSVAR_RENT_PUBKEY,
      redeemedMint.publicKey,
    );

    const redemptionRecordIx = await nina.account.redemptionRecord.createInstruction(redemptionRecord);
    
    const addressObject = {
      name: 'John Smith',
      addressLine1: '123 Main St',
      addressLine2: "Apt 1",
      city: "New York",
      state: "NY",
      postalCode: "10002",
      country: "USA",
    }

    const addressString = Object.values(addressObject).join(",")

    const [encryptedData, _iv] = await encrypt.encryptData(addressString, publisherEncryptionPublicKey, redeemerKeys, 272)
    iv = _iv;
    await nina.rpc.redeemableRedeem(
      redeemerEncryptionPublicKeyBuffer,
      encryptedData,
      iv, {
        accounts: {
          redeemer: user1.publicKey,
          redeemableMint: releaseMint.publicKey,
          redeemedMint: redeemedMint.publicKey,
          redeemable,
          redeemableSigner,
          release,
          redemptionRecord: redemptionRecord.publicKey,
          redeemerRedeemableTokenAccount: receiverReleaseTokenAccount,
          redeemerRedeemedTokenAccount: redeemedTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          systemProgram: anchor.web3.SystemProgram.programId,
        },
        signers: [user1, redemptionRecord],
        instructions: [
          redeemedTokenAccountIx,
          redemptionRecordIx,
        ],
      }
    );

    const redeemableAfter = await nina.account.redeemable.fetch(redeemable);
    assert.ok(redeemableAfter.redeemedCount.toNumber() === 1);

    const redemptionRecordAfter = await nina.account.redemptionRecord.fetch(redemptionRecord.publicKey);
    let encryptionPublicKeyAfter = Buffer.from(redemptionRecordAfter.encryptionPublicKey);
    encryptionPublicKeyAfter = encryptionPublicKeyAfter.buffer.slice(
      encryptionPublicKeyAfter.byteOffset,
      encryptionPublicKeyAfter.byteOffset + encryptionPublicKeyAfter.byteLength
    )
    assert.deepEqual(encryptionPublicKeyAfter, redeemerEncryptionPublicKey)

    const address = await encrypt.decryptData(redemptionRecordAfter.address, redeemerEncryptionPublicKey, iv, publisherKeys);
    assert.ok(address === addressString);

    const receiverReleaseTokenAccountAfter = await getTokenAccount(
      provider,
      receiverReleaseTokenAccount,
    );
    assert.ok(receiverReleaseTokenAccountAfter.amount.toNumber() === 0);

    const redeemedTokenAccountAfter = await getTokenAccount(
      provider,
      redeemedTokenAccount,
    );
    assert.ok(redeemedTokenAccountAfter.amount.toNumber() === 1);
  });

  it('Should let Redeemable Authority update tracking information for redemption record', async () => {
    const shipper = "USPS";
    const trackingNumber = "12345678900987654567890";

    const [encryptedShipper] = await encrypt.encryptData(shipper, redeemerEncryptionPublicKey, publisherKeys, 32, iv)
    const [encryptedTrackingNumber] = await encrypt.encryptData(trackingNumber, redeemerEncryptionPublicKey, publisherKeys, 64, iv)

    await nina.rpc.redeemableShippingUpdate(
      encryptedShipper,
      encryptedTrackingNumber, {
        accounts: {
          authority: provider.wallet.publicKey,
          redeemable: redeemable,
          redemptionRecord: redemptionRecord.publicKey,
        }
      }
    );

    const redemptionRecordLookup = await nina.account.redemptionRecord.fetch(redemptionRecord.publicKey);
    const decryptedShipper = await encrypt.decryptData(redemptionRecordLookup.shipper, publisherEncryptionPublicKey, iv, redeemerKeys)
    const decryptedTrackingNumber = await encrypt.decryptData(redemptionRecordLookup.trackingNumber, publisherEncryptionPublicKey, iv, redeemerKeys)
    assert.ok(decryptedShipper === shipper);
    assert.ok(decryptedTrackingNumber === trackingNumber);
  });

it('Fails when redeeming more redeemables than available', async () => {
    [redeemerEncryptionPublicKey, redeemerKeys] = await encrypt.exportPublicKey();
    const redeemerEncryptionPublicKeyBuffer = new Buffer.from(redeemerEncryptionPublicKey)

    let [redeemedTokenAccount, redeemedTokenAccountIx] = await findOrCreateAssociatedTokenAccount(
      provider,
      user1.publicKey,
      anchor.web3.SystemProgram.programId,
      anchor.web3.SYSVAR_RENT_PUBKEY,
      redeemedMint.publicKey,
    );
    
    const addressObject = {
      name: 'John Smith',
      addressLine1: '123 Main St',
      addressLine2: "Apt 1",
      city: "New York",
      state: "NY",
      postalCode: "10002",
      country: "USA",
    }

    const addressString = Object.values(addressObject).join(",")

    const [encryptedData, _iv] = await encrypt.encryptData(addressString, publisherEncryptionPublicKey, redeemerKeys, 272)
    iv = _iv;

    const createGenerator = function*() {
      let i = 0;
      while(i < 5) {
        yield await Promise.resolve(i++);
      }
    }
    const generator = createGenerator();

    await assert.rejects(
      async () => {
        for await (let item of generator) {
          await nina.rpc.releasePurchase(
            new anchor.BN(releasePrice), {
              accounts: {
                release,
                releaseSigner,
                payer: user1.publicKey,
                payerTokenAccount: user1UsdcTokenAccount,
                receiver: user1.publicKey,
                receiverReleaseTokenAccount: receiverReleaseTokenAccount,
                royaltyTokenAccount,
                releaseMint: releaseMint.publicKey,
                tokenProgram: TOKEN_PROGRAM_ID,
                clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
              },
              signers: [user1],
            }
          );

          const redemptionRecord = anchor.web3.Keypair.generate();
          const redemptionRecordIx = await nina.account.redemptionRecord.createInstruction(redemptionRecord);
          await nina.rpc.redeemableRedeem(
            redeemerEncryptionPublicKeyBuffer,
            encryptedData,
            iv, {
              accounts: {
                redeemer: user1.publicKey,
                redeemableMint: releaseMint.publicKey,
                redeemedMint: redeemedMint.publicKey,
                redeemable,
                redeemableSigner,
                release,
                redemptionRecord: redemptionRecord.publicKey,
                redeemerRedeemableTokenAccount: receiverReleaseTokenAccount,
                redeemerRedeemedTokenAccount: redeemedTokenAccount,
                tokenProgram: TOKEN_PROGRAM_ID,
                rent: anchor.web3.SYSVAR_RENT_PUBKEY,
                systemProgram: anchor.web3.SystemProgram.programId,
              },
              signers: [user1, redemptionRecord],
              instructions: [
                redemptionRecordIx,
              ],
            }
          );
        }
      },
      (err) => {
        assert.equal(err.code, 6010);
        assert.equal(err.msg, "No more redeemables available");
        return true;
      }
    );
  });

  it('Updates a redeemable', async () => {
    [publisherEncryptionPublicKey, publisherKeys] = await encrypt.exportPublicKey();
    const encryptionPublicKeyBuffer = new Buffer.from(publisherEncryptionPublicKey)

    const [redeemable, redeemableBump] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from(anchor.utils.bytes.utf8.encode("nina-redeemable")), release.toBuffer(), redeemedMint.publicKey.toBuffer()],
      nina.programId
    );    
    const redeeemableAccount = await nina.account.redeemable.fetch(redeemable)
    const config = {
      encryptionPublicKey: encryptionPublicKeyBuffer,
      description: encrypt.decode(redeeemableAccount.description),
      redeemedMax: redeeemableAccount.redeemedMax,
    };

    await nina.rpc.redeemableUpdateConfig(
      config,{
        accounts: {
          authority: provider.wallet.publicKey,
          release,
          redeemable,
          redeemableSigner: redeeemableAccount.redeemableSigner,
          redeemableMint: releaseMint.publicKey,
          redeemedMint: redeemedMint.publicKey,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          systemProgram: anchor.web3.SystemProgram.programId,
        },
      }
    )

    const redeemableAfter = await nina.account.redeemable.fetch(redeemable);
    let encryptionPublicKeyBefore = Buffer.from(redeeemableAccount.encryptionPublicKey);
    encryptionPublicKeyBefore = encryptionPublicKeyBefore.buffer.slice(
      encryptionPublicKeyBefore.byteOffset,
      encryptionPublicKeyBefore.byteOffset + encryptionPublicKeyBefore.byteLength
    );

    let encryptionPublicKeyAfter = Buffer.from(redeemableAfter.encryptionPublicKey);
    encryptionPublicKeyAfter = encryptionPublicKeyAfter.buffer.slice(
      encryptionPublicKeyAfter.byteOffset,
      encryptionPublicKeyAfter.byteOffset + encryptionPublicKeyAfter.byteLength
    );
    assert.ok(encryptionPublicKeyBefore !== encryptionPublicKeyAfter)
    assert.deepEqual(encryptionPublicKeyAfter, publisherEncryptionPublicKey)
  });
});

describe('Vault', async () => {
  it('Withdraws From the Vault to Vault Authority', async () => {
    const vaultUsdcTokenAccountBefore = await getTokenAccount(
      provider,
      vaultUsdcTokenAccount,
    );
    const vaultUsdcTokenAccountBeforeBalance = vaultUsdcTokenAccountBefore.amount.toNumber();

    const usdcTokenAccountBefore = await getTokenAccount(
      provider,
      usdcTokenAccount,
    );
    const usdcTokenAccountBeforeBalance = usdcTokenAccountBefore.amount.toNumber();

    const withdrawAmount = vaultUsdcTokenAccountBefore.amount.toNumber();

    await nina.rpc.vaultWithdraw(
      new anchor.BN(withdrawAmount), {
        accounts: {
          authority: provider.wallet.publicKey,
          vault,
          vaultSigner,
          withdrawTarget: vaultUsdcTokenAccount,
          withdrawDestination: usdcTokenAccount,
          withdrawMint: usdcMint,
          tokenProgram: TOKEN_PROGRAM_ID,
        }
      }
    );

    const vaultUsdcTokenAccountAfter = await getTokenAccount(
      provider,
      vaultUsdcTokenAccount,
    );
    const vaultUsdcTokenAccountAfterBalance = vaultUsdcTokenAccountAfter.amount.toNumber();

    assert.ok(vaultUsdcTokenAccountAfterBalance === vaultUsdcTokenAccountBeforeBalance - withdrawAmount)
    const usdcTokenAccountAfter = await getTokenAccount(
      provider,
      usdcTokenAccount,
    );
    const usdcTokenAccountAfterBalance = usdcTokenAccountAfter.amount.toNumber();
    assert.ok(usdcTokenAccountAfterBalance === usdcTokenAccountBeforeBalance + withdrawAmount)
  })

  it('should not allow withdraw from non-authority', async () => {
    const vaultWrappedSolTokenAccountBefore = await getTokenAccount(
      provider,
      vaultWrappedSolTokenAccount,
    );

    const withdrawAmount = vaultWrappedSolTokenAccountBefore.amount.toNumber();

    await assert.rejects(
      async () => {
        await nina.rpc.vaultWithdraw(
          new anchor.BN(withdrawAmount), {
            accounts: {
              authority: user1.publicKey,
              vault,
              vaultSigner,
              withdrawTarget: vaultWrappedSolTokenAccount,
              withdrawDestination: user1WrappedSolTokenAccount,
              withdrawMint: wrappedSolMint,
              tokenProgram: TOKEN_PROGRAM_ID,
            },
            signers: [user1],
          }
        );
      },
      (err) => {
        assert.equal(err.code, 2003);
        assert.equal(err.msg, "A raw constraint was violated");
        return true;
      }
    );
  });

  it('should not allow withdraw with amount greater than balance', async () => {
    const vaultWrappedSolTokenAccountBefore = await getTokenAccount(
      provider,
      vaultWrappedSolTokenAccount,
    );

    const withdrawAmount = vaultWrappedSolTokenAccountBefore.amount.toNumber();

    await assert.rejects(
      async () => {
        await nina.rpc.vaultWithdraw(
          new anchor.BN(withdrawAmount * 2), {
            accounts: {
              authority: provider.wallet.publicKey,
              vault,
              vaultSigner,
              withdrawTarget: vaultWrappedSolTokenAccount,
              withdrawDestination: wrappedSolTokenAccount,
              withdrawMint: wrappedSolMint,
              tokenProgram: TOKEN_PROGRAM_ID,
            },
          }
        );
      },
      (err) => {
        assert.equal(err.code, 6019);
        assert.equal(err.msg, "Cant withdraw more than deposited");
        return true;
      }
    );
  });

  it('should not allow withdraw with amount 0', async () => {
    await assert.rejects(
      async () => {
        await nina.rpc.vaultWithdraw(
          new anchor.BN(0), {
            accounts: {
              authority: provider.wallet.publicKey,
              vault,
              vaultSigner,
              withdrawTarget: vaultWrappedSolTokenAccount,
              withdrawDestination: wrappedSolTokenAccount,
              withdrawMint: wrappedSolMint,
              tokenProgram: TOKEN_PROGRAM_ID,
            },
          }
        );
      },
      (err) => {
        assert.equal(err.code, 6020);
        assert.equal(err.msg, "Withdraw amount must be greater than 0");
        return true;
      }
    );
  });
})

describe('Hub', async () => {
  let hub
  let hubSigner
  let hubWallet
  let hubParams = {
    handle: 'NinaHub',
    publishFee: new anchor.BN(50000),
    uri: 'https://arweave.net/xxxxx',
    referralFee: new anchor.BN(50000),
  }

  it('should init a Hub', async () => {
    const [_hub, hubBump] = await anchor.web3.PublicKey.findProgramAddress([
      Buffer.from(anchor.utils.bytes.utf8.encode("nina-hub")), 
      Buffer.from(anchor.utils.bytes.utf8.encode(hubParams.handle))],
      nina.programId
    );
    hub = _hub

    const [_hubSigner, hubSignerBump] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from(anchor.utils.bytes.utf8.encode("nina-hub-signer")), hub.toBuffer()],
      nina.programId
    );
    hubSigner = _hubSigner
    hubParams.hubSignerBump = hubSignerBump

    const [hubCollaborator, bump] = await anchor.web3.PublicKey.findProgramAddress([
        Buffer.from(anchor.utils.bytes.utf8.encode("nina-hub-collaborator")), 
        hub.toBuffer(),
        provider.wallet.publicKey.toBuffer(),
      ],
      nina.programId
    );

    let [_hubWallet, hubWalletIx] = await findOrCreateAssociatedTokenAccount(
      provider,
      hubSigner,
      anchor.web3.SystemProgram.programId,
      anchor.web3.SYSVAR_RENT_PUBKEY,
      usdcMint,
    );
    hubWallet = _hubWallet

    await nina.rpc.hubInitWithCredit(
      hubParams, {
        accounts: {
          authority: provider.wallet.publicKey,
          hub,
          hubSigner,
          hubCollaborator,
          usdcMint,
          hubWallet,
          authorityHubCreditTokenAccount: hubCreditTokenAccount,
          hubCreditMint: nhcMint,
          systemProgram: anchor.web3.SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        }, 
        instructions:[
          hubWalletIx,
        ]
      }
    )

    const hubAfter = await nina.account.hub.fetch(hub)
    assert.equal(encrypt.decode(hubAfter.handle), hubParams.handle)
    assert.equal(hubAfter.publishFee.toNumber(), hubParams.publishFee)
    assert.equal(encrypt.decode(hubAfter.uri), hubParams.uri)
    assert.equal(hubAfter.authority.toBase58(), provider.wallet.publicKey.toBase58())

    const hubCollaboratorAfter = await nina.account.hubCollaborator.fetch(hubCollaborator)
    assert.equal(hubCollaboratorAfter.collaborator.toBase58(), provider.wallet.publicKey.toBase58())
    assert.equal(hubCollaboratorAfter.hub.toBase58(), hub.toBase58())
  })

  let hubCollaborator
  it('should add collaborator to hub', async () => {
    const [_hubCollaborator, bump] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("nina-hub-collaborator")), 
        hub.toBuffer(),
        user1.publicKey.toBuffer(),
      ],
      nina.programId
    );
    hubCollaborator = _hubCollaborator

    const [_payerHubCollaborator, bump] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("nina-hub-collaborator")), 
        hub.toBuffer(),
        provider.wallet.publicKey.toBuffer(),
      ],
      nina.programId
    );
    payerHubCollaborator = _payerHubCollaborator;
    
    await nina.rpc.hubAddCollaborator(
      false,
      false,
      new anchor.BN(10),
      hubParams.handle, {
      accounts: {
        payer: provider.wallet.publicKey,
        payerHubCollaborator,
        hub,
        hubCollaborator,
        collaborator: user1.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      }
    })

    const hubCollaboratorAfter = await nina.account.hubCollaborator.fetch(hubCollaborator)
    assert.equal(hubCollaboratorAfter.collaborator.toBase58(), user1.publicKey.toBase58())
    assert.equal(hubCollaboratorAfter.hub.toBase58(), hub.toBase58())
  })

  it('should update collaborator permissions', async () => {
    await nina.rpc.hubUpdateCollaboratorPermissions(
      false,
      true,
      new anchor.BN(5),
      hubParams.handle, {
      accounts: {
        payer: provider.wallet.publicKey,
        payerHubCollaborator,
        hub,
        hubCollaborator,
        collaborator: user1.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      }
    })

    const hubCollaboratorAfter = await nina.account.hubCollaborator.fetch(hubCollaborator)
    console.log("hubCollaboratorAfter ::> ", hubCollaboratorAfter)
    assert.equal(hubCollaboratorAfter.allowance, 5)
    assert.equal(hubCollaboratorAfter.canAddCollaborator, true)
    assert.equal(hubCollaboratorAfter.canAddContent, false)
  })

  it('should add collaborator to hub as user w/ permissions', async () => {
    const [_hubCollaborator, bump] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("nina-hub-collaborator")), 
        hub.toBuffer(),
        user2.publicKey.toBuffer(),
      ],
      nina.programId
    );
    hubCollaborator = _hubCollaborator

    const [_payerHubCollaborator, bump] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("nina-hub-collaborator")), 
        hub.toBuffer(),
        user1.publicKey.toBuffer(),
      ],
      nina.programId
    );
    payerHubCollaborator = _payerHubCollaborator;
    
    await nina.rpc.hubAddCollaborator(
      false,
      false,
      new anchor.BN(10),
      hubParams.handle, {
        accounts: {
          payer: user1.publicKey,
          payerHubCollaborator,
          hub,
          hubCollaborator,
          collaborator: user2.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        },
        signers: [user1]
      }
    )

    const hubCollaboratorAfter = await nina.account.hubCollaborator.fetch(hubCollaborator)
    assert.equal(hubCollaboratorAfter.collaborator.toBase58(), user2.publicKey.toBase58())
    assert.equal(hubCollaboratorAfter.hub.toBase58(), hub.toBase58())
  })


  it('should add release to hub', async () => {
    const [hubRelease, bump] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("nina-hub-release")), 
        hub.toBuffer(),
        release.toBuffer(),
      ],
      nina.programId
    );

    const [hubContent, bump] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("nina-hub-content")), 
        hub.toBuffer(),
        release.toBuffer(),
      ],
      nina.programId
    );

    const [hubCollaborator, bump] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("nina-hub-collaborator")), 
        hub.toBuffer(),
        provider.wallet.publicKey.toBuffer(),
      ],
      nina.programId
    );

    await nina.rpc.hubAddRelease(
      hubParams.handle, {
      accounts: {
        authority: provider.wallet.publicKey,
        hub,
        hubRelease,
        hubContent,
        hubCollaborator,
        release,
        systemProgram: anchor.web3.SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      }
    })

    const hubReleaseAfter = await nina.account.hubRelease.fetch(hubRelease)
    assert.equal(hubReleaseAfter.release.toBase58(), release.toBase58())
    assert.equal(hubReleaseAfter.hub.toBase58(), hub.toBase58())
  })

  it('should not add release to hub if collaborator doesnt have authority to', async () => {    
    const [hubRelease, bump] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("nina-hub-release")), 
        hub.toBuffer(),
        releaseSellOut.toBuffer(),
      ],
      nina.programId
    );

    const [hubContent, bump] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("nina-hub-content")), 
        hub.toBuffer(),
        releaseSellOut.toBuffer(),
      ],
      nina.programId
    );

    const [hubCollaborator, bump] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("nina-hub-collaborator")), 
        hub.toBuffer(),
        user1.publicKey.toBuffer(),
      ],
      nina.programId
    );

    await assert.rejects(
      async () => {
        await nina.rpc.hubAddRelease(
          hubParams.handle, {
          accounts: {
            authority: user1.publicKey,
            hub,
            hubRelease,
            hubContent,
            hubCollaborator,
            release: releaseSellOut,
            systemProgram: anchor.web3.SystemProgram.programId,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          },
          signers: [user1]
        })
      },
      (err) => {
        assert.equal(err.code, 6021);
        return true;
      }
    );
  })

  it('should not add collaborator to hub without permissions', async () => {
    const [hubCollaborator, bump] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("nina-hub-collaborator")), 
        hub.toBuffer(),
        user3.publicKey.toBuffer(),
      ],
      nina.programId
    );
    const [payerHubCollaborator, bump] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("nina-hub-collaborator")), 
        hub.toBuffer(),
        user2.publicKey.toBuffer(),
      ],
      nina.programId
    );
    await assert.rejects(
      async () => {
        await nina.rpc.hubAddCollaborator(
          true,
          true,
          new anchor.BN(10),
          hubParams.handle, {
          accounts: {
            payer: user2.publicKey,
            payerHubCollaborator,
            hub,
            hubCollaborator,
            collaborator: user3.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          }, 
          signers: [user2]
        })
      },
      (err) => {
        assert.equal(err.code, 6028);
        return true;
      }
    );
  })

  let releaseAccount
  let releaseSigner
  let hubRoyaltyTokenAccount
  let hubRelease
  let hubReleaseMint
  let hubContent
  it('should create a release via hub as authority', async () => {
    const paymentMint = usdcMint;
    hubReleaseMint = anchor.web3.Keypair.generate();
    const releaseMintIx = await createMintInstructions(
      provider,
      provider.wallet.publicKey,
      hubReleaseMint.publicKey,
      0,
    );

    const [_releaseAccount, releaseBump] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("nina-release")),
        hubReleaseMint.publicKey.toBuffer(),
      ],
      nina.programId,
    );
    releaseAccount = _releaseAccount

    const [releaseSigner, releaseSignerBump] = await anchor.web3.PublicKey.findProgramAddress(
      [releaseAccount.toBuffer()],
      nina.programId,
    );
    releaseSigner = releaseSigner

    let [_hubRoyaltyTokenAccount, royaltyTokenAccountIx] = await findOrCreateAssociatedTokenAccount(
      provider,
      releaseSigner,
      anchor.web3.SystemProgram.programId,
      anchor.web3.SYSVAR_RENT_PUBKEY,
      paymentMint,
    );
    hubRoyaltyTokenAccount = _hubRoyaltyTokenAccount

    const [hubCollaborator, bump] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("nina-hub-collaborator")), 
        hub.toBuffer(),
        provider.wallet.publicKey.toBuffer(),
      ],
      nina.programId
    );

    const [_hubRelease, bump] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("nina-hub-release")), 
        hub.toBuffer(),
        releaseAccount.toBuffer(),
      ],
      nina.programId
    );
    hubRelease = _hubRelease

    const [_hubContent, bump] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("nina-hub-content")), 
        hub.toBuffer(),
        releaseAccount.toBuffer(),
      ],
      nina.programId
    );
    hubContent = _hubContent

    const config = {
      amountTotalSupply: new anchor.BN(1000),
      amountToArtistTokenAccount: new anchor.BN(0),
      amountToVaultTokenAccount: new anchor.BN(0),
      resalePercentage: new anchor.BN(200000),
      price: new anchor.BN(releasePrice),
      releaseDatetime: new anchor.BN((Date.now() / 1000) - 5),
    };

    const bumps = {
      release: releaseBump,
      signer: releaseSignerBump,
    }
    const instructions = [
      ...releaseMintIx,
      royaltyTokenAccountIx,
    ]

    const metadataProgram = new anchor.web3.PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s')
    const [metadata] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from('metadata'), metadataProgram.toBuffer(), hubReleaseMint.publicKey.toBuffer()],
      metadataProgram,
    );

    const metadataData = {
      name: `Nina with the Nina`,
      symbol: `NINA`,
      uri: `https://arweave.net`,
      sellerFeeBasisPoints: 2000,
    }

    await nina.rpc.releaseInitViaHub(
      config,
      bumps,
      metadataData,
      hubParams.handle, {
        accounts: {
          authority: provider.wallet.publicKey,
          release: releaseAccount,
          releaseSigner: releaseSigner,
          hub,
          hubCollaborator,
          hubRelease,
          hubContent,
          hubSigner,
          hubWallet,
          hubAuthority: provider.wallet.publicKey,
          hubAuthorityTokenAccount: usdcTokenAccount,
          releaseMint: hubReleaseMint.publicKey,
          authorityTokenAccount: usdcTokenAccount,
          paymentMint,
          royaltyTokenAccount: hubRoyaltyTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
          metadata,
          metadataProgram,
          systemProgram: anchor.web3.SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        },
        signers: [hubReleaseMint],
        instructions,
      }
    );
    const hubAfter = await nina.account.hub.fetch(hub)
    const hubReleaseAfter = await nina.account.hubRelease.fetch(hubRelease)
    const releaseAfter = await nina.account.release.fetch(releaseAccount)
    assert.equal(releaseAfter.royaltyRecipients[0].percentShare.toNumber(), 950000)
    assert.equal(releaseAfter.royaltyRecipients[0].recipientAuthority.toBase58(), provider.wallet.publicKey.toBase58())
    assert.equal(hubReleaseAfter.hub.toBase58(), hub.toBase58())
    assert.equal(hubReleaseAfter.release.toBase58(), releaseAccount.toBase58())
    assert.equal(hubReleaseAfter.sales.toNumber(), 0)
    assert.equal(hubReleaseAfter.publishedThroughHub, true)
  })

  let referenceHubContent
  it('should create a release via hub as user', async () => {
    const paymentMint = usdcMint;
    hubReleaseMint = anchor.web3.Keypair.generate();
    const releaseMintIx = await createMintInstructions(
      provider,
      user1.publicKey,
      hubReleaseMint.publicKey,
      0,
    );

    const [_hubReleaseAccount, releaseBump] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("nina-release")),
        hubReleaseMint.publicKey.toBuffer(),
      ],
      nina.programId,
    );
    releaseAccount = _hubReleaseAccount

    const [_releaseSigner, releaseSignerBump] = await anchor.web3.PublicKey.findProgramAddress(
      [releaseAccount.toBuffer()],
      nina.programId,
    );
    releaseSigner = _releaseSigner

    let [_hubRoyaltyTokenAccount, royaltyTokenAccountIx] = await findOrCreateAssociatedTokenAccount(
      provider,
      releaseSigner,
      anchor.web3.SystemProgram.programId,
      anchor.web3.SYSVAR_RENT_PUBKEY,
      paymentMint,
    );
    hubRoyaltyTokenAccount = _hubRoyaltyTokenAccount

    const [hubCollaborator, bump] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("nina-hub-collaborator")), 
        hub.toBuffer(),
        user1.publicKey.toBuffer(),
      ],
      nina.programId
    );

    const [_hubRelease, bump] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("nina-hub-release")), 
        hub.toBuffer(),
        releaseAccount.toBuffer(),
      ],
      nina.programId
    );
    hubRelease = _hubRelease

    const [_hubContent, bump] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("nina-hub-content")), 
        hub.toBuffer(),
        releaseAccount.toBuffer(),
      ],
      nina.programId
    );
    hubContent = _hubContent
    referenceHubContent = _hubContent

    const config = {
      amountTotalSupply: new anchor.BN(1000),
      amountToArtistTokenAccount: new anchor.BN(0),
      amountToVaultTokenAccount: new anchor.BN(0),
      resalePercentage: new anchor.BN(200000),
      price: new anchor.BN(releasePrice),
      releaseDatetime: new anchor.BN((Date.now() / 1000) - 5),
    };

    const bumps = {
      release: releaseBump,
      signer: releaseSignerBump,
    }
    const instructions = [
      ...releaseMintIx,
      royaltyTokenAccountIx,
    ]

    const metadataProgram = new anchor.web3.PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s')
    const [metadata] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from('metadata'), metadataProgram.toBuffer(), hubReleaseMint.publicKey.toBuffer()],
      metadataProgram,
    );

    const metadataData = {
      name: `Nina with the Nina`,
      symbol: `NINA`,
      uri: `https://arweave.net`,
      sellerFeeBasisPoints: 2000,
    }

    await nina.rpc.releaseInitViaHub(
      config,
      bumps,
      metadataData,
      hubParams.handle, {
        accounts: {
          authority: user1.publicKey,
          release: releaseAccount,
          releaseSigner,
          hub,
          hubCollaborator,
          hubRelease,
          hubContent,
          hubSigner,
          hubWallet,
          hubAuthority: provider.wallet.publicKey,
          hubAuthorityTokenAccount: usdcTokenAccount,
          releaseMint: hubReleaseMint.publicKey,
          authorityTokenAccount: user1UsdcTokenAccount,
          paymentMint,
          royaltyTokenAccount: hubRoyaltyTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: anchor.web3.SystemProgram.programId,
          metadata,
          metadataProgram,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        },
        signers: [user1, hubReleaseMint],
        instructions,
      }
    );
    const hubAfter = await nina.account.hub.fetch(hub)
    const hubReleaseAfter = await nina.account.hubRelease.fetch(hubRelease)
    const releaseAfter = await nina.account.release.fetch(releaseAccount)
    assert.equal(releaseAfter.royaltyRecipients[0].percentShare.toNumber(), 1000000 - releaseAfter.royaltyRecipients[1].percentShare.toNumber())
    assert.equal(releaseAfter.royaltyRecipients[1].percentShare.toNumber(), hubParams.publishFee.toNumber())
    assert.equal(releaseAfter.royaltyRecipients[0].recipientAuthority.toBase58(), user1.publicKey.toBase58())
    assert.equal(releaseAfter.royaltyRecipients[1].recipientAuthority.toBase58(), hubAfter.hubSigner.toBase58())
    assert.equal(hubReleaseAfter.hub.toBase58(), hub.toBase58())
    assert.equal(hubReleaseAfter.release.toBase58(), releaseAccount.toBase58())
    assert.equal(hubReleaseAfter.sales.toNumber(), 0)
    assert.equal(hubReleaseAfter.publishedThroughHub, true)
  })

  it("Purchases a release with USDC via Hub", async () => {
    const usdcTokenAccountBefore = await getTokenAccount(
      provider,
      user1UsdcTokenAccount,
    );
    const usdcTokenAccountBeforeBalanceTx = usdcTokenAccountBefore.amount.toNumber();
    
    const [hubSigner, hubSignerBump] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from(anchor.utils.bytes.utf8.encode("nina-hub-signer")), hub.toBuffer()],
      nina.programId
    );

    let [_receiverReleaseTokenAccount, receiverReleaseTokenAccountIx] = await findOrCreateAssociatedTokenAccount(
      provider,
      user1.publicKey,
      anchor.web3.SystemProgram.programId,
      anchor.web3.SYSVAR_RENT_PUBKEY,
      hubReleaseMint.publicKey,
    );
    receiverReleaseTokenAccount = _receiverReleaseTokenAccount;

    let [hubTokenAccount, hubTokenAccountIx] = await findOrCreateAssociatedTokenAccount(
      provider,
      hubSigner,
      anchor.web3.SystemProgram.programId,
      anchor.web3.SYSVAR_RENT_PUBKEY,
      usdcMint,
    );

    const releaseBefore = await nina.account.release.fetch(releaseAccount);
    const hubBefore = await nina.account.hub.fetch(hub)
    await nina.rpc.releasePurchaseViaHub(
      new anchor.BN(releasePrice),
      hubParams.handle, {
        accounts: {
          release: releaseAccount,
          releaseSigner,
          payer: user1.publicKey,
          payerTokenAccount: user1UsdcTokenAccount,
          receiver: user1.publicKey,
          receiverReleaseTokenAccount,
          royaltyTokenAccount: hubRoyaltyTokenAccount,
          releaseMint: hubReleaseMint.publicKey,
          hub,
          hubRelease,
          hubSigner,
          hubWallet,
          hubTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
          clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
        },
        signers: [user1],
        instructions: [receiverReleaseTokenAccountIx],
      }
    );
    
    const receiverReleaseTokenAccountAfter = await getTokenAccount(
      provider,
      receiverReleaseTokenAccount,
    );
    assert.ok(receiverReleaseTokenAccountAfter.amount.toNumber() === 1)

    const usdcTokenAccountAfter = await getTokenAccount(
      provider,
      user1UsdcTokenAccount,
    );
    assert.ok(usdcTokenAccountAfter.amount.toNumber() === usdcTokenAccountBeforeBalanceTx - releasePrice - ((releasePrice * hubBefore.referralFee.toNumber()) / 1000000))

    const releaseAfter = await nina.account.release.fetch(releaseAccount);
    assert.ok(releaseAfter.remainingSupply.toNumber() === releaseBefore.remainingSupply.toNumber() - 1);
    assert.equal(releaseAfter.saleCounter.toNumber(), 1);
    assert.equal(releaseAfter.totalCollected.toNumber(), releasePrice);

    const hubReleaseAfter = await nina.account.hubRelease.fetch(hubRelease);
    assert.equal(hubReleaseAfter.sales.toNumber(), 1);

    const royaltyTokenAccountAfter = await getTokenAccount(
      provider,
      releaseAfter.royaltyTokenAccount,
    );
    assert.equal(royaltyTokenAccountAfter.amount.toNumber(), releasePrice);
  });

  it ('should update hub uri is authority', async () => {
    const uri = 'https://arweave.net/jsdlkfj4j3kl4j3lkj43l3kjflksjd'
    await nina.rpc.hubUpdateConfig(
      uri,
      hubParams.handle, 
      hubParams.publishFee,
      hubParams.referralFee, {
        accounts: {
          authority: provider.wallet.publicKey,
          hub,
        }
      }
    )
    const hubAfter = await nina.account.hub.fetch(hub)
    assert.equal(encrypt.decode(hubAfter.uri), uri)
  })
  
  it ('should not update hub uri is authority', async () => {
    await assert.rejects(
      async () => {
        const uri = 'https://arweave.net/jsdlkfj4j3kl4j3lkj43l3kjflksjd'
        await nina.rpc.hubUpdateConfig(
          uri,
          hubParams.handle,
          hubParams.publishFee,
          hubParams.referralFee, {
            accounts: {
              authority: user2.publicKey,
              hub,
            },
            signers: [user2]
          }
        )
      }, (err) => {
        assert.equal(err.code, 2003);
        return true;
      }
    )
  })

  it('should not create a release via hub if collaborator hubCollaborator does not match', async () => {
    const paymentMint = usdcMint;
    const hubReleaseMint = anchor.web3.Keypair.generate();
    const releaseMintIx = await createMintInstructions(
      provider,
      user1.publicKey,
      hubReleaseMint.publicKey,
      0,
    );

    const [releaseAccount, releaseBump] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("nina-release")),
        hubReleaseMint.publicKey.toBuffer(),
      ],
      nina.programId,
    );

    const [releaseSigner, releaseSignerBump] = await anchor.web3.PublicKey.findProgramAddress(
      [releaseAccount.toBuffer()],
      nina.programId,
    );

    let [hubRoyaltyTokenAccount, royaltyTokenAccountIx] = await findOrCreateAssociatedTokenAccount(
      provider,
      releaseSigner,
      anchor.web3.SystemProgram.programId,
      anchor.web3.SYSVAR_RENT_PUBKEY,
      paymentMint,
    );
    const [hubCollaborator, bump] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("nina-hub-collaborator")), 
        hub.toBuffer(),
        user1.publicKey.toBuffer(),
      ],
      nina.programId
    );

    const [hubRelease, bump] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("nina-hub-release")), 
        hub.toBuffer(),
        releaseAccount.toBuffer(),
      ],
      nina.programId
    );

    const [_hubContent, bump] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("nina-hub-content")), 
        hub.toBuffer(),
        releaseAccount.toBuffer(),
      ],
      nina.programId
    );
    hubContent = _hubContent

    const config = {
      amountTotalSupply: new anchor.BN(1000),
      amountToArtistTokenAccount: new anchor.BN(0),
      amountToVaultTokenAccount: new anchor.BN(0),
      resalePercentage: new anchor.BN(200000),
      price: new anchor.BN(releasePrice),
      releaseDatetime: new anchor.BN((Date.now() / 1000) - 5),
    };

    const bumps = {
      release: releaseBump,
      signer: releaseSignerBump,
    }
    const instructions = [
      ...releaseMintIx,
      royaltyTokenAccountIx,
    ]

    const metadataProgram = new anchor.web3.PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s')
    const [metadata] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from('metadata'), metadataProgram.toBuffer(), hubReleaseMint.publicKey.toBuffer()],
      metadataProgram,
    );

    const metadataData = {
      name: `Nina with the Nina`,
      symbol: `NINA`,
      uri: `https://arweave.net`,
      sellerFeeBasisPoints: 2000,
    }

    await assert.rejects(
      async () => {
        await nina.rpc.releaseInitViaHub(
          config,
          bumps,
          metadataData,
          hubParams.handle, {
            accounts: {
              authority: user2.publicKey,
              release: releaseAccount,
              releaseSigner: releaseSigner,
              hub,
              hubCollaborator,
              hubRelease,
              hubContent,
              hubSigner,
              hubWallet,
              releaseMint: hubReleaseMint.publicKey,
              authorityTokenAccount: user1UsdcTokenAccount,
              paymentMint,
              royaltyTokenAccount: hubRoyaltyTokenAccount,
              tokenProgram: TOKEN_PROGRAM_ID,
              systemProgram: anchor.web3.SystemProgram.programId,
              metadata,
              metadataProgram,
              rent: anchor.web3.SYSVAR_RENT_PUBKEY,
            },
            signers: [user2, hubReleaseMint],
            instructions,
          }
        );
      },
      (err) => {
        assert.equal(err.code, 2006);
        return true;
      }
    );
  })
  it('should not create a release via hub if collaborator hubCollaborator does not exist', async () => {
    const paymentMint = usdcMint;
    const hubReleaseMint = anchor.web3.Keypair.generate();
    const releaseMintIx = await createMintInstructions(
      provider,
      user3.publicKey,
      hubReleaseMint.publicKey,
      0,
    );

    const [releaseAccount, releaseBump] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("nina-release")),
        hubReleaseMint.publicKey.toBuffer(),
      ],
      nina.programId,
    );

    const [releaseSigner, releaseSignerBump] = await anchor.web3.PublicKey.findProgramAddress(
      [releaseAccount.toBuffer()],
      nina.programId,
    );

    let [hubRoyaltyTokenAccount, royaltyTokenAccountIx] = await findOrCreateAssociatedTokenAccount(
      provider,
      releaseSigner,
      anchor.web3.SystemProgram.programId,
      anchor.web3.SYSVAR_RENT_PUBKEY,
      paymentMint,
    );
    const [hubCollaborator, bump] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("nina-hub-collaborator")), 
        hub.toBuffer(),
        user3.publicKey.toBuffer(),
      ],
      nina.programId
    );

    const [_hubRelease, bump] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("nina-hub-release")), 
        hub.toBuffer(),
        releaseAccount.toBuffer(),
      ],
      nina.programId
    );  
    hubRelease = _hubRelease

    const [_hubContent, bump] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("nina-hub-content")), 
        hub.toBuffer(),
        releaseAccount.toBuffer(),
      ],
      nina.programId
    );
    hubContent = _hubContent
    const config = {
      amountTotalSupply: new anchor.BN(1000),
      amountToArtistTokenAccount: new anchor.BN(0),
      amountToVaultTokenAccount: new anchor.BN(0),
      resalePercentage: new anchor.BN(200000),
      price: new anchor.BN(releasePrice),
      releaseDatetime: new anchor.BN((Date.now() / 1000) - 5),
    };

    const bumps = {
      release: releaseBump,
      signer: releaseSignerBump,
    }
    const instructions = [
      ...releaseMintIx,
      royaltyTokenAccountIx,
    ]

    const metadataProgram = new anchor.web3.PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s')
    const [metadata] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from('metadata'), metadataProgram.toBuffer(), hubReleaseMint.publicKey.toBuffer()],
      metadataProgram,
    );

    const metadataData = {
      name: `Nina with the Nina`,
      symbol: `NINA`,
      uri: `https://arweave.net`,
      sellerFeeBasisPoints: 2000,
    }

    await assert.rejects(
      async () => {
        await nina.rpc.releaseInitViaHub(
          config,
          bumps,
          metadataData,
          hubParams.handle, {
            accounts: {
              authority: user3.publicKey,
              release: releaseAccount,
              releaseSigner: releaseSigner,
              hub,
              hubCollaborator,
              hubRelease,
              hubContent,
              hubSigner,
              hubWallet,
              releaseMint: hubReleaseMint.publicKey,
              authorityTokenAccount: user1UsdcTokenAccount,
              paymentMint,
              royaltyTokenAccount: hubRoyaltyTokenAccount,
              tokenProgram: TOKEN_PROGRAM_ID,
              systemProgram: anchor.web3.SystemProgram.programId,
              metadata,
              metadataProgram,
              rent: anchor.web3.SYSVAR_RENT_PUBKEY,
            },
            signers: [user3, hubReleaseMint],
            instructions,
          }
        );
      },
      (err) => {
        assert.equal(err.code, 3012);
        return true;
      }
    );
  })
  let payerHubCollaborator
  it('should not remove hub collaborator from hub who is unauthorized', async () => {
    const [hubCollaborator, bump] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("nina-hub-collaborator")), 
        hub.toBuffer(),
        user1.publicKey.toBuffer(),
      ],
      nina.programId
    );
    const [_payerHubCollaborator, bump] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("nina-hub-collaborator")), 
        hub.toBuffer(),
        user2.publicKey.toBuffer(),
      ],
      nina.programId
    );
    payerHubCollaborator = _payerHubCollaborator
    await assert.rejects(
      async () => {
        await nina.rpc.hubRemoveCollaborator(
          hubParams.handle, {
          accounts: {
            payer: user2.publicKey,
            payerHubCollaborator,
            hub,
            hubCollaborator,
            collaborator: user1.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          },
          signers: [user2]
        })
      }, (err) => {
        assert.equal(err.code, 6022);
        return true;
      }
    );
  })

  it('should not remove hub collaborator account for hub authority', async () => {
    const [hubCollaborator, bump] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("nina-hub-collaborator")), 
        hub.toBuffer(),
        provider.wallet.publicKey.toBuffer(),
      ],
      nina.programId
    );

    const [_payerHubCollaborator, bump] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("nina-hub-collaborator")), 
        hub.toBuffer(),
        provider.wallet.publicKey.toBuffer(),
      ],
      nina.programId
    );
    payerHubCollaborator = _payerHubCollaborator

    await assert.rejects(
      async () => {
        await nina.rpc.hubRemoveCollaborator(
          hubParams.handle, {
          accounts: {
            payer: provider.wallet.publicKey,
            payerHubCollaborator,
            hub,
            hubCollaborator,
            collaborator: provider.wallet.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          },
        })
      }, (err) => {
        assert.equal(err.code, 6023);
        return true;
      }
    );
  })

  it('should remove collaborator from hub who is not authority', async () => {
    const [hubCollaborator, bump] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("nina-hub-collaborator")), 
        hub.toBuffer(),
        user1.publicKey.toBuffer(),
      ],
      nina.programId
    );
    const [_payerHubCollaborator, bump] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("nina-hub-collaborator")), 
        hub.toBuffer(),
        user1.publicKey.toBuffer(),
      ],
      nina.programId
    );
    payerHubCollaborator = _payerHubCollaborator

    await nina.rpc.hubRemoveCollaborator(
      hubParams.handle, {
      accounts: {
        payer: user1.publicKey,
        payerHubCollaborator,
        hub,
        hubCollaborator,
        collaborator: user1.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
      signers: [user1]
    })
    await assert.rejects(
      async () => {
        await nina.account.hubCollaborator.fetch(hubCollaborator)
      }
    )
  })

  it('should not remove release from hub if unauthorized', async () => {
    const [hubRelease, bump] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("nina-hub-release")), 
        hub.toBuffer(),
        release.toBuffer(),
      ],
      nina.programId
    );
    const [hubContent, bump] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("nina-hub-content")), 
        hub.toBuffer(),
        release.toBuffer(),
      ],
      nina.programId
    );

    await assert.rejects(
      async () => {
        await nina.rpc.hubRemoveRelease(
          hubParams.handle, {
          accounts: {
            payer: user2.publicKey,
            hub,
            hubRelease,
            hubContent,
            release,
            systemProgram: anchor.web3.SystemProgram.programId,
          },
          signers: [user2]
        })
      },
      (err) => {
        assert.equal(err.code, 6024);
        return true;
      }
    );
  })

  it('should remove collaborator from hub', async () => {
    const [hubCollaborator, bump] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("nina-hub-collaborator")), 
        hub.toBuffer(),
        user3.publicKey.toBuffer(),
      ],
      nina.programId
    );

    const [payerHubCollaborator, bump] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("nina-hub-collaborator")), 
        hub.toBuffer(),
        provider.wallet.publicKey.toBuffer(),
      ],
      nina.programId
    );

    await nina.rpc.hubAddCollaborator(
      false,
      false,
      new anchor.BN(10),
      hubParams.handle, {
        accounts: {
          payer: provider.wallet.publicKey,
          payerHubCollaborator,
          hub,
          hubCollaborator,
          collaborator: user3.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        },
      }
    )

    await nina.rpc.hubRemoveCollaborator(
      hubParams.handle, {
      accounts: {
        payer: provider.wallet.publicKey,
        hub,
        hubCollaborator,
        payerHubCollaborator,
        collaborator: user3.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      }
    })
    await assert.rejects(
      async () => {
        await nina.account.hubCollaborator.fetch(hubCollaborator)
      }
    )
  })

  it('should remove release from hub', async () => {
    const [hubRelease, bump] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("nina-hub-release")), 
        hub.toBuffer(),
        release2.toBuffer(),
      ],
      nina.programId
    );

    const [hubContent, bump] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("nina-hub-content")), 
        hub.toBuffer(),
        release2.toBuffer(),
      ],
      nina.programId
    );

    const [hubCollaborator, bump] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("nina-hub-collaborator")), 
        hub.toBuffer(),
        provider.wallet.publicKey.toBuffer(),
      ],
      nina.programId
    );

    await nina.rpc.hubAddRelease(
      hubParams.handle, {
        accounts: {
          authority: provider.wallet.publicKey,
          hub,
          hubRelease,
          hubContent,
          hubCollaborator,
          release: release2,
          systemProgram: anchor.web3.SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        }
      }
    )

    await nina.rpc.hubRemoveRelease(
      hubParams.handle, {
      accounts: {
        payer: provider.wallet.publicKey,
        hub,
        hubRelease,
        hubContent,
        release: release2,
        systemProgram: anchor.web3.SystemProgram.programId,
      }
    })
    await assert.rejects(
      async () => {
        await nina.account.hubRelease.fetch(hubRelease)
      }
    );
  })

  it('Withdraws From the Hub to Hub Authority', async () => {
    let [hubTokenAccount, hubTokenAccountIx] = await findOrCreateAssociatedTokenAccount(
      provider,
      hubSigner,
      anchor.web3.SystemProgram.programId,
      anchor.web3.SYSVAR_RENT_PUBKEY,
      usdcMint,
    );

    const [_hubSigner, hubSignerBump] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from(anchor.utils.bytes.utf8.encode("nina-hub-signer")), hub.toBuffer()],
      nina.programId
    );
    hubSigner = _hubSigner

    const vaultUsdcTokenAccountBefore = await getTokenAccount(
      provider,
      hubTokenAccount,
    );
    const vaultUsdcTokenAccountBeforeBalance = vaultUsdcTokenAccountBefore.amount.toNumber();

    const usdcTokenAccountBefore = await getTokenAccount(
      provider,
      usdcTokenAccount,
    );
    const usdcTokenAccountBeforeBalance = usdcTokenAccountBefore.amount.toNumber();

    const withdrawAmount = vaultUsdcTokenAccountBefore.amount.toNumber();

    await nina.rpc.hubWithdraw(
      new anchor.BN(withdrawAmount),
      hubParams.handle, {
        accounts: {
          authority: provider.wallet.publicKey,
          hub,
          hubSigner,
          withdrawTarget: hubTokenAccount,
          withdrawDestination: usdcTokenAccount,
          withdrawMint: usdcMint,
          tokenProgram: TOKEN_PROGRAM_ID,
        }
      }
    );

    const vaultUsdcTokenAccountAfter = await getTokenAccount(
      provider,
      vaultUsdcTokenAccount,
    );
    const vaultUsdcTokenAccountAfterBalance = vaultUsdcTokenAccountAfter.amount.toNumber();

    assert.ok(vaultUsdcTokenAccountAfterBalance === vaultUsdcTokenAccountBeforeBalance - withdrawAmount)
    const usdcTokenAccountAfter = await getTokenAccount(
      provider,
      usdcTokenAccount,
    );
    const usdcTokenAccountAfterBalance = usdcTokenAccountAfter.amount.toNumber();
    assert.ok(usdcTokenAccountAfterBalance === usdcTokenAccountBeforeBalance + withdrawAmount)
  })

  it('should create a post via hub as authority', async () => {
    const slug = "my_first_post"
    const uri = "arweave:f-VGVpbBqe4p7wWPhjKhGX1hnMJEGQ_eBRlUEQkCjEM"

    const [post, bump] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("nina-post")),
        hub.toBuffer(),
        Buffer.from(anchor.utils.bytes.utf8.encode(slug)),
      ],
      nina.programId,
    );

    const [hubPost, bump] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("nina-hub-post")), 
        hub.toBuffer(),
        post.toBuffer(),
      ],
      nina.programId
    );

    const [hubContent, bump] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("nina-hub-content")), 
        hub.toBuffer(),
        post.toBuffer(),
      ],
      nina.programId
    );

    const [hubCollaborator, bump] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("nina-hub-collaborator")), 
        hub.toBuffer(),
        provider.wallet.publicKey.toBuffer(),
      ],
      nina.programId
    );

    await nina.rpc.postInitViaHub(
      hubParams.handle,
      slug,
      uri, {
        accounts: {
          author: provider.wallet.publicKey,
          hub,
          post,
          hubPost,
          hubContent,
          hubCollaborator,
          systemProgram: anchor.web3.SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        },
      }
    );
    const hubPostAfter = await nina.account.hubPost.fetch(hubPost)
    const postAfter = await nina.account.post.fetch(post)
    assert.equal(postAfter.publishedThroughHub.toBase58(), hub.toBase58())
    assert.equal(encrypt.decode(hubPostAfter.versionUri), uri)
    assert.equal(encrypt.decode(postAfter.uri), uri)
    assert.equal(encrypt.decode(postAfter.slug), slug)
  })  

  it('should not create a post via hub as authority, if slug already exists', async () => {
    const slug = "my_first_post"
    const uri = "arweave:f-VGVpbBqe4p7wWPhjKhGX1hnMJEGQ_eBRlUEQkCjEM"

    const [post, bump] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("nina-post")),
        hub.toBuffer(),
        Buffer.from(anchor.utils.bytes.utf8.encode(slug)),
      ],
      nina.programId,
    );

    const [hubPost, bump] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("nina-hub-post")), 
        hub.toBuffer(),
        post.toBuffer(),
      ],
      nina.programId
    );

    const [hubContent, bump] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("nina-hub-content")), 
        hub.toBuffer(),
        post.toBuffer(),
      ],
      nina.programId
    );

    const [hubCollaborator, bump] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("nina-hub-collaborator")), 
        hub.toBuffer(),
        provider.wallet.publicKey.toBuffer(),
      ],
      nina.programId
    );
    await assert.rejects(
      async () => {
        await nina.rpc.postInitViaHub(
          hubParams.handle,
          slug,
          uri, {
            accounts: {
              author: provider.wallet.publicKey,
              hub,
              post,
              hubPost,
              hubContent,
              hubCollaborator,
              systemProgram: anchor.web3.SystemProgram.programId,
              rent: anchor.web3.SYSVAR_RENT_PUBKEY,
            },
          }
        );
      },
      (err) => {
        return true;
      }
    );
  })  

  let post
  let hubPost
  const slug = "my_first_post_reference"
  it('should create a post via hub as authority with a reference', async () => {
    const uri = "arweave:f-VGVpbBqe4p7wWPhjKhGX1hnMJEGQ_eBRlUEQkCjEM"

    const [_post, bump] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("nina-post")),
        hub.toBuffer(),
        Buffer.from(anchor.utils.bytes.utf8.encode(slug)),
      ],
      nina.programId,
    );
    post = _post
    const [_hubPost, bump] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("nina-hub-post")), 
        hub.toBuffer(),
        post.toBuffer(),
      ],
      nina.programId
    );
    hubPost = _hubPost

    const [_hubContent, bump] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("nina-hub-content")), 
        hub.toBuffer(),
        post.toBuffer(),
      ],
      nina.programId
    );
    hubContent = _hubContent

    const [_hubCollaborator, bump] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("nina-hub-collaborator")), 
        hub.toBuffer(),
        provider.wallet.publicKey.toBuffer(),
      ],
      nina.programId
    );
    hubCollaborator = _hubCollaborator

    await nina.rpc.postInitViaHubWithReferenceContent(
      hubParams.handle,
      slug,
      uri, {
        accounts: {
          author: provider.wallet.publicKey,
          hub,
          post,
          hubPost,
          hubContent,
          hubCollaborator,
          referenceHubContent,
          systemProgram: anchor.web3.SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        },
      }
    );
    const hubPostAfter = await nina.account.hubPost.fetch(hubPost)
    const postAfter = await nina.account.post.fetch(post)
    assert.equal(encrypt.decode(hubPostAfter.versionUri), uri)
    assert.equal(hubPostAfter.referenceHubContent.toBase58(), referenceHubContent.toBase58())
    assert.equal(encrypt.decode(postAfter.uri), uri)
    assert.equal(encrypt.decode(postAfter.slug), slug)
  })  
  
  it('should update a post via hub if author is correct', async () => {
    const updatedUri = "arweave:newURI-slkjslkds,nmsdfsldlwlwl"

    await nina.rpc.postUpdateViaHubPost(
      hubParams.handle,
      slug,
      updatedUri, {
        accounts: {
          author: provider.wallet.publicKey,
          hub,
          post,
          hubPost,
          hubCollaborator,
        }
      }
    )
    const hubPostAfter = await nina.account.hubPost.fetch(hubPost)
    const postAfter = await nina.account.post.fetch(post)
    assert.equal(encrypt.decode(hubPostAfter.versionUri), updatedUri)
    assert.equal(encrypt.decode(postAfter.uri), updatedUri)
  })

  it('should not update a post via hub if author is incorrect', async () => {
    const updatedUri = "arweave:newURI-1234567890987654"

    await assert.rejects(
      async () => {
        await nina.rpc.postUpdateViaHubPost(
          hubParams.handle,
          slug,
          updatedUri, {
            accounts: {
              author: user1.publicKey,
              hub,
              post,
              hubPost,
              hubCollaborator,
            },
            signers: [user1]
          }
        )
      },
      (err) => {
        return true;
      }
    );  
  })
})