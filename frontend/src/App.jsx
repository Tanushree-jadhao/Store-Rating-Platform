import { useEffect, useState } from "react";

import {
  loginUser,
  signupUser,
  changePassword,
  getAdminDashboard,
  getAdminUsers,
  getAdminUserDetails,
  getAdminStores,
  getStores,
  submitRating,
  updateRating,
  createAdminUser,
  createAdminStore,
  getOwnerDashboard,
} from "./api";

import "./App.css";

function App() {
  // =========================
  // AUTH STATE
  // =========================
  const [loggedIn, setLoggedIn] = useState(false);
  const [role, setRole] = useState("");
  const [activePage, setActivePage] = useState("dashboard");

  // =========================
  // LOGIN STATE
  // =========================
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginRole, setLoginRole] = useState("user");
  const [loginError, setLoginError] = useState("");

  // =========================
  // SIGNUP STATE
  // =========================
  const [showSignup, setShowSignup] = useState(false);
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupAddress, setSignupAddress] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupRole, setSignupRole] = useState("user");
  const [signupError, setSignupError] = useState("");

  // =========================
  // ADMIN STATE
  // =========================
  const [adminStats, setAdminStats] = useState({
    totalUsers: 0,
    totalStores: 0,
    totalRatings: 0,
  });

  const [adminUsers, setAdminUsers] = useState([]);
  const [adminStores, setAdminStores] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserRole, setNewUserRole] = useState("user");

  const [newStoreName, setNewStoreName] = useState("");
  const [newStoreAddress, setNewStoreAddress] = useState("");
  const [newStoreOwner, setNewStoreOwner] = useState("");

  const [adminMessage, setAdminMessage] = useState("");

  // =========================
  // USER STATE
  // =========================
  const [stores, setStores] = useState([]);
  const [userMessage, setUserMessage] = useState("");
  const [selectedRatings, setSelectedRatings] = useState({});
  const [storeSearch, setStoreSearch] = useState("");

  // =========================
  // OWNER STATE
  // =========================
  const [ownerData, setOwnerData] = useState(null);

  // =========================
  // CHANGE PASSWORD
  // =========================
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");

  // =========================
  // PAGE NAVIGATION
  // =========================
  const navigateTo = (page) => {
    setActivePage(page);

    setAdminMessage("");
    setUserMessage("");
    setPasswordMessage("");

    if (page !== "users") {
      setSelectedUser(null);
    }
  };

  // =========================
  // RESTORE LOGIN
  // =========================
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (!savedToken || !savedUser) {
      return;
    }

    try {
      const user = JSON.parse(savedUser);

      Promise.resolve().then(() => {
        setRole(user?.role || "user");
        setLoggedIn(true);
        setActivePage("dashboard");
      });
    } catch (error) {
      console.error("Saved user error:", error);

      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  }, []);

  // =========================
  // FILTERED STORES
  // =========================
  const filteredStores = stores.filter((store) => {
    const search = storeSearch.trim().toLowerCase();

    if (!search) {
      return true;
    }

    return (
      store.name?.toLowerCase().includes(search) ||
      store.address?.toLowerCase().includes(search)
    );
  });

  // =========================
  // LOAD DATA
  // =========================
  useEffect(() => {
    if (!loggedIn) {
      return;
    }

    const loadData = async () => {
      try {
        // =========================
        // ADMIN
        // =========================
        if (role === "admin") {
          const stats = await getAdminDashboard();

          setAdminStats({
            totalUsers: Number(stats?.totalUsers || 0),
            totalStores: Number(stats?.totalStores || 0),
            totalRatings: Number(stats?.totalRatings || 0),
          });

          const users = await getAdminUsers();

          setAdminUsers(
            Array.isArray(users)
              ? users
              : Array.isArray(users?.users)
              ? users.users
              : []
          );

          const storesData = await getAdminStores();

          setAdminStores(
            Array.isArray(storesData)
              ? storesData
              : Array.isArray(storesData?.stores)
              ? storesData.stores
              : []
          );
        }

        // =========================
        // NORMAL USER
        // =========================
        if (role === "user") {
          const storesData = await getStores();

          if (Array.isArray(storesData)) {
            setStores(storesData);
          } else if (Array.isArray(storesData?.stores)) {
            setStores(storesData.stores);
          } else {
            setStores([]);
          }
        }

        // =========================
        // STORE OWNER
        // =========================
        if (role === "owner") {
          const owner = await getOwnerDashboard();
          setOwnerData(owner);
        }
      } catch (error) {
        console.error("Data loading error:", error);

        if (role === "user") {
          setStores([]);
        }

        if (role === "admin") {
          setAdminUsers([]);
          setAdminStores([]);
        }

        if (role === "owner") {
          setOwnerData(null);
        }
      }
    };

    loadData();
  }, [loggedIn, role]);

  // =========================
  // LOGIN
  // =========================
  const handleLogin = async (e) => {
    e.preventDefault();

    setLoginError("");

    try {
      const data = await loginUser(
        loginEmail.trim(),
        loginPassword,
        loginRole
      );

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setRole(data.user.role);
      setLoggedIn(true);
      setActivePage("dashboard");

      setLoginEmail("");
      setLoginPassword("");
    } catch (error) {
      setLoginError(error.message);
    }
  };

  // =========================
  // SIGNUP
  // =========================
  const handleSignup = async (e) => {
    e.preventDefault();

    setSignupError("");

    const name = signupName.trim();
    const email = signupEmail.trim();
    const address = signupAddress.trim();

    if (name.length < 20 || name.length > 60) {
      setSignupError("Name must be between 20 and 60 characters");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      setSignupError("Please enter a valid email address");
      return;
    }

    if (!address) {
      setSignupError("Address is required");
      return;
    }

    if (address.length > 400) {
      setSignupError("Address cannot exceed 400 characters");
      return;
    }

    const passwordRegex =
      /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;

    if (!passwordRegex.test(signupPassword)) {
      setSignupError(
        "Password must be 8-16 characters with at least one uppercase letter and one special character"
      );
      return;
    }

    try {
      await signupUser(
        name,
        email,
        address,
        signupPassword,
        signupRole
      );

      const loginData = await loginUser(
        email,
        signupPassword,
        signupRole
      );

      localStorage.setItem("token", loginData.token);
      localStorage.setItem(
        "user",
        JSON.stringify(loginData.user)
      );

      setRole(loginData.user.role);
      setLoggedIn(true);
      setActivePage("dashboard");

      setSignupName("");
      setSignupEmail("");
      setSignupAddress("");
      setSignupPassword("");
      setSignupRole("user");
      setSignupError("");
    } catch (error) {
      setSignupError(error.message);
    }
  };

  // =========================
  // LOGOUT
  // =========================
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setLoggedIn(false);
    setRole("");
    setActivePage("dashboard");

    setShowSignup(false);

    setLoginEmail("");
    setLoginPassword("");
    setLoginError("");

    setSignupError("");

    setStoreSearch("");

    setAdminMessage("");
    setUserMessage("");
    setPasswordMessage("");

    setSelectedUser(null);
  };

  // =========================
  // CHANGE PASSWORD
  // =========================
  const handleChangePassword = async (e) => {
    e.preventDefault();

    setPasswordMessage("");

    try {
      const data = await changePassword(
        currentPassword,
        newPassword
      );

      setPasswordMessage(data.message);

      setCurrentPassword("");
      setNewPassword("");
    } catch (error) {
      setPasswordMessage(error.message);
    }
  };

  // =========================
  // ADMIN CREATE USER
  // =========================
  const handleCreateUser = async (e) => {
    e.preventDefault();

    setAdminMessage("");

    try {
      await createAdminUser(
        newUserName.trim(),
        newUserEmail.trim(),
        newUserPassword,
        newUserRole
      );

      setAdminMessage("User created successfully");

      setNewUserName("");
      setNewUserEmail("");
      setNewUserPassword("");
      setNewUserRole("user");

      const users = await getAdminUsers();

      setAdminUsers(
        Array.isArray(users)
          ? users
          : Array.isArray(users?.users)
          ? users.users
          : []
      );
    } catch (error) {
      setAdminMessage(error.message);
    }
  };

  // =========================
  // ADMIN CREATE STORE
  // =========================
  const handleCreateStore = async (e) => {
    e.preventDefault();

    setAdminMessage("");

    try {
      await createAdminStore(
        newStoreName.trim(),
        newStoreAddress.trim(),
        newStoreOwner ? Number(newStoreOwner) : null
      );

      setAdminMessage("Store created successfully");

      setNewStoreName("");
      setNewStoreAddress("");
      setNewStoreOwner("");

      const storesData = await getAdminStores();

      setAdminStores(
        Array.isArray(storesData)
          ? storesData
          : Array.isArray(storesData?.stores)
          ? storesData.stores
          : []
      );
    } catch (error) {
      setAdminMessage(error.message);
    }
  };

  // =========================
  // ADMIN USER DETAILS
  // =========================
  const handleUserDetails = async (userId) => {
    try {
      const data = await getAdminUserDetails(userId);

      setSelectedUser(data.user);
    } catch (error) {
      setAdminMessage(error.message);
    }
  };

  // =========================
  // USER RATING
  // =========================
  const handleRating = (storeId, rating) => {
    setSelectedRatings((prev) => ({
      ...prev,
      [storeId]: rating,
    }));
  };

  const handleSubmitRating = async (storeId) => {
    const rating = selectedRatings[storeId];

    if (!rating) {
      setUserMessage("Please select a rating first");
      return;
    }

    try {
      const store = stores.find(
        (item) => item.id === storeId
      );

      if (store?.user_rating) {
        await updateRating(storeId, rating);
      } else {
        await submitRating(storeId, rating);
      }

      setUserMessage("Rating submitted successfully");

      const storesData = await getStores();

      if (Array.isArray(storesData)) {
        setStores(storesData);
      } else if (Array.isArray(storesData?.stores)) {
        setStores(storesData.stores);
      } else {
        setStores([]);
      }
    } catch (error) {
      setUserMessage(error.message);
    }
  };

  // =========================
  // LOGIN / SIGNUP SCREEN
  // =========================
  if (!loggedIn) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="brand">⭐ RateHub</div>

          {!showSignup ? (
            <>
              <p className="auth-subtitle">
                Login to your RateHub account
              </p>

              <form onSubmit={handleLogin}>
                <div className="form-group">
                  <label>Email</label>

                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) =>
                      setLoginEmail(e.target.value)
                    }
                    placeholder="Enter your email"
                  />
                </div>

                <div className="form-group">
                  <label>Password</label>

                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) =>
                      setLoginPassword(e.target.value)
                    }
                    placeholder="Enter your password"
                  />
                </div>

                <div className="form-group">
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

                    <option value="admin">
                      System Administrator
                    </option>

                    <option value="owner">
                      Store Owner
                    </option>
                  </select>
                </div>

                {loginError && (
                  <div className="error-message">
                    {loginError}
                  </div>
                )}

                <button
                  type="submit"
                  className="primary-btn"
                >
                  Login
                </button>
              </form>

              <p className="auth-switch">
                Don't have an account?{" "}
                <button
                  type="button"
                  className="link-btn"
                  onClick={() => {
                    setShowSignup(true);
                    setLoginError("");
                  }}
                >
                  Create Account
                </button>
              </p>
            </>
          ) : (
            <>
              <h1>Create Account</h1>

              <p className="auth-subtitle">
                Create your RateHub account
              </p>

              <form onSubmit={handleSignup}>
                <div className="form-group">
                  <label>Full Name</label>

                  <input
                    type="text"
                    value={signupName}
                    onChange={(e) =>
                      setSignupName(e.target.value)
                    }
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>

                  <input
                    type="email"
                    value={signupEmail}
                    onChange={(e) =>
                      setSignupEmail(e.target.value)
                    }
                    placeholder="Enter your email"
                  />
                </div>

                <div className="form-group">
                  <label>Address</label>

                  <textarea
                    value={signupAddress}
                    onChange={(e) =>
                      setSignupAddress(e.target.value)
                    }
                    placeholder="Enter your address"
                    rows="3"
                  />
                </div>

                <div className="form-group">
                  <label>Password</label>

                  <input
                    type="password"
                    value={signupPassword}
                    onChange={(e) =>
                      setSignupPassword(e.target.value)
                    }
                    placeholder="8-16 characters"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="signup-role">
                    Account Type
                  </label>

                  <select
                    id="signup-role"
                    value={signupRole}
                    onChange={(e) => {
                      setSignupRole(e.target.value);
                      setSignupError("");
                    }}
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

                {signupError && (
                  <div className="error-message">
                    {signupError}
                  </div>
                )}

                <button
                  type="submit"
                  className="primary-btn"
                >
                  Create Account
                </button>
              </form>

              <p className="auth-switch">
                Already have an account?{" "}
                <button
                  type="button"
                  className="link-btn"
                  onClick={() => {
                    setShowSignup(false);
                    setSignupError("");
                  }}
                >
                  Login
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  // =========================
  // MAIN APPLICATION
  // =========================
  return (
    <div className="app">

      {/* TOP BAR */}
      <header className="topbar">
        <div className="brand">⭐ RateHub</div>

        <div className="topbar-right">
          <span>
            {role === "admin"
              ? "System Administrator"
              : role === "owner"
              ? "Store Owner"
              : "Normal User"}
          </span>

          <button
            type="button"
            onClick={handleLogout}
            className="logout-btn"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="layout">

        {/* SIDEBAR */}
        <aside className="sidebar">

          <button
            type="button"
            className={
              activePage === "dashboard"
                ? "nav-btn active"
                : "nav-btn"
            }
            onClick={() => navigateTo("dashboard")}
          >
            Dashboard
          </button>

          {role === "admin" && (
            <>
              <button
                type="button"
                className={
                  activePage === "users"
                    ? "nav-btn active"
                    : "nav-btn"
                }
                onClick={() => navigateTo("users")}
              >
                Users
              </button>

              <button
                type="button"
                className={
                  activePage === "stores"
                    ? "nav-btn active"
                    : "nav-btn"
                }
                onClick={() => navigateTo("stores")}
              >
                Stores
              </button>

              <button
                type="button"
                className={
                  activePage === "add-user"
                    ? "nav-btn active"
                    : "nav-btn"
                }
                onClick={() => navigateTo("add-user")}
              >
                Add User
              </button>

              <button
                type="button"
                className={
                  activePage === "add-store"
                    ? "nav-btn active"
                    : "nav-btn"
                }
                onClick={() => navigateTo("add-store")}
              >
                Add Store
              </button>
            </>
          )}

          {role === "user" && (
            <button
              type="button"
              className={
                activePage === "stores"
                  ? "nav-btn active"
                  : "nav-btn"
              }
              onClick={() => navigateTo("stores")}
            >
              All Stores
            </button>
          )}

          <button
            type="button"
            className={
              activePage === "password"
                ? "nav-btn active"
                : "nav-btn"
            }
            onClick={() => navigateTo("password")}
          >
            Change Password
          </button>
        </aside>

        {/* CONTENT */}
        <main className="content">

          {/* ================= ADMIN DASHBOARD ================= */}
          {activePage === "dashboard" &&
            role === "admin" && (
              <>
                <h1>Admin Dashboard</h1>

                <div className="stats-grid">
                  <div className="stat-card">
                    <h3>Total Users</h3>
                    <p>{adminStats.totalUsers}</p>
                  </div>

                  <div className="stat-card">
                    <h3>Total Stores</h3>
                    <p>{adminStats.totalStores}</p>
                  </div>

                  <div className="stat-card">
                    <h3>Total Ratings</h3>
                    <p>{adminStats.totalRatings}</p>
                  </div>
                </div>
              </>
            )}

          {/* ================= USER DASHBOARD ================= */}
          {activePage === "dashboard" &&
            role === "user" && (
              <>
                <h1>User Dashboard</h1>

                <p className="page-subtitle">
                  Rate stores and view their overall ratings.
                </p>

                {userMessage && (
                  <div className="success-message">
                    {userMessage}
                  </div>
                )}

                <div className="search-box">
                  <input
                    type="text"
                    value={storeSearch}
                    onChange={(e) =>
                      setStoreSearch(e.target.value)
                    }
                    placeholder="🔍 Search stores by name or address..."
                  />
                </div>

                <div className="store-grid">
                  {stores.length === 0 ? (
                    <div className="details-card">
                      <h2>No stores available</h2>
                      <p>
                        No stores have been added yet.
                      </p>
                    </div>
                  ) : filteredStores.length === 0 ? (
                    <div className="details-card">
                      <h2>No matching stores</h2>
                      <p>
                        Try searching with another store name
                        or address.
                      </p>
                    </div>
                  ) : (
                    filteredStores.map((store) => (
                      <div
                        className="store-card"
                        key={store.id}
                      >
                        <h2>{store.name}</h2>

                        <p>{store.address}</p>

                        <div className="rating-info">
                          <strong>
                            Overall Rating:
                          </strong>{" "}
                          {Number(
                            store.overall_rating || 0
                          ).toFixed(2)}
                        </div>

                        <div className="rating-section">
                          <span className="rating-label">
                            Your Rating
                          </span>

                          <div className="star-rating">
                            {[1, 2, 3, 4, 5].map(
                              (star) => (
                                <button
                                  type="button"
                                  key={star}
                                  className={
                                    selectedRatings[
                                      store.id
                                    ] >= star
                                      ? "star-btn active"
                                      : "star-btn"
                                  }
                                  onClick={() =>
                                    handleRating(
                                      store.id,
                                      star
                                    )
                                  }
                                >
                                  ★
                                </button>
                              )
                            )}
                          </div>

                          <span className="rating-value">
                            {selectedRatings[
                              store.id
                            ] ||
                              store.user_rating ||
                              0}
                            /5
                          </span>
                        </div>

                        <button
                          type="button"
                          className="rating-submit-btn"
                          onClick={() =>
                            handleSubmitRating(store.id)
                          }
                        >
                          {store.user_rating
                            ? "Update Rating"
                            : "Submit Rating"}
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}

          {/* ================= OWNER DASHBOARD ================= */}
          {activePage === "dashboard" &&
            role === "owner" && (
              <>
                <h1>Owner Dashboard</h1>

                {ownerData ? (
                  <>
                    <div className="stats-grid">
                      <div className="stat-card">
                        <h3>Average Rating</h3>

                        <p>
                          {Number(
                            ownerData.store
                              ?.average_rating || 0
                          ).toFixed(2)}
                        </p>
                      </div>

                      <div className="stat-card">
                        <h3>Total Ratings</h3>

                        <p>
                          {ownerData.store
                            ?.total_ratings || 0}
                        </p>
                      </div>
                    </div>

                    <h2>Users Who Rated</h2>

                    <div className="table-container">
                      <table>
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Rating</th>
                          </tr>
                        </thead>

                        <tbody>
                          {ownerData.usersWhoRated?.map(
                            (user) => (
                              <tr key={user.id}>
                                <td>{user.name}</td>

                                <td>{user.email}</td>

                                <td>
                                  {user.rating}/5
                                </td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <p>
                    Loading owner dashboard...
                  </p>
                )}
              </>
            )}

          {/* ================= ADMIN USERS ================= */}
          {activePage === "users" &&
            role === "admin" && (
              <>
                <h1>Users</h1>

                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {adminUsers.map((user) => (
                        <tr key={user.id}>
                          <td>{user.id}</td>

                          <td>{user.name}</td>

                          <td>{user.email}</td>

                          <td>{user.role}</td>

                          <td>
                            <button
                              type="button"
                              className="small-btn"
                              onClick={() =>
                                handleUserDetails(
                                  user.id
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

                {/* ================= USER DETAILS POPUP ================= */}
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
                          {selectedUser.role ===
                          "admin"
                            ? "System Administrator"
                            : selectedUser.role ===
                              "owner"
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
              </>
            )}

          {/* ================= ADMIN STORES ================= */}
          {activePage === "stores" &&
            role === "admin" && (
              <>
                <h1>Stores</h1>

                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Store Name</th>
                        <th>Address</th>
                        <th>Owner</th>
                        <th>Rating</th>
                      </tr>
                    </thead>

                    <tbody>
                      {adminStores.map((store) => (
                        <tr key={store.id}>
                          <td>{store.id}</td>

                          <td>{store.name}</td>

                          <td>{store.address}</td>

                          <td>
                            {store.owner_name ||
                              "Not Assigned"}
                          </td>

                          <td>
                            {Number(
                              store.overall_rating || 0
                            ).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

          {/* ================= USER STORES ================= */}
          {activePage === "stores" &&
            role === "user" && (
              <>
                <h1>All Stores</h1>

                <div className="search-box">
                  <input
                    type="text"
                    value={storeSearch}
                    onChange={(e) =>
                      setStoreSearch(e.target.value)
                    }
                    placeholder="🔍 Search stores by name or address..."
                  />
                </div>

                <div className="store-grid">
                  {stores.length === 0 ? (
                    <div className="details-card">
                      <h2>No stores available</h2>

                      <p>
                        No stores have been added yet.
                      </p>
                    </div>
                  ) : filteredStores.length === 0 ? (
                    <div className="details-card">
                      <h2>No matching stores</h2>

                      <p>
                        Try searching with another store name
                        or address.
                      </p>
                    </div>
                  ) : (
                    filteredStores.map((store) => (
                      <div
                        className="store-card"
                        key={store.id}
                      >
                        <h2>{store.name}</h2>

                        <p>{store.address}</p>

                        <p>
                          Overall Rating:{" "}
                          <strong>
                            {Number(
                              store.overall_rating || 0
                            ).toFixed(2)}
                          </strong>
                        </p>

                        <div className="rating-section">
                          <div className="star-rating">
                            {[1, 2, 3, 4, 5].map(
                              (star) => (
                                <button
                                  type="button"
                                  key={star}
                                  className={
                                    selectedRatings[
                                      store.id
                                    ] >= star
                                      ? "star-btn active"
                                      : "star-btn"
                                  }
                                  onClick={() =>
                                    handleRating(
                                      store.id,
                                      star
                                    )
                                  }
                                >
                                  ★
                                </button>
                              )
                            )}
                          </div>

                          <span className="rating-value">
                            {selectedRatings[
                              store.id
                            ] ||
                              store.user_rating ||
                              0}
                            /5
                          </span>
                        </div>

                        <button
                          type="button"
                          className="rating-submit-btn"
                          onClick={() =>
                            handleSubmitRating(store.id)
                          }
                        >
                          {store.user_rating
                            ? "Update Rating"
                            : "Submit Rating"}
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}

          {/* ================= ADD USER ================= */}
          {activePage === "add-user" &&
            role === "admin" && (
              <>
                <h1>Add User</h1>

                <form
                  className="form-card"
                  onSubmit={handleCreateUser}
                >
                  <div className="form-group">
                    <label>Name</label>

                    <input
                      value={newUserName}
                      onChange={(e) =>
                        setNewUserName(e.target.value)
                      }
                      placeholder="20-60 characters"
                    />
                  </div>

                  <div className="form-group">
                    <label>Email</label>

                    <input
                      type="email"
                      value={newUserEmail}
                      onChange={(e) =>
                        setNewUserEmail(e.target.value)
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Password</label>

                    <input
                      type="password"
                      value={newUserPassword}
                      onChange={(e) =>
                        setNewUserPassword(
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Role</label>

                    <select
                      value={newUserRole}
                      onChange={(e) =>
                        setNewUserRole(e.target.value)
                      }
                    >
                      <option value="user">
                        Normal User
                      </option>

                      <option value="admin">
                        Administrator
                      </option>

                      <option value="owner">
                        Store Owner
                      </option>
                    </select>
                  </div>

                  {adminMessage && (
                    <div className="success-message">
                      {adminMessage}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="primary-btn"
                  >
                    Add User
                  </button>
                </form>
              </>
            )}

          {/* ================= ADD STORE ================= */}
          {activePage === "add-store" &&
            role === "admin" && (
              <>
                <h1>Add Store</h1>

                <form
                  className="form-card"
                  onSubmit={handleCreateStore}
                >
                  <div className="form-group">
                    <label>Store Name</label>

                    <input
                      value={newStoreName}
                      onChange={(e) =>
                        setNewStoreName(e.target.value)
                      }
                      placeholder="20-60 characters"
                    />
                  </div>

                  <div className="form-group">
                    <label>Address</label>

                    <textarea
                      value={newStoreAddress}
                      onChange={(e) =>
                        setNewStoreAddress(
                          e.target.value
                        )
                      }
                      rows="4"
                      placeholder="Store address"
                    />
                  </div>

                  <div className="form-group">
                    <label>Assign Owner</label>

                    <select
                      value={newStoreOwner}
                      onChange={(e) =>
                        setNewStoreOwner(
                          e.target.value
                        )
                      }
                    >
                      <option value="">
                        Select Owner
                      </option>

                      {adminUsers
                        .filter(
                          (user) =>
                            user.role === "owner"
                        )
                        .map((owner) => (
                          <option
                            key={owner.id}
                            value={owner.id}
                          >
                            {owner.name} -{" "}
                            {owner.email}
                          </option>
                        ))}
                    </select>
                  </div>

                  {adminMessage && (
                    <div className="success-message">
                      {adminMessage}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="primary-btn"
                  >
                    Add Store
                  </button>
                </form>
              </>
            )}

          {/* ================= CHANGE PASSWORD ================= */}
          {activePage === "password" && (
            <>
              <h1>Change Password</h1>

              <form
                className="form-card"
                onSubmit={handleChangePassword}
              >
                <div className="form-group">
                  <label>Current Password</label>

                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) =>
                      setCurrentPassword(
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="form-group">
                  <label>New Password</label>

                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) =>
                      setNewPassword(e.target.value)
                    }
                    placeholder="8-16 characters"
                  />
                </div>

                {passwordMessage && (
                  <div className="success-message">
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
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;