// const hre = require("hardhat");
// const hardhatHelper = require("../helper-hardhat-config");
// const verifyUtils = require("../utils/VerifyUtils");
// require("dotenv").config();

// module.exports = async function ({ getNamedAccounts, deployments }) {

//   const { deploy, log } = deployments;
//   const { deployer } = await getNamedAccounts();

//   log("Deploying contract ...");
//   const storageTest = await deploy("StorageTest", {
//     from: deployer,
//     args: [],
//     log: true,
//     waitConfirmations: hre.network.config.blockConfirmation || 1
//   });

//   if (!hardhatHelper.developmentChains.includes(hre.network.name) && process.env.ETHERSCAN_API_KEY) {
//     await verifyUtils.verify(storageTest.address);
//   }

//   log("Logging storage ...");
//   for (let i = 0; i < 5; i++) {
//     log(`Slot${i}: ${await hre.ethers.provider.getStorageAt(storageTest.address, i)}`);
//   }

//   const location = hre.ethers.utils.keccak256("0x0000000000000000000000000000000000000000000000000000000000000002");
//   const element = await hre.ethers.provider.getStorageAt(storageTest.address, location);
//   log(`The first element of array is ${element}`);
// };

// module.exports.tags = ["storage-test"];