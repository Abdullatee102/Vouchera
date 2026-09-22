// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

// lib/openzeppelin-contracts/contracts/utils/StorageSlot.sol

// OpenZeppelin Contracts (last updated v5.1.0) (utils/StorageSlot.sol)
// This file was procedurally generated from scripts/generate/templates/StorageSlot.sol.eta.

/**
 * @dev Library for reading and writing primitive types to specific storage slots.
 *
 * Storage slots are often used to avoid storage conflict when dealing with upgradeable contracts.
 * This library helps with reading and writing to such slots without the need for inline assembly.
 *
 * The functions in this library return Slot structs that contain a `value` member that can be used to read or write.
 *
 * Example usage to set ERC-1967 implementation slot:
 * ```solidity
 * contract ERC1967 {
 *     // Define the slot. Alternatively, use the SlotDerivation library to derive the slot.
 *     bytes32 internal constant _IMPLEMENTATION_SLOT = 0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc;
 *
 *     function _getImplementation() internal view returns (address) {
 *         return StorageSlot.getAddressSlot(_IMPLEMENTATION_SLOT).value;
 *     }
 *
 *     function _setImplementation(address newImplementation) internal {
 *         require(newImplementation.code.length > 0);
 *         StorageSlot.getAddressSlot(_IMPLEMENTATION_SLOT).value = newImplementation;
 *     }
 * }
 * ```
 *
 * TIP: Consider using this library along with {SlotDerivation}.
 */
library StorageSlot {
    struct AddressSlot {
        address value;
    }

    struct BooleanSlot {
        bool value;
    }

    struct Bytes32Slot {
        bytes32 value;
    }

    struct Uint256Slot {
        uint256 value;
    }

    struct Int256Slot {
        int256 value;
    }

    struct StringSlot {
        string value;
    }

    struct BytesSlot {
        bytes value;
    }

    /**
     * @dev Returns an `AddressSlot` with member `value` located at `slot`.
     */
    function getAddressSlot(bytes32 slot) internal pure returns (AddressSlot storage r) {
        assembly ("memory-safe") {
            r.slot := slot
        }
    }

    /**
     * @dev Returns a `BooleanSlot` with member `value` located at `slot`.
     */
    function getBooleanSlot(bytes32 slot) internal pure returns (BooleanSlot storage r) {
        assembly ("memory-safe") {
            r.slot := slot
        }
    }

    /**
     * @dev Returns a `Bytes32Slot` with member `value` located at `slot`.
     */
    function getBytes32Slot(bytes32 slot) internal pure returns (Bytes32Slot storage r) {
        assembly ("memory-safe") {
            r.slot := slot
        }
    }

    /**
     * @dev Returns a `Uint256Slot` with member `value` located at `slot`.
     */
    function getUint256Slot(bytes32 slot) internal pure returns (Uint256Slot storage r) {
        assembly ("memory-safe") {
            r.slot := slot
        }
    }

    /**
     * @dev Returns a `Int256Slot` with member `value` located at `slot`.
     */
    function getInt256Slot(bytes32 slot) internal pure returns (Int256Slot storage r) {
        assembly ("memory-safe") {
            r.slot := slot
        }
    }

    /**
     * @dev Returns a `StringSlot` with member `value` located at `slot`.
     */
    function getStringSlot(bytes32 slot) internal pure returns (StringSlot storage r) {
        assembly ("memory-safe") {
            r.slot := slot
        }
    }

    /**
     * @dev Returns an `StringSlot` representation of the string storage pointer `store`.
     */
    function getStringSlot(string storage store) internal pure returns (StringSlot storage r) {
        assembly ("memory-safe") {
            r.slot := store.slot
        }
    }

    /**
     * @dev Returns a `BytesSlot` with member `value` located at `slot`.
     */
    function getBytesSlot(bytes32 slot) internal pure returns (BytesSlot storage r) {
        assembly ("memory-safe") {
            r.slot := slot
        }
    }

    /**
     * @dev Returns an `BytesSlot` representation of the bytes storage pointer `store`.
     */
    function getBytesSlot(bytes storage store) internal pure returns (BytesSlot storage r) {
        assembly ("memory-safe") {
            r.slot := store.slot
        }
    }
}

// lib/openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol

// OpenZeppelin Contracts (last updated v5.5.0) (utils/ReentrancyGuard.sol)

/**
 * @dev Contract module that helps prevent reentrant calls to a function.
 *
 * Inheriting from `ReentrancyGuard` will make the {nonReentrant} modifier
 * available, which can be applied to functions to make sure there are no nested
 * (reentrant) calls to them.
 *
 * Note that because there is a single `nonReentrant` guard, functions marked as
 * `nonReentrant` may not call one another. This can be worked around by making
 * those functions `private`, and then adding `external` `nonReentrant` entry
 * points to them.
 *
 * TIP: If EIP-1153 (transient storage) is available on the chain you're deploying at,
 * consider using {ReentrancyGuardTransient} instead.
 *
 * TIP: If you would like to learn more about reentrancy and alternative ways
 * to protect against it, check out our blog post
 * https://blog.openzeppelin.com/reentrancy-after-istanbul/[Reentrancy After Istanbul].
 *
 * IMPORTANT: Deprecated. This storage-based reentrancy guard will be removed and replaced
 * by the {ReentrancyGuardTransient} variant in v6.0.
 *
 * @custom:stateless
 */
abstract contract ReentrancyGuard {
    using StorageSlot for bytes32;

    // keccak256(abi.encode(uint256(keccak256("openzeppelin.storage.ReentrancyGuard")) - 1)) & ~bytes32(uint256(0xff))
    bytes32 private constant REENTRANCY_GUARD_STORAGE =
        0x9b779b17422d0df92223018b32b4d1fa46e071723d6817e2486d003becc55f00;

    // Booleans are more expensive than uint256 or any type that takes up a full
    // word because each write operation emits an extra SLOAD to first read the
    // slot's contents, replace the bits taken up by the boolean, and then write
    // back. This is the compiler's defense against contract upgrades and
    // pointer aliasing, and it cannot be disabled.

    // The values being non-zero value makes deployment a bit more expensive,
    // but in exchange the refund on every call to nonReentrant will be lower in
    // amount. Since refunds are capped to a percentage of the total
    // transaction's gas, it is best to keep them low in cases like this one, to
    // increase the likelihood of the full refund coming into effect.
    uint256 private constant NOT_ENTERED = 1;
    uint256 private constant ENTERED = 2;

    /**
     * @dev Unauthorized reentrant call.
     */
    error ReentrancyGuardReentrantCall();

    constructor() {
        _reentrancyGuardStorageSlot().getUint256Slot().value = NOT_ENTERED;
    }

    /**
     * @dev Prevents a contract from calling itself, directly or indirectly.
     * Calling a `nonReentrant` function from another `nonReentrant`
     * function is not supported. It is possible to prevent this from happening
     * by making the `nonReentrant` function external, and making it call a
     * `private` function that does the actual work.
     */
    modifier nonReentrant() {
        _nonReentrantBefore();
        _;
        _nonReentrantAfter();
    }

    /**
     * @dev A `view` only version of {nonReentrant}. Use to block view functions
     * from being called, preventing reading from inconsistent contract state.
     *
     * CAUTION: This is a "view" modifier and does not change the reentrancy
     * status. Use it only on view functions. For payable or non-payable functions,
     * use the standard {nonReentrant} modifier instead.
     */
    modifier nonReentrantView() {
        _nonReentrantBeforeView();
        _;
    }

    function _nonReentrantBeforeView() private view {
        if (_reentrancyGuardEntered()) {
            revert ReentrancyGuardReentrantCall();
        }
    }

    function _nonReentrantBefore() private {
        // On the first call to nonReentrant, _status will be NOT_ENTERED
        _nonReentrantBeforeView();

        // Any calls to nonReentrant after this point will fail
        _reentrancyGuardStorageSlot().getUint256Slot().value = ENTERED;
    }

    function _nonReentrantAfter() private {
        // By storing the original value once again, a refund is triggered (see
        // https://eips.ethereum.org/EIPS/eip-2200)
        _reentrancyGuardStorageSlot().getUint256Slot().value = NOT_ENTERED;
    }

    /**
     * @dev Returns true if the reentrancy guard is currently set to "entered", which indicates there is a
     * `nonReentrant` function in the call stack.
     */
    function _reentrancyGuardEntered() internal view returns (bool) {
        return _reentrancyGuardStorageSlot().getUint256Slot().value == ENTERED;
    }

    function _reentrancyGuardStorageSlot() internal pure virtual returns (bytes32) {
        return REENTRANCY_GUARD_STORAGE;
    }
}

// src/Vouchera.sol

/// @title Vouchera Protocol
/// @notice Controlled digital subsidy/voucher system where organizations distribute
///         blockchain-backed value to beneficiaries, restricted to approved merchants.
/// @dev Protocol Admin manages eligibility; Organization Owners manage their orgs independently.
contract Vouchera is ReentrancyGuard {
    // =========================================================================
    // Custom Errors
    // =========================================================================
    error NotProtocolAdmin();
    error NotOrganizationOwner(uint256 orgId);
    error NotBeneficiary(uint256 voucherId);
    error OrganizationNotFound(uint256 orgId);
    error OrganizationInactive(uint256 orgId);
    error ProgramNotFound(uint256 programId);
    error ProgramNotActive(uint256 programId);
    error ProgramAlreadyClosed();
    error VoucherNotFound(uint256 voucherId);
    error VoucherNotActive(uint256 voucherId);
    error VoucherExpired(uint256 voucherId);
    error VoucherNotExpired(uint256 voucherId);
    error VoucherIsCancelled(uint256 voucherId);
    error VoucherFullyRedeemed(uint256 voucherId);
    error InsufficientProgramFunds(uint256 available, uint256 required);
    error InsufficientVoucherBalance(uint256 remaining, uint256 requested);
    error AmountIsZero();
    error InvalidAddress();
    error BeneficiaryAlreadyApproved(address beneficiary);
    error BeneficiaryNotApproved(address beneficiary);
    error MerchantAlreadyApproved(address merchant);
    error MerchantNotApproved(address merchant);
    error MerchantNotActive(address merchant);
    error MerchantCategoryMismatch(bytes32 expected, bytes32 got);
    error WrongMerchant(address expected, address provided);
    error NotEligibleToCreateOrganization(address user, uint256 score, uint256 threshold);
    error InvalidExpiry();
    error ProgramExpired();
    error BeneficiaryCannotSelfApprove();
    error MerchantCannotSelfApprove();
    error NativeTrasferFailed();
    error InvalidProgramTransition();
    error VoucherAlreadyCancelled();
    error EmptyName();
    error EmptyDescription();

    // =========================================================================
    // Enums
    // =========================================================================
    enum ProgramStatus { Draft, Active, Paused, Closed }
    enum VoucherStatus { Active, PartiallyRedeemed, FullyRedeemed, Expired, Cancelled }

    // =========================================================================
    // Structs
    // =========================================================================
    struct Organization {
        uint256 id;
        address owner;
        string name;
        string description;
        uint64 createdAt;
        bool active;
    }

    struct VoucherProgram {
        uint256 id;
        uint256 organizationId;
        string name;
        string description;
        bytes32 categoryCode;
        uint256 totalFunded;        // lifetime BOT deposited into this program
        uint256 totalAllocated;     // total outstanding voucher value (issued, not yet redeemed/refunded)
        uint256 totalRedeemed;      // total BOT paid to merchants
        uint256 totalRefunded;      // total BOT returned from cancelled/expired vouchers
        uint64 createdAt;
        uint64 startsAt;
        uint64 expiresAt;
        ProgramStatus status;
    }

    struct Voucher {
        uint256 id;
        uint256 organizationId;
        uint256 programId;
        address beneficiary;
        uint256 allocatedAmount;
        uint256 remainingAmount;
        uint256 redeemedAmount;
        bytes32 categoryCode;
        address allowedMerchant;    // address(0) = any approved merchant in category
        uint64 issuedAt;
        uint64 expiresAt;
        VoucherStatus status;
    }

    struct Merchant {
        address account;
        string name;
        bytes32 categoryCode;
        bool active;
    }

    struct Redemption {
        uint256 id;
        uint256 voucherId;
        uint256 organizationId;
        uint256 programId;
        address beneficiary;
        address merchant;
        uint256 amount;
        string purchaseReference;
        uint64 redeemedAt;
    }

    // =========================================================================
    // State
    // =========================================================================
    address public protocolAdmin;

    uint256 public organizationCreationThreshold;
    mapping(address => uint256) public activityScore;

    uint256 private _nextOrgId;
    uint256 private _nextProgramId;
    uint256 private _nextVoucherId;
    uint256 private _nextRedemptionId;

    mapping(uint256 => Organization) private _organizations;
    mapping(address => uint256[]) private _ownerOrganizations;
    uint256[] private _allOrganizationIds;

    // orgId => programId[]
    mapping(uint256 => uint256[]) private _orgPrograms;
    mapping(uint256 => VoucherProgram) private _programs;

    // orgId => merchant address => Merchant
    mapping(uint256 => mapping(address => Merchant)) private _merchants;
    // orgId => merchant address[]
    mapping(uint256 => address[]) private _orgMerchantList;

    // orgId => beneficiary address => approved
    mapping(uint256 => mapping(address => bool)) private _approvedBeneficiaries;
    // orgId => beneficiary address[]
    mapping(uint256 => address[]) private _orgBeneficiaryList;

    mapping(uint256 => Voucher) private _vouchers;
    // beneficiary => voucherId[]
    mapping(address => uint256[]) private _beneficiaryVouchers;
    // programId => voucherId[]
    mapping(uint256 => uint256[]) private _programVouchers;

    mapping(uint256 => Redemption) private _redemptions;
    // voucherId => redemptionId[]
    mapping(uint256 => uint256[]) private _voucherRedemptions;
    // orgId => redemptionId[]
    mapping(uint256 => uint256[]) private _orgRedemptions;
    uint256[] private _allRedemptionIds;

    // =========================================================================
    // Events
    // =========================================================================
    event ProtocolAdminTransferred(address indexed previousAdmin, address indexed newAdmin);
    event ThresholdUpdated(uint256 oldThreshold, uint256 newThreshold);
    event ActivityRecorded(address indexed user, uint256 amount, uint256 newScore);

    event OrganizationCreated(uint256 indexed orgId, address indexed owner, string name);
    event OrganizationStatusChanged(uint256 indexed orgId, bool active);

    event ProgramCreated(uint256 indexed programId, uint256 indexed orgId, string name, bytes32 categoryCode);
    event ProgramFunded(uint256 indexed programId, uint256 indexed orgId, uint256 amount, uint256 totalFunded);
    event ProgramStatusChanged(uint256 indexed programId, uint256 indexed orgId, ProgramStatus status);

    event BeneficiaryApproved(uint256 indexed orgId, address indexed beneficiary);
    event BeneficiaryDeactivated(uint256 indexed orgId, address indexed beneficiary);

    event MerchantApproved(uint256 indexed orgId, address indexed merchant, string name, bytes32 categoryCode);
    event MerchantDeactivated(uint256 indexed orgId, address indexed merchant);

    event VoucherIssued(
        uint256 indexed voucherId,
        uint256 indexed orgId,
        uint256 indexed programId,
        address beneficiary,
        uint256 amount,
        bytes32 categoryCode,
        uint64 expiresAt
    );
    event VoucherCancelled(uint256 indexed voucherId, uint256 remainingAmount);
    event ExpiredVoucherReclaimed(uint256 indexed voucherId, uint256 reclaimedAmount);

    event VoucherRedeemed(
        uint256 indexed redemptionId,
        uint256 indexed voucherId,
        uint256 indexed orgId,
        address beneficiary,
        address merchant,
        uint256 amount,
        string purchaseReference
    );

    // =========================================================================
    // Constructor
    // =========================================================================
    constructor(address initialProtocolAdmin, uint256 initialThreshold) {
        if (initialProtocolAdmin == address(0)) revert InvalidAddress();
        protocolAdmin = initialProtocolAdmin;
        organizationCreationThreshold = initialThreshold;
        _nextOrgId = 1;
        _nextProgramId = 1;
        _nextVoucherId = 1;
        _nextRedemptionId = 1;

        emit ProtocolAdminTransferred(address(0), initialProtocolAdmin);
    }

    // =========================================================================
    // Modifiers
    // =========================================================================
    modifier onlyProtocolAdmin() {
        if (msg.sender != protocolAdmin) revert NotProtocolAdmin();
        _;
    }

    modifier onlyOrgOwner(uint256 orgId) {
        if (!_orgExists(orgId)) revert OrganizationNotFound(orgId);
        if (_organizations[orgId].owner != msg.sender) revert NotOrganizationOwner(orgId);
        _;
    }

    modifier orgExists(uint256 orgId) {
        if (!_orgExists(orgId)) revert OrganizationNotFound(orgId);
        _;
    }

    modifier orgActive(uint256 orgId) {
        if (!_orgExists(orgId)) revert OrganizationNotFound(orgId);
        if (!_organizations[orgId].active) revert OrganizationInactive(orgId);
        _;
    }

    // =========================================================================
    // PROTOCOL ADMIN FUNCTIONS
    // =========================================================================

    /// @notice Transfer protocol administration to another wallet
    function transferProtocolAdmin(address newAdmin) external onlyProtocolAdmin {
        if (newAdmin == address(0)) revert InvalidAddress();
        emit ProtocolAdminTransferred(protocolAdmin, newAdmin);
        protocolAdmin = newAdmin;
    }

    /// @notice Set the minimum activity score required to create an organization
    function setOrganizationCreationThreshold(uint256 newThreshold) external onlyProtocolAdmin {
        emit ThresholdUpdated(organizationCreationThreshold, newThreshold);
        organizationCreationThreshold = newThreshold;
    }

    /// @notice Record eligible activity for a user (Protocol Admin controlled — analogous to KYC/approval)
    /// @dev This allows the protocol admin to grant activity score to verified users.
    ///      In production this can be gated by off-chain verification, DAO vote, etc.
    function recordActivity(address user, uint256 amount) external onlyProtocolAdmin {
        if (user == address(0)) revert InvalidAddress();
        if (amount == 0) revert AmountIsZero();
        activityScore[user] += amount;
        emit ActivityRecorded(user, amount, activityScore[user]);
    }

    /// @notice Emergency: deactivate an organization (narrow protocol-level safeguard only)
    function setOrganizationActive(uint256 orgId, bool active) external onlyProtocolAdmin orgExists(orgId) {
        _organizations[orgId].active = active;
        emit OrganizationStatusChanged(orgId, active);
    }

    // =========================================================================
    // ELIGIBILITY
    // =========================================================================

    /// @notice Check if a user is eligible to create an organization
    function isEligibleToCreateOrganization(address user) public view returns (bool) {
        return activityScore[user] >= organizationCreationThreshold;
    }

    // =========================================================================
    // ORGANIZATION FUNCTIONS
    // =========================================================================

    /// @notice Create a new organization. Caller becomes the organization owner.
    function createOrganization(string calldata name, string calldata description)
        external
        returns (uint256 orgId)
    {
        if (!isEligibleToCreateOrganization(msg.sender)) {
            revert NotEligibleToCreateOrganization(msg.sender, activityScore[msg.sender], organizationCreationThreshold);
        }
        if (bytes(name).length == 0) revert EmptyName();
        if (bytes(description).length == 0) revert EmptyDescription();

        orgId = _nextOrgId++;
        _organizations[orgId] = Organization({
            id: orgId,
            owner: msg.sender,   // The CALLER is the owner — not the Protocol Admin
            name: name,
            description: description,
            createdAt: uint64(block.timestamp),
            active: true
        });

        _ownerOrganizations[msg.sender].push(orgId);
        _allOrganizationIds.push(orgId);

        emit OrganizationCreated(orgId, msg.sender, name);
    }

    // =========================================================================
    // VOUCHER PROGRAM FUNCTIONS (Organization Owner only)
    // =========================================================================

    /// @notice Create a voucher program within an organization
    function createProgram(
        uint256 orgId,
        string calldata name,
        string calldata description,
        bytes32 categoryCode,
        uint64 startsAt,
        uint64 expiresAt
    ) external onlyOrgOwner(orgId) orgActive(orgId) returns (uint256 programId) {
        if (bytes(name).length == 0) revert EmptyName();
        if (expiresAt != 0 && expiresAt <= uint64(block.timestamp)) revert InvalidExpiry();
        if (expiresAt != 0 && startsAt >= expiresAt) revert InvalidExpiry();

        programId = _nextProgramId++;
        _programs[programId] = VoucherProgram({
            id: programId,
            organizationId: orgId,
            name: name,
            description: description,
            categoryCode: categoryCode,
            totalFunded: 0,
            totalAllocated: 0,
            totalRedeemed: 0,
            totalRefunded: 0,
            createdAt: uint64(block.timestamp),
            startsAt: startsAt == 0 ? uint64(block.timestamp) : startsAt,
            expiresAt: expiresAt,
            status: ProgramStatus.Draft
        });

        _orgPrograms[orgId].push(programId);
        emit ProgramCreated(programId, orgId, name, categoryCode);
    }

    /// @notice Fund a program with native BOT
    function fundProgram(uint256 orgId, uint256 programId)
        external
        payable
        onlyOrgOwner(orgId)
        orgActive(orgId)
    {
        if (msg.value == 0) revert AmountIsZero();
        _requireProgram(programId, orgId);

        VoucherProgram storage prog = _programs[programId];
        if (prog.status == ProgramStatus.Closed) revert ProgramAlreadyClosed();

        prog.totalFunded += msg.value;
        emit ProgramFunded(programId, orgId, msg.value, prog.totalFunded);
    }

    /// @notice Activate a program (from Draft or Paused)
    function activateProgram(uint256 orgId, uint256 programId) external onlyOrgOwner(orgId) orgActive(orgId) {
        _requireProgram(programId, orgId);
        VoucherProgram storage prog = _programs[programId];
        if (prog.status == ProgramStatus.Active) revert InvalidProgramTransition();
        if (prog.status == ProgramStatus.Closed) revert ProgramAlreadyClosed();
        prog.status = ProgramStatus.Active;
        emit ProgramStatusChanged(programId, orgId, ProgramStatus.Active);
    }

    /// @notice Pause an active program
    function pauseProgram(uint256 orgId, uint256 programId) external onlyOrgOwner(orgId) {
        _requireProgram(programId, orgId);
        VoucherProgram storage prog = _programs[programId];
        if (prog.status != ProgramStatus.Active) revert InvalidProgramTransition();
        prog.status = ProgramStatus.Paused;
        emit ProgramStatusChanged(programId, orgId, ProgramStatus.Paused);
    }

    /// @notice Close a program permanently
    function closeProgram(uint256 orgId, uint256 programId) external onlyOrgOwner(orgId) {
        _requireProgram(programId, orgId);
        VoucherProgram storage prog = _programs[programId];
        if (prog.status == ProgramStatus.Closed) revert ProgramAlreadyClosed();
        prog.status = ProgramStatus.Closed;
        emit ProgramStatusChanged(programId, orgId, ProgramStatus.Closed);
    }

    // =========================================================================
    // BENEFICIARY MANAGEMENT (Organization Owner only)
    // =========================================================================

    /// @notice Approve a beneficiary for an organization
    function approveBeneficiary(uint256 orgId, address beneficiary) external onlyOrgOwner(orgId) orgActive(orgId) {
        if (beneficiary == address(0)) revert InvalidAddress();
        if (beneficiary == msg.sender) revert BeneficiaryCannotSelfApprove();
        if (_approvedBeneficiaries[orgId][beneficiary]) revert BeneficiaryAlreadyApproved(beneficiary);

        _approvedBeneficiaries[orgId][beneficiary] = true;
        _orgBeneficiaryList[orgId].push(beneficiary);
        emit BeneficiaryApproved(orgId, beneficiary);
    }

    /// @notice Deactivate a beneficiary
    function deactivateBeneficiary(uint256 orgId, address beneficiary) external onlyOrgOwner(orgId) {
        if (!_approvedBeneficiaries[orgId][beneficiary]) revert BeneficiaryNotApproved(beneficiary);
        _approvedBeneficiaries[orgId][beneficiary] = false;
        emit BeneficiaryDeactivated(orgId, beneficiary);
    }

    /// @notice Check if an address is an approved beneficiary
    function isBeneficiaryApproved(uint256 orgId, address beneficiary) external view returns (bool) {
        return _approvedBeneficiaries[orgId][beneficiary];
    }

    // =========================================================================
    // MERCHANT MANAGEMENT (Organization Owner only)
    // =========================================================================

    /// @notice Approve a merchant for an organization
    function approveMerchant(
        uint256 orgId,
        address merchantAddr,
        string calldata name,
        bytes32 categoryCode
    ) external onlyOrgOwner(orgId) orgActive(orgId) {
        if (merchantAddr == address(0)) revert InvalidAddress();
        if (merchantAddr == msg.sender) revert MerchantCannotSelfApprove();
        if (bytes(name).length == 0) revert EmptyName();
        if (_merchants[orgId][merchantAddr].account != address(0)) revert MerchantAlreadyApproved(merchantAddr);

        _merchants[orgId][merchantAddr] = Merchant({
            account: merchantAddr,
            name: name,
            categoryCode: categoryCode,
            active: true
        });
        _orgMerchantList[orgId].push(merchantAddr);
        emit MerchantApproved(orgId, merchantAddr, name, categoryCode);
    }

    /// @notice Deactivate a merchant
    function deactivateMerchant(uint256 orgId, address merchantAddr) external onlyOrgOwner(orgId) {
        Merchant storage m = _merchants[orgId][merchantAddr];
        if (m.account == address(0)) revert MerchantNotApproved(merchantAddr);
        m.active = false;
        emit MerchantDeactivated(orgId, merchantAddr);
    }

    /// @notice Reactivate a previously deactivated merchant
    function reactivateMerchant(uint256 orgId, address merchantAddr) external onlyOrgOwner(orgId) {
        Merchant storage m = _merchants[orgId][merchantAddr];
        if (m.account == address(0)) revert MerchantNotApproved(merchantAddr);
        m.active = true;
        emit MerchantApproved(orgId, merchantAddr, m.name, m.categoryCode);
    }

    // =========================================================================
    // VOUCHER ISSUANCE (Organization Owner only)
    // =========================================================================

    /// @notice Issue a voucher to an approved beneficiary
    /// @param orgId Organization ID
    /// @param programId Program ID
    /// @param beneficiary Beneficiary wallet address
    /// @param amount Voucher value in BOT (wei)
    /// @param expiresAt Expiry timestamp (must be future)
    /// @param allowedMerchant Specific merchant restriction; address(0) = any approved merchant in category
    function issueVoucher(
        uint256 orgId,
        uint256 programId,
        address beneficiary,
        uint256 amount,
        uint64 expiresAt,
        address allowedMerchant
    ) external onlyOrgOwner(orgId) orgActive(orgId) returns (uint256 voucherId) {
        if (amount == 0) revert AmountIsZero();
        if (beneficiary == address(0)) revert InvalidAddress();
        if (expiresAt <= uint64(block.timestamp)) revert InvalidExpiry();
        if (!_approvedBeneficiaries[orgId][beneficiary]) revert BeneficiaryNotApproved(beneficiary);

        _requireProgram(programId, orgId);
        VoucherProgram storage prog = _programs[programId];

        if (prog.status != ProgramStatus.Active) revert ProgramNotActive(programId);
        if (prog.expiresAt != 0 && uint64(block.timestamp) >= prog.expiresAt) revert ProgramExpired();

        // Enforce funding: available = totalFunded - totalAllocated - totalRedeemed - totalRefunded
        uint256 available = _availableFunds(prog);
        if (available < amount) revert InsufficientProgramFunds(available, amount);

        // Validate specific merchant restriction if set
        if (allowedMerchant != address(0)) {
            Merchant storage m = _merchants[orgId][allowedMerchant];
            if (m.account == address(0)) revert MerchantNotApproved(allowedMerchant);
            if (m.categoryCode != prog.categoryCode) revert MerchantCategoryMismatch(prog.categoryCode, m.categoryCode);
        }

        prog.totalAllocated += amount;

        voucherId = _nextVoucherId++;
        _vouchers[voucherId] = Voucher({
            id: voucherId,
            organizationId: orgId,
            programId: programId,
            beneficiary: beneficiary,
            allocatedAmount: amount,
            remainingAmount: amount,
            redeemedAmount: 0,
            categoryCode: prog.categoryCode,
            allowedMerchant: allowedMerchant,
            issuedAt: uint64(block.timestamp),
            expiresAt: expiresAt,
            status: VoucherStatus.Active
        });

        _beneficiaryVouchers[beneficiary].push(voucherId);
        _programVouchers[programId].push(voucherId);

        emit VoucherIssued(voucherId, orgId, programId, beneficiary, amount, prog.categoryCode, expiresAt);
    }

    // =========================================================================
    // VOUCHER CANCELLATION (Organization Owner only)
    // =========================================================================

    /// @notice Cancel an active voucher; unused remaining amount returns to program pool
    function cancelVoucher(uint256 voucherId) external nonReentrant {
        if (!_voucherExists(voucherId)) revert VoucherNotFound(voucherId);
        Voucher storage v = _vouchers[voucherId];
        uint256 orgId = v.organizationId;

        if (_organizations[orgId].owner != msg.sender) revert NotOrganizationOwner(orgId);
        if (v.status == VoucherStatus.Cancelled) revert VoucherAlreadyCancelled();
        if (v.status == VoucherStatus.FullyRedeemed) revert VoucherFullyRedeemed(voucherId);

        uint256 remaining = v.remainingAmount;
        v.status = VoucherStatus.Cancelled;
        v.remainingAmount = 0;

        // Return outstanding allocation to program
        VoucherProgram storage prog = _programs[v.programId];
        prog.totalAllocated -= remaining;
        prog.totalRefunded += remaining;

        emit VoucherCancelled(voucherId, remaining);
    }

    // =========================================================================
    // EXPIRED VOUCHER RECLAMATION (Organization Owner only)
    // =========================================================================

    /// @notice Reclaim unused value from an expired voucher
    function reclaimExpiredVoucher(uint256 voucherId) external nonReentrant {
        if (!_voucherExists(voucherId)) revert VoucherNotFound(voucherId);
        Voucher storage v = _vouchers[voucherId];
        uint256 orgId = v.organizationId;

        if (_organizations[orgId].owner != msg.sender) revert NotOrganizationOwner(orgId);
        if (uint64(block.timestamp) <= v.expiresAt) revert VoucherNotExpired(voucherId);
        if (v.status == VoucherStatus.Cancelled) revert VoucherIsCancelled(voucherId);
        if (v.status == VoucherStatus.FullyRedeemed) revert VoucherFullyRedeemed(voucherId);

        uint256 remaining = v.remainingAmount;
        if (remaining == 0) revert AmountIsZero();

        v.status = VoucherStatus.Expired;
        v.remainingAmount = 0;

        VoucherProgram storage prog = _programs[v.programId];
        prog.totalAllocated -= remaining;
        prog.totalRefunded += remaining;

        emit ExpiredVoucherReclaimed(voucherId, remaining);
    }

    // =========================================================================
    // REDEMPTION (Beneficiary only)
    // =========================================================================

    /// @notice Redeem a voucher at an approved merchant
    /// @param voucherId The voucher to redeem against
    /// @param merchantAddr The merchant receiving BOT
    /// @param amount The BOT amount to redeem
    /// @param purchaseReference Optional reference string (e.g. invoice number)
    function redeemVoucher(
        uint256 voucherId,
        address merchantAddr,
        uint256 amount,
        string calldata purchaseReference
    ) external nonReentrant returns (uint256 redemptionId) {
        if (amount == 0) revert AmountIsZero();
        if (merchantAddr == address(0)) revert InvalidAddress();
        if (!_voucherExists(voucherId)) revert VoucherNotFound(voucherId);

        Voucher storage v = _vouchers[voucherId];

        // Authorization: only the voucher's beneficiary
        if (msg.sender != v.beneficiary) revert NotBeneficiary(voucherId);

        // Voucher state checks
        if (v.status == VoucherStatus.Cancelled) revert VoucherIsCancelled(voucherId);
        if (v.status == VoucherStatus.FullyRedeemed) revert VoucherFullyRedeemed(voucherId);
        if (v.status == VoucherStatus.Expired) revert VoucherExpired(voucherId);
        if (uint64(block.timestamp) > v.expiresAt) revert VoucherExpired(voucherId);

        // Amount check (double-spend guard)
        if (amount > v.remainingAmount) revert InsufficientVoucherBalance(v.remainingAmount, amount);

        // Org + program state
        uint256 orgId = v.organizationId;
        uint256 programId = v.programId;
        if (!_organizations[orgId].active) revert OrganizationInactive(orgId);

        VoucherProgram storage prog = _programs[programId];
        if (prog.status != ProgramStatus.Active) revert ProgramNotActive(programId);

        // Merchant checks
        Merchant storage m = _merchants[orgId][merchantAddr];
        if (m.account == address(0)) revert MerchantNotApproved(merchantAddr);
        if (!m.active) revert MerchantNotActive(merchantAddr);

        // Category match
        if (m.categoryCode != v.categoryCode) revert MerchantCategoryMismatch(v.categoryCode, m.categoryCode);

        // Specific merchant restriction
        if (v.allowedMerchant != address(0) && v.allowedMerchant != merchantAddr) {
            revert WrongMerchant(v.allowedMerchant, merchantAddr);
        }

        // =====================
        // CHECKS-EFFECTS-INTERACTIONS
        // =====================
        // Effects first
        v.remainingAmount -= amount;
        v.redeemedAmount += amount;
        prog.totalAllocated -= amount;
        prog.totalRedeemed += amount;

        if (v.remainingAmount == 0) {
            v.status = VoucherStatus.FullyRedeemed;
        } else {
            v.status = VoucherStatus.PartiallyRedeemed;
        }

        // Record redemption
        redemptionId = _nextRedemptionId++;
        _redemptions[redemptionId] = Redemption({
            id: redemptionId,
            voucherId: voucherId,
            organizationId: orgId,
            programId: programId,
            beneficiary: v.beneficiary,
            merchant: merchantAddr,
            amount: amount,
            purchaseReference: purchaseReference,
            redeemedAt: uint64(block.timestamp)
        });

        _voucherRedemptions[voucherId].push(redemptionId);
        _orgRedemptions[orgId].push(redemptionId);
        _allRedemptionIds.push(redemptionId);

        emit VoucherRedeemed(redemptionId, voucherId, orgId, v.beneficiary, merchantAddr, amount, purchaseReference);

        // Interaction last — transfer actual BOT to merchant
        (bool success, ) = merchantAddr.call{value: amount}("");
        if (!success) revert NativeTrasferFailed();
    }

    // =========================================================================
    // READ FUNCTIONS
    // =========================================================================

    function getOrganization(uint256 orgId) external view returns (Organization memory) {
        if (!_orgExists(orgId)) revert OrganizationNotFound(orgId);
        return _organizations[orgId];
    }

    function getOrganizationsByOwner(address owner) external view returns (Organization[] memory) {
        uint256[] memory ids = _ownerOrganizations[owner];
        Organization[] memory result = new Organization[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) {
            result[i] = _organizations[ids[i]];
        }
        return result;
    }

    function getAllOrganizations() external view returns (Organization[] memory) {
        uint256[] memory ids = _allOrganizationIds;
        Organization[] memory result = new Organization[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) {
            result[i] = _organizations[ids[i]];
        }
        return result;
    }

    function getTotalOrganizations() external view returns (uint256) {
        return _allOrganizationIds.length;
    }

    function getProgram(uint256 programId) external view returns (VoucherProgram memory) {
        if (!_programExists(programId)) revert ProgramNotFound(programId);
        return _programs[programId];
    }

    function getProgramsByOrganization(uint256 orgId) external view returns (VoucherProgram[] memory) {
        uint256[] memory ids = _orgPrograms[orgId];
        VoucherProgram[] memory result = new VoucherProgram[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) {
            result[i] = _programs[ids[i]];
        }
        return result;
    }

    function getVoucher(uint256 voucherId) external view returns (Voucher memory) {
        if (!_voucherExists(voucherId)) revert VoucherNotFound(voucherId);
        return _vouchers[voucherId];
    }

    function getVouchersByBeneficiary(address beneficiary) external view returns (Voucher[] memory) {
        uint256[] memory ids = _beneficiaryVouchers[beneficiary];
        Voucher[] memory result = new Voucher[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) {
            result[i] = _vouchers[ids[i]];
        }
        return result;
    }

    function getProgramVouchers(uint256 programId) external view returns (Voucher[] memory) {
        uint256[] memory ids = _programVouchers[programId];
        Voucher[] memory result = new Voucher[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) {
            result[i] = _vouchers[ids[i]];
        }
        return result;
    }

    function getMerchant(uint256 orgId, address merchantAddr) external view returns (Merchant memory) {
        return _merchants[orgId][merchantAddr];
    }

    function getOrgMerchants(uint256 orgId) external view returns (Merchant[] memory) {
        address[] memory addrs = _orgMerchantList[orgId];
        Merchant[] memory result = new Merchant[](addrs.length);
        for (uint256 i = 0; i < addrs.length; i++) {
            result[i] = _merchants[orgId][addrs[i]];
        }
        return result;
    }

    function getOrgBeneficiaries(uint256 orgId) external view returns (address[] memory) {
        return _orgBeneficiaryList[orgId];
    }

    function getRedemption(uint256 redemptionId) external view returns (Redemption memory) {
        return _redemptions[redemptionId];
    }

    function getVoucherRedemptions(uint256 voucherId) external view returns (Redemption[] memory) {
        uint256[] memory ids = _voucherRedemptions[voucherId];
        Redemption[] memory result = new Redemption[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) {
            result[i] = _redemptions[ids[i]];
        }
        return result;
    }

    function getOrgRedemptions(uint256 orgId) external view returns (Redemption[] memory) {
        uint256[] memory ids = _orgRedemptions[orgId];
        Redemption[] memory result = new Redemption[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) {
            result[i] = _redemptions[ids[i]];
        }
        return result;
    }

    function getAllRedemptions(uint256 offset, uint256 limit) external view returns (Redemption[] memory) {
        uint256 total = _allRedemptionIds.length;
        if (offset >= total) return new Redemption[](0);
        uint256 end = offset + limit > total ? total : offset + limit;
        Redemption[] memory result = new Redemption[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            result[i - offset] = _redemptions[_allRedemptionIds[i]];
        }
        return result;
    }

    function getTotalRedemptions() external view returns (uint256) {
        return _allRedemptionIds.length;
    }

    /// @notice Get program funding stats
    function getProgramStats(uint256 programId) external view returns (
        uint256 totalFunded,
        uint256 totalAllocated,
        uint256 totalRedeemed,
        uint256 totalRefunded,
        uint256 availableFunds
    ) {
        if (!_programExists(programId)) revert ProgramNotFound(programId);
        VoucherProgram storage prog = _programs[programId];
        totalFunded = prog.totalFunded;
        totalAllocated = prog.totalAllocated;
        totalRedeemed = prog.totalRedeemed;
        totalRefunded = prog.totalRefunded;
        availableFunds = _availableFunds(prog);
    }

    function getOrganizationStats(uint256 orgId) external view returns (
        uint256 programCount,
        uint256 merchantCount,
        uint256 beneficiaryCount,
        uint256 redemptionCount
    ) {
        programCount = _orgPrograms[orgId].length;
        merchantCount = _orgMerchantList[orgId].length;
        beneficiaryCount = _orgBeneficiaryList[orgId].length;
        redemptionCount = _orgRedemptions[orgId].length;
    }

    function getActivityScore(address user) external view returns (uint256) {
        return activityScore[user];
    }

    // =========================================================================
    // INTERNAL HELPERS
    // =========================================================================

    function _orgExists(uint256 orgId) internal view returns (bool) {
        return _organizations[orgId].createdAt != 0;
    }

    function _programExists(uint256 programId) internal view returns (bool) {
        return _programs[programId].createdAt != 0;
    }

    function _voucherExists(uint256 voucherId) internal view returns (bool) {
        return _vouchers[voucherId].issuedAt != 0;
    }

    function _requireProgram(uint256 programId, uint256 orgId) internal view {
        if (!_programExists(programId)) revert ProgramNotFound(programId);
        if (_programs[programId].organizationId != orgId) revert ProgramNotFound(programId);
    }

    /// @notice Available unallocated funds in a program
    /// available = totalFunded - totalAllocated - totalRedeemed - totalRefunded
    function _availableFunds(VoucherProgram storage prog) internal view returns (uint256) {
        uint256 used = prog.totalAllocated + prog.totalRedeemed + prog.totalRefunded;
        if (used >= prog.totalFunded) return 0;
        return prog.totalFunded - used;
    }

    /// @notice Allows contract to receive BOT directly
    receive() external payable {}
}
