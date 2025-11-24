import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm, deployments } from "hardhat";
import { EncryptedSoilMoisture } from "../types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  alice: HardhatEthersSigner;
};

describe("EncryptedSoilMoistureSepolia", function () {
  let signers: Signers;
  let contract: EncryptedSoilMoisture;
  let contractAddress: string;
  let step: number;
  let steps: number;

  function progress(message: string) {
    console.log(`${++step}/${steps} ${message}`);
  }

  before(async function () {
    if (fhevm.isMock) {
      console.warn(`This hardhat test suite can only run on Sepolia Testnet`);
      this.skip();
    }

    try {
      const EncryptedSoilMoistureDeployment = await deployments.get("EncryptedSoilMoisture");
      contractAddress = EncryptedSoilMoistureDeployment.address;
      contract = await ethers.getContractAt("EncryptedSoilMoisture", EncryptedSoilMoistureDeployment.address);
    } catch (e) {
      (e as Error).message += ". Call 'npx hardhat deploy --network sepolia'";
      throw e;
    }

    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { alice: ethSigners[0] };
  });

  beforeEach(async () => {
    step = 0;
    steps = 0;
  });

  it("record and update soil moisture value", async function () {
    steps = 10;

    this.timeout(4 * 40000);

    progress("Encrypting moisture value '65'...");
    const encryptedMoisture1 = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .add32(65)
      .encrypt();

    progress(
      `Call recordSoilMoisture(65) EncryptedSoilMoisture=${contractAddress} handle=${ethers.hexlify(encryptedMoisture1.handles[0])} signer=${signers.alice.address}...`,
    );
    let tx = await contract
      .connect(signers.alice)
      .recordSoilMoisture(encryptedMoisture1.handles[0], encryptedMoisture1.inputProof);
    await tx.wait();

    progress(`Call EncryptedSoilMoisture.getEncryptedSoilMoisture()...`);
    const encryptedMoistureBefore = await contract.getEncryptedSoilMoisture(signers.alice.address);
    expect(encryptedMoistureBefore).to.not.eq(ethers.ZeroHash);

    progress(`Decrypting EncryptedSoilMoisture.getEncryptedSoilMoisture()=${encryptedMoistureBefore}...`);
    const clearMoistureBefore = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedMoistureBefore,
      contractAddress,
      signers.alice,
    );
    progress(`Clear EncryptedSoilMoisture.getEncryptedSoilMoisture()=${clearMoistureBefore}`);

    expect(clearMoistureBefore).to.eq(65);

    progress(`Encrypting moisture value '75'...`);
    const encryptedMoisture2 = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .add32(75)
      .encrypt();

    progress(
      `Call recordSoilMoisture(75) EncryptedSoilMoisture=${contractAddress} handle=${ethers.hexlify(encryptedMoisture2.handles[0])} signer=${signers.alice.address}...`,
    );
    tx = await contract.connect(signers.alice).recordSoilMoisture(encryptedMoisture2.handles[0], encryptedMoisture2.inputProof);
    await tx.wait();

    progress(`Call EncryptedSoilMoisture.getEncryptedSoilMoisture()...`);
    const encryptedMoistureAfter = await contract.getEncryptedSoilMoisture(signers.alice.address);

    progress(`Decrypting EncryptedSoilMoisture.getEncryptedSoilMoisture()=${encryptedMoistureAfter}...`);
    const clearMoistureAfter = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedMoistureAfter,
      contractAddress,
      signers.alice,
    );
    progress(`Clear EncryptedSoilMoisture.getEncryptedSoilMoisture()=${clearMoistureAfter}`);

    expect(clearMoistureAfter).to.eq(75);
    expect(clearMoistureAfter - clearMoistureBefore).to.eq(10);
  });
});

