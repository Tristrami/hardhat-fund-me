const hre = require("hardhat");
const chai = require("chai");
const helperConfig = require("../../helper-hardhat-config");

const developmentChains = helperConfig.developmentChains;
!developmentChains.includes(hre.network.name)
  ? describe.skip
  : describe("FundMe", function() {
      let fundMe;
      let deployer;
      let mockV3Aggregator;
      const sendValue = hre.ethers.utils.parseUnits("1.0", "ether"); // 1 ETH

      beforeEach(async function() {
        // hre.ethers.getSigners() 可以获取 hardhat-config.networks.[networkName].accounts
        // 获取 hardhat 本地网络的钱包账户
        deployer = (await hre.getNamedAccounts()).deployer;
        // 运行 deploy 目录中 module.exports.tags 为 "all" 的脚本
        await hre.deployments.fixture(["all"]);
        // 获取 FundMe 合约实例
        fundMe = await hre.ethers.getContract("FundMe");
        // 获取 priceFeed
        mockV3Aggregator = await hre.ethers.getContract(
          "MockV3Aggregator",
          deployer
        );
      });

      // 测试构造函数
      describe("constructor", function() {
        it("Sets the aggregator address correctly", async function() {
          const response = await fundMe.getPriceFeed();
          chai.assert.equal(response, mockV3Aggregator.address);
        });
      });

      describe("fund", function() {
        // 未发送足够的 ETH 应报错
        it("Fails if you don't send enough ETH", async function() {
          // 测试函数会不会在某个条件下抛出错误需要使用 expect()
          await chai
            .expect(fundMe.fund())
            .to.be.revertedWith("Didn't send enough");
        });

        // 发送足够 ETH 后应将 funder 的钱包地址正确添加到 s_funders 数组中
        it("Adds funder to array of s_funders", async function() {
          await fundMe.fund({ value: sendValue });
          const funder = await fundMe.getFunder(0);
          chai.assert.equal(funder, deployer);
        });

        // 发送足够 ETH 后应正确更新 s_addressToAmountFunded 中 funder 所对应的 value
        it("Updates the amount funded data structure", async function() {
          await fundMe.fund({ value: sendValue });
          const response = await fundMe.getAddressToAmountFunded(deployer);
          chai.assert.equal(response.toString(), sendValue.toString());
        });
      });

      describe("withdraw", function() {
        beforeEach(async function() {
          await fundMe.fund({ value: sendValue });
        });

        // 应正确退款
        it("Withdraw ETH from a single funder", async function() {
          // 获取 contract 以及 deployer 的初始 balance
          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );
          // 调用 withdraw 函数
          const transactionResponse = await fundMe.withdraw();
          const transactionReceipt = await transactionResponse.wait(1);
          // 获取 gasCost
          const { gasUsed, effectiveGasPrice } = transactionReceipt;
          const gasCost = gasUsed.mul(effectiveGasPrice);
          // 获取 contract 以及 deployer 在执行 withdraw() 之后的 balance
          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );
          // Assert
          chai.assert.equal(endingFundMeBalance, 0);
          chai.assert.equal(
            startingFundMeBalance.add(startingDeployerBalance).toString(),
            endingDeployerBalance.add(gasCost).toString()
          );
        });

        it("Allows us to withdraw with multiple funders", async function() {
          const accounts = await hre.ethers.getSigners();
          // 遍历所有账户，让他们分别连上 fundMe 合约调用 fund() 函数发送 eth，第一个账户是
          // 合约部署者，所以要从第二个账户开始遍历
          for (let i = 1; i < 6; i++) {
            const fundMeConnectedContract = await fundMe.connect(accounts[i]);
            await fundMeConnectedContract.fund({ value: sendValue });
          }

          // 获取 contract 以及 deployer 的初始 balance
          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );
          // 获取 gasCost
          const transactionResponse = await fundMe.withdraw();
          const transactionReceipt = await transactionResponse.wait(1);
          const { gasUsed, effectiveGasPrice } = transactionReceipt;
          const gasCost = gasUsed.mul(effectiveGasPrice);
          // 获取 contract 以及 deployer 在执行 withdraw() 之后的 balance
          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );
          // Assert
          // - 合约账户清零
          chai.assert.equal(endingFundMeBalance, 0);
          // - deployer 账户除了花费了 gasFee 之外无变化
          chai.assert.equal(
            startingFundMeBalance.add(startingDeployerBalance).toString(),
            endingDeployerBalance.add(gasCost).toString()
          );
          // - fundMe 中的 s_funders 数组已被初始化
          await chai.expect(fundMe.getFunder(0)).to.be.reverted;
          // - s_addressToAmountFunded 中各个调用了 fund() 函数的账户的地址所对应的捐款数清零
          for (let i = 1; i < 6; i++) {
            chai.assert.equal(
              await fundMe.getAddressToAmountFunded(accounts[i].address),
              0
            );
          }
        });

        // 非合约部署者不可以调用 withdraw() 函数
        it("Only allows the owner to withdraw", async function() {
          const accounts = await hre.ethers.getSigners();
          const attacker = accounts[1];
          const attackerConnectedContract = await fundMe.connect(attacker);
          await chai
            .expect(attackerConnectedContract.withdraw())
            .to.be.revertedWithCustomError(
              attackerConnectedContract,
              "FundMe__NotOwner"
            );
        });

        it("cheaperWithdraw testing (single account) ...", async function() {
          // 获取 contract 以及 deployer 的初始 balance
          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );
          // 调用 withdraw 函数
          const transactionResponse = await fundMe.cheaperWithdraw();
          const transactionReceipt = await transactionResponse.wait(1);
          // 获取 gasCost
          const { gasUsed, effectiveGasPrice } = transactionReceipt;
          const gasCost = gasUsed.mul(effectiveGasPrice);
          // 获取 contract 以及 deployer 在执行 withdraw() 之后的 balance
          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );
          // Assert
          chai.assert.equal(endingFundMeBalance, 0);
          chai.assert.equal(
            startingFundMeBalance.add(startingDeployerBalance).toString(),
            endingDeployerBalance.add(gasCost).toString()
          );
        });

        it("cheaperWithdraw testing (multi accounts) ...", async function() {
          const accounts = await hre.ethers.getSigners();
          // 遍历所有账户，让他们分别连上 fundMe 合约调用 fund() 函数发送 eth，第一个账户是
          // 合约部署者，所以要从第二个账户开始遍历
          for (let i = 1; i < 6; i++) {
            const fundMeConnectedContract = await fundMe.connect(accounts[i]);
            await fundMeConnectedContract.fund({ value: sendValue });
          }

          // 获取 contract 以及 deployer 的初始 balance
          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );
          // 获取 gasCost
          const transactionResponse = await fundMe.cheaperWithdraw();
          const transactionReceipt = await transactionResponse.wait(1);
          const { gasUsed, effectiveGasPrice } = transactionReceipt;
          const gasCost = gasUsed.mul(effectiveGasPrice);
          // 获取 contract 以及 deployer 在执行 withdraw() 之后的 balance
          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );
          // Assert
          // - 合约账户清零
          chai.assert.equal(endingFundMeBalance, 0);
          // - deployer 账户除了花费了 gasFee 之外无变化
          chai.assert.equal(
            startingFundMeBalance.add(startingDeployerBalance).toString(),
            endingDeployerBalance.add(gasCost).toString()
          );
          // - fundMe 中的 s_funders 数组已被初始化
          await chai.expect(fundMe.getFunder(0)).to.be.reverted;
          // - s_addressToAmountFunded 中各个调用了 fund() 函数的账户的地址所对应的捐款数清零
          for (let i = 1; i < 6; i++) {
            chai.assert.equal(
              await fundMe.getAddressToAmountFunded(accounts[i].address),
              0
            );
          }
        });
      });
    });
