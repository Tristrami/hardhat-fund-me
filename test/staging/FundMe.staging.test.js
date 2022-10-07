const hre = require("hardhat");
const helperConfig = require("../../helper-hardhat-config");
const chai = require("chai");

const developmentChains = helperConfig.developmentChains;
developmentChains.includes(hre.network.name)
  ? describe.skip
  : describe("FundMe", async function() {
      let fundMe;
      let deployer;
      const sendValue = hre.ethers.utils.parseEther("0.02");

      beforeEach(async function() {
        deployer = await hre.getNamedAccounts().deployer;
        fundMe = await hre.ethers.getContract("FundMe", deployer);
      });

      it("allows people to fund and withdraw", async function () {
        await fundMe.fund({ value: sendValue });
        await fundMe.withdraw();
        const endingBalance = await fundMe.provider.getBalance(fundMe.address);
        chai.assert.equal(endingBalance.toString(), "0");
      })
    });
