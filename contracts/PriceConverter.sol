// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

library PriceConverter
{
    function getPrice(AggregatorV3Interface priceFeed) internal view returns (uint256)
    {
        // ABI 
        // Address 0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e
        // 使用 chainlink 获取 eth 的mei yuan
        (, int256 price, , ,) = priceFeed.latestRoundData();

        // solidity 中没有浮点数，所以用整型变量保存浮点数的整数位和小数位
        // 这里得到的 price 的值为 145598000000，实际值为 1455.98
        // 这里得到的 price 有 8 位小数，msg.value 的单位是 wei，有 18 位数，
        // 所以这里增加一下 price 的小数位数方便计算
        price *= 1e10;
        return uint256(price);
    }

    function getConversionRate(uint256 ethAmount, AggregatorV3Interface priceFeed) internal view returns (uint256)
    {
        uint256 ethPrice = getPrice(priceFeed);
        // ethPrice 和 ethAmount 各有 18 位小数，相乘后有 36 位小数，所以要除去 18 位小数
        uint256 ethAmountInUsd = (ethPrice * ethAmount) / 1e18;
        return ethAmountInUsd;
    }
}