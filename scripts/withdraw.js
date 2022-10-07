const hre = require("hardhat");

async function main()
{
  const deployer = await hre.getNamedAccounts().deployer;
  const fundMe = await hre.ethers.getContract("FundMe", deployer);
  const transactionResponse = await fundMe.withdraw();
  await transactionResponse.wait(1);
  console.log("Got it back!");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.log(e);
    process.exit(1);
  })