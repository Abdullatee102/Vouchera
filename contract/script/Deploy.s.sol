// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script, console} from "lib/forge-std/src/Script.sol";
import {Vouchera} from "../src/Vouchera.sol";

/// @title Vouchera Deployment Script
/// @notice Deploy the Vouchera protocol to Bohr Testnet (Chain ID: 968)
/// @dev Uses PRIVATE_KEY from environment. Deployer becomes Protocol Admin.
contract DeployVouchera is Script {
    // Organization creation threshold: 10 activity points required
    uint256 constant CREATION_THRESHOLD = 10;

    function run() external returns (Vouchera vouchera) {
        // Load private key from environment (never hardcoded)
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("=================================================");
        console.log("  Vouchera Protocol Deployment");
        console.log("=================================================");
        console.log("  Deployer (Protocol Admin):", deployer);
        console.log("  Network: Bohr Testnet (Chain ID: 968)");
        console.log("  Organization Creation Threshold:", CREATION_THRESHOLD);
        console.log("=================================================");

        vm.startBroadcast(deployerPrivateKey);

        vouchera = new Vouchera(deployer, CREATION_THRESHOLD);

        vm.stopBroadcast();

        console.log("");
        console.log("  DEPLOYMENT SUCCESSFUL");
        console.log("=================================================");
        console.log("  Contract:       ", address(vouchera));
        console.log("  Protocol Admin: ", deployer);
        console.log("  Threshold:      ", CREATION_THRESHOLD);
        console.log("  Explorer:       https://scan.bohr.life/address/", address(vouchera));
        console.log("=================================================");
    }
}

