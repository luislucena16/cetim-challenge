require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
const config = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    fuji: {
      url:
        process.env.FUJI_RPC_URL ||
        "https://avalanche-fuji-c-chain-rpc.publicnode.com",
      gasPrice: 225000000000,
      chainId: 43113,
      accounts: process.env.FUJI_PRIVATE_KEY
        ? [process.env.FUJI_PRIVATE_KEY]
        : [],
    },
  },
};

module.exports = config;
