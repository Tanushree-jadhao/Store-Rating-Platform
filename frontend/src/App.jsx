import { useEffect, useState } from "react";

import {
  loginUser,
  signupUser,
  getAdminDashboard,
  getAdminUsers,
  getAdminUserDetails,
  getAdminStores,
  createAdminUser,
  createAdminStore,
  getStores,
  submitRating,
  updateRating,
  getOwnerDashboard,
  changePassword,
} from "./api";

import "./App.css";

function App() {
  // AUTH
  const [loggedIn, setLoggedIn] = useState(false);
  const [role, setRole] = useState("user");
  const [user, setUser] = useState(null);

  // LOGIN
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginRole, setLoginRole] = useState("user");
  const [loginError, setLoginError] = useState("");

  // SIGNUP
  const [showSignup, setShowSignup] = useState(false);
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupError, setSignupError] = useState("");

  // PAGE
  const [activePage, setActivePage] = useState("dashboard");

  // PASSWORD
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // ADMIN
  const [adminStats, setAdminStats] = useState({
    totalUsers: 0,
    totalStores: 0,
    totalRatings: 0,
  });

  const [adminUsers, setAdminUsers] = useState([]);
  const [adminStores, setAdminStores] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  const [adminSearch, setAdminSearch] = useState("");
  const [storeSearch, setStoreSearch] = useState("");

  const [adminMessage, setAdminMessage] = useState("");
  const [adminError, setAdminError] = useState("");

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });

  const [newStore, setNewStore] = useState({
    name: "",
    address: "",
    owner_id: "",
  });

  // USER
  const [stores, setStores] = useState([]);
  const [userStoreSearch, setUserStoreSearch] = useState("");
  const [ratings, setRatings] = useState({});
  const [ratingMessage, setRatingMessage] = useState("");
  const [ratingError, setRatingError] = useState("");

  // OWNER
  const [ownerData, setOwnerData] = useState(null);

  // RESTORE LOGIN
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (!savedToken || !savedUser) {
      return;
    }

    try {
      const saved = JSON.parse(savedUser);

      Promise.resolve().then(() => {
        setUser(saved);
        setRole(saved.role || "user");
        setLoggedIn(true);
      });
    } catch (error) {
      console.error("Saved login error:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  }, []);

  // LOAD ADMIN DATA
  useEffect(() => {
    if (!loggedIn || role !== "admin") {
      return;
    }

    const loadAdminData = async () => {
      try {
        const stats = await getAdminDashboard();
        const usersData = await getAdminUsers();
        const storesData = await getAdminStores();

        setAdminStats({
          totalUsers: Number(stats.totalUsers || 0),
          totalStores: Number(stats.totalStores || 0),
          totalRatings: Number(stats.totalRatings || 0),
        });

        setAdminUsers(
          Array.isArray(usersData)
            ? usersData
            : usersData.users || []
        );

        setAdminStores(
          Array.isArray(storesData)
            ? storesData
            : storesData.stores || []
        );
      } catch (error) {
        console.error("Admin data error:", error);
      }
    };

    loadAdminData();
  }, [loggedIn, role]);

  // LOAD USER STORES
  useEffect(() => {
    if (!loggedIn || role !== "user") {
      return;
    }

    const loadStores = async () => {
      try {
        const data = await getStores();

        const storeList = Array.isArray(data)
          ? data
          : data.stores || [];

        setStores(storeList);

        const initialRatings = {};

        storeList.forEach((store) => {
          initialRatings[store.id] = Number(
            store.user_rating || 0
          );
        });

        setRatings(initialRatings);
      } catch (error) {
        console.error("Store loading error:", error);
      }
    };

    loadStores();
  }, [loggedIn, role]);

  // LOAD OWNER
  useEffect(() => {
    if (!loggedIn || role !== "owner") {
      return;
    }

    const loadOwnerData = async () => {
      try {
        const data = await getOwnerDashboard();
        setOwnerData(data);
      } catch (error) {
        console.error("Owner dashboard error:", error);
      }
    };

    loadOwnerData();
  }, [loggedIn, role]);

  // LOGIN
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");

    if (!email || !password) {
      setLoginError("Please enter email and password.");
      return;
    }

    try {
      const data = await loginUser(
        email,
        password,
        loginRole
      );

      localStorage.setItem("token", data.token);
      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      setUser(data.user);
      setRole(data.user.role);
      setLoggedIn(true);
      setActivePage("dashboard");

      setEmail("");
      setPassword("");
    } catch (error) {
      setLoginError(error.message);
    }
  };

  // SIGNUP
  const handleSignup = async (e) => {
    e.preventDefault();
    setSignupError("");

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const passwordRegex =
      /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;

    if (!emailRegex.test(signupEmail)) {
      setSignupError("Please enter a valid email.");
      return;
    }

    if (!passwordRegex.test(signupPassword)) {
      setSignupError(
        "Password must be 8-16 characters with at least one uppercase letter and one special character."
      );
      return;
    }

    try {
      await signupUser(
        signupEmail,
        signupPassword
      );

      const loginData = await loginUser(
        signupEmail,
        signupPassword,
        "user"
      );

      localStorage.setItem(
        "token",
        loginData.token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(loginData.user)
      );

      setUser(loginData.user);
      setRole(loginData.user.role);
      setLoggedIn(true);
      setActivePage("dashboard");

      setSignupEmail("");
      setSignupPassword("");
    } catch (error) {
      setSignupError(error.message);
    }
  };

  // LOGOUT
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setLoggedIn(false);
    setUser(null);
    setRole("user");
    setActivePage("dashboard");

    setEmail("");
    setPassword("");
    setLoginRole("user");
  };

  // CHANGE PASSWORD
  const handleChangePassword = async (e) => {
    e.preventDefault();

    setPasswordMessage("");
    setPasswordError("");

    const passwordRegex =
      /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;

    if (!passwordRegex.test(newPassword)) {
      setPasswordError(
        "Password must be 8-16 characters with uppercase and special character."
      );
      return;
    }

    try {
      const data = await changePassword(
        currentPassword,
        newPassword
      );

      setPasswordMessage(
        data.message || "Password changed successfully."
      );

      setCurrentPassword("");
      setNewPassword("");
    } catch (error) {
      setPasswordError(error.message);
    }
  };

  // ADD USER
  const handleAddUser = async (e) => {
    e.preventDefault();

    setAdminError("");
    setAdminMessage("");

    if (
      newUser.name.length < 20 ||
      newUser.name.length > 60
    ) {
      setAdminError(
        "Name must be between 20 and 60 characters."
      );
      return;
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const passwordRegex =
      /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;

    if (!emailRegex.test(newUser.email)) {
      setAdminError("Please enter a valid email.");
      return;
    }

    if (!passwordRegex.test(newUser.password)) {
      setAdminError(
        "Password must be 8-16 characters with uppercase and special character."
      );
      return;
    }

    try {
      const data = await createAdminUser(
        newUser.name,
        newUser.email,
        newUser.password,
        newUser.role
      );

      setAdminMessage(
        data.message || "User created successfully."
      );

      setNewUser({
        name: "",
        email: "",
        password: "",
        role: "user",
      });

      const usersData = await getAdminUsers();

      setAdminUsers(
        Array.isArray(usersData)
          ? usersData
          : usersData.users || []
      );
    } catch (error) {
      setAdminError(error.message);
    }
  };

  // ADD STORE
  const handleAddStore = async (e) => {
    e.preventDefault();

    setAdminError("");
    setAdminMessage("");

    if (
      newStore.name.length < 20 ||
      newStore.name.length > 60
    ) {
      setAdminError(
        "Store name must be between 20 and 60 characters."
      );
      return;
    }

    if (newStore.address.length > 400) {
      setAdminError(
        "Address cannot exceed 400 characters."
      );
      return;
    }

    if (!newStore.owner_id) {
      setAdminError("Please select a store owner.");
      return;
    }

    try {
      const data = await createAdminStore(
        newStore.name,
        newStore.address,
        Number(newStore.owner_id)
      );

      setAdminMessage(
        data.message || "Store created successfully."
      );

      setNewStore({
        name: "",
        address: "",
        owner_id: "",
      });

      const storesData = await getAdminStores();

      setAdminStores(
        Array.isArray(storesData)
          ? storesData
          : storesData.stores || []
      );
    } catch (error) {
      setAdminError(error.message);
    }
  };

  // RATING
  const handleRating = (storeId, value) => {
    setRatings((previous) => ({
      ...previous,
      [storeId]: value,
    }));
  };

  const handleSubmitRating = async (storeId) => {
    setRatingError("");
    setRatingMessage("");

    const selectedRating = Number(
      ratings[storeId] || 0
    );

    if (
      !Number.isInteger(selectedRating) ||
      selectedRating < 1 ||
      selectedRating > 5
    ) {
      setRatingError(
        "Please select a rating from 1 to 5."
      );
      return;
    }

    try {
      const store = stores.find(
        (item) => item.id === storeId
      );

      const existingRating = Number(
        store?.user_rating || 0
      );

      let data;

      if (existingRating > 0) {
        data = await updateRating(
          storeId,
          selectedRating
        );
      } else {
        data = await submitRating(
          storeId,
          selectedRating
        );
      }

      setRatingMessage(
        data.message || "Rating submitted successfully."
      );

      const updatedData = await getStores();

      const updatedStores = Array.isArray(updatedData)
        ? updatedData
        : updatedData.stores || [];

      setStores(updatedStores);
    } catch (error) {
      setRatingError(error.message);
    }
  };

  // FILTER USERS
  const filteredUsers = adminUsers.filter((item) => {
    const search = adminSearch.toLowerCase();

    return (
      String(item.name || "")
        .toLowerCase()
        .includes(search) ||
      String(item.email || "")
        .toLowerCase()
        .includes(search) ||
      String(item.role || "")
        .toLowerCase()
        .includes(search)
    );
  });

  // FILTER ADMIN STORES
  const filteredAdminStores = adminStores.filter(
    (store) => {
      const search = storeSearch.toLowerCase();

      return (
        String(store.name || "")
          .toLowerCase()
          .includes(search) ||
        String(store.address || "")
          .toLowerCase()
          .includes(search) ||
        String(store.owner_name || "")
          .toLowerCase()
          .includes(search)
      );
    }
  );

  // FILTER USER STORES
  const filteredStores = stores.filter((store) => {
    const search = userStoreSearch.toLowerCase();

    return (
      String(store.name || "")
        .toLowerCase()
        .includes(search) ||
      String(store.address || "")
        .toLowerCase()
        .includes(search)
    );
  });

  // =========================
  // LOGIN SCREEN
  // =========================
  if (!loggedIn) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-logo">
            ⭐ RateHub
          </div>

          {!showSignup ? (
            <>
              <h1>Welcome Back</h1>

              <p className="auth-subtitle">
                Login to your RateHub account
              </p>

              <form onSubmit={handleLogin}>
                <div className="form-group">
                  <label>Email</label>

                  <input
                    type="email"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    placeholder="Enter your email"
                  />
                </div>

                <div className="form-group">
                  <label>Password</label>

                  <input
                    type="password"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
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
                      Admin
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
                Create your Normal User account
              </p>

              <form onSubmit={handleSignup}>
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
  // DASHBOARD
  // =========================
  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-logo">
          ⭐ RateHub
        </div>

        <div className="sidebar-user">
          <div className="user-avatar">
            {(user?.name || user?.email || "U")
              .charAt(0)
              .toUpperCase()}
          </div>

          <div>
            <strong>
              {user?.name || user?.email}
            </strong>

            <small>
              {role === "admin"
                ? "System Administrator"
                : role === "owner"
                ? "Store Owner"
                : "Normal User"}
            </small>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button
            className="sidebar-btn"
            onClick={() =>
              setActivePage("dashboard")
            }
          >
            🏠 Dashboard
          </button>

          {role === "admin" && (
            <>
              <button
                className="sidebar-btn"
                onClick={() =>
                  setActivePage("users")
                }
              >
                👥 Users
              </button>

              <button
                className="sidebar-btn"
                onClick={() =>
                  setActivePage("stores")
                }
              >
                🏪 Stores
              </button>

              <button
                className="sidebar-btn"
                onClick={() =>
                  setActivePage("add-user")
                }
              >
                ➕ Add User
              </button>

              <button
                className="sidebar-btn"
                onClick={() =>
                  setActivePage("add-store")
                }
              >
                ➕ Add Store
              </button>
            </>
          )}

          {role === "user" && (
            <button
              className="sidebar-btn"
              onClick={() =>
                setActivePage("stores")
              }
            >
              ⭐ Rate Stores
            </button>
          )}

          {role === "owner" && (
            <button
              className="sidebar-btn"
              onClick={() =>
                setActivePage("ratings")
              }
            >
              ⭐ My Ratings
            </button>
          )}

          <button
            className="sidebar-btn"
            onClick={() =>
              setActivePage("password")
            }
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
        <header className="topbar">
          <div>
            <h2>
              {activePage === "dashboard"
                ? "Dashboard"
                : activePage === "users"
                ? "Users"
                : activePage === "stores"
                ? "Stores"
                : activePage === "add-user"
                ? "Add User"
                : activePage === "add-store"
                ? "Add Store"
                : activePage === "password"
                ? "Change Password"
                : "Ratings"}
            </h2>

            <p>
              Manage your RateHub account and
              activities.
            </p>
          </div>

          <div className="topbar-user">
            {user?.email}
          </div>
        </header>

        {/* ADMIN DASHBOARD */}
        {role === "admin" &&
          activePage === "dashboard" && (
            <>
              <div className="welcome-card">
                <h1>
                  Welcome, Administrator 👋
                </h1>

                <p>
                  Here's what's happening on
                  RateHub today.
                </p>
              </div>

              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">
                    👥
                  </div>

                  <div>
                    <span>Total Users</span>
                    <h2>
                      {adminStats.totalUsers}
                    </h2>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">
                    🏪
                  </div>

                  <div>
                    <span>Total Stores</span>
                    <h2>
                      {adminStats.totalStores}
                    </h2>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">
                    ⭐
                  </div>

                  <div>
                    <span>Total Ratings</span>
                    <h2>
                      {adminStats.totalRatings}
                    </h2>
                  </div>
                </div>
              </div>
            </>
          )}

        {/* ADMIN USERS */}
        {role === "admin" &&
          activePage === "users" && (
            <div className="content-card">
              <div className="section-header">
                <div>
                  <h2>All Users</h2>
                  <p>
                    View and search registered users.
                  </p>
                </div>
              </div>

              <div className="search-box">
                <input
                  type="text"
                  value={adminSearch}
                  onChange={(e) =>
                    setAdminSearch(e.target.value)
                  }
                  placeholder="Search users..."
                />
              </div>

              <div className="table-wrapper">
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
                    {filteredUsers.map((item) => (
                      <tr key={item.id}>
                        <td>{item.id}</td>
                        <td>{item.name}</td>
                        <td>{item.email}</td>
                        <td>
                          <span className="role-badge">
                            {item.role}
                          </span>
                        </td>

                        <td>
                          <button
                            className="small-btn"
                            onClick={async () => {
                              try {
                                const data =
                                  await getAdminUserDetails(
                                    item.id
                                  );

                                setSelectedUser(
                                  data.user
                                );
                              } catch (error) {
                                setAdminError(
                                  error.message
                                );
                              }
                            }}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {selectedUser && (
                <div className="details-card">
                  <div className="section-header">
                    <h3>User Details</h3>

                    <button
                      className="close-btn"
                      onClick={() =>
                        setSelectedUser(null)
                      }
                    >
                      ✕
                    </button>
                  </div>

                  <p>
                    <strong>Name:</strong>{" "}
                    {selectedUser.name}
                  </p>

                  <p>
                    <strong>Email:</strong>{" "}
                    {selectedUser.email}
                  </p>

                  <p>
                    <strong>Address:</strong>{" "}
                    {selectedUser.address ||
                      "Not provided"}
                  </p>

                  <p>
                    <strong>Role:</strong>{" "}
                    {selectedUser.role}
                  </p>
                </div>
              )}
            </div>
          )}

        {/* ADMIN STORES */}
        {role === "admin" &&
          activePage === "stores" && (
            <div className="content-card">
              <div className="section-header">
                <div>
                  <h2>All Stores</h2>
                  <p>
                    Manage stores and view ratings.
                  </p>
                </div>
              </div>

              <div className="search-box">
                <input
                  type="text"
                  value={storeSearch}
                  onChange={(e) =>
                    setStoreSearch(e.target.value)
                  }
                  placeholder="Search stores..."
                />
              </div>

              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Store Name</th>
                      <th>Address</th>
                      <th>Owner</th>
                      <th>Average Rating</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredAdminStores.map(
                      (store) => (
                        <tr key={store.id}>
                          <td>{store.id}</td>
                          <td>{store.name}</td>
                          <td>{store.address}</td>
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
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        {/* ADD USER */}
        {role === "admin" &&
          activePage === "add-user" && (
            <div className="form-card">
              <h2>Add New User</h2>

              <p>
                Create a user, admin or store owner.
              </p>

              {adminMessage && (
                <div className="success-message">
                  {adminMessage}
                </div>
              )}

              {adminError && (
                <div className="error-message">
                  {adminError}
                </div>
              )}

              <form onSubmit={handleAddUser}>
                <div className="form-group">
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
                </div>

                <div className="form-group">
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
                </div>

                <div className="form-group">
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
                </div>

                <div className="form-group">
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

                    <option value="admin">
                      Admin
                    </option>

                    <option value="owner">
                      Store Owner
                    </option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="primary-btn"
                >
                  Create User
                </button>
              </form>
            </div>
          )}

        {/* ADD STORE */}
        {role === "admin" &&
          activePage === "add-store" && (
            <div className="form-card">
              <h2>Add New Store</h2>

              <p>
                Create a store and assign an owner.
              </p>

              {adminMessage && (
                <div className="success-message">
                  {adminMessage}
                </div>
              )}

              {adminError && (
                <div className="error-message">
                  {adminError}
                </div>
              )}

              <form onSubmit={handleAddStore}>
                <div className="form-group">
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
                </div>

                <div className="form-group">
                  <label>Address</label>

                  <textarea
                    rows="4"
                    value={newStore.address}
                    onChange={(e) =>
                      setNewStore({
                        ...newStore,
                        address: e.target.value,
                      })
                    }
                    placeholder="Enter address"
                  />
                </div>

                <div className="form-group">
                  <label>Store Owner</label>

                  <select
                    value={newStore.owner_id}
                    onChange={(e) =>
                      setNewStore({
                        ...newStore,
                        owner_id: e.target.value,
                      })
                    }
                  >
                    <option value="">
                      Select Store Owner
                    </option>

                    {adminUsers
                      .filter(
                        (item) =>
                          item.role === "owner"
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

                <button
                  type="submit"
                  className="primary-btn"
                >
                  Create Store
                </button>
              </form>
            </div>
          )}

        {/* USER DASHBOARD */}
        {role === "user" &&
          activePage === "dashboard" && (
            <>
              <div className="welcome-card">
                <h1>
                  Welcome to RateHub 👋
                </h1>

                <p>
                  Find stores and share your
                  experience with ratings.
                </p>
              </div>

              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">
                    🏪
                  </div>

                  <div>
                    <span>Available Stores</span>
                    <h2>{stores.length}</h2>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">
                    ⭐
                  </div>

                  <div>
                    <span>Your Ratings</span>

                    <h2>
                      {
                        stores.filter(
                          (store) =>
                            Number(
                              store.user_rating || 0
                            ) > 0
                        ).length
                      }
                    </h2>
                  </div>
                </div>
              </div>
            </>
          )}

        {/* USER STORES */}
        {role === "user" &&
          activePage === "stores" && (
            <div className="content-card">
              <div className="section-header">
                <div>
                  <h2>All Stores</h2>

                  <p>
                    Search stores and submit your
                    rating.
                  </p>
                </div>
              </div>

              <div className="search-box">
                <input
                  type="text"
                  value={userStoreSearch}
                  onChange={(e) =>
                    setUserStoreSearch(
                      e.target.value
                    )
                  }
                  placeholder="Search store..."
                />
              </div>

              {ratingMessage && (
                <div className="success-message">
                  {ratingMessage}
                </div>
              )}

              {ratingError && (
                <div className="error-message">
                  {ratingError}
                </div>
              )}

              <div className="store-grid">
                {filteredStores.map((store) => {
                  const currentRating = Number(
                    ratings[store.id] || 0
                  );

                  return (
                    <div
                      className="store-card"
                      key={store.id}
                    >
                      <div className="store-card-header">
                        <div>
                          <h3>{store.name}</h3>

                          <p>
                            📍 {store.address}
                          </p>
                        </div>

                        <div className="overall-rating">
                          ⭐{" "}
                          {Number(
                            store.average_rating ||
                              store.overall_rating ||
                              0
                          ).toFixed(2)}
                        </div>
                      </div>

                      <div className="store-info">
                        <span>
                          Overall Rating
                        </span>

                        <strong>
                          ⭐{" "}
                          {Number(
                            store.average_rating ||
                              store.overall_rating ||
                              0
                          ).toFixed(2)}
                        </strong>
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
                                className={`star-btn ${
                                  star <=
                                  currentRating
                                    ? "active"
                                    : ""
                                }`}
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
                          {currentRating}/5
                        </span>
                      </div>

                      <button
                        type="button"
                        className="rating-submit-btn"
                        onClick={() =>
                          handleSubmitRating(
                            store.id
                          )
                        }
                      >
                        Submit Rating
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        {/* OWNER DASHBOARD */}
        {role === "owner" &&
          activePage === "dashboard" && (
            <>
              <div className="welcome-card">
                <h1>
                  Store Owner Dashboard 👋
                </h1>

                <p>
                  Monitor your store ratings and
                  customer feedback.
                </p>
              </div>

              {ownerData?.store && (
                <>
                  <div className="content-card">
                    <h2>
                      {ownerData.store.name}
                    </h2>

                    <p>
                      📍 {ownerData.store.address}
                    </p>
                  </div>

                  <div className="stats-grid">
                    <div className="stat-card">
                      <div className="stat-icon">
                        ⭐
                      </div>

                      <div>
                        <span>
                          Average Rating
                        </span>

                        <h2>
                          {Number(
                            ownerData.store
                              .average_rating || 0
                          ).toFixed(2)}
                        </h2>
                      </div>
                    </div>

                    <div className="stat-card">
                      <div className="stat-icon">
                        📝
                      </div>

                      <div>
                        <span>
                          Total Ratings
                        </span>

                        <h2>
                          {
                            ownerData.store
                              .total_ratings
                          }
                        </h2>
                      </div>
                    </div>

                    <div className="stat-card">
                      <div className="stat-icon">
                        👥
                      </div>

                      <div>
                        <span>
                          Users Who Rated
                        </span>

                        <h2>
                          {
                            ownerData.usersWhoRated
                              ?.length || 0
                          }
                        </h2>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </>
          )}

        {/* OWNER RATINGS */}
        {role === "owner" &&
          activePage === "ratings" && (
            <div className="content-card">
              <h2>Users Who Rated</h2>

              <p>
                Customer ratings for your store.
              </p>

              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Email</th>
                      <th>Rating</th>
                      <th>Date</th>
                    </tr>
                  </thead>

                  <tbody>
                    {ownerData?.usersWhoRated?.map(
                      (item) => (
                        <tr key={item.id}>
                          <td>{item.name}</td>

                          <td>{item.email}</td>

                          <td>
                            ⭐ {item.rating}/5
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
            </div>
          )}

        {/* CHANGE PASSWORD */}
        {activePage === "password" && (
          <div className="form-card">
            <h2>Change Password</h2>

            <p>
              Update your account password
              securely.
            </p>

            {passwordMessage && (
              <div className="success-message">
                {passwordMessage}
              </div>
            )}

            {passwordError && (
              <div className="error-message">
                {passwordError}
              </div>
            )}

            <form
              onSubmit={handleChangePassword}
            >
              <div className="form-group">
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
                  placeholder="Current password"
                />
              </div>

              <div className="form-group">
                <label>New Password</label>

                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) =>
                    setNewPassword(
                      e.target.value
                    )
                  }
                  placeholder="New password"
                />
              </div>

              <button
                type="submit"
                className="primary-btn"
              >
                Change Password
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;