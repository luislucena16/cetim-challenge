import hardhat from "hardhat";
import dotenv from "dotenv";

dotenv.config();
const { ethers } = hardhat;

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with", deployer.address);

  const Registry = await ethers.getContractFactory("ProductRegistry");
  const registry = await Registry.deploy();
  await registry.waitForDeployment();

  console.log("ProductRegistry deployed to:", await registry.getAddress());
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
