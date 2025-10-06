import { useEffect, useState } from "react";
import { ethers } from "ethers";
import ProductForm from "../components/ProductForm.js";

const ABI = [
  "function registerProduct(uint256 _id, uint256 _quantity, bytes32 _hash)",
  "function registerEvent(uint256 _productId, string _eventType, string _eventData)",
  "function getProduct(uint256 _id) view returns (uint256,uint256,bytes32,address)",
  "function exists(uint256 _id) view returns (bool)",
  "event ProductRegistered(uint256 indexed id, uint256 quantity, bytes32 characterizationHash, address indexed owner)",
  "event ProductEvent(uint256 indexed productId, string eventType, string eventData, uint256 timestamp)",
];

export default function Home() {
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [contractAddress, setContractAddress] = useState<string>("");
  const [logs, setLogs] = useState<
    {
      type: "product" | "event";
      data: {
        id?: number;
        quantity?: number;
        hash?: string;
        owner?: string;
        productId?: number;
        eventType?: string;
        eventData?: string;
      };
      timestamp: number;
    }[]
  >([]);
  const [walletConnected, setWalletConnected] = useState<boolean>(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  const showNotification = (
    type: "success" | "error" | "info",
    message: string
  ) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleProductRegistered = (
    id: number,
    quantity: number,
    hash: string,
    owner: string
  ) => {
    setLogs(prev => [
      {
        type: "product",
        data: { id, quantity, hash, owner },
        timestamp: Date.now(),
      },
      ...prev,
    ]);
    showNotification("success", `Product ${id} registered successfully!`);
  };

  const handleEventRegistered = (
    productId: number,
    eventType: string,
    eventData: string
  ) => {
    setLogs(prev => [
      {
        type: "event",
        data: { productId, eventType, eventData },
        timestamp: Date.now(),
      },
      ...prev,
    ]);
    showNotification(
      "success",
      `Event ${eventType} registered for product ${productId}!`
    );
  };

  useEffect(() => {
    // Compatible with Brave, MetaMask, and other wallets
    if ((window as { ethereum?: unknown }).ethereum) {
      try {
        console.log(
          "Wallet detected:",
          (window as { ethereum?: { isMetaMask?: boolean } }).ethereum
            ?.isMetaMask
            ? "MetaMask"
            : "Brave"
        );
        // Create provider directly with ethers
        new ethers.BrowserProvider(
          (window as { ethereum?: unknown }).ethereum as ethers.Eip1193Provider
        );
        console.log("✅ Provider initialized correctly");
      } catch (error) {
        console.error("Error initializing provider:", error);
      }
    } else {
      console.log("❌ No wallet detected");
    }
  }, []);

  const connectWallet = async () => {
    console.log("🔗 Starting wallet connection...");

    try {
      // Check if ethereum is available
      if (!(window as { ethereum?: unknown }).ethereum) {
        showNotification(
          "error",
          "Wallet not detected. Install MetaMask or use Brave Browser."
        );
        return;
      }

      // Create provider directly
      const ethereumProvider = new ethers.BrowserProvider(
        (window as { ethereum?: unknown }).ethereum as ethers.Eip1193Provider
      );
      console.log("✅ Provider created");

      // Request account access
      console.log("📝 Requesting account access...");
      await ethereumProvider.send("eth_requestAccounts", []);

      // Get signer
      console.log("🔑 Getting signer...");
      const signer = await ethereumProvider.getSigner();
      const address = await signer.getAddress();

      // Get network
      const network = await ethereumProvider.getNetwork();
      console.log("🌐 Network:", network);

      // Verify we're on Fuji Testnet
      if (network.chainId !== 43113n) {
        showNotification(
          "error",
          `You're on ${network.name} (Chain ID: ${network.chainId}). Please switch to Fuji Testnet (Chain ID: 43113)`
        );
        return;
      }

      // Configure state
      setSigner(signer);
      setWalletConnected(true);

      showNotification(
        "success",
        `Wallet connected successfully! Account: ${address.substring(
          0,
          6
        )}...${address.substring(38)}`
      );
    } catch (error: unknown) {
      console.error("❌ Error:", error);

      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      const errorCode = (error as { code?: number })?.code;

      if (errorCode === 4001) {
        showNotification("error", "Connection rejected by user.");
      } else if (
        errorMessage.includes("wallet must has at least one account")
      ) {
        showNotification(
          "error",
          "Your wallet has no accounts. Import a test account."
        );
      } else {
        showNotification("error", `Error: ${errorMessage}`);
      }
    }
  };

  const deployContract = async () => {
    if (!signer) {
      showNotification("error", "Connect your wallet first");
      return;
    }
    try {
      showNotification("info", "Attaching Fuji contract...");
      // Use the deployed contract address on Fuji
      const deployedAddress = "0x4AfAA2E7BE37b2A59f409438b32Af29fA6609e23";
      setContractAddress(deployedAddress);
      const c = new ethers.Contract(deployedAddress, ABI, signer);
      setContract(c);
      showNotification("success", "Contract attached! You can start using it.");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      showNotification("error", `Error attaching contract: ${errorMessage}`);
    }
  };

  const attachContract = async () => {
    if (!signer) {
      showNotification("error", "Connect your wallet first");
      return;
    }
    if (!contractAddress) {
      showNotification("error", "Enter contract address");
      return;
    }
    try {
      const c = new ethers.Contract(contractAddress, ABI, signer);
      setContract(c);
      showNotification("success", "Contract attached successfully");

      // Event listeners
      c.on("ProductRegistered", (id, quantity, hash, owner) => {
        setLogs(prev => [
          {
            type: "product",
            data: {
              id: Number(id),
              quantity: Number(quantity),
              hash: hash,
              owner: owner,
            },
            timestamp: Date.now(),
          },
          ...prev,
        ]);
      });
      c.on("ProductEvent", (productId, eventType, eventData) => {
        setLogs(prev => [
          {
            type: "event",
            data: { productId: Number(productId), eventType, eventData },
            timestamp: Date.now(),
          },
          ...prev,
        ]);
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      showNotification("error", `Error attaching contract: ${errorMessage}`);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        padding: "0",
        margin: "0",
      }}
    >
      {/* Header */}
      <header
        style={{
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
          padding: "1rem 2rem",
          borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h1
            style={{
              margin: "0",
              fontSize: "1.8rem",
              fontWeight: "700",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            📦 Product Tracker DApp
          </h1>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            <div
              style={{
                padding: "0.5rem 1rem",
                background: walletConnected ? "#10B981" : "#6B7280",
                color: "white",
                borderRadius: "25px",
                fontSize: "0.875rem",
                fontWeight: "500",
              }}
            >
              {walletConnected ? "🟢 Connected" : "🔴 Disconnected"}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "2rem",
        }}
      >
        {/* Instructions Card */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            borderRadius: "16px",
            padding: "2rem",
            marginBottom: "2rem",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
          }}
        >
          <h2
            style={{
              margin: "0 0 1.5rem 0",
              fontSize: "1.5rem",
              fontWeight: "600",
              color: "#1F2937",
            }}
          >
            🚀 Fuji Testnet Configuration
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "1.5rem",
            }}
          >
            <div>
              <h3
                style={{
                  margin: "0 0 0.75rem 0",
                  fontSize: "1.1rem",
                  fontWeight: "600",
                  color: "#374151",
                }}
              >
                🔧 Configure Wallet
              </h3>
              <ul
                style={{ margin: "0", paddingLeft: "1.5rem", color: "#6B7280" }}
              >
                <li>
                  Network Name: <strong>Avalanche Fuji</strong>
                </li>
                <li>
                  RPC URL:{" "}
                  <code>https://avalanche-fuji-c-chain-rpc.publicnode.com</code>
                </li>
                <li>
                  Chain ID: <strong>43113</strong>
                </li>
                <li>
                  Currency: <strong>AVAX</strong>
                </li>
              </ul>
            </div>
            <div>
              <h3
                style={{
                  margin: "0 0 0.75rem 0",
                  fontSize: "1.1rem",
                  fontWeight: "600",
                  color: "#374151",
                }}
              >
                💰 Get AVAX
              </h3>
              <a
                href="https://faucet.avax-test.network/"
                target="_blank"
                style={{
                  display: "inline-block",
                  padding: "0.75rem 1.5rem",
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                  textDecoration: "none",
                  borderRadius: "8px",
                  fontWeight: "500",
                  transition: "transform 0.2s ease",
                }}
              >
                🚰 Fuji Faucet
              </a>
            </div>
          </div>
          <div
            style={{
              marginTop: "1.5rem",
              padding: "1rem",
              background: "#F3F4F6",
              borderRadius: "8px",
              border: "1px solid #E5E7EB",
            }}
          >
            <strong style={{ color: "#374151" }}>📋 Deployed Contract:</strong>
            <code
              style={{
                display: "block",
                marginTop: "0.5rem",
                padding: "0.5rem",
                background: "#1F2937",
                color: "#10B981",
                borderRadius: "4px",
                fontSize: "0.875rem",
                wordBreak: "break-all",
              }}
            >
              0x4AfAA2E7BE37b2A59f409438b32Af29fA6609e23
            </code>
          </div>
        </div>

        {/* Wallet Connection */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            borderRadius: "16px",
            padding: "2rem",
            marginBottom: "2rem",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
          }}
        >
          <h2
            style={{
              margin: "0 0 1.5rem 0",
              fontSize: "1.5rem",
              fontWeight: "600",
              color: "#1F2937",
            }}
          >
            🔗 Wallet Connection
          </h2>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "1rem",
              alignItems: "center",
            }}
          >
            <button
              onClick={connectWallet}
              style={{
                padding: "1rem 2rem",
                background: walletConnected
                  ? "linear-gradient(135deg, #10B981 0%, #059669 100%)"
                  : "linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)",
                color: "white",
                border: "none",
                borderRadius: "12px",
                fontSize: "1rem",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.3s ease",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
              }}
            >
              {walletConnected ? "✅ Wallet Connected" : "🔗 Connect Wallet"}
            </button>

            <input
              placeholder="Contract address (optional)"
              value={contractAddress}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setContractAddress(e.target.value)
              }
              style={{
                flex: "1",
                minWidth: "300px",
                padding: "1rem",
                border: "2px solid #E5E7EB",
                borderRadius: "12px",
                fontSize: "1rem",
                outline: "none",
                transition: "border-color 0.2s ease",
              }}
            />

            <button
              onClick={deployContract}
              style={{
                padding: "1rem 1.5rem",
                background: "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)",
                color: "white",
                border: "none",
                borderRadius: "12px",
                fontSize: "1rem",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.3s ease",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
              }}
            >
              ✅ Use Fuji Contract
            </button>

            <button
              onClick={attachContract}
              style={{
                padding: "1rem 1.5rem",
                background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
                color: "white",
                border: "none",
                borderRadius: "12px",
                fontSize: "1rem",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.3s ease",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
              }}
            >
              📎 Attach Contract
            </button>
          </div>
        </div>

        {/* Product Form */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            borderRadius: "16px",
            padding: "2rem",
            marginBottom: "2rem",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
          }}
        >
          <ProductForm
            contract={contract}
            signer={signer}
            onProductRegistered={handleProductRegistered}
            onEventRegistered={handleEventRegistered}
          />
        </div>

        {/* Logs Section */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            borderRadius: "16px",
            padding: "2rem",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
          }}
        >
          <h2
            style={{
              margin: "0 0 1.5rem 0",
              fontSize: "1.5rem",
              fontWeight: "600",
              color: "#1F2937",
            }}
          >
            📊 Activity Logs
          </h2>
          <div
            style={{
              background: "#1F2937",
              borderRadius: "12px",
              padding: "1.5rem",
              minHeight: "200px",
              maxHeight: "400px",
              overflowY: "auto",
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            {logs.length === 0 ? (
              <div
                style={{
                  color: "#6B7280",
                  textAlign: "center",
                  padding: "2rem",
                  fontSize: "1rem",
                }}
              >
                📝 No logs yet. Register a product to see activity here.
              </div>
            ) : (
              logs.map((log, i: number) => (
                <div
                  key={i}
                  style={{
                    marginBottom: "0.75rem",
                    padding: "0.75rem",
                    borderRadius: "8px",
                    border: `1px solid ${
                      log.type === "product"
                        ? "rgba(102, 126, 234, 0.3)"
                        : "rgba(16, 185, 129, 0.3)"
                    }`,
                    background:
                      log.type === "product"
                        ? "rgba(102, 126, 234, 0.1)"
                        : "rgba(16, 185, 129, 0.1)",
                  }}
                >
                  {log.type === "product" ? (
                    <div>
                      <div
                        style={{
                          color: "#667eea",
                          fontWeight: "600",
                          fontSize: "0.875rem",
                          marginBottom: "0.25rem",
                        }}
                      >
                        🏷️ Product Registered
                      </div>
                      <div style={{ color: "#E5E7EB", fontSize: "0.8rem" }}>
                        ID: {log.data.id} | Quantity: {log.data.quantity} |
                        Hash: {log.data.hash?.substring(0, 20)}...
                      </div>
                      <div
                        style={{
                          color: "#9CA3AF",
                          fontSize: "0.75rem",
                          marginTop: "0.25rem",
                        }}
                      >
                        Owner: {log.data.owner?.substring(0, 6)}...
                        {log.data.owner?.substring(38)} |{" "}
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div
                        style={{
                          color: "#10B981",
                          fontWeight: "600",
                          fontSize: "0.875rem",
                          marginBottom: "0.25rem",
                        }}
                      >
                        📋 Event Registered
                      </div>
                      <div style={{ color: "#E5E7EB", fontSize: "0.8rem" }}>
                        Product: {log.data.productId} | Type:{" "}
                        {log.data.eventType}
                      </div>
                      <div
                        style={{
                          color: "#9CA3AF",
                          fontSize: "0.75rem",
                          marginTop: "0.25rem",
                        }}
                      >
                        Data: {log.data.eventData} |{" "}
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        style={{
          background: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(10px)",
          padding: "2rem",
          textAlign: "center",
          color: "white",
          borderTop: "1px solid rgba(255, 255, 255, 0.2)",
        }}
      >
        <p style={{ margin: "0", fontSize: "0.875rem", opacity: "0.8" }}>
          🚀 Product Tracker DApp - Built with Solidity, Hardhat, React and
          ethers.js
        </p>
      </footer>

      {/* Notification */}
      {notification && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            background:
              notification.type === "success"
                ? "#10B981"
                : notification.type === "error"
                ? "#EF4444"
                : "#3B82F6",
            color: "white",
            padding: "1rem 1.5rem",
            borderRadius: "12px",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
            zIndex: 1000,
            maxWidth: "400px",
            animation: "slideIn 0.3s ease-out",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.875rem",
              fontWeight: "500",
            }}
          >
            {notification.type === "success" && "✅"}
            {notification.type === "error" && "❌"}
            {notification.type === "info" && "ℹ️"}
            {notification.message}
          </div>
        </div>
      )}
    </div>
  );
}
