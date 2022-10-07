// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/* solidity 变量存储位置参考:
    https://docs.soliditylang.org/en/v0.8.13/types.html#data-location-and-assignment-behaviour
    https://docs.soliditylang.org/en/v0.8.13/types.html#reference-types
    https://docs.soliditylang.org/en/v0.8.13/internals/layout_in_storage.html
    https://twitter.com/Web3Oscar/status/1514509414501343234
    https://twitter.com/PatrickAlphaC/status/1514257121302429696 */

contract StorageTest
{
    // contract 的全局变量存储在 storage 中
    uint256 public number; // 存储在 storage 的 slot0
    bool public someBool; // 存储在 storage 的 slot1
    uint256[] public array; /* array 的长度存储在 storage 的 slot2，数组中的第一个元素
    存储在 keccack256("2") 这个位置（2 是因为 slot2），后续的元素依次往下存储 */
    mapping(uint256 => uint256) public myMap; /* slot3 会留空来标识这个 slot 存储的是 map，
    map 中的元素的存储位置使用 keccack256(h(k) * p) 来决定，其中: 
    - p: storage slot，这里是 3
    - k: key 的十六进制表示形式
    - h: 根据类型不同有不同的函数 */

    /* constant 和 immutable 类型的变量不存储在 storage 中，constant 变量会被编译到 abi 中，
       在使用到时直接替换为 = 号后面的表达式，所以 constant 类型的变量必须声明时就初始化 */
    uint256 public constant CONSTANCT = 0x40;
    uint256 public immutable i_immutable;

    constructor()
    {
        number = 0x10;
        someBool = true;
        array.push(0x20);
        myMap[0x100] = 0x101;
        i_immutable = 0x30;
    }

    function doSomething() public pure
    {
        // 函数中的变量会被存储在 memory 中
        uint256 val;
    }
}