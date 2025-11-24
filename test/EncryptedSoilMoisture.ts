import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm } from "hardhat";
import { EncryptedSoilMoisture, EncryptedSoilMoisture__factory } from "../types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
};

async function deployFixture() {
  const factory = (await ethers.getContractFactory("EncryptedSoilMoisture")) as EncryptedSoilMoisture__factory;
  const contract = (await factory.deploy()) as EncryptedSoilMoisture;
  const contractAddress = await contract.getAddress();

  return { contract, contractAddress };
}

describe("EncryptedSoilMoisture", function () {
  let signers: Signers;
  let contract: EncryptedSoilMoisture;
  let contractAddress: string;

  before(async function () {
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { deployer: ethSigners[0], alice: ethSigners[1], bob: ethSigners[2] };
  });

  beforeEach(async function () {
    // Check whether the tests are running against an FHEVM mock environment
    if (!fhevm.isMock) {
      console.warn(`This hardhat test suite cannot run on Sepolia Testnet`);
      this.skip();
    }

    ({ contract, contractAddress } = await deployFixture());
  });

  it("encrypted moisture should be uninitialized after deployment", async function () {
    const hasInit = await contract.hasInitialized(signers.alice.address);
    expect(hasInit).to.be.false;
  });

  it("record soil moisture value", async function () {
    const clearMoisture = 65; // 65% moisture

    // Encrypt moisture value as a euint32
    const encryptedMoisture = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .add32(clearMoisture)
      .encrypt();

    const tx = await contract
      .connect(signers.alice)
      .recordSoilMoisture(encryptedMoisture.handles[0], encryptedMoisture.inputProof);
    await tx.wait();

    const hasInit = await contract.hasInitialized(signers.alice.address);
    expect(hasInit).to.be.true;

    const encryptedMoistureValue = await contract.getEncryptedSoilMoisture(signers.alice.address);
    const clearMoistureValue = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedMoistureValue,
      contractAddress,
      signers.alice,
    );

    expect(clearMoistureValue).to.eq(clearMoisture);
  });

  it("update soil moisture value", async function () {
    const clearMoisture1 = 60;
    const clearMoisture2 = 75;

    // First record
    const encryptedMoisture1 = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .add32(clearMoisture1)
      .encrypt();

    let tx = await contract
      .connect(signers.alice)
      .recordSoilMoisture(encryptedMoisture1.handles[0], encryptedMoisture1.inputProof);
    await tx.wait();

    // Update with new value
    const encryptedMoisture2 = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .add32(clearMoisture2)
      .encrypt();

    tx = await contract
      .connect(signers.alice)
      .recordSoilMoisture(encryptedMoisture2.handles[0], encryptedMoisture2.inputProof);
    await tx.wait();

    const encryptedMoistureValue = await contract.getEncryptedSoilMoisture(signers.alice.address);
    const clearMoistureValue = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedMoistureValue,
      contractAddress,
      signers.alice,
    );

    expect(clearMoistureValue).to.eq(clearMoisture2);
  });

  it("users have separate moisture data", async function () {
    const aliceMoisture = 65;
    const bobMoisture = 80;

    // Alice records
    const encryptedAlice = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .add32(aliceMoisture)
      .encrypt();

    let tx = await contract
      .connect(signers.alice)
      .recordSoilMoisture(encryptedAlice.handles[0], encryptedAlice.inputProof);
    await tx.wait();

    // Bob records
    const encryptedBob = await fhevm
      .createEncryptedInput(contractAddress, signers.bob.address)
      .add32(bobMoisture)
      .encrypt();

    tx = await contract
      .connect(signers.bob)
      .recordSoilMoisture(encryptedBob.handles[0], encryptedBob.inputProof);
    await tx.wait();

    // Verify Alice's data
    const aliceEncrypted = await contract.getEncryptedSoilMoisture(signers.alice.address);
    const aliceClear = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      aliceEncrypted,
      contractAddress,
      signers.alice,
    );
    expect(aliceClear).to.eq(aliceMoisture);

    // Verify Bob's data
    const bobEncrypted = await contract.getEncryptedSoilMoisture(signers.bob.address);
    const bobClear = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      bobEncrypted,
      contractAddress,
      signers.bob,
    );
    expect(bobClear).to.eq(bobMoisture);
  });
});

