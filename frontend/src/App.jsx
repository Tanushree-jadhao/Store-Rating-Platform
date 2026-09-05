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
  getStores,
  getStoreDetails,
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

  const [activePage, setActivePage] = useState("login");

  // Login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginRole, setLoginRole] = useState("");

  // Signup
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupAddress, setSignupAddress] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupRole, setSignupRole] = useState("user");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Admin
  const [adminStats, setAdminStats] = useState({
    totalUsers: 0,
    totalStores: 0,
    totalRatings: 0,
  });

  const [adminUsers, setAdminUsers] = useState([]);
  const [adminStores, setAdminStores] = useState([]);

  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("");
  const [userSortBy, setUserSortBy] = useState("name");
  const [userSortOrder, setUserSortOrder] = useState("asc");

  const [storeSearch, setStoreSearch] = useState("");

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    address: "",
    password: "",
    role: "user",
  });

  const [newStore, setNewStore] = useState({
    name: "",
    address: "",
    owner_id: "",
  });

  const [userCreateMessage, setUserCreateMessage] = useState("");
  const [storeCreateMessage, setStoreCreateMessage] = useState("");

  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedStore, setSelectedStore] = useState(null);

  // Normal User
  const [stores, setStores] = useState([]);
  const [userRating, setUserRating] = useState({});
  const [ratingMessage, setRatingMessage] = useState("");

  // Owner
  const [ownerData, setOwnerData] = useState(null);

  // Change password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");

  // =========================
  // LOAD DASHBOARD DATA
  // =========================

  useEffect(() => {
    if (!loggedIn) return;

    const loadDashboardData = async () => {
      try {
        if (role === "admin") {
          const stats = await getAdminDashboardStats();
          setAdminStats(stats);
        }

        if (role === "user") {
          const data = await getStores();
          setStores(data || []);
        }

        if (role === "owner") {
          const data = await getOwnerDashboard();
          setOwnerData(data);
        }
      } catch (err) {
        console.error("Dashboard loading error:", err);
      }
    };

    loadDashboardData();
  }, [loggedIn, role]);

  // =========================
  // LOGIN
  // =========================

  const handleLogin = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!email.trim() || !password || !loginRole) {
      setError("Email, password and login role are required");
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
      setActivePage("dashboard");

      setEmail("");
      setPassword("");
      setLoginRole("");
      setError("");
      setMessage("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Login failed"
      );
    }
  };

  // =========================
  // SIGNUP
  // =========================

  const handleSignup = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    const name = signupName.trim();
    const signupEmailValue = signupEmail.trim();
    const address = signupAddress.trim();

    if (!name || !signupEmailValue || !address || !signupPassword) {
      setError("All fields are required");
      return;
    }

    if (name.length < 20 || name.length > 60) {
      setError("Name must be between 20 and 60 characters");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(signupEmailValue)) {
      setError("Please enter a valid email address");
      return;
    }

    if (address.length > 400) {
      setError("Address cannot exceed 400 characters");
      return;
    }

    const passwordRegex =
      /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;

    if (!passwordRegex.test(signupPassword)) {
      setError(
        "Password must be 8-16 characters with at least one uppercase letter and one special character"
      );
      return;
    }

    try {
      const data = await signupUser({
        name,
        email: signupEmailValue,
        address,
        password: signupPassword,
        role: signupRole,
      });

      setMessage(
        data.message || "Account created successfully"
      );

      setSignupName("");
      setSignupEmail("");
      setSignupAddress("");
      setSignupPassword("");
      setSignupRole("user");
      setActivePage("login");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Signup failed"
      );
    }
  };

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setLoggedIn(false);
    setUser(null);
    setRole("");
    setActivePage("login");

    setEmail("");
    setPassword("");
    setLoginRole("");
    setMessage("");
    setError("");
  };

  // =========================
  // ADMIN USERS
  // =========================

  const loadAdminUsers = async () => {
    try {
      const data = await getAdminUsers({
        search: userSearch,
        role: userRoleFilter,
        sortBy: userSortBy,
        order: userSortOrder,
      });

      setAdminUsers(data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load users"
      );
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();

    setUserCreateMessage("");
    setError("");

    try {
      const data = await createAdminUser(newUser);

      setUserCreateMessage(
        data.message || "User created successfully"
      );

      setNewUser({
        name: "",
        email: "",
        address: "",
        password: "",
        role: "user",
      });

      await loadAdminUsers();

      const stats = await getAdminDashboardStats();
      setAdminStats(stats);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to create user"
      );
    }
  };

  const handleViewUser = async (id) => {
    try {
      const data = await getUserDetails(id);
      setSelectedUser(data.user || data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load user details"
      );
    }
  };

  // =========================
  // ADMIN STORES
  // =========================

  const loadAdminStores = async () => {
    try {
      const data = await getAdminStores();
      setAdminStores(data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load stores"
      );
    }
  };

  const handleCreateStore = async (e) => {
    e.preventDefault();

    setStoreCreateMessage("");
    setError("");

    try {
      const data = await createAdminStore(newStore);

      setStoreCreateMessage(
        data.message || "Store created successfully"
      );

      setNewStore({
        name: "",
        address: "",
        owner_id: "",
      });

      await loadAdminStores();

      const stats = await getAdminDashboardStats();
      setAdminStats(stats);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to create store"
      );
    }
  };

  const handleViewStore = async (id) => {
    try {
      const data = await getStoreDetails(id);
      setSelectedStore(data.store || data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load store details"
      );
    }
  };

  // =========================
  // USER STORES
  // =========================

  const filteredStores = stores.filter((store) => {
    const search = storeSearch.toLowerCase();

    return (
      store.name?.toLowerCase().includes(search) ||
      store.address?.toLowerCase().includes(search)
    );
  });

  const handleRatingChange = (storeId, value) => {
    setUserRating((prev) => ({
      ...prev,
      [storeId]: value,
    }));
  };

  const handleSubmitRating = async (storeId) => {
    setRatingMessage("");

    const rating = Number(userRating[storeId]);

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      setRatingMessage(
        "Rating must be an integer between 1 and 5"
      );
      return;
    }

    try {
      await submitRating({
        store_id: storeId,
        rating,
      });

      setRatingMessage("Rating submitted successfully");

      const data = await getStores();
      setStores(data || []);
    } catch {
      try {
        await updateRating({
          store_id: storeId,
          rating,
        });

        setRatingMessage("Rating updated successfully");

        const data = await getStores();
        setStores(data || []);
      } catch (updateErr) {
        setRatingMessage(
          updateErr.response?.data?.message ||
            "Failed to submit rating"
        );
      }
    }
  };

  // =========================
  // CHANGE PASSWORD
  // =========================

  const handleChangePassword = async (e) => {
    e.preventDefault();

    setPasswordMessage("");
    setError("");

    if (!currentPassword || !newPassword) {
      setError("Both password fields are required");
      return;
    }

    const passwordRegex =
      /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;

    if (!passwordRegex.test(newPassword)) {
      setError(
        "New password must be 8-16 characters with at least one uppercase letter and one special character"
      );
      return;
    }

    try {
      const data = await changePassword({
        currentPassword,
        newPassword,
      });

      setPasswordMessage(
        data.message || "Password changed successfully"
      );

      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to change password"
      );
    }
  };

  // =========================
  // PAGE LOADERS
  // =========================

  const openAdminUsers = async () => {
    setActivePage("admin-users");
    setUserCreateMessage("");
    setError("");
    await loadAdminUsers();
  };

  const openAdminStores = async () => {
    setActivePage("admin-stores");
    setStoreCreateMessage("");
    setError("");
    await loadAdminStores();
  };

  const openUserStores = async () => {
    setActivePage("stores");
    setError("");

    try {
      const data = await getStores();
      setStores(data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load stores"
      );
    }
  };

  // =========================
  // LOGIN / SIGNUP SCREEN
  // =========================

  if (!loggedIn) {
    return (
      <div className="auth-page">
        <div className="auth-card">

          <div className="brand-header">
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

          {activePage === "login" && (
            <>
              <h2>Welcome Back</h2>

              {message && (
                <div className="success-message">
                  {message}
                </div>
              )}

              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin}>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  required
                />

                <select
                  value={loginRole}
                  onChange={(e) =>
                    setLoginRole(e.target.value)
                  }
                  required
                >
                  <option value="">Select Role</option>
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

                <button
                  type="submit"
                  className="primary-btn"
                >
                  Login
                </button>
              </form>

              <button
                type="button"
                className="secondary-btn"
                onClick={() => {
                  setActivePage("signup");
                  setError("");
                  setMessage("");
                }}
              >
                Create Account
              </button>
            </>
          )}

          {activePage === "signup" && (
            <>
              <h2>Create Account</h2>

              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}

              {message && (
                <div className="success-message">
                  {message}
                </div>
              )}

              <form onSubmit={handleSignup}>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={signupName}
                  onChange={(e) =>
                    setSignupName(e.target.value)
                  }
                  required
                />

                <input
                  type="email"
                  placeholder="Email"
                  value={signupEmail}
                  onChange={(e) =>
                    setSignupEmail(e.target.value)
                  }
                  required
                />

                <input
                  type="text"
                  placeholder="Address"
                  value={signupAddress}
                  onChange={(e) =>
                    setSignupAddress(e.target.value)
                  }
                  required
                />

                <input
                  type="password"
                  placeholder="Password"
                  value={signupPassword}
                  onChange={(e) =>
                    setSignupPassword(e.target.value)
                  }
                  required
                />

                <select
                  value={signupRole}
                  onChange={(e) =>
                    setSignupRole(e.target.value)
                  }
                  required
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

                <button
                  type="submit"
                  className="primary-btn"
                >
                  Create Account
                </button>
              </form>

              <button
                type="button"
                className="secondary-btn"
                onClick={() => {
                  setActivePage("login");
                  setError("");
                  setMessage("");
                }}
              >
                Back to Login
              </button>
            </>
          )}

        </div>
      </div>
    );
  }

  // =========================
  // DASHBOARD
  // =========================

  return (
    <div className="app-layout">

      <aside className="sidebar">

        <div className="sidebar-brand">
          <span>🏪</span>
          <div>
            <strong>RateHub</strong>
            <small>Store Rating Platform</small>
          </div>
        </div>

        <div className="user-info">
          <strong>{user?.name}</strong>
          <span>{user?.email}</span>
          <small>
            {role === "admin"
              ? "System Administrator"
              : role === "owner"
              ? "Store Owner"
              : "Normal User"}
          </small>
        </div>

        <nav>

          <button
            className={
              activePage === "dashboard"
                ? "nav-btn active"
                : "nav-btn"
            }
            onClick={() => setActivePage("dashboard")}
          >
            📊 Dashboard
          </button>

          {role === "admin" && (
            <>
              <button
                className={
                  activePage === "admin-users"
                    ? "nav-btn active"
                    : "nav-btn"
                }
                onClick={openAdminUsers}
              >
                👥 Users
              </button>

              <button
                className={
                  activePage === "admin-stores"
                    ? "nav-btn active"
                    : "nav-btn"
                }
                onClick={openAdminStores}
              >
                🏬 Stores
              </button>

              <button
                className={
                  activePage === "add-user"
                    ? "nav-btn active"
                    : "nav-btn"
                }
                onClick={() => {
                  setActivePage("add-user");
                  setUserCreateMessage("");
                  setError("");
                }}
              >
                ➕ Add User
              </button>

              <button
                className={
                  activePage === "add-store"
                    ? "nav-btn active"
                    : "nav-btn"
                }
                onClick={() => {
                  setActivePage("add-store");
                  setStoreCreateMessage("");
                  setError("");
                }}
              >
                ➕ Add Store
              </button>
            </>
          )}

          {role === "user" && (
            <button
              className={
                activePage === "stores"
                  ? "nav-btn active"
                  : "nav-btn"
              }
              onClick={openUserStores}
            >
              🏬 All Stores
            </button>
          )}

          <button
            className={
              activePage === "change-password"
                ? "nav-btn active"
                : "nav-btn"
            }
            onClick={() => {
              setActivePage("change-password");
              setError("");
              setPasswordMessage("");
            }}
          >
            🔐 Change Password
          </button>

        </nav>

        <button
          className="logout-btn"
          onClick={handleLogout}
        >
          🚪 Logout
        </button>

      </aside>

      <main className="main-content">

        {/* DASHBOARD */}

        {activePage === "dashboard" && (
          <section>

            <div className="page-header">
              <div>
                <h1>
                  {role === "admin"
                    ? "Admin Dashboard"
                    : role === "owner"
                    ? "Owner Dashboard"
                    : "User Dashboard"}
                </h1>

                <p>
                  {role === "admin"
                    ? "Manage users, stores and ratings."
                    : role === "owner"
                    ? "Monitor your store ratings and customers."
                    : "Discover stores and share your experience."}
                </p>
              </div>
            </div>

            {role === "admin" && (
              <div className="stats-grid">

                <div className="stat-card">
                  <div className="stat-icon">👥</div>
                  <div>
                    <span>Total Users</span>
                    <strong>
                      {adminStats.totalUsers}
                    </strong>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">🏬</div>
                  <div>
                    <span>Total Stores</span>
                    <strong>
                      {adminStats.totalStores}
                    </strong>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">⭐</div>
                  <div>
                    <span>Total Ratings</span>
                    <strong>
                      {adminStats.totalRatings}
                    </strong>
                  </div>
                </div>

              </div>
            )}

            {role === "user" && (
              <>
                <div className="dashboard-welcome">
                  <h2>
                    Welcome, {user?.name} 👋
                  </h2>

                  <p>
                    Browse stores, check ratings and share
                    your experience.
                  </p>
                </div>

                <div className="search-box">
                  <input
                    type="text"
                    placeholder="Search stores by name or address..."
                    value={storeSearch}
                    onChange={(e) =>
                      setStoreSearch(e.target.value)
                    }
                  />
                </div>

                <div className="store-grid">

                  {filteredStores.length === 0 ? (
                    <div className="empty-state">
                      {stores.length === 0
                        ? "No stores available."
                        : "No stores match your search."}
                    </div>
                  ) : (
                    filteredStores.map((store) => (
                      <div
                        className="store-card"
                        key={store.id}
                      >

                        <div className="store-card-top">

                          <div>
                            <h3>{store.name}</h3>
                            <p>{store.address}</p>
                          </div>

                          <div className="rating-badge">
                            ⭐{" "}
                            {Number(
                              store.overall_rating || 0
                            ).toFixed(2)}
                          </div>

                        </div>

                        <div className="store-rating-section">

                          <span>Your Rating</span>

                          <div className="rating-row">

                            <select
                              value={
                                userRating[store.id] || ""
                              }
                              onChange={(e) =>
                                handleRatingChange(
                                  store.id,
                                  e.target.value
                                )
                              }
                            >
                              <option value="">
                                Select
                              </option>
                              <option value="1">
                                1 ⭐
                              </option>
                              <option value="2">
                                2 ⭐
                              </option>
                              <option value="3">
                                3 ⭐
                              </option>
                              <option value="4">
                                4 ⭐
                              </option>
                              <option value="5">
                                5 ⭐
                              </option>
                            </select>

                            <button
                              className="primary-btn small-btn"
                              onClick={() =>
                                handleSubmitRating(
                                  store.id
                                )
                              }
                            >
                              Rate
                            </button>

                          </div>

                        </div>

                      </div>
                    ))
                  )}

                </div>

                {ratingMessage && (
                  <div className="success-message">
                    {ratingMessage}
                  </div>
                )}
              </>
            )}

            {role === "owner" && ownerData && (
              <>
                <div className="stats-grid">

                  <div className="stat-card">
                    <div className="stat-icon">
                      ⭐
                    </div>

                    <div>
                      <span>Average Rating</span>
                      <strong>
                        {Number(
                          ownerData.store?.average_rating || 0
                        ).toFixed(2)}
                      </strong>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon">
                      📝
                    </div>

                    <div>
                      <span>Total Ratings</span>
                      <strong>
                        {ownerData.store?.total_ratings || 0}
                      </strong>
                    </div>
                  </div>

                </div>

                <div className="owner-store-card">
                  <h2>
                    {ownerData.store?.name}
                  </h2>

                  <p>
                    {ownerData.store?.address}
                  </p>
                </div>

                <div className="table-card">

                  <h2>Users Who Rated</h2>

                  {ownerData.usersWhoRated?.length === 0 ? (
                    <div className="empty-state">
                      No ratings yet.
                    </div>
                  ) : (
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
                            (ratedUser) => (
                              <tr key={ratedUser.id}>

                                <td>
                                  {ratedUser.name}
                                </td>

                                <td>
                                  {ratedUser.email}
                                </td>

                                <td>
                                  ⭐ {ratedUser.rating}
                                </td>

                                <td>
                                  {ratedUser.created_at
                                    ? new Date(
                                        ratedUser.created_at
                                      ).toLocaleDateString()
                                    : "-"}
                                </td>

                              </tr>
                            )
                          )}
                        </tbody>

                      </table>

                    </div>
                  )}

                </div>
              </>
            )}

          </section>
        )}

        {/* ADMIN USERS */}

        {activePage === "admin-users" &&
          role === "admin" && (
            <section>

              <div className="page-header">
                <div>
                  <h1>Users</h1>
                  <p>
                    View and manage registered users.
                  </p>
                </div>
              </div>

              <div className="filters-card">

                <input
                  type="text"
                  placeholder="Search users..."
                  value={userSearch}
                  onChange={(e) =>
                    setUserSearch(e.target.value)
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      loadAdminUsers();
                    }
                  }}
                />

                <select
                  value={userRoleFilter}
                  onChange={(e) =>
                    setUserRoleFilter(e.target.value)
                  }
                >
                  <option value="">
                    All Roles
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

                <select
                  value={userSortBy}
                  onChange={(e) =>
                    setUserSortBy(e.target.value)
                  }
                >
                  <option value="name">
                    Name
                  </option>
                  <option value="email">
                    Email
                  </option>
                  <option value="role">
                    Role
                  </option>
                  <option value="created_at">
                    Created Date
                  </option>
                </select>

                <select
                  value={userSortOrder}
                  onChange={(e) =>
                    setUserSortOrder(e.target.value)
                  }
                >
                  <option value="asc">
                    Ascending
                  </option>
                  <option value="desc">
                    Descending
                  </option>
                </select>

                <button
                  className="primary-btn"
                  onClick={loadAdminUsers}
                >
                  Search
                </button>

              </div>

              <div className="table-card">

                <div className="table-wrapper">

                  <table>

                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Address</th>
                        <th>Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {adminUsers.map((adminUser) => (
                        <tr key={adminUser.id}>

                          <td>
                            {adminUser.name}
                          </td>

                          <td>
                            {adminUser.email}
                          </td>

                          <td>
                            <span className="role-badge">
                              {adminUser.role}
                            </span>
                          </td>

                          <td>
                            {adminUser.address}
                          </td>

                          <td>
                            <button
                              className="view-btn"
                              onClick={() =>
                                handleViewUser(
                                  adminUser.id
                                )
                              }
                            >
                              View
                            </button>
                          </td>

                        </tr>
                      ))}
                    </tbody>

                  </table>

                </div>

              </div>

            </section>
          )}

        {/* USER MODAL */}

        {selectedUser && (
          <div
            className="modal-overlay"
            onClick={() => setSelectedUser(null)}
          >

            <div
              className="user-details-modal"
              onClick={(e) =>
                e.stopPropagation()
              }
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

              <h2>User Details</h2>

              <p className="modal-subtitle">
                Complete user information
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
                  {selectedUser.address}
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

        {/* ADMIN STORES */}

        {activePage === "admin-stores" &&
          role === "admin" && (
            <section>

              <div className="page-header">
                <div>
                  <h1>Stores</h1>
                  <p>
                    View all registered stores.
                  </p>
                </div>
              </div>

              <div className="search-box">

                <input
                  type="text"
                  placeholder="Search stores..."
                  value={storeSearch}
                  onChange={(e) =>
                    setStoreSearch(e.target.value)
                  }
                />

              </div>

              <div className="table-card">

                <div className="table-wrapper">

                  <table>

                    <thead>
                      <tr>
                        <th>Store Name</th>
                        <th>Address</th>
                        <th>Owner</th>
                        <th>Overall Rating</th>
                        <th>Action</th>
                      </tr>
                    </thead>

                    <tbody>

                      {adminStores
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
                          <tr key={store.id}>

                            <td>
                              {store.name}
                            </td>

                            <td>
                              {store.address}
                            </td>

                            <td>
                              {store.owner_name ||
                                "Not Assigned"}
                            </td>

                            <td>
                              ⭐{" "}
                              {Number(
                                store.overall_rating || 0
                              ).toFixed(2)}
                            </td>

                            <td>
                              <button
                                className="view-btn"
                                onClick={() =>
                                  handleViewStore(
                                    store.id
                                  )
                                }
                              >
                                View
                              </button>
                            </td>

                          </tr>
                        ))}

                    </tbody>

                  </table>

                </div>

              </div>

            </section>
          )}

        {/* STORE MODAL */}

        {selectedStore && (
          <div
            className="modal-overlay"
            onClick={() =>
              setSelectedStore(null)
            }
          >

            <div
              className="user-details-modal"
              onClick={(e) =>
                e.stopPropagation()
              }
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
                🏬
              </div>

              <h2>Store Details</h2>

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
                    "Not Assigned"}
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

        {/* ADD USER */}

        {activePage === "add-user" &&
          role === "admin" && (
            <section>

              <div className="page-header">
                <div>
                  <h1>Add User</h1>
                  <p>
                    Create a new platform account.
                  </p>
                </div>
              </div>

              {userCreateMessage && (
                <div className="success-message">
                  {userCreateMessage}
                </div>
              )}

              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}

              <div className="form-card">

                <form onSubmit={handleCreateUser}>

                  <label>
                    Full Name
                  </label>

                  <input
                    type="text"
                    value={newUser.name}
                    onChange={(e) =>
                      setNewUser({
                        ...newUser,
                        name: e.target.value,
                      })
                    }
                    required
                  />

                  <label>
                    Email
                  </label>

                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) =>
                      setNewUser({
                        ...newUser,
                        email: e.target.value,
                      })
                    }
                    required
                  />

                  <label>
                    Address
                  </label>

                  <input
                    type="text"
                    value={newUser.address}
                    onChange={(e) =>
                      setNewUser({
                        ...newUser,
                        address: e.target.value,
                      })
                    }
                    required
                  />

                  <label>
                    Password
                  </label>

                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) =>
                      setNewUser({
                        ...newUser,
                        password: e.target.value,
                      })
                    }
                    required
                  />

                  <label>
                    Role
                  </label>

                  <select
                    value={newUser.role}
                    onChange={(e) =>
                      setNewUser({
                        ...newUser,
                        role: e.target.value,
                      })
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

                  <button
                    type="submit"
                    className="primary-btn"
                  >
                    Add User
                  </button>

                </form>

              </div>

            </section>
          )}

        {/* ADD STORE */}

        {activePage === "add-store" &&
          role === "admin" && (
            <section>

              <div className="page-header">
                <div>
                  <h1>Add Store</h1>
                  <p>
                    Create a new store and assign its owner.
                  </p>
                </div>
              </div>

              {storeCreateMessage && (
                <div className="success-message">
                  {storeCreateMessage}
                </div>
              )}

              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}

              <div className="form-card">

                <form onSubmit={handleCreateStore}>

                  <label>
                    Store Name
                  </label>

                  <input
                    type="text"
                    value={newStore.name}
                    onChange={(e) =>
                      setNewStore({
                        ...newStore,
                        name: e.target.value,
                      })
                    }
                    required
                  />

                  <label>
                    Address
                  </label>

                  <input
                    type="text"
                    value={newStore.address}
                    onChange={(e) =>
                      setNewStore({
                        ...newStore,
                        address: e.target.value,
                      })
                    }
                    required
                  />

                  <label>
                    Owner ID
                  </label>

                  <input
                    type="number"
                    value={newStore.owner_id}
                    onChange={(e) =>
                      setNewStore({
                        ...newStore,
                        owner_id: e.target.value,
                      })
                    }
                    placeholder="Enter Store Owner ID"
                    required
                  />

                  <button
                    type="submit"
                    className="primary-btn"
                  >
                    Add Store
                  </button>

                </form>

              </div>

            </section>
          )}

        {/* ALL STORES */}

        {activePage === "stores" &&
          role === "user" && (
            <section>

              <div className="page-header">
                <div>
                  <h1>All Stores</h1>
                  <p>
                    Search stores and submit your rating.
                  </p>
                </div>
              </div>

              <div className="search-box">

                <input
                  type="text"
                  placeholder="Search by store name or address..."
                  value={storeSearch}
                  onChange={(e) =>
                    setStoreSearch(e.target.value)
                  }
                />

              </div>

              <div className="store-grid">

                {filteredStores.length === 0 ? (
                  <div className="empty-state">
                    {stores.length === 0
                      ? "No stores available."
                      : "No stores match your search."}
                  </div>
                ) : (
                  filteredStores.map((store) => (
                    <div
                      className="store-card"
                      key={store.id}
                    >

                      <div className="store-card-top">

                        <div>
                          <h3>{store.name}</h3>
                          <p>{store.address}</p>
                        </div>

                        <div className="rating-badge">
                          ⭐{" "}
                          {Number(
                            store.overall_rating || 0
                          ).toFixed(2)}
                        </div>

                      </div>

                      <div className="store-rating-section">

                        <span>Your Rating</span>

                        <div className="rating-row">

                          <select
                            value={
                              userRating[store.id] || ""
                            }
                            onChange={(e) =>
                              handleRatingChange(
                                store.id,
                                e.target.value
                              )
                            }
                          >
                            <option value="">
                              Select
                            </option>
                            <option value="1">
                              1 ⭐
                            </option>
                            <option value="2">
                              2 ⭐
                            </option>
                            <option value="3">
                              3 ⭐
                            </option>
                            <option value="4">
                              4 ⭐
                            </option>
                            <option value="5">
                              5 ⭐
                            </option>
                          </select>

                          <button
                            className="primary-btn small-btn"
                            onClick={() =>
                              handleSubmitRating(
                                store.id
                              )
                            }
                          >
                            Rate
                          </button>

                        </div>

                      </div>

                    </div>
                  ))
                )}

              </div>

            </section>
          )}

        {/* CHANGE PASSWORD */}

        {activePage === "change-password" && (
          <section>

            <div className="page-header">
              <div>
                <h1>Change Password</h1>
                <p>
                  Update your account password securely.
                </p>
              </div>
            </div>

            {passwordMessage && (
              <div className="success-message">
                {passwordMessage}
              </div>
            )}

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <div className="form-card">

              <form onSubmit={handleChangePassword}>

                <label>
                  Current Password
                </label>

                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) =>
                    setCurrentPassword(
                      e.target.value
                    )
                  }
                  required
                />

                <label>
                  New Password
                </label>

                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) =>
                    setNewPassword(
                      e.target.value
                    )
                  }
                  required
                />

                <button
                  type="submit"
                  className="primary-btn"
                >
                  Change Password
                </button>

              </form>

            </div>

          </section>
        )}

      </main>
    </div>
  );
}

export default App;