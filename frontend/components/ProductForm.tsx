import { useState } from "react";
import { ethers } from "ethers";

export default function ProductForm({
  contract,
  onProductRegistered,
  onEventRegistered,
}: {
  contract: ethers.Contract | null;
  signer: ethers.Signer | null;
  onProductRegistered?: (
    _id: number,
    _quantity: number,
    _hash: string,
    _owner: string
  ) => void;
  onEventRegistered?: (
    _productId: number,
    _eventType: string,
    _eventData: string
  ) => void;
}) {
  const [id, setId] = useState(0);
  const [qty, setQty] = useState(1);
  const [hashText, setHashText] = useState("");
  const [eventProductId, setEventProductId] = useState(0);
  const [eventType, setEventType] = useState("");
  const [eventData, setEventData] = useState("");
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [loadingEvent, setLoadingEvent] = useState(false);

  const registerProduct = async () => {
    if (!contract) return;
    if (!hashText.trim()) return;

    setLoadingProduct(true);
    try {
      const hash = ethers.encodeBytes32String(hashText);
      const tx = await contract.registerProduct(id, qty, hash);
      const receipt = await tx.wait();

      // Extract event data
      const event = receipt.logs.find((log: ethers.Log) => {
        try {
          const parsed = contract.interface.parseLog(log);
          return parsed?.name === "ProductRegistered";
        } catch {
          return false;
        }
      });

      if (event) {
        const parsed = contract.interface.parseLog(event);
        if (parsed) {
          onProductRegistered?.(
            Number(parsed.args.id),
            Number(parsed.args.quantity),
            hashText,
            parsed.args.owner
          );
        }
      }

      setHashText(""); // Clear field
    } catch (error: unknown) {
      console.error("Error registering product:", error);
    } finally {
      setLoadingProduct(false);
    }
  };

  const registerEvent = async () => {
    if (!contract) return;
    if (!eventType.trim() || !eventData.trim()) return;

    setLoadingEvent(true);
    try {
      const tx = await contract.registerEvent(
        eventProductId,
        eventType,
        eventData
      );
      const receipt = await tx.wait();

      // Extract event data
      const event = receipt.logs.find((log: ethers.Log) => {
        try {
          const parsed = contract.interface.parseLog(log);
          return parsed?.name === "ProductEvent";
        } catch {
          return false;
        }
      });

      if (event) {
        const parsed = contract.interface.parseLog(event);
        if (parsed) {
          onEventRegistered?.(
            Number(parsed.args.productId),
            parsed.args.eventType,
            parsed.args.eventData
          );
        }
      }

      setEventType("");
      setEventData("");
    } catch (error: unknown) {
      console.error("Error registering event:", error);
    } finally {
      setLoadingEvent(false);
    }
  };

  return (
    <div>
      <h2
        style={{
          margin: "0 0 2rem 0",
          fontSize: "1.5rem",
          fontWeight: "600",
          color: "#1F2937",
          textAlign: "center",
        }}
      >
        📦 Product Management
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
          gap: "2rem",
        }}
      >
        {/* Register Product */}
        <div
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            borderRadius: "16px",
            padding: "2rem",
            color: "white",
          }}
        >
          <h3
            style={{
              margin: "0 0 1.5rem 0",
              fontSize: "1.25rem",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            🏷️ Register Product
          </h3>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                }}
              >
                Product ID
              </label>
              <input
                type="number"
                placeholder="Ex: 12345"
                value={id || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setId(parseInt(e.target.value) || 0)
                }
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "2px solid rgba(255, 255, 255, 0.3)",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  background: "rgba(255, 255, 255, 0.1)",
                  color: "white",
                  outline: "none",
                  transition: "border-color 0.2s ease",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                }}
              >
                Quantity
              </label>
              <input
                type="number"
                placeholder="Ex: 100"
                value={qty || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setQty(parseInt(e.target.value) || 1)
                }
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "2px solid rgba(255, 255, 255, 0.3)",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  background: "rgba(255, 255, 255, 0.1)",
                  color: "white",
                  outline: "none",
                  transition: "border-color 0.2s ease",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                }}
              >
                Characterization Hash
              </label>
              <input
                placeholder="Ex: product-characteristics-123"
                value={hashText}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setHashText(e.target.value)
                }
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "2px solid rgba(255, 255, 255, 0.3)",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  background: "rgba(255, 255, 255, 0.1)",
                  color: "white",
                  outline: "none",
                  transition: "border-color 0.2s ease",
                }}
              />
            </div>

            <button
              onClick={registerProduct}
              disabled={loadingProduct || !contract}
              style={{
                padding: "1rem",
                background: loadingProduct
                  ? "#6B7280"
                  : "rgba(255, 255, 255, 0.2)",
                color: "white",
                border: "2px solid rgba(255, 255, 255, 0.3)",
                borderRadius: "8px",
                fontSize: "1rem",
                fontWeight: "600",
                cursor: loadingProduct ? "not-allowed" : "pointer",
                transition: "all 0.3s ease",
              }}
            >
              {loadingProduct ? "⏳ Processing..." : "✅ Register Product"}
            </button>
          </div>
        </div>

        {/* Register Event */}
        <div
          style={{
            background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
            borderRadius: "16px",
            padding: "2rem",
            color: "white",
          }}
        >
          <h3
            style={{
              margin: "0 0 1.5rem 0",
              fontSize: "1.25rem",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            📋 Register Event
          </h3>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                }}
              >
                Product ID
              </label>
              <input
                type="number"
                placeholder="Ex: 12345"
                value={eventProductId || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEventProductId(parseInt(e.target.value) || 0)
                }
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "2px solid rgba(255, 255, 255, 0.3)",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  background: "rgba(255, 255, 255, 0.1)",
                  color: "white",
                  outline: "none",
                  transition: "border-color 0.2s ease",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                }}
              >
                Event Type
              </label>
              <select
                value={eventType}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setEventType(e.target.value)
                }
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "2px solid rgba(255, 255, 255, 0.3)",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  background: "rgba(255, 255, 255, 0.1)",
                  color: "white",
                  outline: "none",
                }}
              >
                <option value="">Select a type</option>
                <option value="CREATED">CREATED - Product created</option>
                <option value="SHIPPED">SHIPPED - Shipped</option>
                <option value="DELIVERED">DELIVERED - Delivered</option>
                <option value="STORED">STORED - Stored</option>
                <option value="PROCESSED">PROCESSED - Processed</option>
                <option value="QUALITY_CHECK">
                  QUALITY_CHECK - Quality control
                </option>
                <option value="SOLD">SOLD - Sold</option>
              </select>
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                }}
              >
                Event Data
              </label>
              <textarea
                placeholder="Ex: Product shipped from main warehouse to final client"
                value={eventData}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setEventData(e.target.value)
                }
                rows={3}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "2px solid rgba(255, 255, 255, 0.3)",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  background: "rgba(255, 255, 255, 0.1)",
                  color: "white",
                  outline: "none",
                  resize: "vertical",
                  fontFamily: "inherit",
                }}
              />
            </div>

            <button
              onClick={registerEvent}
              disabled={loadingEvent || !contract}
              style={{
                padding: "1rem",
                background: loadingEvent
                  ? "#6B7280"
                  : "rgba(255, 255, 255, 0.2)",
                color: "white",
                border: "2px solid rgba(255, 255, 255, 0.3)",
                borderRadius: "8px",
                fontSize: "1rem",
                fontWeight: "600",
                cursor: loadingEvent ? "not-allowed" : "pointer",
                transition: "all 0.3s ease",
              }}
            >
              {loadingEvent ? "⏳ Processing..." : "✅ Register Event"}
            </button>
          </div>
        </div>
      </div>

      {!contract && (
        <div
          style={{
            marginTop: "2rem",
            padding: "1.5rem",
            background: "#FEF3C7",
            border: "2px solid #F59E0B",
            borderRadius: "12px",
            textAlign: "center",
          }}
        >
          <p style={{ margin: "0", color: "#92400E", fontWeight: "500" }}>
            ⚠️ Connect your wallet and attach the contract to start registering
            products
          </p>
        </div>
      )}
    </div>
  );
}
