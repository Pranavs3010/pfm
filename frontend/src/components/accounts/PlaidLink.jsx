import React, { useState, useEffect } from "react";
import { plaidAPI } from "../../services/api";
import { Plus, Link2, X, RefreshCw } from "lucide-react";

const PlaidLink = ({ onAccountAdded }) => {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [plaidLoaded, setPlaidLoaded] = useState(false);

  // Load Plaid script with better error handling
  useEffect(() => {
    let script = document.querySelector(
      'script[src="https://cdn.plaid.com/link/v2/stable/link-initialize.js"]'
    );

    if (!script) {
      script = document.createElement("script");
      script.src = "https://cdn.plaid.com/link/v2/stable/link-initialize.js";
      script.async = true;
      script.onload = () => {
        console.log("✅ Plaid script loaded successfully");
        setPlaidLoaded(true);
      };
      script.onerror = () => {
        console.error("❌ Failed to load Plaid script");
        setPlaidLoaded(false);
      };
      document.body.appendChild(script);
    } else {
      // Script already exists, check if it's loaded
      if (window.Plaid) {
        setPlaidLoaded(true);
      } else {
        // Re-add onload handler if script exists but Plaid isn't loaded
        script.onload = () => {
          console.log("✅ Plaid script loaded (re-attached)");
          setPlaidLoaded(true);
        };
      }
    }

    // Check if Plaid is already available (might be cached)
    const checkPlaid = setInterval(() => {
      if (window.Plaid && !plaidLoaded) {
        console.log("✅ Plaid detected (cached)");
        setPlaidLoaded(true);
        clearInterval(checkPlaid);
      }
    }, 100);

    // Cleanup after 5 seconds
    setTimeout(() => clearInterval(checkPlaid), 5000);

    return () => {
      clearInterval(checkPlaid);
    };
  }, []);

  const handleConnectBank = async () => {
    try {
      setLoading(true);
      console.log("🔄 Starting Plaid connection...");

      // Check if Plaid is loaded
      if (!window.Plaid) {
        console.log("❌ Plaid not found, checking status...");

        // Try to reload the script
        const script = document.createElement("script");
        script.src = "https://cdn.plaid.com/link/v2/stable/link-initialize.js";
        script.async = true;

        return new Promise((resolve) => {
          script.onload = () => {
            console.log("✅ Plaid loaded on retry");
            setPlaidLoaded(true);
            // Retry the connection after a short delay
            setTimeout(() => {
              handleConnectBank();
            }, 500);
          };
          script.onerror = () => {
            console.error("❌ Failed to load Plaid on retry");
            alert(
              "Failed to load bank connection. Please check your internet connection and try again."
            );
            setLoading(false);
          };
          document.body.appendChild(script);
        });
      }

      console.log("✅ Plaid library is loaded, getting link token...");

      // Get link token from backend
      const response = await plaidAPI.createLinkToken();
      console.log("📦 Backend response:", response.data);

      const { linkToken } = response.data;

      if (!linkToken) {
        throw new Error("No link token received from server");
      }

      console.log("🔑 Link token received, opening Plaid...");

      // Create Plaid handler
      const handler = window.Plaid.create({
        token: linkToken,
        onSuccess: (publicToken, metadata) => {
          console.log("🎉 Plaid Success!", { publicToken, metadata });
          handleSuccess(publicToken, metadata);
        },
        onExit: (err, metadata) => {
          console.log("🚪 Plaid Exit:", err, metadata);
          setShowModal(false);
          setLoading(false);
          if (err) {
            console.warn("Plaid exit with error:", err);
          }
        },
        onEvent: (eventName, metadata) => {
          console.log("📢 Plaid Event:", eventName, metadata);
        },
      });

      // Open Plaid Link
      handler.open();
      setShowModal(true);
      console.log("🪟 Plaid window opened");
    } catch (error) {
      console.error("💥 Plaid connection error:", error);

      let errorMessage = "Failed to connect bank. ";

      if (error.response?.data?.message) {
        errorMessage += error.response.data.message;
      } else if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += "Please try again.";
      }

      alert(errorMessage);
      setLoading(false);
    }
  };

  const handleSuccess = async (publicToken, metadata) => {
    try {
      console.log("🔄 Exchanging public token...");

      await plaidAPI.exchangePublicToken({
        publicToken,
        institutionId: metadata.institution.institution_id,
        institutionName: metadata.institution.name,
      });

      console.log("✅ Bank account connected successfully!");

      setShowModal(false);
      setLoading(false);

      if (onAccountAdded) {
        onAccountAdded();
      }

      alert(
        "🎉 Bank account connected successfully! Transactions will start syncing."
      );
    } catch (error) {
      console.error("❌ Error exchanging token:", error);
      alert(
        `Connected but sync failed: ${
          error.response?.data?.message || error.message
        }`
      );
      setLoading(false);
    }
  };

  const reloadPlaid = () => {
    // Remove existing script
    const existingScript = document.querySelector(
      'script[src="https://cdn.plaid.com/link/v2/stable/link-initialize.js"]'
    );
    if (existingScript) {
      existingScript.remove();
    }

    // Clear Plaid from window
    delete window.Plaid;
    setPlaidLoaded(false);

    // Reload the script
    const script = document.createElement("script");
    script.src = "https://cdn.plaid.com/link/v2/stable/link-initialize.js";
    script.async = true;
    script.onload = () => {
      console.log("✅ Plaid script reloaded successfully");
      setPlaidLoaded(true);
    };
    script.onerror = () => {
      console.error("❌ Failed to reload Plaid script");
      setPlaidLoaded(false);
    };
    document.body.appendChild(script);
  };

  return (
    <>
      <div className="flex flex-col gap-4">
        <button
          onClick={handleConnectBank}
          disabled={loading}
          className="btn btn-primary flex items-center gap-2"
        >
          {loading ? (
            <div className="loading-spinner"></div>
          ) : (
            <Plus className="w-4 h-4" />
          )}
          Connect Bank Account
        </button>

        {/* Debug info */}
        <div className="text-xs text-gray-500 flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              plaidLoaded ? "bg-green-500" : "bg-yellow-500"
            }`}
          ></div>
          Plaid: {plaidLoaded ? "Loaded" : "Loading..."}
          <button
            onClick={reloadPlaid}
            className="text-blue-500 hover:text-blue-700 flex items-center gap-1"
            title="Reload Plaid library"
          >
            <RefreshCw className="w-3 h-3" />
            Reload
          </button>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                Connect Your Bank
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setLoading(false);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 text-center">
              <Link2 className="mx-auto h-12 w-12 text-blue-600 mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                Connecting to Your Bank
              </h4>
              <p className="text-gray-600 mb-4">
                Please complete the connection in the Plaid window. If you don't
                see it, check for pop-up blockers.
              </p>
              <div className="loading-spinner mx-auto"></div>
              <p className="text-sm text-gray-500 mt-4">
                Status: {plaidLoaded ? "Ready" : "Loading..."}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PlaidLink;
