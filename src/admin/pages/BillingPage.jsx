import { useEffect, useState } from "react";
import { adminApi } from "../api/adminApi";
import { useAdminAuth } from "../hooks/useAdminAuth";

const INITIAL_SETTINGS = {
  currency: "INR",
  gatewayMode: "sandbox",
  autoCapture: true,
  retryWindowMinutes: 15,
};

export default function BillingPage() {
  const { token } = useAdminAuth();
  const [settings, setSettings] = useState(INITIAL_SETTINGS);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadBilling() {
      try {
        setError("");
        const response = await adminApi.getSettings(token);
        if (!ignore && response.settings) {
          setSettings({
            currency: response.settings.currency || "INR",
            gatewayMode: response.settings.gatewayMode || "sandbox",
            autoCapture: Boolean(response.settings.autoCapture),
            retryWindowMinutes: Number(response.settings.retryWindowMinutes || 15),
          });
        }
      } catch (requestError) {
        if (!ignore) {
          setError(requestError.message);
        }
      }
    }

    loadBilling();

    return () => {
      ignore = true;
    };
  }, [token]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await adminApi.updateSettings(token, settings);
      setMessage(response.message || "Billing settings updated");
      setError("");
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <section>
      <h2>Billing</h2>
      <p>Configure payment behavior, capture policy, and retry controls.</p>
      {message ? <p className="form-success">{message}</p> : null}
      {error ? <p className="form-error">{error}</p> : null}

      <form className="admin-form-grid" onSubmit={handleSubmit}>
        <label>
          Currency
          <input
            type="text"
            maxLength={3}
            value={settings.currency}
            onChange={(event) =>
              setSettings((current) => ({ ...current, currency: event.target.value.toUpperCase() }))
            }
          />
        </label>

        <label>
          Gateway Mode
          <select
            value={settings.gatewayMode}
            onChange={(event) => setSettings((current) => ({ ...current, gatewayMode: event.target.value }))}
          >
            <option value="sandbox">Sandbox</option>
            <option value="production">Production</option>
          </select>
        </label>

        <label>
          Retry Window (Minutes)
          <input
            type="number"
            min="1"
            max="120"
            value={settings.retryWindowMinutes}
            onChange={(event) =>
              setSettings((current) => ({ ...current, retryWindowMinutes: Number(event.target.value) }))
            }
          />
        </label>

        <label className="settings-toggle-field">
          <span>Auto Capture Payments</span>
          <input
            type="checkbox"
            checked={settings.autoCapture}
            onChange={(event) => setSettings((current) => ({ ...current, autoCapture: event.target.checked }))}
          />
        </label>

        <div className="admin-form-actions">
          <button type="submit" className="btn-primary">
            Save Billing Settings
          </button>
        </div>
      </form>
    </section>
  );
}
