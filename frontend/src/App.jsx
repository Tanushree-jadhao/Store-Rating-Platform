import { useEffect, useState } from "react";
import "./App.css";

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

function App() {
  // ================= AUTH STATE =================
  const [loggedIn, setLoggedIn] = useState(() => {
    return Boolean(localStorage.getItem("token"));
  });

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");

    if (!savedUser) {
      return null;
    }

    try {
      return JSON.parse(savedUser);
    } catch {
      return null;
    }
  });

  const [role, setRole] = useState(() => {
    const savedUser = localStorage.getItem("user");

    if (!savedUser) {
      return "";
    }

    try {
      return JSON.parse(savedUser)?.role || "";
    } catch {
      return "";
    }
  });

  const [activePage, setActivePage] = useState("dashboard");

  // ================= LOGIN =================
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginRole, setLoginRole] = useState("user");
  const [loginMessage, setLoginMessage] = useState("");

  // ================= SIGNUP =================
  const [showSignup, setShowSignup] = useState(false);
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupAddress, setSignupAddress] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupRole, setSignupRole] = useState("user");
  const [signupMessage, setSignupMessage] = useState("");

  // ================= ADMIN =================
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

  const [userCreateMessage, setUserCreateMessage] = useState("");
  const [storeCreateMessage, setStoreCreateMessage] = useState("");

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

  // ================= USER =================
  const [stores, setStores] = useState([]);
  const [ratingValue, setRatingValue] = useState(5);
  const [ratingMessage, setRatingMessage] = useState("");

  // ================= OWNER =================
  const [ownerData, setOwnerData] = useState(null);

  // ================= CHANGE PASSWORD =================
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");

  // ================= ADMIN FUNCTIONS =================
  const loadAdminDashboard = async () => {
    try {
      const stats = await getAdminDashboardStats();
      setAdminStats(stats);
    } catch (error) {
      console.error("Admin dashboard error:", error);
    }
  };

  const loadAdminUsers = async () => {
    try {
      const data = await getAdminUsers();
      setAdminUsers(data || []);
    } catch (error) {
      console.error("Admin users error:", error);
    }
  };

  const loadAdminStores = async () => {
    try {
      const data = await getAdminStores();
      setAdminStores(data || []);
    } catch (error) {
      console.error("Admin stores error:", error);
    }
  };

  // ================= USER FUNCTIONS =================
  const loadStores = async () => {
    try {
      const data = await getStores();
      setStores(data || []);
    } catch (error) {
      console.error("Stores error:", error);
    }
  };

  // ================= LOAD DASHBOARD =================
  useEffect(() => {
    if (!loggedIn) {
      return;
    }

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
      } catch (error) {
        console.error("Dashboard loading error:", error);
      }
    };

    loadDashboardData();
  }, [loggedIn, role]);

  // ================= LOGIN =================
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginMessage("");

    if (!email || !password) {
      setLoginMessage("Please enter email and password");
      return;
    }

    try {
      const data = await loginUser({
        email,
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
    } catch (error) {
      setLoginMessage(
        error?.response?.data?.message ||
          error?.message ||
          "Login failed"
      );
    }
  };

  // ================= SIGNUP =================
  const handleSignup = async (e) => {
    e.preventDefault();
    setSignupMessage("");

    if (
      !signupName ||
      !signupEmail ||
      !signupAddress ||
      !signupPassword
    ) {
      setSignupMessage("Please fill all fields");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const passwordRegex =
      /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;

    if (
      signupName.trim().length < 20 ||
      signupName.trim().length > 60
    ) {
      setSignupMessage(
        "Name must be between 20 and 60 characters"
      );
      return;
    }

    if (!emailRegex.test(signupEmail.trim())) {
      setSignupMessage("Please enter a valid email address");
      return;
    }

    if (signupAddress.trim().length > 400) {
      setSignupMessage(
        "Address cannot exceed 400 characters"
      );
      return;
    }

    if (!passwordRegex.test(signupPassword)) {
      setSignupMessage(
        "Password must be 8-16 characters with at least one uppercase letter and one special character"
      );
      return;
    }

    try {
      const data = await signupUser({
        name: signupName,
        email: signupEmail,
        address: signupAddress,
        password: signupPassword,
        role: signupRole,
      });

      setSignupMessage(
        data?.message || "Account created successfully"
      );

      setSignupName("");
      setSignupEmail("");
      setSignupAddress("");
      setSignupPassword("");
    } catch (error) {
      setSignupMessage(
        error?.response?.data?.message ||
          error?.message ||
          "Signup failed"
      );
    }
  };

  // ================= LOGOUT =================
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setLoggedIn(false);
    setRole("");
    setUser(null);
    setActivePage("dashboard");

    setEmail("");
    setPassword("");
    setLoginMessage("");

    setOwnerData(null);
    setStores([]);
  };

  // ================= CREATE USER =================
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setUserCreateMessage("");

    try {
      const data = await createAdminUser(newUser);

      setUserCreateMessage(
        data?.message || "User created successfully"
      );

      setNewUser({
        name: "",
        email: "",
        address: "",
        password: "",
        role: "user",
      });

      await loadAdminUsers();
      await loadAdminDashboard();
    } catch (error) {
      setUserCreateMessage(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to create user"
      );
    }
  };

  // ================= CREATE STORE =================
  const handleCreateStore = async (e) => {
    e.preventDefault();
    setStoreCreateMessage("");

    try {
      const data = await createAdminStore(newStore);

      setStoreCreateMessage(
        data?.message || "Store created successfully"
      );

      setNewStore({
        name: "",
        address: "",
        owner_id: "",
      });

      await loadAdminStores();
      await loadAdminDashboard();
    } catch (error) {
      setStoreCreateMessage(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to create store"
      );
    }
  };

  // ================= VIEW USER =================
  const handleViewUser = async (id) => {
    try {
      const data = await getUserDetails(id);
      setSelectedUser(data?.user || data);
    } catch (error) {
      console.error("User details error:", error);
    }
  };

  // ================= VIEW STORE =================
  const handleViewStore = async (id) => {
    try {
      const data = await getStoreDetails(id);
      setSelectedStore(data?.store || data);
    } catch (error) {
      console.error("Store details error:", error);
    }
  };

  // ================= RATING =================
  const handleSubmitRating = async (storeId) => {
    setRatingMessage("");

    try {
      const existingStore = stores.find(
        (store) => store.id === storeId
      );

      if (existingStore?.user_rating) {
        await updateRating({
          store_id: storeId,
          rating: Number(ratingValue),
        });

        setRatingMessage("Rating updated successfully");
      } else {
        await submitRating({
          store_id: storeId,
          rating: Number(ratingValue),
        });

        setRatingMessage("Rating submitted successfully");
      }

      await loadStores();
    } catch (error) {
      setRatingMessage(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to submit rating"
      );
    }
  };

  // ================= CHANGE PASSWORD =================
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMessage("");

    if (!currentPassword || !newPassword) {
      setPasswordMessage(
        "Please fill both password fields"
      );
      return;
    }

    const passwordRegex =
      /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;

    if (!passwordRegex.test(newPassword)) {
      setPasswordMessage(
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
        data?.message ||
          "Password changed successfully"
      );

      setCurrentPassword("");
      setNewPassword("");
    } catch (error) {
      setPasswordMessage(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to change password"
      );
    }
  };

  // ================= FILTERS =================
  const filteredUsers = adminUsers.filter((item) => {
    const search = userSearch.toLowerCase();

    return (
      item.name?.toLowerCase().includes(search) ||
      item.email?.toLowerCase().includes(search) ||
      item.role?.toLowerCase().includes(search)
    );
  });

  const filteredStores = stores.filter((store) => {
    const search = storeSearch.toLowerCase();

    return (
      store.name?.toLowerCase().includes(search) ||
      store.address?.toLowerCase().includes(search)
    );
  });

  // ================= LOGIN / SIGNUP PAGE =================
  if (!loggedIn) {
    if (showSignup) {
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

            <div className="login-heading">
              <h2>Create Account</h2>
              <span>Create your account</span>
            </div>

            <form onSubmit={handleSignup}>
              <label>Name</label>

              <input
                type="text"
                value={signupName}
                onChange={(e) =>
                  setSignupName(e.target.value)
                }
                placeholder="Enter your full name"
              />

              <label>Email</label>

              <input
                type="email"
                value={signupEmail}
                onChange={(e) =>
                  setSignupEmail(e.target.value)
                }
                placeholder="Enter your email"
              />

              <label>Address</label>

              <textarea
                value={signupAddress}
                onChange={(e) =>
                  setSignupAddress(e.target.value)
                }
                placeholder="Enter your address"
              />

              <label>Password</label>

              <input
                type="password"
                value={signupPassword}
                onChange={(e) =>
                  setSignupPassword(e.target.value)
                }
                placeholder="8-16 characters"
              />

              <label>Account Type</label>

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

              {signupMessage && (
                <div className="message-box">
                  {signupMessage}
                </div>
              )}

              <button
                type="submit"
                className="primary-btn"
              >
                Create Account
              </button>
            </form>

            <button
              type="button"
              className="link-btn"
              onClick={() => {
                setShowSignup(false);
                setSignupMessage("");
              }}
            >
              Already have an account? Login
            </button>
          </div>
        </div>
      );
    }

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

          <form onSubmit={handleLogin}>
            <label>Email</label>

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="Enter your email"
            />

            <label>Password</label>

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="Enter your password"
            />

            <label>Login As</label>

            <select
              value={loginRole}
              onChange={(e) =>
                setLoginRole(e.target.value)
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

            {loginMessage && (
              <div className="message-box error">
                {loginMessage}
              </div>
            )}

            <button
              type="submit"
              className="primary-btn"
            >
              Login
            </button>
          </form>

          <button
            type="button"
            className="link-btn"
            onClick={() => {
              setShowSignup(true);
              setLoginMessage("");
            }}
          >
            Don't have an account? Create Account
          </button>
        </div>
      </div>
    );
  }

  // ================= MAIN APPLICATION =================
  return (
    <div className="app-container">
      {/* TOPBAR */}
      <header className="topbar">
        <div className="topbar-brand">
          🏪 Store Rating Platform
        </div>

        <div className="topbar-right">
          <span className="user-name">
            {user?.name}
          </span>

          <button
            type="button"
            className="logout-btn"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </header>

      <div className="layout">
        {/* SIDEBAR */}
        <aside className="sidebar">
          <button
            className={
              activePage === "dashboard"
                ? "nav-btn active"
                : "nav-btn"
            }
            onClick={() =>
              setActivePage("dashboard")
            }
          >
            Dashboard
          </button>

          {/* ADMIN MENU */}
          {role === "admin" && (
            <>
              <button
                className={
                  activePage === "users"
                    ? "nav-btn active"
                    : "nav-btn"
                }
                onClick={() => {
                  setActivePage("users");
                  loadAdminUsers();
                }}
              >
                Users
              </button>

              <button
                className={
                  activePage === "stores"
                    ? "nav-btn active"
                    : "nav-btn"
                }
                onClick={() => {
                  setActivePage("stores");
                  loadAdminStores();
                }}
              >
                Stores
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
                }}
              >
                Add User
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
                }}
              >
                Add Store
              </button>
            </>
          )}

          {/* USER MENU */}
          {role === "user" && (
            <>
              <button
                className={
                  activePage === "all-stores"
                    ? "nav-btn active"
                    : "nav-btn"
                }
                onClick={() => {
                  setActivePage("all-stores");
                  loadStores();
                }}
              >
                All Stores
              </button>

              <button
                className={
                  activePage === "change-password"
                    ? "nav-btn active"
                    : "nav-btn"
                }
                onClick={() =>
                  setActivePage("change-password")
                }
              >
                Change Password
              </button>
            </>
          )}

          {/* OWNER MENU */}
          {role === "owner" && (
            <button
              className={
                activePage === "change-password"
                  ? "nav-btn active"
                  : "nav-btn"
              }
              onClick={() =>
                setActivePage("change-password")
              }
            >
              Change Password
            </button>
          )}
        </aside>

        {/* MAIN CONTENT */}
        <main className="main-content">
          {/* ADMIN DASHBOARD */}
          {activePage === "dashboard" &&
            role === "admin" && (
              <>
                <div className="page-header">
                  <h2>
                    System Administrator Dashboard
                  </h2>

                  <p>
                    Manage the Store Rating Platform
                  </p>
                </div>

                <div className="stats-grid">
                  <div className="stat-card">
                    <span>Total Users</span>

                    <strong>
                      {adminStats.totalUsers}
                    </strong>
                  </div>

                  <div className="stat-card">
                    <span>Total Stores</span>

                    <strong>
                      {adminStats.totalStores}
                    </strong>
                  </div>

                  <div className="stat-card">
                    <span>Total Ratings</span>

                    <strong>
                      {adminStats.totalRatings}
                    </strong>
                  </div>
                </div>
              </>
            )}

          {/* USER DASHBOARD */}
          {activePage === "dashboard" &&
            role === "user" && (
              <>
                <div className="page-header">
                  <h2>
                    Welcome, {user?.name}
                  </h2>

                  <p>
                    Discover stores and share your
                    experience.
                  </p>
                </div>

                <div className="section-card">
                  <div className="section-header">
                    <div>
                      <h3>Stores</h3>

                      <p>
                        Search and rate stores
                      </p>
                    </div>

                    <input
                      className="search-input"
                      type="text"
                      placeholder="Search store..."
                      value={storeSearch}
                      onChange={(e) =>
                        setStoreSearch(e.target.value)
                      }
                    />
                  </div>

                  <div className="store-grid">
                    {filteredStores.length === 0 ? (
                      <p className="empty-text">
                        {stores.length === 0
                          ? "No stores available."
                          : "No matching stores found."}
                      </p>
                    ) : (
                      filteredStores.map((store) => (
                        <div
                          className="store-card"
                          key={store.id}
                        >
                          <h3>{store.name}</h3>

                          <p>{store.address}</p>

                          <div className="rating-info">
                            <span>
                              Overall Rating:{" "}
                              {Number(
                                store.overall_rating || 0
                              ).toFixed(2)}
                            </span>

                            <span>
                              Your Rating:{" "}
                              {store.user_rating ||
                                "Not rated"}
                            </span>
                          </div>

                          <div className="rating-actions">
                            <select
                              value={ratingValue}
                              onChange={(e) =>
                                setRatingValue(
                                  Number(e.target.value)
                                )
                              }
                            >
                              <option value="1">
                                1 Star
                              </option>

                              <option value="2">
                                2 Stars
                              </option>

                              <option value="3">
                                3 Stars
                              </option>

                              <option value="4">
                                4 Stars
                              </option>

                              <option value="5">
                                5 Stars
                              </option>
                            </select>

                            <button
                              type="button"
                              className="primary-btn small"
                              onClick={() =>
                                handleSubmitRating(
                                  store.id
                                )
                              }
                            >
                              {store.user_rating
                                ? "Update Rating"
                                : "Rate Store"}
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {ratingMessage && (
                    <div className="message-box">
                      {ratingMessage}
                    </div>
                  )}
                </div>
              </>
            )}

          {/* OWNER DASHBOARD */}
          {activePage === "dashboard" &&
            role === "owner" &&
            ownerData && (
              <>
                <div className="page-header">
                  <h2>
                    Store Owner Dashboard
                  </h2>

                  <p>
                    View your store performance
                    and customer ratings.
                  </p>
                </div>

                <div className="stats-grid">
                  <div className="stat-card">
                    <span>Average Rating</span>

                    <strong>
                      {Number(
                        ownerData.store
                          ?.average_rating || 0
                      ).toFixed(2)}
                    </strong>
                  </div>

                  <div className="stat-card">
                    <span>Total Ratings</span>

                    <strong>
                      {ownerData.store
                        ?.total_ratings || 0}
                    </strong>
                  </div>
                </div>

                <div className="section-card">
                  <h3>
                    {ownerData.store?.name}
                  </h3>

                  <p>
                    {ownerData.store?.address}
                  </p>

                  <h3 className="table-title">
                    Users Who Rated
                  </h3>

                  {ownerData.usersWhoRated?.length ===
                  0 ? (
                    <p className="empty-text">
                      No users have rated your
                      store yet.
                    </p>
                  ) : (
                    <div className="table-wrapper">
                      <table>
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Rating</th>
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

          {/* ADMIN USERS */}
          {activePage === "users" &&
            role === "admin" && (
              <>
                <div className="page-header">
                  <h2>Users</h2>

                  <p>
                    View and manage registered
                    users.
                  </p>
                </div>

                <div className="section-card">
                  <div className="section-header">
                    <h3>All Users</h3>

                    <input
                      className="search-input"
                      type="text"
                      placeholder="Search users..."
                      value={userSearch}
                      onChange={(e) =>
                        setUserSearch(e.target.value)
                      }
                    />
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
                        {filteredUsers.map((item) => (
                          <tr key={item.id}>
                            <td>
                              {item.name}
                            </td>

                            <td>
                              {item.email}
                            </td>

                            <td>
                              {item.role === "admin"
                                ? "System Administrator"
                                : item.role === "owner"
                                ? "Store Owner"
                                : "Normal User"}
                            </td>

                            <td>
                              <button
                                type="button"
                                className="secondary-btn"
                                onClick={() =>
                                  handleViewUser(
                                    item.id
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
              </>
            )}

          {/* ADMIN STORES */}
          {activePage === "stores" &&
            role === "admin" && (
              <>
                <div className="page-header">
                  <h2>Stores</h2>

                  <p>
                    View all registered stores.
                  </p>
                </div>

                <div className="section-card">
                  <div className="table-wrapper">
                    <table>
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Address</th>
                          <th>Owner</th>
                          <th>Rating</th>
                          <th>Action</th>
                        </tr>
                      </thead>

                      <tbody>
                        {adminStores.map((store) => (
                          <tr key={store.id}>
                            <td>
                              {store.name}
                            </td>

                            <td>
                              {store.address}
                            </td>

                            <td>
                              {store.owner_name ||
                                "Not assigned"}
                            </td>

                            <td>
                              ⭐{" "}
                              {Number(
                                store.overall_rating || 0
                              ).toFixed(2)}
                            </td>

                            <td>
                              <button
                                type="button"
                                className="secondary-btn"
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
              </>
            )}

          {/* ADD USER */}
          {activePage === "add-user" &&
            role === "admin" && (
              <>
                <div className="page-header">
                  <h2>Add User</h2>

                  <p>
                    Create a new platform
                    account.
                  </p>
                </div>

                <div className="section-card form-card">
                  <form onSubmit={handleCreateUser}>
                    <label>Name</label>

                    <input
                      type="text"
                      value={newUser.name}
                      onChange={(e) =>
                        setNewUser({
                          ...newUser,
                          name: e.target.value,
                        })
                      }
                      placeholder="20-60 characters"
                    />

                    <label>Email</label>

                    <input
                      type="email"
                      value={newUser.email}
                      onChange={(e) =>
                        setNewUser({
                          ...newUser,
                          email: e.target.value,
                        })
                      }
                      placeholder="Enter email"
                    />

                    <label>Address</label>

                    <textarea
                      value={newUser.address}
                      onChange={(e) =>
                        setNewUser({
                          ...newUser,
                          address: e.target.value,
                        })
                      }
                      placeholder="Maximum 400 characters"
                    />

                    <label>Password</label>

                    <input
                      type="password"
                      value={newUser.password}
                      onChange={(e) =>
                        setNewUser({
                          ...newUser,
                          password: e.target.value,
                        })
                      }
                      placeholder="8-16 characters"
                    />

                    <label>Role</label>

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

                    {userCreateMessage && (
                      <div className="message-box">
                        {userCreateMessage}
                      </div>
                    )}

                    <button
                      type="submit"
                      className="primary-btn"
                    >
                      Add User
                    </button>
                  </form>
                </div>
              </>
            )}

          {/* ADD STORE */}
          {activePage === "add-store" &&
            role === "admin" && (
              <>
                <div className="page-header">
                  <h2>Add Store</h2>

                  <p>
                    Create a store and assign
                    an owner.
                  </p>
                </div>

                <div className="section-card form-card">
                  <form onSubmit={handleCreateStore}>
                    <label>Store Name</label>

                    <input
                      type="text"
                      value={newStore.name}
                      onChange={(e) =>
                        setNewStore({
                          ...newStore,
                          name: e.target.value,
                        })
                      }
                      placeholder="20-60 characters"
                    />

                    <label>Address</label>

                    <textarea
                      value={newStore.address}
                      onChange={(e) =>
                        setNewStore({
                          ...newStore,
                          address: e.target.value,
                        })
                      }
                      placeholder="Maximum 400 characters"
                    />

                    <label>Owner ID</label>

                    <input
                      type="number"
                      value={newStore.owner_id}
                      onChange={(e) =>
                        setNewStore({
                          ...newStore,
                          owner_id: e.target.value,
                        })
                      }
                      placeholder="Enter owner ID"
                    />

                    {storeCreateMessage && (
                      <div className="message-box">
                        {storeCreateMessage}
                      </div>
                    )}

                    <button
                      type="submit"
                      className="primary-btn"
                    >
                      Add Store
                    </button>
                  </form>
                </div>
              </>
            )}

          {/* ALL STORES */}
          {activePage === "all-stores" &&
            role === "user" && (
              <>
                <div className="page-header">
                  <h2>All Stores</h2>

                  <p>
                    Search and rate available
                    stores.
                  </p>
                </div>

                <div className="section-card">
                  <div className="section-header">
                    <h3>Stores</h3>

                    <input
                      className="search-input"
                      type="text"
                      placeholder="Search by name or address..."
                      value={storeSearch}
                      onChange={(e) =>
                        setStoreSearch(e.target.value)
                      }
                    />
                  </div>

                  <div className="store-grid">
                    {filteredStores.length === 0 ? (
                      <p className="empty-text">
                        {stores.length === 0
                          ? "No stores available."
                          : "No matching stores found."}
                      </p>
                    ) : (
                      filteredStores.map((store) => (
                        <div
                          className="store-card"
                          key={store.id}
                        >
                          <h3>{store.name}</h3>

                          <p>{store.address}</p>

                          <div className="rating-info">
                            <span>
                              Overall Rating:{" "}
                              {Number(
                                store.overall_rating || 0
                              ).toFixed(2)}
                            </span>

                            <span>
                              Your Rating:{" "}
                              {store.user_rating ||
                                "Not rated"}
                            </span>
                          </div>

                          <div className="rating-actions">
                            <select
                              value={ratingValue}
                              onChange={(e) =>
                                setRatingValue(
                                  Number(e.target.value)
                                )
                              }
                            >
                              <option value="1">
                                1 Star
                              </option>

                              <option value="2">
                                2 Stars
                              </option>

                              <option value="3">
                                3 Stars
                              </option>

                              <option value="4">
                                4 Stars
                              </option>

                              <option value="5">
                                5 Stars
                              </option>
                            </select>

                            <button
                              type="button"
                              className="primary-btn small"
                              onClick={() =>
                                handleSubmitRating(
                                  store.id
                                )
                              }
                            >
                              {store.user_rating
                                ? "Update Rating"
                                : "Rate Store"}
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}

          {/* CHANGE PASSWORD */}
          {activePage === "change-password" && (
            <>
              <div className="page-header">
                <h2>Change Password</h2>

                <p>
                  Update your account password.
                </p>
              </div>

              <div className="section-card form-card">
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
                    placeholder="Enter current password"
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
                    placeholder="8-16 characters"
                  />

                  {passwordMessage && (
                    <div className="message-box">
                      {passwordMessage}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="primary-btn"
                  >
                    Change Password
                  </button>
                </form>
              </div>
            </>
          )}
        </main>
      </div>

      {/* ================= USER DETAILS MODAL ================= */}
      {selectedUser && (
        <div
          className="modal-overlay"
          onClick={() =>
            setSelectedUser(null)
          }
        >
          <div
            className="user-details-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <button
              type="button"
              className="modal-close"
              onClick={() =>
                setSelectedUser(null)
              }
              aria-label="Close"
            >
              ×
            </button>

            <div className="modal-icon">
              👤
            </div>

            <h2>User Details</h2>

            <p className="modal-subtitle">
              Account information
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
                {selectedUser.role === "admin"
                  ? "System Administrator"
                  : selectedUser.role === "owner"
                  ? "Store Owner"
                  : "Normal User"}
              </strong>
            </div>

            <button
              type="button"
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

      {/* ================= STORE DETAILS MODAL ================= */}
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
              type="button"
              className="modal-close"
              onClick={() =>
                setSelectedStore(null)
              }
              aria-label="Close"
            >
              ×
            </button>

            <div className="modal-icon">
              🏪
            </div>

            <h2>Store Details</h2>

            <p className="modal-subtitle">
              Store information
            </p>

            <div className="user-detail-row">
              <span>Name</span>

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
              type="button"
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