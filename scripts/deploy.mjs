import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const Identity = await ethers.getContractFactory("IdentityContract");
  const identity = await Identity.deploy();
  await identity.deployed();
  console.log("IdentityContract deployed at:", identity.address);

  const Consent = await ethers.getContractFactory("ConsentContract");
  const consent = await Consent.deploy();
  await consent.deployed();
  console.log("ConsentContract deployed at:", consent.address);

  const Incentive = await ethers.getContractFactory("IncentiveContract");
  const incentive = await Incentive.deploy();
  await incentive.deployed();
  console.log("IncentiveContract deployed at:", incentive.address);
}

main().catch(console.error);
