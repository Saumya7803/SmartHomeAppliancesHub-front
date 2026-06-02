import { useEffect, useMemo, useState } from "react";
import { adminApi } from "../api/adminApi";
import { useAdminAuth } from "../hooks/useAdminAuth";
import { canManageUsers, formatRoleLabel, normalizeUserRole, USER_ROLES } from "../utils/roles";

const USER_STATUS = Object.freeze({
  ACTIVE: "active",
  SUSPENDED: "suspended",
  DISABLED: "disabled",
});

const INITIAL_USER_FORM = {
  name: "",
  email: "",
  password: "",
  role: USER_ROLES.OPERATOR,
  status: USER_STATUS.ACTIVE,
};

const ROLE_SELECT_OPTIONS = [
  { value: USER_ROLES.SUPER_ADMIN, label: "Super Admin" },
  { value: USER_ROLES.ADMIN, label: "Admin" },
  { value: USER_ROLES.DEVELOPMENT_TEAM, label: "Developer" },
  { value: USER_ROLES.SALES, label: "Sales Team" },
  { value: USER_ROLES.OPERATOR, label: "Operator" },
];

const STATUS_SELECT_OPTIONS = [
  { value: USER_STATUS.ACTIVE, label: "Active" },
  { value: USER_STATUS.SUSPENDED, label: "Suspended" },
  { value: USER_STATUS.DISABLED, label: "Disabled" },
];

function getStatusLabel(status) {
  const normalized = String(status || USER_STATUS.ACTIVE).toLowerCase();
  if (normalized === USER_STATUS.SUSPENDED) {
    return "Suspended";
  }
  if (normalized === USER_STATUS.DISABLED) {
    return "Disabled";
  }
  return "Active";
}

function getStatusBadgeClass(status) {
  const normalized = String(status || USER_STATUS.ACTIVE).toLowerCase();
  if (normalized === USER_STATUS.SUSPENDED) {
    return "admin-user-status suspended";
  }
  if (normalized === USER_STATUS.DISABLED) {
    return "admin-user-status disabled";
  }
  return "admin-user-status active";
}

function getRoleBadgeClass(role) {
  const normalized = normalizeUserRole(role);
  if (normalized === USER_ROLES.SUPER_ADMIN) {
    return "admin-user-role super-admin";
  }
  if (normalized === USER_ROLES.ADMIN) {
    return "admin-user-role admin";
  }
  if (normalized === USER_ROLES.DEVELOPMENT_TEAM) {
    return "admin-user-role developer";
  }
  if (normalized === USER_ROLES.SALES) {
    return "admin-user-role sales";
  }
  return "admin-user-role operator";
}

export default function UsersPage() {
  const { token, user } = useAdminAuth();
  const canEditUsers = canManageUsers(user);
  const actorRole = normalizeUserRole(user?.role);
  const isSuperAdmin = actorRole === USER_ROLES.SUPER_ADMIN;

  const [users, setUsers] = useState([]);
  const [userForm, setUserForm] = useState(INITIAL_USER_FORM);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activityFilter, setActivityFilter] = useState("all");
  const [reloadKey, setReloadKey] = useState(0);
  const [loading, setLoading] = useState(true);

  const [editingUser, setEditingUser] = useState(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");

  const [passwordUser, setPasswordUser] = useState(null);
  const [passwordValue, setPasswordValue] = useState("");

  const [roleUser, setRoleUser] = useState(null);
  const [nextRole, setNextRole] = useState(USER_ROLES.OPERATOR);

  const [confirmAction, setConfirmAction] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadUsers() {
      setLoading(true);
      try {
        setError("");
        const response = await adminApi.getUsers(token, user.role);

        if (!ignore) {
          setUsers(response.users || []);
        }
      } catch (requestError) {
        if (!ignore) {
          setError(requestError.message);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadUsers();

    return () => {
      ignore = true;
    };
  }, [token, user.role, reloadKey]);

  const createRoleOptions = useMemo(() => {
    if (isSuperAdmin) {
      return ROLE_SELECT_OPTIONS;
    }

    return ROLE_SELECT_OPTIONS.filter(
      (option) =>
        option.value === USER_ROLES.DEVELOPMENT_TEAM ||
        option.value === USER_ROLES.SALES ||
        option.value === USER_ROLES.OPERATOR
    );
  }, [isSuperAdmin]);

  const filteredUsers = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return users.filter((row) => {
      const role = normalizeUserRole(row.role);
      const status = String(row.status || USER_STATUS.ACTIVE).toLowerCase();
      const activityCount = Number(row.activity_count || 0);

      const matchesSearch =
        !normalizedSearch ||
        [row.name, row.email, formatRoleLabel(role)]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesRole = roleFilter === "all" || role === roleFilter;
      const matchesStatus = statusFilter === "all" || status === statusFilter;
      const matchesActivity =
        activityFilter === "all" ||
        (activityFilter === "none" && activityCount === 0) ||
        (activityFilter === "some" && activityCount > 0) ||
        (activityFilter === "high" && activityCount >= 10);

      return matchesSearch && matchesRole && matchesStatus && matchesActivity;
    });
  }, [users, searchTerm, roleFilter, statusFilter, activityFilter]);

  const closeUserModal = () => {
    setEditingUser(null);
    setEditName("");
    setEditEmail("");
  };

  const closePasswordModal = () => {
    setPasswordUser(null);
    setPasswordValue("");
  };

  const closeRoleModal = () => {
    setRoleUser(null);
    setNextRole(USER_ROLES.OPERATOR);
  };

  const roleOptionsForUser = (targetUser) => {
    if (isSuperAdmin) {
      return ROLE_SELECT_OPTIONS;
    }

    const currentRole = normalizeUserRole(targetUser?.role);
    const operatorAndDeveloper = ROLE_SELECT_OPTIONS.filter(
      (option) =>
        option.value === USER_ROLES.DEVELOPMENT_TEAM ||
        option.value === USER_ROLES.SALES ||
        option.value === USER_ROLES.OPERATOR
    );

    if (
      currentRole === USER_ROLES.DEVELOPMENT_TEAM ||
      currentRole === USER_ROLES.SALES ||
      currentRole === USER_ROLES.OPERATOR
    ) {
      return operatorAndDeveloper;
    }

    return [];
  };

  const canManageTargetUser = () => {
    if (!canEditUsers) {
      return false;
    }

    return true;
  };

  const canDeleteUserRow = (targetUser) => {
    if (!canManageTargetUser(targetUser)) {
      return false;
    }

    const targetRole = normalizeUserRole(targetUser.role);
    return targetRole !== USER_ROLES.SUPER_ADMIN && Number(targetUser.id) !== Number(user.id);
  };

  const canChangeRoleForUser = (targetUser) => {
    if (!canManageTargetUser(targetUser)) {
      return false;
    }
    return roleOptionsForUser(targetUser).length > 0;
  };

  const canChangeStatusForUser = (targetUser) => {
    if (!canManageTargetUser(targetUser)) {
      return false;
    }

    if (Number(targetUser.id) === Number(user.id)) {
      return false;
    }

    return true;
  };

  const handleCreateUser = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      await adminApi.createUser(token, {
        ...userForm,
        email: String(userForm.email || "").trim().toLowerCase(),
      });
      setMessage("User created");
      setUserForm(INITIAL_USER_FORM);
      setReloadKey((value) => value + 1);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const handleEditOpen = (targetUser) => {
    setEditingUser(targetUser);
    setEditName(targetUser.name || "");
    setEditEmail(targetUser.email || "");
  };

  const handleSaveUser = async (event) => {
    event.preventDefault();
    if (!editingUser) {
      return;
    }

    setMessage("");
    setError("");
    try {
      await adminApi.updateUser(token, editingUser.id, {
        name: editName,
        email: editEmail,
      });
      setMessage("User updated");
      closeUserModal();
      setReloadKey((value) => value + 1);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const handleOpenRoleModal = (targetUser) => {
    const options = roleOptionsForUser(targetUser);
    if (!options.length) {
      return;
    }
    setRoleUser(targetUser);
    setNextRole(normalizeUserRole(targetUser.role));
  };

  const handleContinueRoleChange = (event) => {
    event.preventDefault();
    if (!roleUser || nextRole === normalizeUserRole(roleUser.role)) {
      closeRoleModal();
      return;
    }

    setConfirmAction({
      type: "change_role",
      userId: roleUser.id,
      userName: roleUser.name,
      role: nextRole,
    });
    closeRoleModal();
  };

  const handleOpenPasswordModal = (targetUser) => {
    setPasswordUser(targetUser);
    setPasswordValue("");
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();
    if (!passwordUser) {
      return;
    }

    setMessage("");
    setError("");
    try {
      await adminApi.resetUserPassword(token, passwordUser.id, passwordValue);
      setMessage("Password reset successful");
      closePasswordModal();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const handleToggleStatus = async (targetUser) => {
    const currentStatus = String(targetUser.status || USER_STATUS.ACTIVE).toLowerCase();
    const nextStatus = currentStatus === USER_STATUS.ACTIVE ? USER_STATUS.SUSPENDED : USER_STATUS.ACTIVE;

    setMessage("");
    setError("");
    try {
      await adminApi.updateUserStatus(token, targetUser.id, nextStatus);
      setMessage(nextStatus === USER_STATUS.ACTIVE ? "User activated" : "User deactivated");
      setReloadKey((value) => value + 1);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const handleConfirmAction = async () => {
    if (!confirmAction) {
      return;
    }

    setMessage("");
    setError("");
    try {
      if (confirmAction.type === "delete_user") {
        await adminApi.deleteUser(token, confirmAction.userId);
        setMessage("User deleted");
      }

      if (confirmAction.type === "change_role") {
        await adminApi.updateUserRole(token, confirmAction.userId, confirmAction.role);
        setMessage("User role updated");
      }

      setConfirmAction(null);
      setReloadKey((value) => value + 1);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <section>
      <h2>User Management</h2>
      <p>Create and manage user accounts, roles, status, and secure access controls.</p>
      {message ? <p className="form-success">{message}</p> : null}
      {error ? <p className="form-error">{error}</p> : null}

      {canEditUsers ? (
        <form className="admin-form-grid" onSubmit={handleCreateUser}>
          <label>
            Name
            <input
              type="text"
              value={userForm.name}
              onChange={(event) => setUserForm((value) => ({ ...value, name: event.target.value }))}
              required
            />
          </label>

          <label>
            Email (Login ID)
            <input
              type="email"
              value={userForm.email}
              onChange={(event) => setUserForm((value) => ({ ...value, email: event.target.value }))}
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={userForm.password}
              onChange={(event) => setUserForm((value) => ({ ...value, password: event.target.value }))}
              required
            />
          </label>

          <label>
            Role
            <select
              value={userForm.role}
              onChange={(event) => setUserForm((value) => ({ ...value, role: event.target.value }))}
            >
              {createRoleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            Status
            <select
              value={userForm.status}
              onChange={(event) => setUserForm((value) => ({ ...value, status: event.target.value }))}
            >
              {STATUS_SELECT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <div className="admin-form-actions">
            <button type="submit" className="btn-primary">
              Create User
            </button>
          </div>
        </form>
      ) : null}

      <div className="admin-products-toolbar">
        <label className="admin-products-search">
          Search
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by name, email, or role"
          />
        </label>

        <label>
          Role Filter
          <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}>
            <option value="all">All Roles</option>
            {ROLE_SELECT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          Status Filter
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="all">All Statuses</option>
            {STATUS_SELECT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          Activity Filter
          <select value={activityFilter} onChange={(event) => setActivityFilter(event.target.value)}>
            <option value="all">All Activity</option>
            <option value="none">No Activity</option>
            <option value="some">Any Activity</option>
            <option value="high">10+ Actions</option>
          </select>
        </label>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email (Login ID)</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5">Loading users...</td>
              </tr>
            ) : null}
            {!loading
              ? filteredUsers.map((row) => {
                  const rowRole = normalizeUserRole(row.role);
                  const rowStatus = String(row.status || USER_STATUS.ACTIVE).toLowerCase();
                  const canEditTarget = canManageTargetUser(row);
                  const canChangeRole = canChangeRoleForUser(row);
                  const canChangeStatus = canChangeStatusForUser(row);
                  const canDelete = canDeleteUserRow(row);
                  const resetBlocked = false;

                  return (
                    <tr key={row.id}>
                      <td>{row.name}</td>
                      <td>{row.email}</td>
                      <td>
                        <span className={getRoleBadgeClass(rowRole)}>{formatRoleLabel(rowRole)}</span>
                      </td>
                      <td>
                        <span className={getStatusBadgeClass(rowStatus)}>{getStatusLabel(rowStatus)}</span>
                      </td>
                      <td>
                        {canEditUsers ? (
                          <div className="table-action-row">
                            <button
                              type="button"
                              className="btn-outline"
                              onClick={() => handleEditOpen(row)}
                              disabled={!canEditTarget}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="btn-outline"
                              onClick={() => handleOpenRoleModal(row)}
                              disabled={!canChangeRole}
                            >
                              Change Role
                            </button>
                            <button
                              type="button"
                              className="btn-outline"
                              onClick={() => handleOpenPasswordModal(row)}
                              disabled={resetBlocked || !canEditTarget}
                            >
                              Reset Password
                            </button>
                            <button
                              type="button"
                              className="btn-outline"
                              onClick={() => handleToggleStatus(row)}
                              disabled={!canChangeStatus}
                            >
                              {rowStatus === USER_STATUS.ACTIVE ? "Deactivate" : "Activate"}
                            </button>
                            <button
                              type="button"
                              className="btn-reject"
                              onClick={() =>
                                setConfirmAction({
                                  type: "delete_user",
                                  userId: row.id,
                                  userName: row.name,
                                })
                              }
                              disabled={!canDelete}
                            >
                              Delete User
                            </button>
                          </div>
                        ) : (
                          <span>View Only</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              : null}
            {!loading && !filteredUsers.length ? (
              <tr>
                <td colSpan="5">No users found.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {editingUser ? (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Edit user">
          <div className="enquiry-modal enterprise-modal">
            <div className="enquiry-modal-header enterprise-modal-header">
              <h3>Edit User</h3>
              <button type="button" className="modal-close-btn" onClick={closeUserModal}>
                x
              </button>
            </div>
            <form className="enterprise-modal-content" onSubmit={handleSaveUser}>
              <label className="enterprise-brand-modal-field">
                Name
                <input value={editName} onChange={(event) => setEditName(event.target.value)} required />
              </label>
              <label className="enterprise-brand-modal-field">
                Email (Login ID)
                <input
                  type="email"
                  value={editEmail}
                  onChange={(event) => setEditEmail(event.target.value)}
                  required
                />
              </label>
              <div className="enterprise-brand-add-actions">
                <button type="button" className="btn-outline" onClick={closeUserModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save User
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {passwordUser ? (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Reset password">
          <div className="enquiry-modal enterprise-modal">
            <div className="enquiry-modal-header enterprise-modal-header">
              <h3>Reset Password</h3>
              <button type="button" className="modal-close-btn" onClick={closePasswordModal}>
                x
              </button>
            </div>
            <form className="enterprise-modal-content" onSubmit={handleResetPassword}>
              <label className="enterprise-brand-modal-field">
                New Password
                <input
                  type="password"
                  minLength={8}
                  value={passwordValue}
                  onChange={(event) => setPasswordValue(event.target.value)}
                  required
                />
              </label>
              <div className="enterprise-brand-add-actions">
                <button type="button" className="btn-outline" onClick={closePasswordModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Reset Password
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {roleUser ? (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Change role">
          <div className="enquiry-modal enterprise-modal">
            <div className="enquiry-modal-header enterprise-modal-header">
              <h3>Change Role</h3>
              <button type="button" className="modal-close-btn" onClick={closeRoleModal}>
                x
              </button>
            </div>
            <form className="enterprise-modal-content" onSubmit={handleContinueRoleChange}>
              <label className="enterprise-brand-modal-field">
                Role
                <select value={nextRole} onChange={(event) => setNextRole(event.target.value)}>
                  {roleOptionsForUser(roleUser).map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <div className="enterprise-brand-add-actions">
                <button type="button" className="btn-outline" onClick={closeRoleModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Continue
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {confirmAction ? (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Confirm action">
          <div className="enquiry-modal enterprise-modal">
            <div className="enquiry-modal-header enterprise-modal-header">
              <h3>
                {confirmAction.type === "delete_user"
                  ? "Delete User"
                  : "Change Role"}
              </h3>
              <button type="button" className="modal-close-btn" onClick={() => setConfirmAction(null)}>
                x
              </button>
            </div>
            <div className="enterprise-modal-content">
              <p>
                {confirmAction.type === "delete_user"
                  ? `Delete ${confirmAction.userName}? This action cannot be undone.`
                  : `Change ${confirmAction.userName}'s role to ${formatRoleLabel(confirmAction.role)}?`}
              </p>
              <div className="enterprise-brand-add-actions">
                <button type="button" className="btn-outline" onClick={() => setConfirmAction(null)}>
                  Cancel
                </button>
                <button
                  type="button"
                  className={confirmAction.type === "delete_user" ? "btn-reject" : "btn-primary"}
                  onClick={handleConfirmAction}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
