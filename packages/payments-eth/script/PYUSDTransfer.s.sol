// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {IERC20} from "../src/IERC20.sol";

contract PYUSDTransferScript is Script {
    // PYUSD contract address on Sepolia testnet
    address constant PYUSD_CONTRACT = 0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9;
    
    // Your wallet address
    address constant YOUR_WALLET = 0x0D181A6daA62c7a8180d1B6FdF54C8fd20942E68;
    
    // Amount to transfer (0.1 PYUSD - PYUSD has 6 decimals)
    uint256 constant TRANSFER_AMOUNT = 10**5; // 0.1 PYUSD

    function setUp() public {}

    function run() public {
        // Get the PYUSD contract instance
        IERC20 pyusd = IERC20(PYUSD_CONTRACT);
        
        // Check current balance before transfer
        uint256 balanceBefore = pyusd.balanceOf(YOUR_WALLET);
        console.log("PYUSD Balance before transfer:", balanceBefore / 10**6, "PYUSD");
        
        // Start broadcasting transactions
        vm.startBroadcast();
        
        // Transfer PYUSD to yourself (this will test the transaction)
        bool success = pyusd.transfer(YOUR_WALLET, TRANSFER_AMOUNT);
        require(success, "Transfer failed");
        
        vm.stopBroadcast();
        
        // Check balance after transfer (should be the same since it's a self-transfer)
        uint256 balanceAfter = pyusd.balanceOf(YOUR_WALLET);
        console.log("PYUSD Balance after transfer:", balanceAfter / 10**6, "PYUSD");
        
        console.log("Successfully transferred", TRANSFER_AMOUNT / 10**6, "PYUSD to yourself!");
        console.log("Transaction completed successfully");
    }
    
    // Function to check balance only (no transaction)
    function checkBalance() public view {
        IERC20 pyusd = IERC20(PYUSD_CONTRACT);
        uint256 balance = pyusd.balanceOf(YOUR_WALLET);
        console.log("Current PYUSD Balance:", balance / 10**6, "PYUSD");
        console.log("Raw balance (with 6 decimals):", balance);
    }
} 