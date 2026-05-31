const ENDPOINTS = [
  { method: "GET", path: "/api/health", description: "Health check endpoint" },
  { method: "POST", path: "/api/admin/login", description: "Admin authentication" },
  { method: "GET", path: "/api/admin/dashboard", description: "Business dashboard metrics" },
  { method: "GET", path: "/api/admin/pending-changes", description: "Approval center queue" },
  { method: "GET", path: "/api/dev/health", description: "Developer system health telemetry" },
  { method: "GET", path: "/api/dev/system-logs", description: "Developer system logs" },
];

export default function ApiDocsPage() {
  return (
    <section>
      <h2>API Docs</h2>
      <p>Core API references used across the admin, developer, and operator workspaces.</p>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Method</th>
              <th>Path</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {ENDPOINTS.map((row) => (
              <tr key={`${row.method}-${row.path}`}>
                <td>{row.method}</td>
                <td>
                  <code>{row.path}</code>
                </td>
                <td>{row.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
