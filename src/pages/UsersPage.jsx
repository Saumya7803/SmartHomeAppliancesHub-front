import { useEffect, useState } from "react";
import { getAdminSession } from "../utils/adminAuth";
import { adminMockApi } from "../utils/adminMockApi";

const INITIAL_FORM = {
  name: "",
  email: "",
  password: "",
};

function formatDate(value) {
  return new Date(value).toLocaleString();
}

export default function UsersPage() {
  const session = getAdminSession();
  const user = session?.user;

  const [users, setUsers] = useState([]);
  const [formState, setFormState] = useState(INITIAL_FORM);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const refreshUsers = async () => {
    const rows = await adminMockApi.getUsers();
    setUsers(rows);
  };

  useEffect(() => {
    let ignore = false;

    async function loadInitialUsers() {
      try {
        const rows = await adminMockApi.getUsers();
        if (!ignore) {
          setError("");
          setUsers(rows);
        }
      } catch (requestError) {
        if (!ignore) {
          setError(requestError.message);
        }
      }
    }

    loadInitialUsers();

    return () => {
      ignore = true;
    };
  }, []);

  const handleCreateOperator = async (event) => {
    event.preventDefault();
    try {
      setError("");
      setMessage("");
      const response = await adminMockApi.addOperator(formState, user);
      setMessage(response.message);
      setFormState(INITIAL_FORM);
      await refreshUsers();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const handleRoleChange = async (userId, role) => {
    setError("");
    setMessage("");

    try {
      const response = await adminMockApi.changeUserRole(userId, role, user);
      setMessage(response.message);
      await refreshUsers();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const handleDeactivate = async (userId) => {
    setError("");
    setMessage("");

    try {
      const response = await adminMockApi.deactivateUser(userId, user);
      setMessage(response.message);
      await refreshUsers();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <section>
      <h2>Users Management</h2>
      <p>Create operators, update role assignments, and deactivate accounts.</p>

      {message ? <p className="form-success">{message}</p> : null}
      {error ? <p className="form-error">{error}</p> : null}

      <form className="admin-form-grid" onSubmit={handleCreateOperator}>
        <label>
          Full Name
          <input
            type="text"
            value={formState.name}
            onChange={(event) => setFormState((value) => ({ ...value, name: event.target.value }))}
            required
          />
        </label>

        <label>
          Email
          <input
            type="email"
            value={formState.email}
            onChange={(event) => setFormState((value) => ({ ...value, email: event.target.value }))}
            required
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={formState.password}
            onChange={(event) =>
              setFormState((value) => ({ ...value, password: event.target.value }))
            }
            required
          />
        </label>

        <div className="admin-form-actions">
          <button type="submit" className="btn-primary">
            Add Operator
          </button>
        </div>
      </form>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((row) => (
              <tr key={row.id}>
                <td>{row.id}</td>
                <td>{row.name}</td>
                <td>{row.email}</td>
                <td>{row.role}</td>
                <td>{row.active ? "Active" : "Inactive"}</td>
                <td>{formatDate(row.createdAt)}</td>
                <td>
                  <div className="table-action-row">
                    {row.active ? (
                      <>
                        <button
                          type="button"
                          className="btn-outline"
                          onClick={() =>
                            handleRoleChange(row.id, row.role === "admin" ? "operator" : "admin")
                          }
                        >
                          Make {row.role === "admin" ? "Operator" : "Admin"}
                        </button>

                        <button
                          type="button"
                          className="btn-reject"
                          onClick={() => handleDeactivate(row.id)}
                        >
                          Deactivate
                        </button>
                      </>
                    ) : (
                      <span className="admin-muted">Inactive</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
