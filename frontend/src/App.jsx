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
  // =========================================================

  return (
    <div className="dashboard-app">

      {/* =====================================================
          TOP BAR
      ===================================================== */}

      <header className="topbar">
        <div className="brand-area">
          <h1>🏪 RateHub</h1>
          <p>Store Rating Platform</p>
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
            onClick={() =>
              setShowChangePassword(!showChangePassword)
            }
          >
            🔐 Change Password
          </button>

          <button
            className="logout-btn"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </header>

      {/* =====================================================
          CHANGE PASSWORD
      ===================================================== */}

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
              onChange={(e) =>
                setCurrentPassword(e.target.value)
              }
            />

            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) =>
                setNewPassword(e.target.value)
              }
            />

            {passwordMessage && (
              <p className="message">
                {passwordMessage}
              </p>
            )}

            <button
              type="submit"
              className="primary-btn"
            >
              Update Password
            </button>
          </form>
        </div>
      )}

      {/* =====================================================
          ADMIN DASHBOARD
      ===================================================== */}

      {role === "admin" && (
        <div className="admin-dashboard">

          {/* HERO */}

          <div className="admin-hero">
            <div className="admin-hero-content">
              <div className="hero-icon">
                🛡️
              </div>

              <div>
                <span className="hero-label">
                  ADMINISTRATION
                </span>

                <h2>
                  System Administrator Dashboard
                </h2>

                <p>
                  Manage users, stores and platform activity
                  from one place.
                </p>
              </div>
            </div>

            <div className="hero-welcome">
              <span>Welcome back</span>
              <strong>{user?.name}</strong>
            </div>
          </div>

          {/* STATS */}

          <div className="admin-stats-grid">

            <div className="admin-stat-card users-stat">
              <div className="stat-top">
                <div className="stat-icon">
                  👥
                </div>

                <span className="stat-tag">
                  USERS
                </span>
              </div>

              <div className="stat-number">
                {adminStats.totalUsers || 0}
              </div>

              <p>
                Registered platform users
              </p>
            </div>

            <div className="admin-stat-card stores-stat">
              <div className="stat-top">
                <div className="stat-icon">
                  🏪
                </div>

                <span className="stat-tag">
                  STORES
                </span>
              </div>

              <div className="stat-number">
                {adminStats.totalStores || 0}
              </div>

              <p>
                Stores available on platform
              </p>
            </div>

            <div className="admin-stat-card ratings-stat">
              <div className="stat-top">
                <div className="stat-icon">
                  ⭐
                </div>

                <span className="stat-tag">
                  RATINGS
                </span>
              </div>

              <div className="stat-number">
                {adminStats.totalRatings || 0}
              </div>

              <p>
                Ratings submitted by users
              </p>
            </div>

          </div>

          {/* QUICK ACTIONS */}

          <div className="quick-action-card">

            <div className="quick-heading">
              <div>
                <span className="section-label">
                  MANAGEMENT
                </span>

                <h2>
                  Quick Actions
                </h2>

                <p>
                  Choose what you want to manage.
                </p>
              </div>
            </div>

            <div className="quick-action-grid">

              <button
                className="quick-action blue-action"
                onClick={handleAdminUsers}
              >
                <span className="quick-action-icon">
                  👥
                </span>

                <span>
                  <strong>Manage Users</strong>
                  <small>
                    View and search all users
                  </small>
                </span>

                <b>→</b>
              </button>

              <button
                className="quick-action purple-action"
                onClick={handleAdminStores}
              >
                <span className="quick-action-icon">
                  🏪
                </span>

                <span>
                  <strong>Manage Stores</strong>
                  <small>
                    View stores and ratings
                  </small>
                </span>

                <b>→</b>
              </button>

              <button
                className="quick-action green-action"
                onClick={async () => {
                  setShowAddUser(!showAddUser);
                  setShowAddStore(false);
                  setUserCreateMessage("");
                  setStoreCreateMessage("");
                  await loadAdminUsers();
                }}
              >
                <span className="quick-action-icon">
                  ➕
                </span>

                <span>
                  <strong>Add User</strong>
                  <small>
                    Create a new account
                  </small>
                </span>

                <b>→</b>
              </button>

              <button
                className="quick-action orange-action"
                onClick={async () => {
                  setShowAddStore(!showAddStore);
                  setShowAddUser(false);
                  setUserCreateMessage("");
                  setStoreCreateMessage("");
                  await loadAdminUsers();
                }}
              >
                <span className="quick-action-icon">
                  🏬
                </span>

                <span>
                  <strong>Add Store</strong>
                  <small>
                    Register a new store
                  </small>
                </span>

                <b>→</b>
              </button>

            </div>
          </div>

          {/* ADD USER */}

          {showAddUser && (
            <div className="admin-form-card">

              <div className="admin-card-heading">
                <div className="heading-icon blue-bg">
                  👤
                </div>

                <div>
                  <span className="section-label">
                    NEW ACCOUNT
                  </span>

                  <h2>
                    Add New User
                  </h2>

                  <p>
                    Create a user, store owner or administrator account.
                  </p>
                </div>
              </div>

              <form onSubmit={handleCreateUser}>

                <div className="form-grid">

                  <input
                    type="text"
                    placeholder="Full Name"
                    value={newUserName}
                    onChange={(e) =>
                      setNewUserName(e.target.value)
                    }
                  />

                  <input
                    type="email"
                    placeholder="Email Address"
                    value={newUserEmail}
                    onChange={(e) =>
                      setNewUserEmail(e.target.value)
                    }
                  />

                  <textarea
                    placeholder="Address"
                    value={newUserAddress}
                    onChange={(e) =>
                      setNewUserAddress(e.target.value)
                    }
                  />

                  <input
                    type="password"
                    placeholder="Password"
                    value={newUserPassword}
                    onChange={(e) =>
                      setNewUserPassword(e.target.value)
                    }
                  />

                  <select
                    value={newUserRole}
                    onChange={(e) =>
                      setNewUserRole(e.target.value)
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

                </div>

                {userCreateMessage && (
                  <p className="message">
                    {userCreateMessage}
                  </p>
                )}

                <div className="form-actions">
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => setShowAddUser(false)}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="primary-btn"
                  >
                    Create User
                  </button>
                </div>

              </form>
            </div>
          )}

          {/* ADD STORE */}

          {showAddStore && (
            <div className="admin-form-card">

              <div className="admin-card-heading">
                <div className="heading-icon orange-bg">
                  🏪
                </div>

                <div>
                  <span className="section-label">
                    NEW STORE
                  </span>

                  <h2>
                    Add New Store
                  </h2>

                  <p>
                    Create a store and assign it to a store owner.
                  </p>
                </div>
              </div>

              <form onSubmit={handleCreateStore}>

                <div className="form-grid">

                  <input
                    type="text"
                    placeholder="Store Name"
                    value={newStoreName}
                    onChange={(e) =>
                      setNewStoreName(e.target.value)
                    }
                  />

                  <textarea
                    placeholder="Store Address"
                    value={newStoreAddress}
                    onChange={(e) =>
                      setNewStoreAddress(e.target.value)
                    }
                  />

                  <select
                    value={newStoreOwnerId}
                    onChange={(e) =>
                      setNewStoreOwnerId(e.target.value)
                    }
                  >
                    <option value="">
                      Select Store Owner
                    </option>

                    {adminUsers
                      .filter(
                        (item) => item.role === "owner"
                      )
                      .map((item) => (
                        <option
                          key={item.id}
                          value={item.id}
                        >
                          {item.name} - {item.email}
                        </option>
                      ))}
                  </select>

                </div>

                {adminUsers.filter(
                  (item) => item.role === "owner"
                ).length === 0 && (
                  <p className="warning-message">
                    No store owner found. Create a Store Owner account first.
                  </p>
                )}

                {storeCreateMessage && (
                  <p className="message">
                    {storeCreateMessage}
                  </p>
                )}

                <div className="form-actions">
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => setShowAddStore(false)}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="primary-btn"
                  >
                    Create Store
                  </button>
                </div>

              </form>
            </div>
          )}

          {/* USERS */}

          {adminUsers.length > 0 && (
            <div className="admin-table-card">

              <div className="table-card-header">

                <div className="table-title">
                  <div className="heading-icon blue-bg">
                    👥
                  </div>

                  <div>
                    <span className="section-label">
                      PLATFORM USERS
                    </span>

                    <h2>
                      All Users
                    </h2>

                    <p>
                      View and search registered users.
                    </p>
                  </div>
                </div>

                <div className="table-search">
                  🔍
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={userSearch}
                    onChange={(e) =>
                      setUserSearch(e.target.value)
                    }
                  />
                </div>

              </div>

              <div className="table-wrapper">
                <table>

                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>

                    {filteredAdminUsers.map((item) => (
                      <tr key={item.id}>

                        <td>
                          <div className="table-user">
                            <div className="mini-avatar">
                              {item.name
                                ?.charAt(0)
                                ?.toUpperCase()}
                            </div>

                            <strong>
                              {item.name}
                            </strong>
                          </div>
                        </td>

                        <td>
                          {item.email}
                        </td>

                        <td>
                          <span
                            className={`role-pill ${item.role}`}
                          >
                            {item.role}
                          </span>
                        </td>

                        <td>
                          <button
                            className="view-btn"
                            onClick={() =>
                              handleViewUser(item.id)
                            }
                          >
                            View →
                          </button>
                        </td>

                      </tr>
                    ))}

                  </tbody>

                </table>
              </div>

              {filteredAdminUsers.length === 0 && (
                <div className="empty-table">
                  <span>🔍</span>
                  <strong>
                    No matching users found
                  </strong>
                  <p>
                    Try another search term.
                  </p>
                </div>
              )}

            </div>
          )}

          {/* STORES */}

          {adminStores.length > 0 && (
            <div className="admin-table-card">

              <div className="table-card-header">

                <div className="table-title">
                  <div className="heading-icon orange-bg">
                    🏪
                  </div>

                  <div>
                    <span className="section-label">
                      STORE DIRECTORY
                    </span>

                    <h2>
                      All Stores
                    </h2>

                    <p>
                      View stores, owners and ratings.
                    </p>
                  </div>
                </div>

                <div className="table-search">
                  🔍
                  <input
                    type="text"
                    placeholder="Search stores..."
                    value={storeSearch}
                    onChange={(e) =>
                      setStoreSearch(e.target.value)
                    }
                  />
                </div>

              </div>

              <div className="table-wrapper">
                <table>

                  <thead>
                    <tr>
                      <th>Store</th>
                      <th>Address</th>
                      <th>Owner</th>
                      <th>Rating</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>

                    {filteredAdminStores.map((item) => (
                      <tr key={item.id}>

                        <td>
                          <div className="table-store">
                            <div className="store-mini-icon">
                              🏪
                            </div>

                            <strong>
                              {item.name}
                            </strong>
                          </div>
                        </td>

                        <td>
                          <span className="address-text">
                            {item.address}
                          </span>
                        </td>

                        <td>
                          {item.owner_name || (
                            <span className="not-assigned">
                              Not assigned
                            </span>
                          )}
                        </td>

                        <td>
                          <span className="rating-pill">
                            ⭐{" "}
                            {Number(
                              item.overall_rating || 0
                            ).toFixed(2)}
                          </span>
                        </td>

                        <td>
                          <button
                            className="view-btn"
                            onClick={() =>
                              handleViewStore(item.id)
                            }
                          >
                            View →
                          </button>
                        </td>

                      </tr>
                    ))}

                  </tbody>

                </table>
              </div>

              {filteredAdminStores.length === 0 && (
                <div className="empty-table">
                  <span>🔍</span>
                  <strong>
                    No matching stores found
                  </strong>
                  <p>
                    Try another search term.
                  </p>
                </div>
              )}

            </div>
          )}

        </div>
      )}

      {/* =====================================================
          NORMAL USER DASHBOARD
      ===================================================== */}

      {role === "user" && (
        <div className="dashboard-content user-dashboard">

          <div className="dashboard-heading">
            <div>
              <span className="section-label">
                STORE DISCOVERY
              </span>

              <h2>
                Normal User Dashboard
              </h2>

              <p>
                Search, explore and rate your favourite stores.
              </p>
            </div>
          </div>

          <div className="section-header">
            <div>
              <h2>All Stores</h2>
              <p>
                Search and rate your favourite stores.
              </p>
            </div>

            <input
              type="text"
              placeholder="Search by store name or address..."
              value={storeSearch}
              onChange={(e) =>
                setStoreSearch(e.target.value)
              }
            />
          </div>

          {stores.length === 0 ? (
            <div className="empty-card">
              <h3>No stores available</h3>
              <p>
                Please check again later.
              </p>
            </div>
          ) : (
            <div className="store-grid">

              {stores
                .filter((store) => {
                  const search =
                    storeSearch.toLowerCase();

                  return (
                    store.name
                      ?.toLowerCase()
                      .includes(search) ||
                    store.address
                      ?.toLowerCase()
                      .includes(search)
                  );
                })
                .map((store) => (

                  <div
                    className="store-card"
                    key={store.id}
                  >

                    <div className="store-card-header">
                      <h3>
                        {store.name}
                      </h3>

                      <span>
                        ⭐{" "}
                        {Number(
                          store.overall_rating || 0
                        ).toFixed(2)}
                      </span>
                    </div>

                    <p className="store-address">
                      {store.address}
                    </p>

                    <div className="rating-info">
                      <p>
                        Your Rating:{" "}
                        <strong>
                          {store.user_rating
                            ? store.user_rating + "/5"
                            : "Not rated"}
                        </strong>
                      </p>
                    </div>

                    <select
                      value={
                        ratingValues[store.id] || ""
                      }
                      onChange={(e) =>
                        handleRatingChange(
                          store.id,
                          e.target.value
                        )
                      }
                    >
                      <option value="">
                        Select Rating
                      </option>

                      <option value="1">
                        ⭐ 1
                      </option>

                      <option value="2">
                        ⭐ 2
                      </option>

                      <option value="3">
                        ⭐ 3
                      </option>

                      <option value="4">
                        ⭐ 4
                      </option>

                      <option value="5">
                        ⭐ 5
                      </option>
                    </select>

                    <button
                      className="primary-btn"
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
              const search =
                storeSearch.toLowerCase();

              return (
                store.name
                  ?.toLowerCase()
                  .includes(search) ||
                store.address
                  ?.toLowerCase()
                  .includes(search)
              );
            }).length === 0 && (
              <div className="empty-card">
                <h3>
                  No matching stores found
                </h3>

                <p>
                  Try another store name or address.
                </p>
              </div>
            )}

          {message && (
            <div className="dashboard-message">
              {message}
            </div>
          )}

        </div>
      )}

      {/* =====================================================
          OWNER DASHBOARD
      ===================================================== */}

      {role === "owner" && (
        <div className="dashboard-content owner-dashboard">

          <div className="dashboard-heading">
            <div>
              <span className="section-label">
                STORE MANAGEMENT
              </span>

              <h2>
                Store Owner Dashboard
              </h2>

              <p>
                Monitor your store performance and customer ratings.
              </p>
            </div>
          </div>

          {ownerData?.store ? (
            <>

              <div className="owner-store-card">

                <div className="owner-store-icon">
                  🏪
                </div>

                <div>
                  <span>
                    YOUR STORE
                  </span>

                  <h2>
                    {ownerData.store.name}
                  </h2>

                  <p>
                    📍 {ownerData.store.address}
                  </p>
                </div>

              </div>

              <div className="stats-grid">

                <div className="stat-card">
                  <h3>
                    ⭐ Average Rating
                  </h3>

                  <strong>
                    {Number(
                      ownerData.store.average_rating || 0
                    ).toFixed(2)}
                  </strong>
                </div>

                <div className="stat-card">
                  <h3>
                    📝 Total Ratings
                  </h3>

                  <strong>
                    {ownerData.store.total_ratings || 0}
                  </strong>
                </div>

                <div className="stat-card">
                  <h3>
                    👥 Users Who Rated
                  </h3>

                  <strong>
                    {ownerData.usersWhoRated?.length || 0}
                  </strong>
                </div>

              </div>

              <div className="table-card">

                <h2>
                  Users Who Rated Your Store
                </h2>

                {ownerData.usersWhoRated?.length > 0 ? (
                  <div className="table-wrapper">

                    <table>

                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Rating</th>
                          <th>Date</th>
                        </tr>
                      </thead>

                      <tbody>

                        {ownerData.usersWhoRated.map(
                          (item) => (
                            <tr key={item.id}>

                              <td>
                                {item.name}
                              </td>

                              <td>
                                {item.email}
                              </td>

                              <td>
                                ⭐ {item.rating}
                              </td>

                              <td>
                                {item.created_at
                                  ? new Date(
                                      item.created_at
                                    ).toLocaleDateString()
                                  : "-"}
                              </td>

                            </tr>
                          )
                        )}

                      </tbody>

                    </table>

                  </div>
                ) : (
                  <p className="empty-text">
                    No users have rated your store yet.
                  </p>
                )}

              </div>

            </>
          ) : (
            <div className="empty-card">
              <h3>
                No store assigned
              </h3>

              <p>
                Please contact the administrator.
              </p>
            </div>
          )}

        </div>
      )}

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