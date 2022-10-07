// 在本地网络上进行测试时，需要自己写一个 AggregatorV3Interface 的实现合约，这里直接 import
// chainlink 的 github repo 上的 MockV3Aggregator.sol
// https://github.com/smartcontractkit/chainlink/blob/develop/contracts/src/v0.6/tests/MockV3Aggregator.sol

// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "@chainlink/contracts/src/v0.6/tests/MockV3Aggregator.sol";