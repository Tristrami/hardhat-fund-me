// 我们可以自己写 task，然后在 hardhat.config.js 中使用 require("./tasks/block-number.js")
// 导入我们写的 js 文件，hardhat 会自动检测到其中的 task，把他们加入到 task 列表中

// 导入 hardhat/config 才能使用 task() 函数来注册 task
const { task } = require("hardhat/config");

task("block-number", "Prints the current block number")
  .setAction(
    async (taskArgs, hre) => { // hre: hard hat running environment
      const blockNumber = await hre.ethers.provider.getBlockNumber();
      console.log(`Current block number ${blockNumber}`);
    }
  );

module.exports = {};