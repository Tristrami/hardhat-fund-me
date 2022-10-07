const { network } = require("hardhat");
const { 
  developmentChains, 
  DECIMALS, 
  INITIAL_ANSWERS 
} = require("../helper-hardhat-config");

module.exports = async ({ getNamedAccounts, deployments }) => {

  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  // 如果当前的网络是本地网络，那么就将 MockV3Aggregator 部署到本地网络上，使用 MockV3Aggregator 来获取 ethPrice
  if (developmentChains.includes(network.name)) {
    log("Local network detected! Deploying mocks ...");
    await deploy("MockV3Aggregator", {
      contract: "MockV3Aggregator",
      from: deployer,
      log: true,
      args: [DECIMALS, INITIAL_ANSWERS]
    });
    log("Mocks deployed!")
    log("----------------------------------------------------")
  }
}

module.exports.tags = ["all", "mocks"];