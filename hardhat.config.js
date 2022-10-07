require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
require("@nomiclabs/hardhat-etherscan");
require("./tasks/block-number");
require("./tasks/accounts");
require("hardhat-gas-reporter");
require("@typechain/hardhat");
require("hardhat-deploy");

/** @type import('hardhat/config').HardhatUserConfig */

const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL || "https://eth-goerli";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "0xkey";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "key";
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || "key";

module.exports = {
  // `hardhat` 这个网络在 run 命令结束后就没了，生命周期仅限于程序运行时
  defaultNetwork: "hardhat",

  // 配置 blockchain
  networks: {
    goerli: {
      // RPC-URL
      url: GOERLI_RPC_URL,
      // PRIVATE_KEYS
      accounts: [PRIVATE_KEY],
      chainId: 5,
      // 等待 6 个 block 确认，这是为了给 etherscan 一点时间来 index 我们的 transaction
      blockConfirmations: 6,
    },
    // 使用 `hardhat node` 命令启动的本地网络
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337
    }
  },

  // 配置多个版本的 solidity 编译器
  solidity: {
    compilers: [
      { version: "0.8.17" },
      { version: "0.6.6" },
    ]
  },
  
  // 使用 hardhat 验证合约: https://hardhat.org/hardhat-runner/plugins/nomiclabs-hardhat-etherscan
  // 这里有个巨坑: 
  // 1. 先解析 api-goerli.etherscan.io 对应的 ip 存到 hosts 文件中（域名解析: https://url5.co/?t=1636355893）
  // 2. 然后在 etherscan 中使用 customChains 配置 goerli 网络，将 api 的 url 配置为 HTTP 协议
  // 3. 使用 clashx 打开命令行代理
  etherscan: {
    apiKey: {
      goerli: ETHERSCAN_API_KEY,
    },
    customChains: [
      {
        network: "goerli",
        chainId: 5,
        urls: {
          apiURL: "http://api-goerli.etherscan.io/api", // HTTPS => HTTP
          browserURL: "https://goerli.etherscan.io"
        }
      }
    ],
  },

  // 配置 hardhat-gas-reporter，在使用 yarn hardhat test 进行测试时会自动打印 gas 报告
  // doc: https://www.npmjs.com/package/hardhat-gas-reporter
  gasReporter: {
    enabled: true,
    // 将 gas 报告输出到文件中
    outputFile: "gas-report.txt",
    // 输出到文件中不关闭颜色可能会乱七八糟
    noColors: true,
    // 获取 eth 对应的美元数
    currency: "USD",
    // 这里通过使用 coinmarketcap 的 API 来执行 eth 兑换美元
    coinmarketcap: COINMARKETCAP_API_KEY,
    // 通过指定 token 来指定获取哪个 blockchain 的 gasPrice，这里以 polygon 为例
    token: "ETH",
  },

  // 给账户起名字
  namedAccounts: {
    deployer: {
      default: 0,
    }
  }
};