import { useEffect, useState } from "react";
import { adminApi } from "../api/adminApi";
import { useAdminAuth } from "../hooks/useAdminAuth";

function formatCellValue(value) {
  if (value === null || value === undefined) {
    return "-";
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}

export default function DevToolsPage() {
  const { token } = useAdminAuth();
  const [featureFlags, setFeatureFlags] = useState([]);
  const [apiRequests, setApiRequests] = useState([]);
  const [buildLogs, setBuildLogs] = useState([]);
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState("");
  const [tableRows, setTableRows] = useState([]);
  const [querySql, setQuerySql] = useState("SELECT * FROM users LIMIT 10");
  const [queryResult, setQueryResult] = useState(null);
  const [cacheState, setCacheState] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadDevTools() {
      try {
        setError("");
        const [flagsResponse, apiResponse, buildResponse, tablesResponse] = await Promise.all([
          adminApi.getFeatureFlags(token),
          adminApi.getApiRequests(token),
          adminApi.getBuildLogs(token),
          adminApi.getDatabaseTables(token),
        ]);

        if (!ignore) {
          setFeatureFlags(flagsResponse.flags || []);
          setApiRequests(apiResponse.logs || []);
          setBuildLogs(buildResponse.files || []);
          const nextTables = tablesResponse.tables || [];
          setTables(nextTables);
          setSelectedTable((current) => current || nextTables[0] || "");
        }
      } catch (requestError) {
        if (!ignore) {
          setError(requestError.message);
        }
      }
    }

    loadDevTools();

    return () => {
      ignore = true;
    };
  }, [token]);

  useEffect(() => {
    let ignore = false;

    async function loadTableRows() {
      if (!selectedTable) {
        setTableRows([]);
        return;
      }

      try {
        const response = await adminApi.getDatabaseTableRows(token, selectedTable, 25);
        if (!ignore) {
          setTableRows(response.rows || []);
        }
      } catch (requestError) {
        if (!ignore) {
          setError(requestError.message);
        }
      }
    }

    loadTableRows();

    return () => {
      ignore = true;
    };
  }, [token, selectedTable]);

  const handleToggleFlag = async (flagKey, enabled) => {
    try {
      await adminApi.updateFeatureFlag(token, flagKey, !enabled);
      setFeatureFlags((current) =>
        current.map((flag) =>
          flag.flag_key === flagKey ? { ...flag, is_enabled: !enabled } : flag
        )
      );
      setMessage(`Feature flag ${flagKey} updated`);
      setError("");
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const handleClearCache = async () => {
    try {
      const response = await adminApi.clearCache(token);
      setCacheState(response.cache || null);
      setMessage(response.message || "Runtime cache cleared");
      setError("");
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const handleRunQuery = async (event) => {
    event.preventDefault();

    try {
      const response = await adminApi.runReadOnlyQuery(token, querySql);
      setQueryResult(response);
      setMessage("Read-only query executed");
      setError("");
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const tableColumns = tableRows.length ? Object.keys(tableRows[0]) : [];

  return (
    <section>
      <h2>Dev Tools</h2>
      <p>Technical controls for cache management, feature flags, API inspection, and read-only data access.</p>

      {message ? <p className="form-success">{message}</p> : null}
      {error ? <p className="form-error">{error}</p> : null}

      <div className="admin-form-actions">
        <button type="button" className="btn-primary" onClick={handleClearCache}>
          Clear Cache
        </button>
        {cacheState?.lastClearedAt ? <span>Last cleared: {new Date(cacheState.lastClearedAt).toLocaleString()}</span> : null}
      </div>

      <section>
        <h3>Feature Flags</h3>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Key</th>
                <th>Label</th>
                <th>Description</th>
                <th>Enabled</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {featureFlags.map((flag) => (
                <tr key={flag.id}>
                  <td>{flag.flag_key}</td>
                  <td>{flag.label}</td>
                  <td>{flag.description}</td>
                  <td>{flag.is_enabled ? "Yes" : "No"}</td>
                  <td>
                    <button
                      type="button"
                      className="btn-outline"
                      onClick={() => handleToggleFlag(flag.flag_key, flag.is_enabled)}
                    >
                      Toggle
                    </button>
                  </td>
                </tr>
              ))}
              {!featureFlags.length ? (
                <tr>
                  <td colSpan="5">No feature flags available.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h3>API Requests</h3>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Method</th>
                <th>Path</th>
                <th>Status</th>
                <th>Duration</th>
                <th>User</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {apiRequests.map((row) => (
                <tr key={row.id}>
                  <td>{row.details?.method || "-"}</td>
                  <td>{row.details?.path || "-"}</td>
                  <td>{row.details?.statusCode || "-"}</td>
                  <td>{row.details?.durationMs || "-"} ms</td>
                  <td>{row.user_email || "Anonymous"}</td>
                  <td>{new Date(row.created_at).toLocaleString()}</td>
                </tr>
              ))}
              {!apiRequests.length ? (
                <tr>
                  <td colSpan="6">No API requests logged yet.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h3>Build Logs</h3>
        <div className="admin-stats-grid">
          {buildLogs.map((file) => (
            <article key={file.fileName} className="admin-stat-card">
              <p>{file.fileName}</p>
              <pre className="json-preview">{file.exists ? file.content || "Log is empty." : "File not found."}</pre>
            </article>
          ))}
          {!buildLogs.length ? <p>No build logs available.</p> : null}
        </div>
      </section>

      <section>
        <h3>Database Table Viewer</h3>
        <div className="admin-form-grid">
          <label>
            Table
            <select value={selectedTable} onChange={(event) => setSelectedTable(event.target.value)}>
              {tables.map((tableName) => (
                <option key={tableName} value={tableName}>
                  {tableName}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                {tableColumns.map((column) => (
                  <th key={column}>{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row, rowIndex) => (
                <tr key={`${selectedTable}-${rowIndex}`}>
                  {tableColumns.map((column) => (
                    <td key={`${rowIndex}-${column}`}>{formatCellValue(row[column])}</td>
                  ))}
                </tr>
              ))}
              {!tableRows.length ? (
                <tr>
                  <td colSpan={Math.max(tableColumns.length, 1)}>No rows available.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h3>Read-Only Query Runner</h3>
        <form className="admin-form-grid" onSubmit={handleRunQuery}>
          <label className="span-2">
            SQL
            <textarea
              rows={5}
              value={querySql}
              onChange={(event) => setQuerySql(event.target.value)}
              placeholder="Use SELECT, SHOW, DESCRIBE, or EXPLAIN statements only"
            />
          </label>
          <div className="admin-form-actions">
            <button type="submit" className="btn-primary">
              Run Query
            </button>
          </div>
        </form>

        {queryResult ? (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  {queryResult.fields.map((field) => (
                    <th key={field}>{field}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(queryResult.rows || []).map((row, rowIndex) => (
                  <tr key={`query-row-${rowIndex}`}>
                    {queryResult.fields.map((field) => (
                      <td key={`${rowIndex}-${field}`}>{formatCellValue(row[field])}</td>
                    ))}
                  </tr>
                ))}
                {!queryResult.rows?.length ? (
                  <tr>
                    <td colSpan={Math.max(queryResult.fields.length, 1)}>Query returned no rows.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
    </section>
  );
}
