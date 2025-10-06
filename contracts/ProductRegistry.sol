// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title ProductRegistry
 * @author Product Tracker DApp
 * @notice A smart contract for tracking products and their lifecycle events on the blockchain
 * @dev Implements a registry system for product traceability with custom errors for gas efficiency
 */
contract ProductRegistry {
    // Custom errors
    error ProductAlreadyRegistered();
    error InvalidQuantity();
    error ProductNotFound();
    error InvalidProductId();
    error InvalidHash();
    error Unauthorized();

    /**
     * @notice Product structure containing all relevant information
     * @param id Unique identifier for the product
     * @param quantity Number of units of the product
     * @param characterizationHash Hash representing product characteristics
     * @param owner Address that registered the product
     * @param exists Boolean flag indicating if product is registered
     */
    struct Product {
        uint256 id;
        uint256 quantity;
        bytes32 characterizationHash;
        address owner;
        bool exists;
    }

    /**
     * @notice Emitted when a new product is registered
     * @param id The product identifier
     * @param quantity The quantity of the product
     * @param characterizationHash Hash of product characteristics
     * @param owner The address that registered the product
     */
    event ProductRegistered(uint256 indexed id, uint256 quantity, bytes32 characterizationHash, address indexed owner);

    /**
     * @notice Emitted when an event is registered for a product
     * @param productId The product identifier
     * @param eventType Type of event (e.g., "SHIPPED", "DELIVERED")
     * @param eventData Additional data about the event
     * @param timestamp Block timestamp when event was registered
     */
    event ProductEvent(uint256 indexed productId, string eventType, string eventData, uint256 timestamp);

    /// @notice Mapping from product ID to Product struct
    mapping(uint256 => Product) private _products;

    /**
     * @notice Registers a new product in the registry
     * @dev Reverts if product ID already exists or quantity is zero
     * @param _id Unique identifier for the product
     * @param _quantity Number of units of the product (must be > 0)
     * @param _hash Hash representing the product's characterization data
     * @custom:event Emits ProductRegistered event upon successful registration
     */
    function registerProduct(uint256 _id, uint256 _quantity, bytes32 _hash) external {
        if (_products[_id].exists) revert ProductAlreadyRegistered();
        if (_quantity == 0) revert InvalidQuantity();
        if (_id == 0) revert InvalidProductId();
        if (_hash == bytes32(0)) revert InvalidHash();

        _products[_id] = Product({
            id: _id,
            quantity: _quantity,
            characterizationHash: _hash,
            owner: msg.sender,
            exists: true
        });

        emit ProductRegistered(_id, _quantity, _hash, msg.sender);
    }

    /**
     * @notice Registers an event for an existing product
     * @dev Reverts if the product doesn't exist or caller is not the product owner
     * @param _productId The ID of the product to register an event for
     * @param _eventType Type of event (e.g., "SHIPPED", "DELIVERED", "QUALITY_CHECK")
     * @param _eventData Additional information about the event
     * @custom:event Emits ProductEvent with block timestamp
     */
    function registerEvent(uint256 _productId, string calldata _eventType, string calldata _eventData) external {
        if (!_products[_productId].exists) revert ProductNotFound();
        if (_products[_productId].owner != msg.sender) revert Unauthorized();
        emit ProductEvent(_productId, _eventType, _eventData, block.timestamp);
    }

    /**
     * @notice Retrieves product information by ID
     * @dev Reverts if product doesn't exist
     * @param _id The product identifier
     * @return id The product ID
     * @return quantity The quantity of the product
     * @return characterizationHash The product's characterization hash
     * @return owner The address that registered the product
     */
    function getProduct(uint256 _id) external view returns (uint256, uint256, bytes32, address) {
        if (!_products[_id].exists) revert ProductNotFound();
        Product storage p = _products[_id];
        return (p.id, p.quantity, p.characterizationHash, p.owner);
    }

    /**
     * @notice Checks if a product exists in the registry
     * @param _id The product identifier to check
     * @return exists True if the product is registered, false otherwise
     */
    function exists(uint256 _id) external view returns (bool) {
        return _products[_id].exists;
    }
}
