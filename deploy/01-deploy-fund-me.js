// 等价于:
// const helperConfig = require(../helper-hardhat-config);
// const networkConfig = helperConfig.networkConfig;
const { networkConfig, developmentChains } = require("../helper-hardhat-config");
const { network } = require("hardhat");
const { verify } = require("../utils/VerifyUtils");

// 从 hre 获得 getNamedAccounts, deployments 函数
module.exports = async ({ getNamedAccounts, deployments }) => {

  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  // * 获取 priceFeed 的合约地址
  let ethUsdPriceFeedAddress;
  // 如果使用本地网络，就使用 MockV3Aggregator 作为 priceFeed，如果不是，就使用 networkConfig
  // 中我们为不同网络配置的 priceFeed 的 contract 地址
  if (developmentChains.includes(network.name)) {
    // 如果正在使用本地网络，那就先部署 MockV3Aggregator，并将其地址作为 priceFeed 合约的地址
    const ethUsdAggregator = await deployments.get("MockV3Aggregator");
    ethUsdPriceFeedAddress = ethUsdAggregator.address;
  } else {
    // 如果是非本地网络，那么直接使用 networkConfig 中配置的该网络对应的 priceFeed 合约的地址
    ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeedAddress"];
  }

  const args = [ethUsdPriceFeedAddress];

  // * 部署 FundMe.sol
  const fundMe = await deploy("FundMe", {
    contract: "FundMe",
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });
  log("----------------------------------------------------");

  // * 当处在非本地网络时进行 verify and publish
  if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
    await /* A function that verifies the contract on Etherscan. */
    verify(fundMe.address, args);
  }
}
// 我们使用 yarn hardhat node 启动本地网络时 hardhat 会自动运行我们的部署脚本

module.exports.tags = ["all", "fundme"];