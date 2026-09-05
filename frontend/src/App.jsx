import { useEffect, useState } from "react";

import {
  loginUser,
  signupUser,
  changePassword,
  getAdminDashboardStats,
  getAdminUsers,
  getAdminStores,
  createAdminUser,
  createAdminStore,
  getUserDetails,
  getStoreDetails,
  getStores,
  submitRating,
  updateRating,
  getOwnerDashboard,
} from "./api";

import "./App.css";

function App() {
  const [loggedIn, setLoggedIn] = useState(() =>
    Boolean(localStorage.getItem("token"))
  );

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    if (!savedUser) return null;

    try {
      return JSON.parse(savedUser);
    } catch {
      return null;
    }
  });

  const [role, setRole] = useState(() => {
    const savedUser = localStorage.getItem("user");
    if (!savedUser) return "";

    try {
      return JSON.parse(savedUser)?.role || "";
    } catch {
      return "";
    }
  });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginRole, setLoginRole] = useState("");

  const [showSignup, setShowSignup] = useState(false);
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupAddress, setSignupAddress] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupRole, setSignupRole] = useState("user");

  const [message, setMessage] = useState("");

  const [adminStats, setAdminStats] = useState({
    totalUsers: 0,
    totalStores: 0,
    totalRatings: 0,
  });

  const [adminUsers, setAdminUsers] = useState([]);
  const [adminStores, setAdminStores] = useState([]);

  const [userSearch, setUserSearch] = useState("");
  const [storeSearch, setStoreSearch] = useState("");

  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedStore, setSelectedStore] = useState(null);

  const [showAddUser, setShowAddUser] = useState(false);
  const [showAddStore, setShowAddStore] = useState(false);

  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserAddress, setNewUserAddress] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserRole, setNewUserRole] = useState("user");

  const [newStoreName, setNewStoreName] = useState("");
  const [newStoreAddress, setNewStoreAddress] = useState("");
  const [newStoreOwnerId, setNewStoreOwnerId] = useState("");

  const [userCreateMessage, setUserCreateMessage] = useState("");
  const [storeCreateMessage, setStoreCreateMessage] = useState("");

  const [stores, setStores] = useState([]);
  const [ratingValues, setRatingValues] = useState({});

  const [ownerData, setOwnerData] = useState(null);

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");

  // =========================================================
  // DASHBOARD DATA
  // =========================================================

  useEffect(() => {
    if (!loggedIn) return;

    const loadDashboardData = async () => {
      try {
        if (role === "admin") {
          const stats = await getAdminDashboardStats();
          setAdminStats(
            stats || {
              totalUsers: 0,
              totalStores: 0,
              totalRatings: 0,
            }
          );
        }

        if (role === "user") {
          const data = await getStores();
          setStores(data || []);
        }

        if (role === "owner") {
          const data = await getOwnerDashboard();
          setOwnerData(data);
        }
      } catch (error) {
        console.error("Dashboard loading error:", error);
      }
    };

    loadDashboardData();
  }, [loggedIn, role]);

  // =========================================================
  // LOGIN
  // =========================================================

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!email.trim() || !password || !loginRole) {
      setMessage("Please enter email, password and select a role.");
      return;
    }

    try {
      const data = await loginUser({
        email: email.trim(),
        password,
        role: loginRole,
      });

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setUser(data.user);
      setRole(data.user.role);
      setLoggedIn(true);

      setEmail("");
      setPassword("");
      setLoginRole("");
      setMessage("");
    } catch (error) {
      setMessage(error.message || "Invalid email or password.");
    }
  };

  // =========================================================
  // SIGNUP
  // =========================================================

  const handleSignup = async (e) => {
    e.preventDefault();
    setMessage("");

    if (
      !signupName.trim() ||
      !signupEmail.trim() ||
      !signupAddress.trim() ||
      !signupPassword ||
      !signupRole
    ) {
      setMessage("Please fill all fields.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const passwordRegex =
      /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;

    if (
      signupName.trim().length < 20 ||
      signupName.trim().length > 60
    ) {
      setMessage("Name must be between 20 and 60 characters.");
      return;
    }

    if (!emailRegex.test(signupEmail.trim())) {
      setMessage("Please enter a valid email address.");
      return;
    }

    if (signupAddress.trim().length > 400) {
      setMessage("Address cannot exceed 400 characters.");
      return;
    }

    if (!passwordRegex.test(signupPassword)) {
      setMessage(
        "Password must be 8-16 characters with at least one uppercase letter and one special character."
      );
      return;
    }

    try {
      const signupData = {
        name: signupName.trim(),
        email: signupEmail.trim(),
        address: signupAddress.trim(),
        password: signupPassword,
        role: signupRole,
      };

      await signupUser(signupData);

      const loginData = await loginUser({
        email: signupData.email,
        password: signupData.password,
        role: signupData.role,
      });

      localStorage.setItem("token", loginData.token);
      localStorage.setItem("user", JSON.stringify(loginData.user));

      setUser(loginData.user);
      setRole(loginData.user.role);
      setLoggedIn(true);

      setSignupName("");
      setSignupEmail("");
      setSignupAddress("");
      setSignupPassword("");
      setSignupRole("user");

      setShowSignup(false);
      setMessage("");
    } catch (error) {
      console.error("Signup/Login error:", error);
      setMessage(error.message || "Signup failed.");
    }
  };

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setLoggedIn(false);
    setUser(null);
    setRole("");
    setMessage("");

    setOwnerData(null);
    setStores([]);
    setShowChangePassword(false);
  };

  // =========================================================
  // ADMIN USERS
  // =========================================================

  const loadAdminUsers = async () => {
    try {
      const data = await getAdminUsers();
      setAdminUsers(data || []);
    } catch (error) {
      console.error("Failed to load users:", error);
    }
  };

  // =========================================================
  // ADMIN STORES
  // =========================================================

  const loadAdminStores = async () => {
    try {
      const data = await getAdminStores();
      setAdminStores(data || []);
    } catch (error) {
      console.error("Failed to load stores:", error);
    }
  };

  const handleAdminUsers = async () => {
    setShowAddUser(false);
    setShowAddStore(false);

    setUserCreateMessage("");
    setStoreCreateMessage("");

    await loadAdminUsers();
  };

  const handleAdminStores = async () => {
    setShowAddUser(false);
    setShowAddStore(false);

    setUserCreateMessage("");
    setStoreCreateMessage("");

    await loadAdminStores();
  };

  // =========================================================
  // VIEW USER
  // =========================================================

  const handleViewUser = async (id) => {
    try {
      const data = await getUserDetails(id);
      setSelectedUser(data.user || data);
    } catch {
      setMessage("Unable to load user details.");
    }
  };

  // =========================================================
  // VIEW STORE
  // =========================================================

  const handleViewStore = async (id) => {
    try {
      const data = await getStoreDetails(id);
      setSelectedStore(data.store || data);
    } catch {
      setMessage("Unable to load store details.");
    }
  };

  // =========================================================
  // CREATE USER
  // =========================================================

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setUserCreateMessage("");

    try {
      await createAdminUser({
        name: newUserName.trim(),
        email: newUserEmail.trim(),
        address: newUserAddress.trim(),
        password: newUserPassword,
        role: newUserRole,
      });

      setUserCreateMessage("User created successfully.");

      setNewUserName("");
      setNewUserEmail("");
      setNewUserAddress("");
      setNewUserPassword("");
      setNewUserRole("user");

      await loadAdminUsers();

      const stats = await getAdminDashboardStats();
      setAdminStats(stats || {});
    } catch (error) {
      setUserCreateMessage(
        error.message || "Failed to create user."
      );
    }
  };

  // =========================================================
  // CREATE STORE
  // =========================================================

  const handleCreateStore = async (e) => {
    e.preventDefault();
    setStoreCreateMessage("");

    try {
      await createAdminStore({
        name: newStoreName.trim(),
        address: newStoreAddress.trim(),
        owner_id: newStoreOwnerId
          ? Number(newStoreOwnerId)
          : null,
      });

      setStoreCreateMessage("Store created successfully.");

      setNewStoreName("");
      setNewStoreAddress("");
      setNewStoreOwnerId("");

      await loadAdminStores();

      const stats = await getAdminDashboardStats();
      setAdminStats(stats || {});
    } catch (error) {
      setStoreCreateMessage(
        error.message || "Failed to create store."
      );
    }
  };

  // =========================================================
  // FILTER USERS
  // =========================================================

  const filteredAdminUsers = adminUsers.filter((item) => {
    const search = userSearch.toLowerCase();

    return (
      item.name?.toLowerCase().includes(search) ||
      item.email?.toLowerCase().includes(search) ||
      item.role?.toLowerCase().includes(search)
    );
  });

  // =========================================================
  // FILTER STORES
  // =========================================================

  const filteredAdminStores = adminStores.filter((item) => {
    const search = storeSearch.toLowerCase();

    return (
      item.name?.toLowerCase().includes(search) ||
      item.address?.toLowerCase().includes(search) ||
      item.owner_name?.toLowerCase().includes(search)
    );
  });

  // =========================================================
  // RATINGS
  // =========================================================

  const handleRatingChange = (storeId, value) => {
    setRatingValues((previous) => ({
      ...previous,
      [storeId]: value,
    }));
  };

  const handleSubmitRating = async (store) => {
    const rating = Number(ratingValues[store.id]);

    if (
      !Number.isInteger(rating) ||
      rating < 1 ||
      rating > 5
    ) {
      setMessage("Please select a rating between 1 and 5.");
      return;
    }

    try {
      if (store.user_rating) {
        await updateRating({
          store_id: store.id,
          rating,
        });

        setMessage("Rating updated successfully.");
      } else {
        await submitRating({
          store_id: store.id,
          rating,
        });

        setMessage("Rating submitted successfully.");
      }

      const data = await getStores();
      setStores(data || []);

      setTimeout(() => {
        setMessage("");
      }, 2000);
    } catch (error) {
      setMessage(
        error.message || "Failed to submit rating."
      );
    }
  };

  // =========================================================
  // CHANGE PASSWORD
  // =========================================================

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMessage("");

    if (!currentPassword || !newPassword) {
      setPasswordMessage("Please enter both passwords.");
      return;
    }

    const passwordRegex =
      /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;

    if (!passwordRegex.test(newPassword)) {
      setPasswordMessage(
        "New password must be 8-16 characters with at least one uppercase letter and one special character."
      );
      return;
    }

    try {
      await changePassword({
        currentPassword,
        newPassword,
      });

      setPasswordMessage("Password changed successfully.");

      setCurrentPassword("");
      setNewPassword("");
    } catch (error) {
      setPasswordMessage(
        error.message || "Failed to change password."
      );
    }
  };

  // =========================================================
  // LOGIN / SIGNUP PAGE
  // DO NOT CHANGE
  // =========================================================

  if (!loggedIn) {
    return (
      <div className="app-container">
        <div className="auth-card">
          <div
            style={{
              textAlign: "center",
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "9px",
                marginBottom: "5px",
              }}
            >
              <span
                style={{
                  fontSize: "26px",
                  lineHeight: 1,
                }}
              >
                🏪
              </span>

              <h1
                style={{
                  margin: 0,
                  fontSize: "27px",
                  lineHeight: 1.2,
                }}
              >
                Store Rating Platform
              </h1>
            </div>

            <p
              style={{
                fontSize: "11px",
                textAlign: "center",
                margin: "7px 0 0",
              }}
            >
              Rate stores. Share experiences. Make better choices.
            </p>
          </div>

          {showSignup ? (
            <>
              <h2>Create Account</h2>

              <form onSubmit={handleSignup}>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={signupName}
                  onChange={(e) =>
                    setSignupName(e.target.value)
                  }
                />

                <input
                  type="email"
                  placeholder="Email Address"
                  value={signupEmail}
                  onChange={(e) =>
                    setSignupEmail(e.target.value)
                  }
                />

                <textarea
                  placeholder="Address"
                  value={signupAddress}
                  onChange={(e) =>
                    setSignupAddress(e.target.value)
                  }
                  rows="3"
                />

                <input
                  type="password"
                  placeholder="Password"
                  value={signupPassword}
                  onChange={(e) =>
                    setSignupPassword(e.target.value)
                  }
                />

                <select
                  value={signupRole}
                  onChange={(e) =>
                    setSignupRole(e.target.value)
                  }
                >
                  <option value="user">
                    Normal User
                  </option>

                  <option value="owner">
                    Store Owner
                  </option>

                  <option value="admin">
                    System Administrator
                  </option>
                </select>

                {message && (
                  <p className="message">
                    {message}
                  </p>
                )}

                <button
                  type="submit"
                  className="primary-btn"
                >
                  Create Account
                </button>
              </form>

              <div className="login-footer">
                <span>
                  Already have an account?
                </span>

                <button
                  type="button"
                  className="text-btn"
                  onClick={() => {
                    setShowSignup(false);
                    setMessage("");
                  }}
                >
                  Login
                </button>
              </div>
            </>
          ) : (
            <>
              <h2>Login</h2>

              <form onSubmit={handleLogin}>
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                />

                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                />

                <select
                  value={loginRole}
                  onChange={(e) =>
                    setLoginRole(e.target.value)
                  }
                >
                  <option value="">
                    Select Role
                  </option>

                  <option value="user">
                    Normal User
                  </option>

                  <option value="owner">
                    Store Owner
                  </option>

                  <option value="admin">
                    System Administrator
                  </option>
                </select>

                {message && (
                  <p className="message">
                    {message}
                  </p>
                )}

                <button
                  type="submit"
                  className="primary-btn"
                >
                  Login
                </button>
              </form>

              <div className="login-footer">
                <span>
                  Don't have an account?
                </span>

                <button
                  type="button"
                  className="text-btn"
                  onClick={() => {
                    setShowSignup(true);
                    setMessage("");
                  }}
                >
                  Create Account
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // =========================================================
  // DASHBOARD
  // Login / Signup above is intentionally untouched.
  // =========================================================

  return (
    <div className="dashboard-app">

      {/* TOP BAR */}
      <header className="topbar dashboard-topbar">
        <div className="topbar-left">
          <button className="menu-btn" type="button" aria-label="Menu">
            ☰
          </button>

          <div className="brand-area">
            <h1>🏪 RateHub</h1>
            <p>Store Rating Platform</p>
          </div>
        </div>

        <div className="topbar-right">
          <div className="user-profile">
            <div className="profile-avatar">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>

            <div>
              <strong>{user?.name}</strong>
              <small>
                {role === "admin"
                  ? "System Administrator"
                  : role === "owner"
                  ? "Store Owner"
                  : "Normal User"}
              </small>
            </div>
          </div>

          <button
            className="secondary-btn"
            onClick={() => setShowChangePassword(!showChangePassword)}
          >
            🔐 Change Password
          </button>

          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      {/* CHANGE PASSWORD */}
      {showChangePassword && (
        <div className="password-box">
          <div className="password-box-header">
            <div>
              <span className="section-icon">🔐</span>
              <div>
                <h2>Change Password</h2>
                <p>Update your account password securely.</p>
              </div>
            </div>

            <button
              className="close-mini-btn"
              onClick={() => setShowChangePassword(false)}
            >
              ×
            </button>
          </div>

          <form onSubmit={handleChangePassword}>
            <input
              type="password"
              placeholder="Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />

            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />

            {passwordMessage && (
              <p className="message">{passwordMessage}</p>
            )}

            <button type="submit" className="primary-btn">
              Update Password
            </button>
          </form>
        </div>
      )}

      <div className={`dashboard-layout ${role}-layout`}>

        {/* SIDEBAR */}
        <aside className={`dashboard-sidebar ${role}-sidebar`}>
          <div className="sidebar-section-title">
            {role === "admin"
              ? "🛡️ ADMINISTRATION"
              : role === "owner"
              ? "🏪 STORE OWNER"
              : "👤 USER PANEL"}
          </div>

          <button className="sidebar-item active" type="button">
            <span>▦</span>
            Dashboard
          </button>

          {role === "admin" && (
            <>
              <button
                className="sidebar-item"
                type="button"
                onClick={handleAdminUsers}
              >
                <span>👥</span>
                Manage Users
              </button>

              <button
                className="sidebar-item"
                type="button"
                onClick={handleAdminStores}
              >
                <span>🏪</span>
                Manage Stores
              </button>

              <button
                className="sidebar-item"
                type="button"
                onClick={async () => {
                  setShowAddUser(true);
                  setShowAddStore(false);
                  setUserCreateMessage("");
                  await loadAdminUsers();
                }}
              >
                <span>👤</span>
                Add User
              </button>

              <button
                className="sidebar-item"
                type="button"
                onClick={async () => {
                  setShowAddStore(true);
                  setShowAddUser(false);
                  setStoreCreateMessage("");
                  await loadAdminUsers();
                }}
              >
                <span>🏬</span>
                Add Store
              </button>

              <button
                className="sidebar-item"
                type="button"
                onClick={() => setMessage("All Ratings are shown in the store data below.")}
              >
                <span>★</span>
                All Ratings
              </button>

              <button
                className="sidebar-item"
                type="button"
                onClick={() => setMessage("Reports section is ready for future reports.")}
              >
                <span>▥</span>
                Reports
              </button>

              <button
                className="sidebar-item"
                type="button"
                onClick={() => setMessage("Settings are available through your account controls.")}
              >
                <span>⚙</span>
                Settings
              </button>
            </>
          )}

          {role === "owner" && (
            <>
              <button className="sidebar-item" type="button">
                <span>🏪</span>
                My Store
              </button>
              <button className="sidebar-item" type="button">
                <span>★</span>
                Ratings & Reviews
              </button>
              <button className="sidebar-item" type="button">
                <span>▥</span>
                Reports
              </button>
              <button className="sidebar-item" type="button">
                <span>👤</span>
                Profile
              </button>
              <button className="sidebar-item" type="button">
                <span>⚙</span>
                Settings
              </button>
            </>
          )}

          {role === "user" && (
            <>
              <button className="sidebar-item" type="button">
                <span>▦</span>
                Explore Stores
              </button>
              <button className="sidebar-item" type="button">
                <span>★</span>
                My Reviews
              </button>
              <button className="sidebar-item" type="button">
                <span>♥</span>
                Saved Stores
              </button>
              <button className="sidebar-item" type="button">
                <span>👤</span>
                Profile
              </button>
              <button className="sidebar-item" type="button">
                <span>⚙</span>
                Settings
              </button>
            </>
          )}

          <div className="sidebar-help">
            <span>?</span>
            Help & Support
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="dashboard-main">

          {/* =====================================================
              ADMIN DASHBOARD
          ===================================================== */}
          {role === "admin" && (
            <div className="reference-dashboard admin-reference-dashboard">

              <div className="reference-hero">
                <div className="reference-hero-icon">🛡️</div>
                <div>
                  <span>ADMINISTRATION</span>
                  <h2>System Administrator Dashboard</h2>
                  <p>Manage users, stores and platform activity from one place.</p>
                </div>
              </div>

              <div className="reference-stats-grid three">
                <div className="reference-stat blue">
                  <div className="reference-stat-icon">👥</div>
                  <div>
                    <span>USERS</span>
                    <strong>{adminStats.totalUsers || 0}</strong>
                    <small>Registered platform users</small>
                  </div>
                </div>

                <div className="reference-stat green">
                  <div className="reference-stat-icon">🏪</div>
                  <div>
                    <span>STORES</span>
                    <strong>{adminStats.totalStores || 0}</strong>
                    <small>Stores available on platform</small>
                  </div>
                </div>

                <div className="reference-stat orange">
                  <div className="reference-stat-icon">⭐</div>
                  <div>
                    <span>RATINGS</span>
                    <strong>{adminStats.totalRatings || 0}</strong>
                    <small>Ratings submitted by users</small>
                  </div>
                </div>
              </div>

              <section className="reference-panel quick-panel">
                <div className="reference-panel-title">
                  <div className="panel-icon">⚡</div>
                  <div>
                    <span>MANAGEMENT</span>
                    <h3>Quick Actions</h3>
                    <p>Choose what you want to manage.</p>
                  </div>
                </div>

                <div className="quick-reference-grid">
                  <button className="reference-action blue" onClick={handleAdminUsers}>
                    <span>👥</span>
                    <div>
                      <strong>Manage Users</strong>
                      <small>View and search all users</small>
                    </div>
                    <b>→</b>
                  </button>

                  <button className="reference-action green" onClick={handleAdminStores}>
                    <span>🏪</span>
                    <div>
                      <strong>Manage Stores</strong>
                      <small>View stores and ratings</small>
                    </div>
                    <b>→</b>
                  </button>

                  <button
                    className="reference-action purple"
                    onClick={async () => {
                      setShowAddUser(true);
                      setShowAddStore(false);
                      setUserCreateMessage("");
                      await loadAdminUsers();
                    }}
                  >
                    <span>👤+</span>
                    <div>
                      <strong>Add User</strong>
                      <small>Create a new account</small>
                    </div>
                    <b>→</b>
                  </button>

                  <button
                    className="reference-action orange"
                    onClick={async () => {
                      setShowAddStore(true);
                      setShowAddUser(false);
                      setStoreCreateMessage("");
                      await loadAdminUsers();
                    }}
                  >
                    <span>🏬</span>
                    <div>
                      <strong>Add Store</strong>
                      <small>Register a new store</small>
                    </div>
                    <b>→</b>
                  </button>
                </div>
              </section>

              {showAddUser && (
                <div className="reference-panel admin-form-card">
                  <div className="reference-panel-title">
                    <div className="panel-icon blue">👤</div>
                    <div>
                      <span>NEW ACCOUNT</span>
                      <h3>Add New User</h3>
                      <p>Create a user, store owner or administrator account.</p>
                    </div>
                  </div>

                  <form onSubmit={handleCreateUser}>
                    <div className="form-grid">
                      <input
                        type="text"
                        placeholder="Full Name"
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                      />
                      <input
                        type="email"
                        placeholder="Email Address"
                        value={newUserEmail}
                        onChange={(e) => setNewUserEmail(e.target.value)}
                      />
                      <textarea
                        placeholder="Address"
                        value={newUserAddress}
                        onChange={(e) => setNewUserAddress(e.target.value)}
                      />
                      <input
                        type="password"
                        placeholder="Password"
                        value={newUserPassword}
                        onChange={(e) => setNewUserPassword(e.target.value)}
                      />
                      <select
                        value={newUserRole}
                        onChange={(e) => setNewUserRole(e.target.value)}
                      >
                        <option value="user">Normal User</option>
                        <option value="owner">Store Owner</option>
                        <option value="admin">System Administrator</option>
                      </select>
                    </div>

                    {userCreateMessage && (
                      <p className="message">{userCreateMessage}</p>
                    )}

                    <div className="form-actions">
                      <button
                        type="button"
                        className="cancel-btn"
                        onClick={() => setShowAddUser(false)}
                      >
                        Cancel
                      </button>
                      <button type="submit" className="primary-btn">
                        Create User
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {showAddStore && (
                <div className="reference-panel admin-form-card">
                  <div className="reference-panel-title">
                    <div className="panel-icon orange">🏪</div>
                    <div>
                      <span>NEW STORE</span>
                      <h3>Add New Store</h3>
                      <p>Create a store and assign it to a store owner.</p>
                    </div>
                  </div>

                  <form onSubmit={handleCreateStore}>
                    <div className="form-grid">
                      <input
                        type="text"
                        placeholder="Store Name"
                        value={newStoreName}
                        onChange={(e) => setNewStoreName(e.target.value)}
                      />
                      <textarea
                        placeholder="Store Address"
                        value={newStoreAddress}
                        onChange={(e) => setNewStoreAddress(e.target.value)}
                      />
                      <select
                        value={newStoreOwnerId}
                        onChange={(e) => setNewStoreOwnerId(e.target.value)}
                      >
                        <option value="">Select Store Owner</option>
                        {adminUsers
                          .filter((item) => item.role === "owner")
                          .map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.name} - {item.email}
                            </option>
                          ))}
                      </select>
                    </div>

                    {adminUsers.filter((item) => item.role === "owner").length === 0 && (
                      <p className="warning-message">
                        No store owner found. Create a Store Owner account first.
                      </p>
                    )}

                    {storeCreateMessage && (
                      <p className="message">{storeCreateMessage}</p>
                    )}

                    <div className="form-actions">
                      <button
                        type="button"
                        className="cancel-btn"
                        onClick={() => setShowAddStore(false)}
                      >
                        Cancel
                      </button>
                      <button type="submit" className="primary-btn">
                        Create Store
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="reference-two-column">

                <section className="reference-panel table-panel">
                  <div className="table-panel-head">
                    <div>
                      <span>USERS</span>
                      <h3>Recent Users</h3>
                    </div>
                    <div className="table-search">
                      🔍
                      <input
                        type="text"
                        placeholder="Search users..."
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                      />
                    </div>
                  </div>

                  {filteredAdminUsers.length > 0 ? (
                    <div className="reference-table-wrap">
                      <table className="reference-table">
                        <thead>
                          <tr>
                            <th>USER</th>
                            <th>EMAIL</th>
                            <th>ROLE</th>
                            <th>STATUS</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredAdminUsers.slice(0, 8).map((item) => (
                            <tr key={item.id}>
                              <td>
                                <div className="table-user">
                                  <div className="mini-avatar">
                                    {item.name?.charAt(0)?.toUpperCase()}
                                  </div>
                                  <strong>{item.name}</strong>
                                </div>
                              </td>
                              <td>{item.email}</td>
                              <td>
                                <span className={`role-pill ${item.role}`}>
                                  {item.role}
                                </span>
                              </td>
                              <td>
                                <span className="status-pill">Active</span>
                              </td>
                              <td>
                                <button
                                  className="view-btn"
                                  onClick={() => handleViewUser(item.id)}
                                >
                                  View →
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="empty-table">
                      <strong>No users loaded</strong>
                      <p>Use Manage Users to refresh the list.</p>
                    </div>
                  )}
                </section>

                <section className="reference-panel table-panel">
                  <div className="table-panel-head">
                    <div>
                      <span>STORES</span>
                      <h3>Recent Stores</h3>
                    </div>
                    <div className="table-search">
                      🔍
                      <input
                        type="text"
                        placeholder="Search stores..."
                        value={storeSearch}
                        onChange={(e) => setStoreSearch(e.target.value)}
                      />
                    </div>
                  </div>

                  {filteredAdminStores.length > 0 ? (
                    <div className="reference-table-wrap">
                      <table className="reference-table">
                        <thead>
                          <tr>
                            <th>STORE</th>
                            <th>OWNER</th>
                            <th>RATING</th>
                            <th>STATUS</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredAdminStores.slice(0, 8).map((item) => (
                            <tr key={item.id}>
                              <td>
                                <div className="table-user">
                                  <div className="store-mini-icon">🏪</div>
                                  <strong>{item.name}</strong>
                                </div>
                              </td>
                              <td>{item.owner_name || "Not assigned"}</td>
                              <td>
                                <span className="rating-pill">
                                  ⭐ {Number(item.overall_rating || 0).toFixed(2)}
                                </span>
                              </td>
                              <td>
                                <span className="status-pill">Active</span>
                              </td>
                              <td>
                                <button
                                  className="view-btn"
                                  onClick={() => handleViewStore(item.id)}
                                >
                                  View →
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="empty-table">
                      <strong>No stores loaded</strong>
                      <p>Use Manage Stores to refresh the list.</p>
                    </div>
                  )}
                </section>

              </div>
            </div>
          )}

          {/* =====================================================
              OWNER DASHBOARD
          ===================================================== */}
          {role === "owner" && (
            <div className="reference-dashboard owner-reference-dashboard">

              <div className="reference-hero">
                <div className="reference-hero-icon owner">🏪</div>
                <div>
                  <span>STORE OWNER</span>
                  <h2>Store Owner Dashboard</h2>
                  <p>Manage your store, track ratings and grow your business.</p>
                </div>
              </div>

              {ownerData?.store ? (
                <>
                  <div className="owner-store-strip">
                    <div className="owner-store-icon">🏪</div>
                    <div>
                      <span>YOUR STORE</span>
                      <h3>{ownerData.store.name}</h3>
                      <p>📍 {ownerData.store.address}</p>
                    </div>
                  </div>

                  <div className="reference-stats-grid four">
                    <div className="reference-stat orange">
                      <div className="reference-stat-icon">⭐</div>
                      <div>
                        <span>AVERAGE RATING</span>
                        <strong>
                          {Number(ownerData.store.average_rating || 0).toFixed(1)}
                        </strong>
                        <small>Average store rating</small>
                      </div>
                    </div>

                    <div className="reference-stat green">
                      <div className="reference-stat-icon">★</div>
                      <div>
                        <span>TOTAL RATINGS</span>
                        <strong>{ownerData.store.total_ratings || 0}</strong>
                        <small>Total ratings received</small>
                      </div>
                    </div>

                    <div className="reference-stat blue">
                      <div className="reference-stat-icon">👥</div>
                      <div>
                        <span>USERS WHO RATED</span>
                        <strong>{ownerData.usersWhoRated?.length || 0}</strong>
                        <small>Customers who rated</small>
                      </div>
                    </div>

                    <div className="reference-stat purple">
                      <div className="reference-stat-icon">📝</div>
                      <div>
                        <span>TOTAL REVIEWS</span>
                        <strong>{ownerData.usersWhoRated?.length || 0}</strong>
                        <small>Customer reviews available</small>
                      </div>
                    </div>
                  </div>

                  <div className="owner-two-column">
                    <section className="reference-panel chart-panel">
                      <div className="panel-heading-row">
                        <div>
                          <span>PERFORMANCE</span>
                          <h3>Rating Overview</h3>
                        </div>
                        <strong>{Number(ownerData.store.average_rating || 0).toFixed(1)} ★</strong>
                      </div>

                      <div className="rating-bars">
                        {[5, 4, 3, 2, 1].map((star) => {
                          const count =
                            ownerData.usersWhoRated?.filter(
                              (item) => Number(item.rating) === star
                            ).length || 0;
                          const total = ownerData.usersWhoRated?.length || 0;
                          const width = total ? (count / total) * 100 : 0;

                          return (
                            <div className="rating-bar-row" key={star}>
                              <span>{star} ★</span>
                              <div className="rating-bar-track">
                                <div
                                  className={`rating-bar-fill star-${star}`}
                                  style={{ width: `${width}%` }}
                                />
                              </div>
                              <strong>{count}</strong>
                            </div>
                          );
                        })}
                      </div>
                    </section>

                    <section className="reference-panel distribution-panel">
                      <div>
                        <span>RATINGS</span>
                        <h3>Rating Distribution</h3>
                      </div>

                      <div className="distribution-center">
                        <div className="rating-donut">
                          <strong>{ownerData.store.total_ratings || 0}</strong>
                          <span>Total</span>
                        </div>

                        <div className="distribution-legend">
                          {[5, 4, 3, 2, 1].map((star) => {
                            const count =
                              ownerData.usersWhoRated?.filter(
                                (item) => Number(item.rating) === star
                              ).length || 0;

                            return (
                              <div key={star}>
                                <span className={`legend-dot star-${star}`}></span>
                                <span>{star} Stars</span>
                                <strong>{count}</strong>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </section>
                  </div>

                  <section className="reference-panel table-panel owner-reviews-panel">
                    <div className="table-panel-head">
                      <div>
                        <span>RECENT REVIEWS</span>
                        <h3>Users Who Rated Your Store</h3>
                      </div>
                    </div>

                    {ownerData.usersWhoRated?.length > 0 ? (
                      <div className="reference-table-wrap">
                        <table className="reference-table">
                          <thead>
                            <tr>
                              <th>USER</th>
                              <th>EMAIL</th>
                              <th>RATING</th>
                              <th>DATE</th>
                            </tr>
                          </thead>
                          <tbody>
                            {ownerData.usersWhoRated.map((item) => (
                              <tr key={item.id}>
                                <td>
                                  <div className="table-user">
                                    <div className="mini-avatar green">
                                      {item.name?.charAt(0)?.toUpperCase()}
                                    </div>
                                    <strong>{item.name}</strong>
                                  </div>
                                </td>
                                <td>{item.email}</td>
                                <td>
                                  <span className="rating-stars">
                                    {"★".repeat(Number(item.rating))}
                                    <span className="muted-stars">
                                      {"★".repeat(5 - Number(item.rating))}
                                    </span>
                                  </span>
                                </td>
                                <td>
                                  {item.created_at
                                    ? new Date(item.created_at).toLocaleDateString()
                                    : "-"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="empty-text">No users have rated your store yet.</p>
                    )}
                  </section>

                  <section className="reference-panel performance-card">
                    <div>
                      <span>STORE PERFORMANCE</span>
                      <h3>Your Store Summary</h3>
                    </div>
                    <div className="performance-summary">
                      <div>
                        <small>Average Rating</small>
                        <strong>{Number(ownerData.store.average_rating || 0).toFixed(2)}</strong>
                      </div>
                      <div>
                        <small>Total Ratings</small>
                        <strong>{ownerData.store.total_ratings || 0}</strong>
                      </div>
                      <div>
                        <small>Customers Rated</small>
                        <strong>{ownerData.usersWhoRated?.length || 0}</strong>
                      </div>
                    </div>
                  </section>
                </>
              ) : (
                <div className="reference-panel empty-card">
                  <h3>No store assigned</h3>
                  <p>Please contact the administrator.</p>
                </div>
              )}
            </div>
          )}

          {/* =====================================================
              USER DASHBOARD
          ===================================================== */}
         {/* =====================================================
    USER DASHBOARD
===================================================== */}
{role === "user" && (
  <div className="reference-dashboard user-reference-dashboard">
    <div className="reference-hero">
      <div className="reference-hero-icon user">👤</div>

      <div>
        <span>USER PANEL</span>
        <h2>User Dashboard</h2>
        <p>
          Discover great stores and share your experiences.
        </p>
      </div>
    </div>

    <div className="reference-stats-grid four">
      <div className="reference-stat purple">
        <div className="reference-stat-icon">🏪</div>
        <div>
          <span>STORES AVAILABLE</span>
          <strong>{stores.length}</strong>
          <small>Stores on platform</small>
        </div>
      </div>

      <div className="reference-stat blue">
        <div className="reference-stat-icon">★</div>
        <div>
          <span>STORES RATED</span>
          <strong>
            {stores.filter((store) => store.user_rating).length}
          </strong>
          <small>Your submitted ratings</small>
        </div>
      </div>

      <div className="reference-stat orange">
        <div className="reference-stat-icon">⭐</div>
        <div>
          <span>YOUR AVERAGE</span>
          <strong>
            {(() => {
              const rated = stores
                .filter((store) => store.user_rating)
                .map((store) => Number(store.user_rating));

              return rated.length
                ? (
                    rated.reduce((a, b) => a + b, 0) /
                    rated.length
                  ).toFixed(1)
                : "0.0";
            })()}
          </strong>
          <small>Average rating you gave</small>
        </div>
      </div>

      <div className="reference-stat green">
        <div className="reference-stat-icon">♥</div>
        <div>
          <span>TOP RATED</span>
          <strong>
            {stores.length
              ? Math.max(
                  ...stores.map((store) =>
                    Number(store.overall_rating || 0)
                  )
                ).toFixed(1)
              : "0.0"}
          </strong>
          <small>Highest store rating</small>
        </div>
      </div>
    </div>

    {/* EXPLORE STORES */}
    <section className="reference-panel explore-panel">
      <div className="table-panel-head">
        <div>
          <span>STORE DISCOVERY</span>
          <h3>Explore Stores</h3>
          <p>Search and rate your favourite stores.</p>
        </div>

        <div className="large-search">
          🔍
          <input
            type="text"
            placeholder="Search by store name or address..."
            value={storeSearch}
            onChange={(e) => setStoreSearch(e.target.value)}
          />
        </div>
      </div>

      {stores.length === 0 ? (
        <div className="empty-card">
          <h3>No stores available</h3>
          <p>Please check again later.</p>
        </div>
      ) : (
        <div className="user-store-reference-grid">
          {stores
            .filter((store) => {
              const search = storeSearch.toLowerCase();

              return (
                store.name?.toLowerCase().includes(search) ||
                store.address?.toLowerCase().includes(search)
              );
            })
            .map((store) => (
              <div
                className="reference-store-card"
                key={store.id}
              >
                <div className="reference-store-top">
                  <div className="store-reference-icon">
                    🏪
                  </div>

                  <span className="reference-rating">
                    ⭐{" "}
                    {Number(
                      store.overall_rating || 0
                    ).toFixed(1)}
                  </span>
                </div>

                <h4>{store.name}</h4>

                <p className="store-address">
                  📍 {store.address}
                </p>

                {/* YOUR RATING */}
                <div className="your-rating-box">
                  <span>Your Rating</span>

                  <strong>
                    {store.user_rating
                      ? `${store.user_rating}/5`
                      : "Not rated"}
                  </strong>
                </div>

                {/* STAR RATING */}
                <div className="star-rating-selector">
                  <span className="rating-label">
                    Rate this store
                  </span>

                  <div className="rating-stars-input">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const selectedRating = Number(
                        ratingValues[store.id] || 0
                      );

                      return (
                        <button
                          key={star}
                          type="button"
                          className={
                            star <= selectedRating
                              ? "star-button selected"
                              : "star-button"
                          }
                          onClick={() =>
                            handleRatingChange(
                              store.id,
                              star
                            )
                          }
                          aria-label={`Rate ${star} out of 5`}
                        >
                          ★
                        </button>
                      );
                    })}
                  </div>

                  <small className="rating-help">
                    {ratingValues[store.id]
                      ? `${ratingValues[store.id]} out of 5`
                      : "Select stars"}
                  </small>
                </div>

                <button
                  type="button"
                  className="primary-btn reference-rate-btn"
                  onClick={() =>
                    handleSubmitRating(store)
                  }
                >
                  {store.user_rating
                    ? "Update Rating"
                    : "Submit Rating"}
                </button>
              </div>
            ))}
        </div>
      )}

      {stores.length > 0 &&
        stores.filter((store) => {
          const search = storeSearch.toLowerCase();

          return (
            store.name?.toLowerCase().includes(search) ||
            store.address?.toLowerCase().includes(search)
          );
        }).length === 0 && (
          <div className="empty-card">
            <h3>No matching stores found</h3>
            <p>
              Try another store name or address.
            </p>
          </div>
        )}
    </section>

    {message && (
      <div className="dashboard-message">
        {message}
      </div>
    )}
  </div>
)}
        </main>
      </div>

      {/* =====================================================
          USER DETAILS MODAL
      ===================================================== */}

      {selectedUser && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedUser(null)}
        >

          <div
            className="user-details-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <button
              className="modal-close"
              onClick={() =>
                setSelectedUser(null)
              }
            >
              ×
            </button>

            <div className="modal-icon">
              👤
            </div>

            <h2>
              User Details
            </h2>

            <p className="modal-subtitle">
              Complete account information
            </p>

            <div className="user-detail-row">
              <span>Name</span>

              <strong>
                {selectedUser.name}
              </strong>
            </div>

            <div className="user-detail-row">
              <span>Email</span>

              <strong>
                {selectedUser.email}
              </strong>
            </div>

            <div className="user-detail-row">
              <span>Address</span>

              <strong>
                {selectedUser.address ||
                  "Not provided"}
              </strong>
            </div>

            <div className="user-detail-row">
              <span>Role</span>

              <strong>
                {selectedUser.role}
              </strong>
            </div>

            <button
              className="modal-close-btn"
              onClick={() =>
                setSelectedUser(null)
              }
            >
              Close
            </button>

          </div>

        </div>
      )}

      {/* =====================================================
          STORE DETAILS MODAL
      ===================================================== */}

      {selectedStore && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedStore(null)}
        >

          <div
            className="user-details-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <button
              className="modal-close"
              onClick={() =>
                setSelectedStore(null)
              }
            >
              ×
            </button>

            <div className="modal-icon">
              🏪
            </div>

            <h2>
              Store Details
            </h2>

            <p className="modal-subtitle">
              Complete store information
            </p>

            <div className="user-detail-row">
              <span>Store Name</span>

              <strong>
                {selectedStore.name}
              </strong>
            </div>

            <div className="user-detail-row">
              <span>Address</span>

              <strong>
                {selectedStore.address}
              </strong>
            </div>

            <div className="user-detail-row">
              <span>Owner</span>

              <strong>
                {selectedStore.owner_name ||
                  "Not assigned"}
              </strong>
            </div>

            <div className="user-detail-row">
              <span>Overall Rating</span>

              <strong>
                ⭐{" "}
                {Number(
                  selectedStore.overall_rating || 0
                ).toFixed(2)}
              </strong>
            </div>

            <button
              className="modal-close-btn"
              onClick={() =>
                setSelectedStore(null)
              }
            >
              Close
            </button>

          </div>

        </div>
      )}

    </div>
  );
}

export default App;
