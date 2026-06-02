import { useEffect, useState } from "react";
import { adminApi } from "../api/adminApi";
import { useAdminAuth } from "../hooks/useAdminAuth";

function formatPermission(value) {
  return String(value || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

export default function RolePermissionsPage() {
  const { token } = useAdminAuth();
  const [matrix, setMatrix] = useState({});
  const [roleMetadata, setRoleMetadata] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadRoleModel() {
      try {
        setError("");
        const response = await adminApi.getRoleManagement(token);
        if (!ignore) {
          setMatrix(response.permissionMatrix || {});
          setRoleMetadata(response.roleMetadata || {});
        }
      } catch (requestError) {
        if (!ignore) {
          setError(requestError.message);
        }
      }
    }

    loadRoleModel();

    return () => {
      ignore = true;
    };
  }, [token]);

  return (
    <section>
      <h2>Roles & Permissions</h2>
      <p>Role matrix for enterprise access governance.</p>
      {error ? <p className="form-error">{error}</p> : null}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Role</th>
              <th>Name</th>
              <th>Priority</th>
              <th>Permissions</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(matrix).map(([role, permissions]) => (
              <tr key={role}>
                <td>{formatPermission(role)}</td>
                <td>{roleMetadata?.[role]?.name || formatPermission(role)}</td>
                <td>{roleMetadata?.[role]?.priority ?? "-"}</td>
                <td>{Array.isArray(permissions) ? permissions.map(formatPermission).join(", ") : "-"}</td>
              </tr>
            ))}
            {!Object.keys(matrix).length ? (
              <tr>
                <td colSpan="4">No permission matrix data found.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
