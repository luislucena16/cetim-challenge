import { expect } from "chai";
import hardhat from "hardhat";
const { ethers } = hardhat;

describe("ProductRegistry", function () {
  let ProductRegistry, registry, owner;

  beforeEach(async function () {
    ProductRegistry = await ethers.getContractFactory("ProductRegistry");
    [owner] = await ethers.getSigners();
    registry = await ProductRegistry.deploy();
  });

  it("should register a product and emit ProductRegistered", async function () {
    await expect(
      registry
        .connect(owner)
        .registerProduct(1, 10, ethers.encodeBytes32String("hash1"))
    )
      .to.emit(registry, "ProductRegistered")
      .withArgs(1, 10, ethers.encodeBytes32String("hash1"), owner.address);
  });

  it("should not allow duplicate product registration", async function () {
    await registry.registerProduct(2, 5, ethers.encodeBytes32String("h2"));
    await expect(
      registry.registerProduct(2, 3, ethers.encodeBytes32String("h3"))
    ).to.be.revertedWithCustomError(registry, "ProductAlreadyRegistered");
  });

  it("should register product events and emit ProductEvent", async function () {
    await registry.registerProduct(3, 7, ethers.encodeBytes32String("h3"));
    const tx = await registry.registerEvent(
      3,
      "SHIPPED",
      "Shipment to warehouse"
    );
    const receipt = await tx.wait();
    const event = receipt.logs.find(log => {
      try {
        const parsed = registry.interface.parseLog(log);
        return parsed.name === "ProductEvent";
      } catch {
        return false;
      }
    });
    expect(event).to.not.be.undefined;
    const parsed = registry.interface.parseLog(event);
    expect(parsed.args.productId).to.equal(3);
    expect(parsed.args.eventType).to.equal("SHIPPED");
    expect(parsed.args.eventData).to.equal("Shipment to warehouse");
  });

  it("should revert when trying to register event for non-existent product", async function () {
    await expect(
      registry.registerEvent(999, "X", "Y")
    ).to.be.revertedWithCustomError(registry, "ProductNotFound");
  });

  it("should revert when non-owner tries to register event", async function () {
    const [, addr1] = await ethers.getSigners();
    await registry.registerProduct(4, 5, ethers.encodeBytes32String("h4"));

    await expect(
      registry.connect(addr1).registerEvent(4, "SHIPPED", "Test data")
    ).to.be.revertedWithCustomError(registry, "Unauthorized");
  });
});
