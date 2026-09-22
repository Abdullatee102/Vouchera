// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Script, console2} from "forge-std/Script.sol";
import {Vouchera} from "../src/Vouchera.sol";

contract InteractE2E is Script {
    address constant CONTRACT_ADDR = 0xCad5b0572f4bD9732d26B319530254b477dA9711;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console2.log("Running E2E On-Chain Interaction on Bohr Testnet...");
        console2.log("Caller:", deployer);

        Vouchera vouchera = Vouchera(payable(CONTRACT_ADDR));

        vm.startBroadcast(deployerPrivateKey);

        // 1. Grant activity score to deployer to become eligible for organization creation
        vouchera.recordActivity(deployer, 50);
        console2.log("Activity recorded for deployer. Score:", vouchera.activityScore(deployer));
        console2.log("Eligible to create Org:", vouchera.isEligibleToCreateOrganization(deployer));

        // 2. Create Organization
        uint256 orgId = vouchera.createOrganization(
            "Global Food Relief",
            "Emergency food subsidy programs for vulnerable communities."
        );
        console2.log("Organization created with ID:", orgId);

        // 3. Create Program
        bytes32 foodCategory = keccak256("FOOD");
        uint256 programId = vouchera.createProgram(
            orgId,
            "Community Food Subsidy 2026",
            "Subsidized groceries and essential nutrition support.",
            foodCategory,
            uint64(block.timestamp),
            uint64(block.timestamp + 90 days)
        );
        console2.log("Program created with ID:", programId);

        // 4. Fund Program with native BOT (0.05 BOT)
        vouchera.fundProgram{value: 0.05 ether}(orgId, programId);
        console2.log("Program funded with 0.05 BOT");

        // 5. Activate Program
        vouchera.activateProgram(orgId, programId);
        console2.log("Program activated!");

        // 6. Approve Merchant
        address merchantAddr = address(0x1111111111111111111111111111111111111111);
        vouchera.approveMerchant(orgId, merchantAddr, "FreshMart Groceries", foodCategory);
        console2.log("Merchant approved:", merchantAddr);

        // 7. Approve Distinct Beneficiary
        address beneficiaryAddr = address(0x2222222222222222222222222222222222222222);
        vouchera.approveBeneficiary(orgId, beneficiaryAddr);
        console2.log("Beneficiary approved:", beneficiaryAddr);

        // 8. Issue Voucher (0.02 BOT) to Beneficiary
        uint256 voucherId = vouchera.issueVoucher(
            orgId,
            programId,
            beneficiaryAddr,
            0.02 ether,
            uint64(block.timestamp + 30 days),
            address(0) // Any approved food merchant
        );
        console2.log("Voucher issued with ID:", voucherId);

        vm.stopBroadcast();

        console2.log("=========================================");
        console2.log("E2E ON-CHAIN SETUP & VERIFICATION COMPLETED!");
        console2.log("=========================================");
    }
}

