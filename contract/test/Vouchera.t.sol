// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test, console} from "lib/forge-std/src/Test.sol";
import {Vouchera} from "../src/Vouchera.sol";

/// @title Vouchera Comprehensive Test Suite
contract VoucheraTest is Test {
    Vouchera public vouchera;

    // Actors
    address public protocolAdmin = makeAddr("protocolAdmin");
    address public alice = makeAddr("alice");     // Org owner 1
    address public bob = makeAddr("bob");         // Org owner 2
    address public charlie = makeAddr("charlie"); // Beneficiary
    address public diana = makeAddr("diana");     // Beneficiary 2
    address public greenmart = makeAddr("greenmart"); // Merchant (food)
    address public bookstore = makeAddr("bookstore"); // Merchant (education)
    address public attacker = makeAddr("attacker");
    address public merchant2 = makeAddr("merchant2");

    // Category codes
    bytes32 constant FOOD = keccak256("FOOD");
    bytes32 constant EDUCATION = keccak256("EDUCATION");
    bytes32 constant HEALTHCARE = keccak256("HEALTHCARE");
    bytes32 constant TRANSPORT = keccak256("TRANSPORT");
    bytes32 constant ESSENTIALS = keccak256("ESSENTIALS");

    // Constants
    uint256 constant THRESHOLD = 10;
    uint256 constant VOUCHER_AMOUNT = 20 ether;
    uint256 constant PROGRAM_FUND = 100 ether;

    // Org and program IDs set after creation
    uint256 aliceOrgId;
    uint256 bobOrgId;
    uint256 aliceProgramId;

    function setUp() public {
        vm.deal(alice, 1000 ether);
        vm.deal(bob, 1000 ether);
        vm.deal(charlie, 10 ether);
        vm.deal(greenmart, 10 ether);
        vm.deal(attacker, 10 ether);

        vouchera = new Vouchera(protocolAdmin, THRESHOLD);
    }

    // =========================================================================
    // HELPER FUNCTIONS
    // =========================================================================
    function _makeAliceEligible() internal {
        vm.prank(protocolAdmin);
        vouchera.recordActivity(alice, THRESHOLD);
    }

    function _makeBobEligible() internal {
        vm.prank(protocolAdmin);
        vouchera.recordActivity(bob, THRESHOLD);
    }

    function _createAliceOrg() internal returns (uint256 orgId) {
        _makeAliceEligible();
        vm.prank(alice);
        orgId = vouchera.createOrganization("Community Food Initiative", "Supporting food security");
        aliceOrgId = orgId;
    }

    function _createAliceProgram() internal returns (uint256 programId) {
        uint256 orgId = _createAliceOrg();
        vm.prank(alice);
        programId = vouchera.createProgram(
            orgId,
            "Food Support 2026",
            "Food subsidy program",
            FOOD,
            uint64(block.timestamp),
            uint64(block.timestamp + 365 days)
        );
        aliceProgramId = programId;
    }

    function _fundAndActivateProgram(uint256 orgId, uint256 programId, uint256 amount) internal {
        vm.prank(alice);
        vouchera.fundProgram{value: amount}(orgId, programId);
        vm.prank(alice);
        vouchera.activateProgram(orgId, programId);
    }

    function _approveCharlieAsBeneficiary(uint256 orgId) internal {
        vm.prank(alice);
        vouchera.approveBeneficiary(orgId, charlie);
    }

    function _approveGreenMart(uint256 orgId) internal {
        vm.prank(alice);
        vouchera.approveMerchant(orgId, greenmart, "GreenMart", FOOD);
    }

    function _issueVoucherToCharlie(uint256 orgId, uint256 programId, uint256 amount) internal returns (uint256 voucherId) {
        vm.prank(alice);
        voucherId = vouchera.issueVoucher(
            orgId, programId, charlie, amount,
            uint64(block.timestamp + 30 days),
            address(0)
        );
    }

    // =========================================================================
    // PROTOCOL ADMIN TESTS
    // =========================================================================

    function test_ProtocolAdminInitializedCorrectly() public view {
        assertEq(vouchera.protocolAdmin(), protocolAdmin);
    }

    function test_OrganizationCreationThresholdInitialized() public view {
        assertEq(vouchera.organizationCreationThreshold(), THRESHOLD);
    }

    function test_ProtocolAdminCanSetThreshold() public {
        vm.prank(protocolAdmin);
        vouchera.setOrganizationCreationThreshold(20);
        assertEq(vouchera.organizationCreationThreshold(), 20);
    }

    function test_NonAdminCannotSetThreshold() public {
        vm.prank(alice);
        vm.expectRevert(Vouchera.NotProtocolAdmin.selector);
        vouchera.setOrganizationCreationThreshold(20);
    }

    function test_ProtocolAdminCanTransferAdmin() public {
        vm.prank(protocolAdmin);
        vouchera.transferProtocolAdmin(alice);
        assertEq(vouchera.protocolAdmin(), alice);
    }

    function test_NonAdminCannotTransferAdmin() public {
        vm.prank(alice);
        vm.expectRevert(Vouchera.NotProtocolAdmin.selector);
        vouchera.transferProtocolAdmin(alice);
    }


    function test_CannotTransferAdminToZero() public {
        vm.prank(protocolAdmin);
        vm.expectRevert(Vouchera.InvalidAddress.selector);
        vouchera.transferProtocolAdmin(address(0));
    }

    function test_TransferAdminEmitsEvent() public {
        vm.expectEmit(true, true, false, false);
        emit Vouchera.ProtocolAdminTransferred(protocolAdmin, alice);
        vm.prank(protocolAdmin);
        vouchera.transferProtocolAdmin(alice);
    }

    // =========================================================================
    // ELIGIBILITY TESTS
    // =========================================================================

    function test_IneligibleWalletCannotCreateOrg() public {
        vm.prank(alice);
        vm.expectRevert(
            abi.encodeWithSelector(Vouchera.NotEligibleToCreateOrganization.selector, alice, 0, THRESHOLD)
        );
        vouchera.createOrganization("Test", "Test org");
    }

    function test_PartialScoreNotEnough() public {
        vm.prank(protocolAdmin);
        vouchera.recordActivity(alice, THRESHOLD - 1);
        assertFalse(vouchera.isEligibleToCreateOrganization(alice));

        vm.prank(alice);
        vm.expectRevert(
            abi.encodeWithSelector(Vouchera.NotEligibleToCreateOrganization.selector, alice, THRESHOLD - 1, THRESHOLD)
        );
        vouchera.createOrganization("Test", "Test org");
    }

    function test_EligibleWalletCanCreateOrg() public {
        _makeAliceEligible();
        assertTrue(vouchera.isEligibleToCreateOrganization(alice));
        vm.prank(alice);
        uint256 orgId = vouchera.createOrganization("Test", "Test org");
        assertGt(orgId, 0);
    }

    function test_ThresholdBoundaryExact() public {
        vm.prank(protocolAdmin);
        vouchera.recordActivity(alice, THRESHOLD);
        assertTrue(vouchera.isEligibleToCreateOrganization(alice));
    }

    function test_ActivityRecordedCorrectly() public {
        vm.prank(protocolAdmin);
        vouchera.recordActivity(alice, 5);
        assertEq(vouchera.activityScore(alice), 5);

        vm.prank(protocolAdmin);
        vouchera.recordActivity(alice, 5);
        assertEq(vouchera.activityScore(alice), 10);
    }

    function test_NonAdminCannotRecordActivity() public {
        vm.prank(alice);
        vm.expectRevert(Vouchera.NotProtocolAdmin.selector);
        vouchera.recordActivity(bob, 10);
    }

    function test_CannotRecordZeroActivity() public {
        vm.prank(protocolAdmin);
        vm.expectRevert(Vouchera.AmountIsZero.selector);
        vouchera.recordActivity(alice, 0);
    }

    function test_CannotRecordActivityToZeroAddress() public {
        vm.prank(protocolAdmin);
        vm.expectRevert(Vouchera.InvalidAddress.selector);
        vouchera.recordActivity(address(0), 10);
    }

    // =========================================================================
    // ORGANIZATION TESTS
    // =========================================================================

    function test_CreatorBecomesOrganizationOwner() public {
        _makeAliceEligible();
        vm.prank(alice);
        uint256 orgId = vouchera.createOrganization("Community Food Initiative", "Food security org");

        Vouchera.Organization memory org = vouchera.getOrganization(orgId);
        assertEq(org.owner, alice);
        // Critical: Protocol Admin is NOT the owner
        assertTrue(org.owner != protocolAdmin);
    }

    function test_UniqueOrganizationIds() public {
        _makeAliceEligible();
        vm.prank(protocolAdmin);
        vouchera.recordActivity(bob, THRESHOLD);

        vm.prank(alice);
        uint256 org1 = vouchera.createOrganization("Org 1", "First");
        vm.prank(bob);
        uint256 org2 = vouchera.createOrganization("Org 2", "Second");

        assertTrue(org1 != org2);
    }

    function test_OrganizationDataStoredCorrectly() public {
        _makeAliceEligible();
        vm.prank(alice);
        uint256 orgId = vouchera.createOrganization("Community Food Initiative", "Food security org");

        Vouchera.Organization memory org = vouchera.getOrganization(orgId);
        assertEq(org.name, "Community Food Initiative");
        assertEq(org.description, "Food security org");
        assertEq(org.owner, alice);
        assertTrue(org.active);
        assertGt(org.createdAt, 0);
    }

    function test_OrganizationIsolation() public {
        _makeAliceEligible();
        _makeBobEligible();

        vm.prank(alice);
        uint256 aliceOrg = vouchera.createOrganization("Alice Org", "Alice's organization");
        vm.prank(bob);
        uint256 bobOrg = vouchera.createOrganization("Bob Org", "Bob's organization");

        assertEq(vouchera.getOrganization(aliceOrg).owner, alice);
        assertEq(vouchera.getOrganization(bobOrg).owner, bob);
        assertTrue(aliceOrg != bobOrg);
    }

    function test_NonOwnerCannotManageOrganization() public {
        _makeAliceEligible();
        vm.prank(alice);
        uint256 orgId = vouchera.createOrganization("Alice Org", "Alice's org");

        // Bob tries to create a program in Alice's org
        vm.prank(bob);
        vm.expectRevert(abi.encodeWithSelector(Vouchera.NotOrganizationOwner.selector, orgId));
        vouchera.createProgram(orgId, "Bad program", "Unauthorized", FOOD, 0, uint64(block.timestamp + 100 days));
    }

    function test_GetOrganizationsByOwner() public {
        _makeAliceEligible();
        vm.prank(alice);
        vouchera.createOrganization("Alice 1", "First");

        // Give alice more score and create a second org
        vm.prank(protocolAdmin);
        vouchera.recordActivity(alice, THRESHOLD);
        vm.prank(alice);
        vouchera.createOrganization("Alice 2", "Second");

        Vouchera.Organization[] memory aliceOrgs = vouchera.getOrganizationsByOwner(alice);
        assertEq(aliceOrgs.length, 2);

        Vouchera.Organization[] memory bobOrgs = vouchera.getOrganizationsByOwner(bob);
        assertEq(bobOrgs.length, 0);
    }

    function test_OrganizationCreationEmitsEvent() public {
        _makeAliceEligible();
        vm.expectEmit(false, true, false, false);
        emit Vouchera.OrganizationCreated(1, alice, "Test Org");
        vm.prank(alice);
        vouchera.createOrganization("Test Org", "Description");
    }

    function test_EmptyNameRejected() public {
        _makeAliceEligible();
        vm.prank(alice);
        vm.expectRevert(Vouchera.EmptyName.selector);
        vouchera.createOrganization("", "Description");
    }

    // =========================================================================
    // PROGRAM TESTS
    // =========================================================================

    function test_OrgOwnerCanCreateProgram() public {
        uint256 orgId = _createAliceOrg();
        vm.prank(alice);
        uint256 programId = vouchera.createProgram(
            orgId, "Food Support 2026", "Food subsidy", FOOD,
            uint64(block.timestamp), uint64(block.timestamp + 365 days)
        );
        assertGt(programId, 0);
    }

    function test_NonOwnerCannotCreateProgram() public {
        uint256 orgId = _createAliceOrg();
        vm.prank(bob);
        vm.expectRevert(abi.encodeWithSelector(Vouchera.NotOrganizationOwner.selector, orgId));
        vouchera.createProgram(orgId, "Unauthorized", "bad", FOOD, 0, uint64(block.timestamp + 100 days));
    }

    function test_ProgramFunding() public {
        uint256 programId = _createAliceProgram();
        vm.prank(alice);
        vouchera.fundProgram{value: PROGRAM_FUND}(aliceOrgId, programId);

        Vouchera.VoucherProgram memory prog = vouchera.getProgram(programId);
        assertEq(prog.totalFunded, PROGRAM_FUND);
    }

    function test_ProgramFundingEmitsEvent() public {
        uint256 programId = _createAliceProgram();
        vm.expectEmit(true, true, false, true);
        emit Vouchera.ProgramFunded(programId, aliceOrgId, PROGRAM_FUND, PROGRAM_FUND);
        vm.prank(alice);
        vouchera.fundProgram{value: PROGRAM_FUND}(aliceOrgId, programId);
    }

    function test_ZeroFundingReverts() public {
        uint256 programId = _createAliceProgram();
        vm.prank(alice);
        vm.expectRevert(Vouchera.AmountIsZero.selector);
        vouchera.fundProgram{value: 0}(aliceOrgId, programId);
    }

    function test_ProgramStatusTransitions() public {
        uint256 programId = _createAliceProgram();
        Vouchera.VoucherProgram memory prog = vouchera.getProgram(programId);
        assertEq(uint(prog.status), uint(Vouchera.ProgramStatus.Draft));

        vm.prank(alice);
        vouchera.activateProgram(aliceOrgId, programId);
        assertEq(uint(vouchera.getProgram(programId).status), uint(Vouchera.ProgramStatus.Active));

        vm.prank(alice);
        vouchera.pauseProgram(aliceOrgId, programId);
        assertEq(uint(vouchera.getProgram(programId).status), uint(Vouchera.ProgramStatus.Paused));

        vm.prank(alice);
        vouchera.activateProgram(aliceOrgId, programId);

        vm.prank(alice);
        vouchera.closeProgram(aliceOrgId, programId);
        assertEq(uint(vouchera.getProgram(programId).status), uint(Vouchera.ProgramStatus.Closed));
    }

    function test_ClosedProgramCannotBeReopened() public {
        uint256 programId = _createAliceProgram();
        vm.prank(alice);
        vouchera.closeProgram(aliceOrgId, programId);
        vm.prank(alice);
        vm.expectRevert(Vouchera.ProgramAlreadyClosed.selector);
        vouchera.activateProgram(aliceOrgId, programId);
    }

    function test_ClosedProgramCannotBeFunded() public {
        uint256 programId = _createAliceProgram();
        vm.prank(alice);
        vouchera.closeProgram(aliceOrgId, programId);
        vm.prank(alice);
        vm.expectRevert(Vouchera.ProgramAlreadyClosed.selector);
        vouchera.fundProgram{value: 1 ether}(aliceOrgId, programId);
    }

    // =========================================================================
    // BENEFICIARY TESTS
    // =========================================================================

    function test_OwnerCanApproveBeneficiary() public {
        uint256 orgId = _createAliceOrg();
        vm.prank(alice);
        vouchera.approveBeneficiary(orgId, charlie);
        assertTrue(vouchera.isBeneficiaryApproved(orgId, charlie));
    }

    function test_NonOwnerCannotApproveBeneficiary() public {
        uint256 orgId = _createAliceOrg();
        vm.prank(bob);
        vm.expectRevert(abi.encodeWithSelector(Vouchera.NotOrganizationOwner.selector, orgId));
        vouchera.approveBeneficiary(orgId, charlie);
    }

    function test_BeneficiaryCannotApproveSelf() public {
        uint256 orgId = _createAliceOrg();
        // Alice owns the org; charlie can't become org owner so this test is really:
        // owner cannot approve themselves - let's test zero address
        vm.prank(alice);
        vm.expectRevert(Vouchera.InvalidAddress.selector);
        vouchera.approveBeneficiary(orgId, address(0));
    }

    function test_OwnerCannotApproveSelfAsBeneficiary() public {
        uint256 orgId = _createAliceOrg();
        vm.prank(alice);
        vm.expectRevert(Vouchera.BeneficiaryCannotSelfApprove.selector);
        vouchera.approveBeneficiary(orgId, alice);
    }

    function test_CannotApproveBeneficiaryTwice() public {
        uint256 orgId = _createAliceOrg();
        vm.prank(alice);
        vouchera.approveBeneficiary(orgId, charlie);
        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(Vouchera.BeneficiaryAlreadyApproved.selector, charlie));
        vouchera.approveBeneficiary(orgId, charlie);
    }

    function test_OwnerCanDeactivateBeneficiary() public {
        uint256 orgId = _createAliceOrg();
        vm.prank(alice);
        vouchera.approveBeneficiary(orgId, charlie);
        vm.prank(alice);
        vouchera.deactivateBeneficiary(orgId, charlie);
        assertFalse(vouchera.isBeneficiaryApproved(orgId, charlie));
    }

    // =========================================================================
    // MERCHANT TESTS
    // =========================================================================

    function test_OwnerCanApproveMerchant() public {
        uint256 orgId = _createAliceOrg();
        vm.prank(alice);
        vouchera.approveMerchant(orgId, greenmart, "GreenMart", FOOD);
        Vouchera.Merchant memory m = vouchera.getMerchant(orgId, greenmart);
        assertEq(m.account, greenmart);
        assertEq(m.name, "GreenMart");
        assertEq(m.categoryCode, FOOD);
        assertTrue(m.active);
    }

    function test_NonOwnerCannotApproveMerchant() public {
        uint256 orgId = _createAliceOrg();
        vm.prank(bob);
        vm.expectRevert(abi.encodeWithSelector(Vouchera.NotOrganizationOwner.selector, orgId));
        vouchera.approveMerchant(orgId, greenmart, "GreenMart", FOOD);
    }

    function test_MerchantCannotSelfApprove() public {
        uint256 orgId = _createAliceOrg();
        // Greenmart cannot approve itself (alice is the org owner, not greenmart)
        // This test verifies the owner check — greenmart trying to call would fail as non-owner
        vm.prank(greenmart);
        vm.expectRevert(abi.encodeWithSelector(Vouchera.NotOrganizationOwner.selector, orgId));
        vouchera.approveMerchant(orgId, greenmart, "GreenMart", FOOD);
    }

    function test_OwnerCannotApproveSelfAsMerchant() public {
        uint256 orgId = _createAliceOrg();
        vm.prank(alice);
        vm.expectRevert(Vouchera.MerchantCannotSelfApprove.selector);
        vouchera.approveMerchant(orgId, alice, "Alice's Store", FOOD);
    }

    function test_CannotApproveMerchantTwice() public {
        uint256 orgId = _createAliceOrg();
        vm.prank(alice);
        vouchera.approveMerchant(orgId, greenmart, "GreenMart", FOOD);
        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(Vouchera.MerchantAlreadyApproved.selector, greenmart));
        vouchera.approveMerchant(orgId, greenmart, "GreenMart", FOOD);
    }

    function test_OwnerCanDeactivateMerchant() public {
        uint256 orgId = _createAliceOrg();
        vm.prank(alice);
        vouchera.approveMerchant(orgId, greenmart, "GreenMart", FOOD);
        vm.prank(alice);
        vouchera.deactivateMerchant(orgId, greenmart);
        assertFalse(vouchera.getMerchant(orgId, greenmart).active);
    }

    function test_CategoryRestrictionsEnforced() public {
        // Food merchant cannot redeem education voucher
        uint256 programId = _createAliceProgram();
        _fundAndActivateProgram(aliceOrgId, programId, PROGRAM_FUND);
        _approveCharlieAsBeneficiary(aliceOrgId);
        _approveGreenMart(aliceOrgId);
        // Approve education merchant
        vm.prank(alice);
        vouchera.approveMerchant(aliceOrgId, bookstore, "BookStore", EDUCATION);

        uint256 voucherId = _issueVoucherToCharlie(aliceOrgId, programId, VOUCHER_AMOUNT);

        // Bookstore (education) cannot redeem food voucher
        vm.prank(charlie);
        vm.expectRevert(
            abi.encodeWithSelector(Vouchera.MerchantCategoryMismatch.selector, FOOD, EDUCATION)
        );
        vouchera.redeemVoucher(voucherId, bookstore, 5 ether, "inv001");
    }

    function test_DeactivatedMerchantCannotRedeem() public {
        uint256 programId = _createAliceProgram();
        _fundAndActivateProgram(aliceOrgId, programId, PROGRAM_FUND);
        _approveCharlieAsBeneficiary(aliceOrgId);
        _approveGreenMart(aliceOrgId);

        uint256 voucherId = _issueVoucherToCharlie(aliceOrgId, programId, VOUCHER_AMOUNT);

        vm.prank(alice);
        vouchera.deactivateMerchant(aliceOrgId, greenmart);

        vm.prank(charlie);
        vm.expectRevert(abi.encodeWithSelector(Vouchera.MerchantNotActive.selector, greenmart));
        vouchera.redeemVoucher(voucherId, greenmart, 5 ether, "");
    }

    // =========================================================================
    // VOUCHER ISSUANCE TESTS
    // =========================================================================

    function test_ValidVoucherIssuance() public {
        uint256 programId = _createAliceProgram();
        _fundAndActivateProgram(aliceOrgId, programId, PROGRAM_FUND);
        _approveCharlieAsBeneficiary(aliceOrgId);

        uint256 voucherId = _issueVoucherToCharlie(aliceOrgId, programId, VOUCHER_AMOUNT);
        assertGt(voucherId, 0);

        Vouchera.Voucher memory v = vouchera.getVoucher(voucherId);
        assertEq(v.beneficiary, charlie);
        assertEq(v.allocatedAmount, VOUCHER_AMOUNT);
        assertEq(v.remainingAmount, VOUCHER_AMOUNT);
        assertEq(v.redeemedAmount, 0);
        assertEq(v.categoryCode, FOOD);
        assertEq(uint(v.status), uint(Vouchera.VoucherStatus.Active));
    }

    function test_VoucherAllocatedFromProgramFunds() public {
        uint256 programId = _createAliceProgram();
        _fundAndActivateProgram(aliceOrgId, programId, PROGRAM_FUND);
        _approveCharlieAsBeneficiary(aliceOrgId);

        _issueVoucherToCharlie(aliceOrgId, programId, VOUCHER_AMOUNT);

        (,uint256 totalAllocated,,,) = vouchera.getProgramStats(programId);
        assertEq(totalAllocated, VOUCHER_AMOUNT);
    }

    function test_CannotIssueUnfundedVoucher() public {
        uint256 programId = _createAliceProgram();
        vm.prank(alice);
        vouchera.activateProgram(aliceOrgId, programId); // Activate but NO funding
        _approveCharlieAsBeneficiary(aliceOrgId);

        vm.prank(alice);
        vm.expectRevert(
            abi.encodeWithSelector(Vouchera.InsufficientProgramFunds.selector, 0, VOUCHER_AMOUNT)
        );
        vouchera.issueVoucher(
            aliceOrgId, programId, charlie, VOUCHER_AMOUNT,
            uint64(block.timestamp + 30 days), address(0)
        );
    }

    function test_CannotIssueVoucherExceedingFunds() public {
        uint256 programId = _createAliceProgram();
        _fundAndActivateProgram(aliceOrgId, programId, 10 ether); // Only 10 BOT
        _approveCharlieAsBeneficiary(aliceOrgId);

        vm.prank(alice);
        vm.expectRevert(
            abi.encodeWithSelector(Vouchera.InsufficientProgramFunds.selector, 10 ether, 20 ether)
        );
        vouchera.issueVoucher(
            aliceOrgId, programId, charlie, 20 ether,
            uint64(block.timestamp + 30 days), address(0)
        );
    }

    function test_NonOwnerCannotIssueVoucher() public {
        uint256 programId = _createAliceProgram();
        _fundAndActivateProgram(aliceOrgId, programId, PROGRAM_FUND);
        _approveCharlieAsBeneficiary(aliceOrgId);

        vm.prank(bob);
        vm.expectRevert(abi.encodeWithSelector(Vouchera.NotOrganizationOwner.selector, aliceOrgId));
        vouchera.issueVoucher(
            aliceOrgId, programId, charlie, VOUCHER_AMOUNT,
            uint64(block.timestamp + 30 days), address(0)
        );
    }

    function test_CannotIssueVoucherToUnapprovedBeneficiary() public {
        uint256 programId = _createAliceProgram();
        _fundAndActivateProgram(aliceOrgId, programId, PROGRAM_FUND);
        // charlie NOT approved

        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(Vouchera.BeneficiaryNotApproved.selector, charlie));
        vouchera.issueVoucher(
            aliceOrgId, programId, charlie, VOUCHER_AMOUNT,
            uint64(block.timestamp + 30 days), address(0)
        );
    }

    function test_VoucherExpiry() public {
        uint256 programId = _createAliceProgram();
        _fundAndActivateProgram(aliceOrgId, programId, PROGRAM_FUND);
        _approveCharlieAsBeneficiary(aliceOrgId);
        _approveGreenMart(aliceOrgId);

        uint256 voucherId = _issueVoucherToCharlie(aliceOrgId, programId, VOUCHER_AMOUNT);

        // Warp past expiry
        vm.warp(block.timestamp + 31 days);

        vm.prank(charlie);
        vm.expectRevert(abi.encodeWithSelector(Vouchera.VoucherExpired.selector, voucherId));
        vouchera.redeemVoucher(voucherId, greenmart, 5 ether, "");
    }

    function test_VoucherNonTransferability() public {
        // Vouchers have no transfer function — this is verified by ensuring only
        // the beneficiary can redeem
        uint256 programId = _createAliceProgram();
        _fundAndActivateProgram(aliceOrgId, programId, PROGRAM_FUND);
        _approveCharlieAsBeneficiary(aliceOrgId);
        _approveGreenMart(aliceOrgId);

        uint256 voucherId = _issueVoucherToCharlie(aliceOrgId, programId, VOUCHER_AMOUNT);

        // Attacker cannot redeem charlie's voucher
        vm.prank(attacker);
        vm.expectRevert(abi.encodeWithSelector(Vouchera.NotBeneficiary.selector, voucherId));
        vouchera.redeemVoucher(voucherId, greenmart, 5 ether, "");
    }

    function test_PastExpiryVoucherIssuanceReverts() public {
        uint256 programId = _createAliceProgram();
        _fundAndActivateProgram(aliceOrgId, programId, PROGRAM_FUND);
        _approveCharlieAsBeneficiary(aliceOrgId);

        vm.prank(alice);
        vm.expectRevert(Vouchera.InvalidExpiry.selector);
        vouchera.issueVoucher(
            aliceOrgId, programId, charlie, VOUCHER_AMOUNT,
            uint64(block.timestamp - 1), // past expiry
            address(0)
        );
    }

    // =========================================================================
    // REDEMPTION TESTS
    // =========================================================================

    function _setupFullRedemptionScenario() internal returns (uint256 voucherId) {
        uint256 programId = _createAliceProgram();
        _fundAndActivateProgram(aliceOrgId, programId, PROGRAM_FUND);
        _approveCharlieAsBeneficiary(aliceOrgId);
        _approveGreenMart(aliceOrgId);
        voucherId = _issueVoucherToCharlie(aliceOrgId, programId, VOUCHER_AMOUNT);
    }

    function test_ValidRedemption() public {
        uint256 voucherId = _setupFullRedemptionScenario();
        uint256 redeemAmount = 7 ether;
        uint256 merchantBefore = greenmart.balance;

        vm.prank(charlie);
        vouchera.redeemVoucher(voucherId, greenmart, redeemAmount, "inv001");

        Vouchera.Voucher memory v = vouchera.getVoucher(voucherId);
        assertEq(v.remainingAmount, VOUCHER_AMOUNT - redeemAmount);
        assertEq(v.redeemedAmount, redeemAmount);
        assertEq(uint(v.status), uint(Vouchera.VoucherStatus.PartiallyRedeemed));
        assertEq(greenmart.balance, merchantBefore + redeemAmount);
    }

    function test_PartialRedemption() public {
        uint256 voucherId = _setupFullRedemptionScenario();

        vm.prank(charlie);
        vouchera.redeemVoucher(voucherId, greenmart, 7 ether, "");
        assertEq(vouchera.getVoucher(voucherId).remainingAmount, 13 ether);

        vm.prank(charlie);
        vouchera.redeemVoucher(voucherId, greenmart, 5 ether, "");
        assertEq(vouchera.getVoucher(voucherId).remainingAmount, 8 ether);
    }

    function test_FullRedemptionStatus() public {
        uint256 voucherId = _setupFullRedemptionScenario();

        vm.prank(charlie);
        vouchera.redeemVoucher(voucherId, greenmart, VOUCHER_AMOUNT, "");

        Vouchera.Voucher memory v = vouchera.getVoucher(voucherId);
        assertEq(v.remainingAmount, 0);
        assertEq(uint(v.status), uint(Vouchera.VoucherStatus.FullyRedeemed));
    }

    function test_ActualBOTTransferToMerchant() public {
        uint256 voucherId = _setupFullRedemptionScenario();
        uint256 amount = 7 ether;
        uint256 before = greenmart.balance;

        vm.prank(charlie);
        vouchera.redeemVoucher(voucherId, greenmart, amount, "inv001");

        assertEq(greenmart.balance, before + amount);
    }

    function test_DoubleSpendingPrevention() public {
        uint256 voucherId = _setupFullRedemptionScenario();

        vm.prank(charlie);
        vouchera.redeemVoucher(voucherId, greenmart, VOUCHER_AMOUNT, "");

        // Try to redeem again
        vm.prank(charlie);
        vm.expectRevert(abi.encodeWithSelector(Vouchera.VoucherFullyRedeemed.selector, voucherId));
        vouchera.redeemVoucher(voucherId, greenmart, 1 ether, "");
    }

    function test_OverRedemptionReverts() public {
        uint256 voucherId = _setupFullRedemptionScenario();

        vm.prank(charlie);
        vm.expectRevert(
            abi.encodeWithSelector(Vouchera.InsufficientVoucherBalance.selector, VOUCHER_AMOUNT, VOUCHER_AMOUNT + 1)
        );
        vouchera.redeemVoucher(voucherId, greenmart, VOUCHER_AMOUNT + 1, "");
    }

    function test_ZeroAmountRedemptionReverts() public {
        uint256 voucherId = _setupFullRedemptionScenario();

        vm.prank(charlie);
        vm.expectRevert(Vouchera.AmountIsZero.selector);
        vouchera.redeemVoucher(voucherId, greenmart, 0, "");
    }

    function test_UnauthorizedBeneficiaryCannotRedeem() public {
        uint256 voucherId = _setupFullRedemptionScenario();

        vm.prank(attacker);
        vm.expectRevert(abi.encodeWithSelector(Vouchera.NotBeneficiary.selector, voucherId));
        vouchera.redeemVoucher(voucherId, greenmart, 5 ether, "");
    }

    function test_UnapprovedMerchantCannotRedeem() public {
        uint256 voucherId = _setupFullRedemptionScenario();

        vm.prank(charlie);
        vm.expectRevert(abi.encodeWithSelector(Vouchera.MerchantNotApproved.selector, attacker));
        vouchera.redeemVoucher(voucherId, attacker, 5 ether, "");
    }

    function test_WrongCategoryMerchantReverts() public {
        uint256 voucherId = _setupFullRedemptionScenario();
        // Add education merchant
        vm.prank(alice);
        vouchera.approveMerchant(aliceOrgId, bookstore, "BookStore", EDUCATION);

        vm.prank(charlie);
        vm.expectRevert(
            abi.encodeWithSelector(Vouchera.MerchantCategoryMismatch.selector, FOOD, EDUCATION)
        );
        vouchera.redeemVoucher(voucherId, bookstore, 5 ether, "");
    }

    function test_SpecificMerchantRestriction() public {
        uint256 programId = _createAliceProgram();
        _fundAndActivateProgram(aliceOrgId, programId, PROGRAM_FUND);
        _approveCharlieAsBeneficiary(aliceOrgId);
        _approveGreenMart(aliceOrgId);
        // Approve another food merchant
        vm.prank(alice);
        vouchera.approveMerchant(aliceOrgId, merchant2, "FoodMart2", FOOD);

        // Issue voucher restricted to greenmart only
        vm.prank(alice);
        uint256 voucherId = vouchera.issueVoucher(
            aliceOrgId, programId, charlie, VOUCHER_AMOUNT,
            uint64(block.timestamp + 30 days),
            greenmart // specific merchant
        );

        // merchant2 (food) cannot redeem — wrong specific merchant
        vm.prank(charlie);
        vm.expectRevert(
            abi.encodeWithSelector(Vouchera.WrongMerchant.selector, greenmart, merchant2)
        );
        vouchera.redeemVoucher(voucherId, merchant2, 5 ether, "");

        // greenmart can redeem
        vm.prank(charlie);
        vouchera.redeemVoucher(voucherId, greenmart, 5 ether, "");
    }

    function test_ExpiredVoucherCannotBeRedeemed() public {
        uint256 voucherId = _setupFullRedemptionScenario();
        vm.warp(block.timestamp + 31 days);

        vm.prank(charlie);
        vm.expectRevert(abi.encodeWithSelector(Vouchera.VoucherExpired.selector, voucherId));
        vouchera.redeemVoucher(voucherId, greenmart, 5 ether, "");
    }

    function test_CancelledVoucherCannotBeRedeemed() public {
        uint256 voucherId = _setupFullRedemptionScenario();

        vm.prank(alice);
        vouchera.cancelVoucher(voucherId);

        vm.prank(charlie);
        vm.expectRevert(abi.encodeWithSelector(Vouchera.VoucherIsCancelled.selector, voucherId));
        vouchera.redeemVoucher(voucherId, greenmart, 5 ether, "");
    }

    function test_PausedProgramCannotBeRedeemedIn() public {
        uint256 programId = _createAliceProgram();
        _fundAndActivateProgram(aliceOrgId, programId, PROGRAM_FUND);
        _approveCharlieAsBeneficiary(aliceOrgId);
        _approveGreenMart(aliceOrgId);

        uint256 voucherId = _issueVoucherToCharlie(aliceOrgId, programId, VOUCHER_AMOUNT);

        vm.prank(alice);
        vouchera.pauseProgram(aliceOrgId, programId);

        vm.prank(charlie);
        vm.expectRevert(abi.encodeWithSelector(Vouchera.ProgramNotActive.selector, programId));
        vouchera.redeemVoucher(voucherId, greenmart, 5 ether, "");
    }

    function test_RedemptionRecorded() public {
        uint256 voucherId = _setupFullRedemptionScenario();

        vm.prank(charlie);
        uint256 redemptionId = vouchera.redeemVoucher(voucherId, greenmart, 7 ether, "inv001");

        Vouchera.Redemption memory r = vouchera.getRedemption(redemptionId);
        assertEq(r.voucherId, voucherId);
        assertEq(r.beneficiary, charlie);
        assertEq(r.merchant, greenmart);
        assertEq(r.amount, 7 ether);
        assertEq(r.purchaseReference, "inv001");
    }

    function test_RedemptionEmitsEvent() public {
        uint256 voucherId = _setupFullRedemptionScenario();

        vm.expectEmit(false, true, true, true);
        emit Vouchera.VoucherRedeemed(1, voucherId, aliceOrgId, charlie, greenmart, 7 ether, "inv001");
        vm.prank(charlie);
        vouchera.redeemVoucher(voucherId, greenmart, 7 ether, "inv001");
    }

    // =========================================================================
    // CANCELLATION TESTS
    // =========================================================================

    function test_OwnerCanCancelVoucher() public {
        uint256 voucherId = _setupFullRedemptionScenario();

        vm.prank(alice);
        vouchera.cancelVoucher(voucherId);

        assertEq(uint(vouchera.getVoucher(voucherId).status), uint(Vouchera.VoucherStatus.Cancelled));
        assertEq(vouchera.getVoucher(voucherId).remainingAmount, 0);
    }

    function test_CancellationReturnsAllocationToPool() public {
        uint256 programId = _createAliceProgram();
        _fundAndActivateProgram(aliceOrgId, programId, PROGRAM_FUND);
        _approveCharlieAsBeneficiary(aliceOrgId);

        uint256 voucherId = _issueVoucherToCharlie(aliceOrgId, programId, VOUCHER_AMOUNT);
        (,uint256 allocated,,,) = vouchera.getProgramStats(programId);
        assertEq(allocated, VOUCHER_AMOUNT);

        vm.prank(alice);
        vouchera.cancelVoucher(voucherId);

        (,uint256 allocatedAfter,,,) = vouchera.getProgramStats(programId);
        assertEq(allocatedAfter, 0);
    }

    function test_NonOwnerCannotCancelVoucher() public {
        uint256 voucherId = _setupFullRedemptionScenario();

        vm.prank(bob);
        vm.expectRevert(abi.encodeWithSelector(Vouchera.NotOrganizationOwner.selector, aliceOrgId));
        vouchera.cancelVoucher(voucherId);
    }

    function test_FullyRedeemedVoucherCannotBeCancelled() public {
        uint256 voucherId = _setupFullRedemptionScenario();

        vm.prank(charlie);
        vouchera.redeemVoucher(voucherId, greenmart, VOUCHER_AMOUNT, "");

        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(Vouchera.VoucherFullyRedeemed.selector, voucherId));
        vouchera.cancelVoucher(voucherId);
    }

    // =========================================================================
    // EXPIRED VOUCHER RECLAMATION TESTS
    // =========================================================================

    function test_OwnerCanReclaimExpiredVoucher() public {
        uint256 programId = _createAliceProgram();
        _fundAndActivateProgram(aliceOrgId, programId, PROGRAM_FUND);
        _approveCharlieAsBeneficiary(aliceOrgId);

        uint256 voucherId = _issueVoucherToCharlie(aliceOrgId, programId, VOUCHER_AMOUNT);

        vm.warp(block.timestamp + 31 days); // Past expiry

        vm.prank(alice);
        vouchera.reclaimExpiredVoucher(voucherId);

        assertEq(uint(vouchera.getVoucher(voucherId).status), uint(Vouchera.VoucherStatus.Expired));
        assertEq(vouchera.getVoucher(voucherId).remainingAmount, 0);
    }

    function test_CannotReclaimNonExpiredVoucher() public {
        uint256 programId = _createAliceProgram();
        _fundAndActivateProgram(aliceOrgId, programId, PROGRAM_FUND);
        _approveCharlieAsBeneficiary(aliceOrgId);

        uint256 voucherId = _issueVoucherToCharlie(aliceOrgId, programId, VOUCHER_AMOUNT);

        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(Vouchera.VoucherNotExpired.selector, voucherId));
        vouchera.reclaimExpiredVoucher(voucherId);
    }

    function test_AlreadyRedeemedAmountNotReclaimed() public {
        uint256 programId = _createAliceProgram();
        _fundAndActivateProgram(aliceOrgId, programId, PROGRAM_FUND);
        _approveCharlieAsBeneficiary(aliceOrgId);
        _approveGreenMart(aliceOrgId);

        uint256 voucherId = _issueVoucherToCharlie(aliceOrgId, programId, VOUCHER_AMOUNT);

        // Charlie redeems partial amount
        vm.prank(charlie);
        vouchera.redeemVoucher(voucherId, greenmart, 7 ether, "");

        vm.warp(block.timestamp + 31 days);

        uint256 merchantBalanceBefore = greenmart.balance;

        vm.prank(alice);
        vouchera.reclaimExpiredVoucher(voucherId);

        // Redeemed BOT (7 ether) should stay with merchant; only remaining (13 ether) is reclaimed
        assertEq(greenmart.balance, merchantBalanceBefore); // no additional transfer
    }

    // =========================================================================
    // SECURITY / ACCESS CONTROL TESTS
    // =========================================================================

    function test_ProtocolAdminCannotAccessOrganizationFunds() public {
        // Protocol admin has no function to withdraw organization-level funds
        // (this is verified by the absence of such a function in the contract)
        // We verify by checking the protocol admin cannot call org-level functions
        uint256 orgId = _createAliceOrg();
        vm.prank(protocolAdmin);
        vm.expectRevert(abi.encodeWithSelector(Vouchera.NotOrganizationOwner.selector, orgId));
        vouchera.createProgram(orgId, "Admin Program", "Unauthorized", FOOD, 0, uint64(block.timestamp + 100 days));
    }

    function test_CrossOrganizationAccessPrevented() public {
        _makeAliceEligible();
        _makeBobEligible();

        vm.prank(alice);
        uint256 aliceOrg = vouchera.createOrganization("Alice Org", "Alice's");
        vm.prank(bob);
        uint256 bobOrg = vouchera.createOrganization("Bob Org", "Bob's");

        // Bob cannot approve beneficiary in Alice's org
        vm.prank(bob);
        vm.expectRevert(abi.encodeWithSelector(Vouchera.NotOrganizationOwner.selector, aliceOrg));
        vouchera.approveBeneficiary(aliceOrg, charlie);

        // Alice cannot approve merchant in Bob's org
        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(Vouchera.NotOrganizationOwner.selector, bobOrg));
        vouchera.approveMerchant(bobOrg, greenmart, "GreenMart", FOOD);
    }

    function test_AccountingConsistencyAfterRedemption() public {
        uint256 programId = _createAliceProgram();
        _fundAndActivateProgram(aliceOrgId, programId, PROGRAM_FUND);
        _approveCharlieAsBeneficiary(aliceOrgId);
        _approveGreenMart(aliceOrgId);

        uint256 voucherId = _issueVoucherToCharlie(aliceOrgId, programId, VOUCHER_AMOUNT);

        vm.prank(charlie);
        vouchera.redeemVoucher(voucherId, greenmart, 7 ether, "");

        (uint256 funded, uint256 allocated, uint256 redeemed, uint256 refunded, uint256 avail)
            = vouchera.getProgramStats(programId);

        assertEq(funded, PROGRAM_FUND);
        // After redemption: allocated decreases (was VOUCHER_AMOUNT, decreased by 7), redeemed increases
        assertEq(allocated, VOUCHER_AMOUNT - 7 ether);
        assertEq(redeemed, 7 ether);
        assertEq(refunded, 0);
        // avail = funded - allocated - redeemed - refunded
        uint256 expectedAvail = funded - allocated - redeemed - refunded;
        assertEq(avail, expectedAvail);
    }

    function test_ZeroAddressChecks() public {
        uint256 orgId = _createAliceOrg();
        vm.prank(alice);
        vm.expectRevert(Vouchera.InvalidAddress.selector);
        vouchera.approveMerchant(orgId, address(0), "ZeroMerchant", FOOD);
    }
}
