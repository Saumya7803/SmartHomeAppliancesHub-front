import { useEffect, useState } from "react";
import { adminApi } from "../api/adminApi";
import { useAdminAuth } from "../hooks/useAdminAuth";

const INITIAL_FORM = {
  keyName: "",
  roleScope: "read_only",
};

export default function ApiKeysPage() {
  const { token } = useAdminAuth();
  const [keys, setKeys] = useState([]);
  const [formState, setFormState] = useState(INITIAL_FORM);
  const [generatedKey, setGeneratedKey] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadKeys = async () => {
    const response = await adminApi.getApiKeys(token);
    setKeys(response.keys || []);
  };

  useEffect(() => {
    let ignore = false;

    async function hydrate() {
      try {
        setError("");
        const response = await adminApi.getApiKeys(token);
        if (!ignore) {
          setKeys(response.keys || []);
        }
      } catch (requestError) {
        if (!ignore) {
          setError(requestError.message);
        }
      }
    }

    hydrate();

    return () => {
      ignore = true;
    };
  }, [token]);

  const handleCreate = async (event) => {
    event.preventDefault();
    setGeneratedKey("");

    try {
      const response = await adminApi.createApiKey(token, formState);
      setGeneratedKey(response.rawKey || "");
      setMessage(response.message || "API key created");
      setError("");
      setFormState(INITIAL_FORM);
      await loadKeys();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const handleRevoke = async (keyId) => {
    const confirmed = window.confirm("Revoke this API key?");
    if (!confirmed) {
      return;
    }

    try {
      const response = await adminApi.revokeApiKey(token, keyId);
      setMessage(response.message || "API key revoked");
      setError("");
      await loadKeys();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <section>
      <h2>API Keys</h2>
      <p>Issue and revoke scoped API keys for enterprise integrations.</p>

      {message ? <p className="form-success">{message}</p> : null}
      {error ? <p className="form-error">{error}</p> : null}
      {generatedKey ? (
        <p className="form-success">
          New key (copy now, it will not be shown again): <code>{generatedKey}</code>
        </p>
      ) : null}

      <form className="admin-form-grid" onSubmit={handleCreate}>
        <label>
          Key Name
          <input
            type="text"
            value={formState.keyName}
            onChange={(event) => setFormState((current) => ({ ...current, keyName: event.target.value }))}
            required
          />
        </label>

        <label>
          Scope
          <select
            value={formState.roleScope}
            onChange={(event) => setFormState((current) => ({ ...current, roleScope: event.target.value }))}
          >
            <option value="read_only">Read Only</option>
            <option value="operator">Operator</option>
            <option value="sales">Sales Team</option>
            <option value="development_team">Developer</option>
            <option value="admin">Admin</option>
            <option value="super_admin">Super Admin</option>
          </select>
        </label>

        <div className="admin-form-actions">
          <button type="submit" className="btn-primary">
            Create API Key
          </button>
        </div>
      </form>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Prefix</th>
              <th>Scope</th>
              <th>Created</th>
              <th>Revoked</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {keys.map((row) => (
              <tr key={row.id}>
                <td>{row.id}</td>
                <td>{row.key_name}</td>
                <td>{row.key_prefix}</td>
                <td>{row.role_scope}</td>
                <td>{new Date(row.created_at).toLocaleString()}</td>
                <td>{row.revoked_at ? new Date(row.revoked_at).toLocaleString() : "Active"}</td>
                <td>
                  {row.revoked_at ? (
                    <span>Revoked</span>
                  ) : (
                    <button type="button" className="btn-reject" onClick={() => handleRevoke(row.id)}>
                      Revoke
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {!keys.length ? (
              <tr>
                <td colSpan="7">No API keys created.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
