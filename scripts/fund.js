const hre = require("hardhat");

async function main()
{
  const deployer = await hre.getNamedAccounts().deployer;
  const fundMe = await hre.ethers.getContract("FundMe", deployer);
  console.log("Funding contract ...");
  const transactionResponse = await fundMe.fund({
    value: hre.ethers.utils.parseEther("0.1")
  });
  await transactionResponse.wait(1);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.log(e);
    process.exit(1);
  })