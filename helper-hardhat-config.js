const networkConfig = {
  // chainId => config
  // goerli
  5: {
    name: "goerli",
    ethUsdPriceFeedAddress: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e",
  },
  // polygon
  137: {
    name: "polygon",
    ethUsdPriceFeedAddress: "0xF9680D99D6C9589e2a93a78A04A279e509205945",
  }
}

// 用于测试的网络
const developmentChains = ["hardhat", "localhost"];
// 构造 MockV3Aggregator 的两个参数
const DECIMALS = 8;
const INITIAL_ANSWERS = 200000000000;

module.exports = {
  networkConfig,
  developmentChains,
  DECIMALS,
  INITIAL_ANSWERS,
}