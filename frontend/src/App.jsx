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

import "./index.css";

function App() {
  // =========================
  // AUTH
  // =========================

  const [loggedIn, setLoggedIn] = useState(false);
  const [role, setRole] = useState("");
  const [user, setUser] = useState(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loginError, setLoginError] = useState("");
  const [loginMessage, setLoginMessage] = useState("");

  // =========================
  // SIGNUP
  // =========================

  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupAddress, setSignupAddress] = useState("");

  const [signupMessage, setSignupMessage] = useState("");
  const [signupError, setSignupError] = useState("");

  const [showSignup, setShowSignup] = useState(false);

  // =========================
  // CHANGE PASSWORD
  // =========================

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // =========================
  // ADMIN
  // =========================

  const [adminPage, setAdminPage] = useState("dashboard");

  const [adminStats, setAdminStats] = useState({
    users: 0,
    stores: 0,
    ratings: 0,
  });

  const [adminUsers, setAdminUsers] = useState([]);
  const [adminStores, setAdminStores] = useState([]);

  const [adminUserSearch, setAdminUserSearch] = useState("");
  const [adminUserRoleFilter, setAdminUserRoleFilter] =
    useState("all");

  const [adminUserSort, setAdminUserSort] =
    useState("name-asc");

  const [adminStoreSearch, setAdminStoreSearch] = useState("");
  const [adminStoreSort, setAdminStoreSort] =
    useState("name-asc");

  const [selectedUser, setSelectedUser] = useState(null);

  // =========================
  // ADD USER
  // =========================

  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserRole, setNewUserRole] = useState("user");

  const [addUserMessage, setAddUserMessage] = useState("");
  const [addUserError, setAddUserError] = useState("");

  // =========================
  // ADD STORE
  // =========================

  const [newStoreName, setNewStoreName] = useState("");
  const [newStoreAddress, setNewStoreAddress] = useState("");
  const [newStoreOwner, setNewStoreOwner] = useState("");

  const [addStoreMessage, setAddStoreMessage] = useState("");
  const [addStoreError, setAddStoreError] = useState("");

  // =========================
  // NORMAL USER
  // =========================

  const [stores, setStores] = useState([]);
  const [storeSearch, setStoreSearch] = useState("");

  // Selected star before submitting
  const [selectedRatings, setSelectedRatings] = useState({});

  // =========================
  // OWNER
  // =========================

  const [ownerData, setOwnerData] = useState(null);

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
      const savedUserData = JSON.parse(savedUser);

      Promise.resolve().then(() => {
        setUser(savedUserData);
        setRole(savedUserData?.role || "user");
        setLoggedIn(true);
      });
    } catch (error) {
      console.error("Saved user error:", error);

      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  }, []);

  // =========================
  // LOAD ADMIN DASHBOARD
  // =========================

  useEffect(() => {
    if (!loggedIn || role !== "admin") {
      return;
    }

    getAdminDashboard()
      .then((data) => {
        setAdminStats({
          users: data.users ?? data.totalUsers ?? 0,
          stores: data.stores ?? data.totalStores ?? 0,
          ratings: data.ratings ?? data.totalRatings ?? 0,
        });
      })
      .catch((error) => {
        console.error("Admin dashboard error:", error);
      });
  }, [loggedIn, role]);

  // =========================
  // LOAD ADMIN USERS
  // =========================

  useEffect(() => {
    if (!loggedIn || role !== "admin") {
      return;
    }

    getAdminUsers()
      .then((data) => {
        setAdminUsers(data.users || data || []);
      })
      .catch((error) => {
        console.error("Admin users error:", error);
      });
  }, [loggedIn, role]);

  // =========================
  // LOAD ADMIN STORES
  // =========================

  useEffect(() => {
    if (!loggedIn || role !== "admin") {
      return;
    }

    getAdminStores()
      .then((data) => {
        setAdminStores(data.stores || data || []);
      })
      .catch((error) => {
        console.error("Admin stores error:", error);
      });
  }, [loggedIn, role]);

  // =========================
  // LOAD OWNER DASHBOARD
  // =========================

  useEffect(() => {
    if (!loggedIn || role !== "owner") {
      return;
    }

    getOwnerDashboard()
      .then((data) => {
        setOwnerData(data);
      })
      .catch((error) => {
        console.error("Owner dashboard error:", error);
      });
  }, [loggedIn, role]);

  // =========================
  // LOAD NORMAL USER STORES
  // =========================

  useEffect(() => {
    if (!loggedIn || role !== "user") {
      return;
    }

    getStores()
      .then((data) => {
        setStores(data.stores || data || []);
      })
      .catch((error) => {
        console.error("Stores error:", error);
      });
  }, [loggedIn, role]);

  // =========================
  // LOGIN
  // =========================

  const handleLogin = async (e) => {
    e.preventDefault();

    setLoginError("");
    setLoginMessage("");

    try {
      const data = await loginUser(email, password);

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setUser(data.user);
      setRole(data.user.role);
      setLoggedIn(true);

      setLoginMessage("Login successful!");

      setEmail("");
      setPassword("");
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
    setSignupMessage("");

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const passwordRegex =
      /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;

    if (
      signupName.length < 20 ||
      signupName.length > 60
    ) {
      setSignupError(
        "Name must be between 20 and 60 characters."
      );
      return;
    }

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

    if (signupAddress.length > 400) {
      setSignupError(
        "Address cannot exceed 400 characters."
      );
      return;
    }

    try {
      const data = await signupUser(
        signupName,
        signupEmail,
        signupPassword,
        signupAddress
      );

      setSignupMessage(
        data.message ||
          "Signup successful! You can now login."
      );

      setSignupName("");
      setSignupEmail("");
      setSignupPassword("");
      setSignupAddress("");
    } catch (error) {
      setSignupError(error.message);
    }
  };

  // =========================
  // CHANGE PASSWORD
  // =========================

  const handleChangePassword = async (e) => {
    e.preventDefault();

    setPasswordError("");
    setPasswordMessage("");

    const passwordRegex =
      /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;

    if (!passwordRegex.test(newPassword)) {
      setPasswordError(
        "New password must be 8-16 characters with at least one uppercase letter and one special character."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(
        "New passwords do not match."
      );
      return;
    }

    try {
      const data = await changePassword(
        currentPassword,
        newPassword
      );

      setPasswordMessage(
        data.message ||
          "Password changed successfully."
      );

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setPasswordError(error.message);
    }
  };

  // =========================
  // ADD USER
  // =========================

  const handleAddUser = async (e) => {
    e.preventDefault();

    setAddUserMessage("");
    setAddUserError("");

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const passwordRegex =
      /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;

    if (
      newUserName.length < 20 ||
      newUserName.length > 60
    ) {
      setAddUserError(
        "Name must be between 20 and 60 characters."
      );
      return;
    }

    if (!emailRegex.test(newUserEmail)) {
      setAddUserError("Please enter a valid email.");
      return;
    }

    if (!passwordRegex.test(newUserPassword)) {
      setAddUserError(
        "Password must be 8-16 characters with at least one uppercase letter and one special character."
      );
      return;
    }

    try {
      const data = await createAdminUser(
        newUserName,
        newUserEmail,
        newUserPassword,
        newUserRole
      );

      setAddUserMessage(
        data.message ||
          "User created successfully."
      );

      setNewUserName("");
      setNewUserEmail("");
      setNewUserPassword("");
      setNewUserRole("user");

      const updatedUsers = await getAdminUsers();

      setAdminUsers(
        updatedUsers.users ||
          updatedUsers ||
          []
      );
    } catch (error) {
      setAddUserError(error.message);
    }
  };

  // =========================
  // ADD STORE
  // =========================

  const handleAddStore = async (e) => {
    e.preventDefault();

    setAddStoreMessage("");
    setAddStoreError("");

    if (
      newStoreName.length < 20 ||
      newStoreName.length > 60
    ) {
      setAddStoreError(
        "Store name must be between 20 and 60 characters."
      );
      return;
    }

    if (newStoreAddress.length > 400) {
      setAddStoreError(
        "Address cannot exceed 400 characters."
      );
      return;
    }

    if (!newStoreOwner) {
      setAddStoreError(
        "Please select a store owner."
      );
      return;
    }

    try {
      const data = await createAdminStore(
        newStoreName,
        newStoreAddress,
        Number(newStoreOwner)
      );

      setAddStoreMessage(
        data.message ||
          "Store created successfully."
      );

      setNewStoreName("");
      setNewStoreAddress("");
      setNewStoreOwner("");

      const updatedStores = await getAdminStores();

      setAdminStores(
        updatedStores.stores ||
          updatedStores ||
          []
      );
    } catch (error) {
      setAddStoreError(error.message);
    }
  };

  // =========================
  // SUBMIT / UPDATE RATING
  // =========================

  const handleRatingSubmit = async (
    storeId,
    existingRating
  ) => {
    const selectedRating =
      selectedRatings[storeId];

    if (!selectedRating) {
      alert(
        "Please select a rating from 1 to 5."
      );
      return;
    }

    try {
      if (existingRating) {
        await updateRating(
          storeId,
          selectedRating
        );
      } else {
        await submitRating(
          storeId,
          selectedRating
        );
      }

      const updated = await getStores();

      setStores(
        updated.stores ||
          updated ||
          []
      );

      setSelectedRatings((prev) => ({
        ...prev,
        [storeId]: undefined,
      }));

      alert(
        existingRating
          ? "Rating updated successfully!"
          : "Rating submitted successfully!"
      );
    } catch (error) {
      alert(error.message);
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
    setUser(null);

    setEmail("");
    setPassword("");

    setAdminPage("dashboard");
    setOwnerData(null);
    setStores([]);

    setSelectedUser(null);
    setSelectedRatings({});
  };

  // =========================
  // ADMIN USER FILTERING
  // =========================

  const filteredAdminUsers = [...adminUsers]
    .filter((item) => {
      const search =
        adminUserSearch
          .toLowerCase()
          .trim();

      const matchesSearch =
        !search ||
        item.name
          ?.toLowerCase()
          .includes(search) ||
        item.email
          ?.toLowerCase()
          .includes(search);

      const matchesRole =
        adminUserRoleFilter === "all" ||
        item.role === adminUserRoleFilter;

      return matchesSearch && matchesRole;
    })
    .sort((a, b) => {
      const nameA =
        (a.name || "").toLowerCase();

      const nameB =
        (b.name || "").toLowerCase();

      const emailA =
        (a.email || "").toLowerCase();

      const emailB =
        (b.email || "").toLowerCase();

      if (adminUserSort === "name-desc") {
        return nameB.localeCompare(nameA);
      }

      if (adminUserSort === "email-asc") {
        return emailA.localeCompare(emailB);
      }

      if (adminUserSort === "email-desc") {
        return emailB.localeCompare(emailA);
      }

      return nameA.localeCompare(nameB);
    });

  // =========================
  // ADMIN STORE FILTERING
  // =========================

  const filteredAdminStores = [...adminStores]
    .filter((item) => {
      const search =
        adminStoreSearch
          .toLowerCase()
          .trim();

      return (
        !search ||
        item.name
          ?.toLowerCase()
          .includes(search) ||
        item.address
          ?.toLowerCase()
          .includes(search) ||
        item.owner_name
          ?.toLowerCase()
          .includes(search)
      );
    })
    .sort((a, b) => {
      if (adminStoreSort === "name-desc") {
        return (b.name || "").localeCompare(
          a.name || ""
        );
      }

      if (adminStoreSort === "rating-high") {
        return (
          Number(b.overall_rating || 0) -
          Number(a.overall_rating || 0)
        );
      }

      if (adminStoreSort === "rating-low") {
        return (
          Number(a.overall_rating || 0) -
          Number(b.overall_rating || 0)
        );
      }

      return (a.name || "").localeCompare(
        b.name || ""
      );
    });

  // =========================
  // NORMAL USER STORE SEARCH
  // =========================

  const filteredStores = stores.filter(
    (store) => {
      const search =
        storeSearch
          .toLowerCase()
          .trim();

      return (
        !search ||
        store.name
          ?.toLowerCase()
          .includes(search) ||
        store.address
          ?.toLowerCase()
          .includes(search)
      );
    }
  );

  // =====================================================
  // ADMIN PANEL
  // =====================================================

  if (loggedIn && role === "admin") {
    return (
      <div className="app-layout">

        <aside className="sidebar">

          <h1 className="logo">
            RateHub
          </h1>

          <p className="sidebar-user">
            Welcome, {user?.name}
          </p>

          <button
            className={
              adminPage === "dashboard"
                ? "sidebar-btn active"
                : "sidebar-btn"
            }
            onClick={() =>
              setAdminPage("dashboard")
            }
          >
            📊 Dashboard
          </button>

          <button
            className={
              adminPage === "users"
                ? "sidebar-btn active"
                : "sidebar-btn"
            }
            onClick={() =>
              setAdminPage("users")
            }
          >
            👥 Users
          </button>

          <button
            className={
              adminPage === "stores"
                ? "sidebar-btn active"
                : "sidebar-btn"
            }
            onClick={() =>
              setAdminPage("stores")
            }
          >
            🏪 Stores
          </button>

          <button
            className={
              adminPage === "add-user"
                ? "sidebar-btn active"
                : "sidebar-btn"
            }
            onClick={() =>
              setAdminPage("add-user")
            }
          >
            ➕ Add User
          </button>

          <button
            className={
              adminPage === "add-store"
                ? "sidebar-btn active"
                : "sidebar-btn"
            }
            onClick={() =>
              setAdminPage("add-store")
            }
          >
            ➕ Add Store
          </button>

          <button
            className={
              adminPage === "change-password"
                ? "sidebar-btn active"
                : "sidebar-btn"
            }
            onClick={() =>
              setAdminPage("change-password")
            }
          >
            🔐 Change Password
          </button>

          <button
            className="logout-btn"
            onClick={handleLogout}
          >
            🚪 Logout
          </button>

        </aside>

        <main className="main-content">

          {/* DASHBOARD */}

          {adminPage === "dashboard" && (
            <>
              <h2>Admin Dashboard</h2>

              <div className="stats-grid">

                <div className="stat-card">
                  <h3>Total Users</h3>
                  <p>
                    {adminStats.users}
                  </p>
                </div>

                <div className="stat-card">
                  <h3>Total Stores</h3>
                  <p>
                    {adminStats.stores}
                  </p>
                </div>

                <div className="stat-card">
                  <h3>Total Ratings</h3>
                  <p>
                    {adminStats.ratings}
                  </p>
                </div>

              </div>
            </>
          )}

          {/* USERS */}

          {adminPage === "users" && (
            <>
              <h2>All Users</h2>

              {selectedUser && (
                <div className="details-card user-details-top">

                  <div className="details-header">

                    <div>
                      <h3>User Details</h3>

                      <p>
                        Complete information about selected user
                      </p>
                    </div>

                    <button
                      className="small-btn"
                      onClick={() =>
                        setSelectedUser(null)
                      }
                    >
                      Close
                    </button>

                  </div>

                  <div className="details-grid">

                    <div className="detail-item">
                      <span>Name:</span>
                      <strong>
                        {selectedUser.name}
                      </strong>
                    </div>

                    <div className="detail-item">
                      <span>Email:</span>
                      <strong>
                        {selectedUser.email}
                      </strong>
                    </div>

                    <div className="detail-item">
                      <span>Role:</span>
                      <strong>
                        {selectedUser.role}
                      </strong>
                    </div>

                    <div className="detail-item">
                      <span>Address:</span>
                      <strong>
                        {selectedUser.address ||
                          "N/A"}
                      </strong>
                    </div>

                  </div>
                </div>
              )}

              <div className="admin-filters">

                <input
                  className="search-input"
                  type="text"
                  value={adminUserSearch}
                  onChange={(e) =>
                    setAdminUserSearch(
                      e.target.value
                    )
                  }
                  placeholder="🔍 Search by name or email..."
                />

                <select
                  value={adminUserRoleFilter}
                  onChange={(e) =>
                    setAdminUserRoleFilter(
                      e.target.value
                    )
                  }
                >
                  <option value="all">
                    All Roles
                  </option>

                  <option value="user">
                    Normal User
                  </option>

                  <option value="owner">
                    Store Owner
                  </option>

                  <option value="admin">
                    Administrator
                  </option>
                </select>

                <select
                  value={adminUserSort}
                  onChange={(e) =>
                    setAdminUserSort(
                      e.target.value
                    )
                  }
                >
                  <option value="name-asc">
                    Name A-Z
                  </option>

                  <option value="name-desc">
                    Name Z-A
                  </option>

                  <option value="email-asc">
                    Email A-Z
                  </option>

                  <option value="email-desc">
                    Email Z-A
                  </option>
                </select>

              </div>

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

                    {filteredAdminUsers.length === 0 ? (
                      <tr>
                        <td
                          colSpan="5"
                          style={{
                            textAlign: "center",
                          }}
                        >
                          No users match your search/filter.
                        </td>
                      </tr>
                    ) : (
                      filteredAdminUsers.map(
                        (item) => (
                          <tr key={item.id}>

                            <td>
                              {item.id}
                            </td>

                            <td>
                              {item.name}
                            </td>

                            <td>
                              {item.email}
                            </td>

                            <td>
                              {item.role}
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
                                      data.user ||
                                        data
                                    );

                                    window.scrollTo({
                                      top: 0,
                                      behavior:
                                        "smooth",
                                    });
                                  } catch (error) {
                                    alert(
                                      error.message
                                    );
                                  }
                                }}
                              >
                                View
                              </button>
                            </td>

                          </tr>
                        )
                      )
                    )}

                  </tbody>

                </table>

              </div>
            </>
          )}

          {/* STORES */}

          {adminPage === "stores" && (
            <>
              <h2>All Stores</h2>

              <div className="admin-filters">

                <input
                  className="search-input"
                  type="text"
                  value={adminStoreSearch}
                  onChange={(e) =>
                    setAdminStoreSearch(
                      e.target.value
                    )
                  }
                  placeholder="🔍 Search store, address or owner..."
                />

                <select
                  value={adminStoreSort}
                  onChange={(e) =>
                    setAdminStoreSort(
                      e.target.value
                    )
                  }
                >
                  <option value="name-asc">
                    Name A-Z
                  </option>

                  <option value="name-desc">
                    Name Z-A
                  </option>

                  <option value="rating-high">
                    Rating High-Low
                  </option>

                  <option value="rating-low">
                    Rating Low-High
                  </option>
                </select>

              </div>

              <div className="table-container">

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

                    {filteredAdminStores.length === 0 ? (
                      <tr>
                        <td
                          colSpan="5"
                          style={{
                            textAlign: "center",
                          }}
                        >
                          No stores match your search.
                        </td>
                      </tr>
                    ) : (
                      filteredAdminStores.map(
                        (store) => (
                          <tr key={store.id}>

                            <td>
                              {store.id}
                            </td>

                            <td>
                              {store.name}
                            </td>

                            <td>
                              {store.address}
                            </td>

                            <td>
                              {store.owner_name ||
                                store.owner ||
                                "N/A"}
                            </td>

                            <td>
                              ⭐{" "}
                              {Number(
                                store.overall_rating || 0
                              ).toFixed(2)}
                            </td>

                          </tr>
                        )
                      )
                    )}

                  </tbody>

                </table>

              </div>
            </>
          )}

          {/* ADD USER */}

          {adminPage === "add-user" && (
            <>
              <h2>Add User</h2>

              <form
                className="form-card"
                onSubmit={handleAddUser}
              >

                <input
                  type="text"
                  placeholder="Full Name (20-60 characters)"
                  value={newUserName}
                  onChange={(e) =>
                    setNewUserName(
                      e.target.value
                    )
                  }
                />

                <input
                  type="email"
                  placeholder="Email"
                  value={newUserEmail}
                  onChange={(e) =>
                    setNewUserEmail(
                      e.target.value
                    )
                  }
                />

                <input
                  type="password"
                  placeholder="Password"
                  value={newUserPassword}
                  onChange={(e) =>
                    setNewUserPassword(
                      e.target.value
                    )
                  }
                />

                <select
                  value={newUserRole}
                  onChange={(e) =>
                    setNewUserRole(
                      e.target.value
                    )
                  }
                >
                  <option value="user">
                    Normal User
                  </option>

                  <option value="owner">
                    Store Owner
                  </option>

                  <option value="admin">
                    Administrator
                  </option>
                </select>

                <button type="submit">
                  Add User
                </button>

                {addUserMessage && (
                  <p className="success-message">
                    {addUserMessage}
                  </p>
                )}

                {addUserError && (
                  <p className="error-message">
                    {addUserError}
                  </p>
                )}

              </form>
            </>
          )}

          {/* ADD STORE */}

          {adminPage === "add-store" && (
            <>
              <h2>Add Store</h2>

              <form
                className="form-card"
                onSubmit={handleAddStore}
              >

                <input
                  type="text"
                  placeholder="Store Name (20-60 characters)"
                  value={newStoreName}
                  onChange={(e) =>
                    setNewStoreName(
                      e.target.value
                    )
                  }
                />

                <textarea
                  placeholder="Store Address"
                  value={newStoreAddress}
                  onChange={(e) =>
                    setNewStoreAddress(
                      e.target.value
                    )
                  }
                />

                <select
                  value={newStoreOwner}
                  onChange={(e) =>
                    setNewStoreOwner(
                      e.target.value
                    )
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

                <button type="submit">
                  Add Store
                </button>

                {addStoreMessage && (
                  <p className="success-message">
                    {addStoreMessage}
                  </p>
                )}

                {addStoreError && (
                  <p className="error-message">
                    {addStoreError}
                  </p>
                )}

              </form>
            </>
          )}

          {/* CHANGE PASSWORD */}

          {adminPage === "change-password" && (
            <>
              <h2>Change Password</h2>

              <form
                className="form-card"
                onSubmit={handleChangePassword}
              >

                <input
                  type="password"
                  placeholder="Current Password"
                  value={currentPassword}
                  onChange={(e) =>
                    setCurrentPassword(
                      e.target.value
                    )
                  }
                />

                <input
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) =>
                    setNewPassword(
                      e.target.value
                    )
                  }
                />

                <input
                  type="password"
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(
                      e.target.value
                    )
                  }
                />

                <button type="submit">
                  Change Password
                </button>

                {passwordMessage && (
                  <p className="success-message">
                    {passwordMessage}
                  </p>
                )}

                {passwordError && (
                  <p className="error-message">
                    {passwordError}
                  </p>
                )}

              </form>
            </>
          )}

        </main>

      </div>
    );
  }

  // =====================================================
  // STORE OWNER PANEL
  // =====================================================

  if (loggedIn && role === "owner") {
    const ownerStore = ownerData?.store;

    const usersWhoRated =
      ownerData?.usersWhoRated || [];

    return (
      <div className="app-layout">

        <aside className="sidebar">

          <h1 className="logo">
            RateHub
          </h1>

          <p className="sidebar-user">
            Welcome, {user?.name}
          </p>

          <button className="sidebar-btn active">
            🏪 My Store
          </button>

          <button
            className="sidebar-btn"
            onClick={() => {
              setPasswordMessage("");
              setPasswordError("");

              document
                .getElementById("owner-password")
                ?.scrollIntoView({
                  behavior: "smooth",
                });
            }}
          >
            🔐 Change Password
          </button>

          <button
            className="logout-btn"
            onClick={handleLogout}
          >
            🚪 Logout
          </button>

        </aside>

        <main className="main-content">

          <h2>Store Owner Dashboard</h2>

          {ownerStore ? (
            <>
              <div className="owner-store-card">

                <h3>
                  {ownerStore.name}
                </h3>

                <p>
                  <strong>Address:</strong>{" "}
                  {ownerStore.address}
                </p>

                <p>
                  <strong>Average Rating:</strong>{" "}
                  ⭐{" "}
                  {Number(
                    ownerStore.average_rating || 0
                  ).toFixed(2)}
                </p>

                <p>
                  <strong>Total Ratings:</strong>{" "}
                  {ownerStore.total_ratings || 0}
                </p>

              </div>

              <h3>
                Users Who Rated Your Store
              </h3>

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

                    {usersWhoRated.length === 0 ? (
                      <tr>
                        <td
                          colSpan="3"
                          style={{
                            textAlign: "center",
                          }}
                        >
                          No ratings yet.
                        </td>
                      </tr>
                    ) : (
                      usersWhoRated.map(
                        (item, index) => (
                          <tr
                            key={
                              item.id ||
                              index
                            }
                          >

                            <td>
                              {item.name ||
                                item.user_name}
                            </td>

                            <td>
                              {item.email}
                            </td>

                            <td>
                              ⭐ {item.rating}
                            </td>

                          </tr>
                        )
                      )
                    )}

                  </tbody>

                </table>

              </div>
            </>
          ) : (
            <p>
              No store information available.
            </p>
          )}

          <div
            id="owner-password"
            className="form-section"
          >

            <h2>Change Password</h2>

            <form
              className="form-card"
              onSubmit={handleChangePassword}
            >

              <input
                type="password"
                placeholder="Current Password"
                value={currentPassword}
                onChange={(e) =>
                  setCurrentPassword(
                    e.target.value
                  )
                }
              />

              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) =>
                  setNewPassword(
                    e.target.value
                  )
                }
              />

              <input
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(
                    e.target.value
                  )
                }
              />

              <button type="submit">
                Change Password
              </button>

              {passwordMessage && (
                <p className="success-message">
                  {passwordMessage}
                </p>
              )}

              {passwordError && (
                <p className="error-message">
                  {passwordError}
                </p>
              )}

            </form>

          </div>

        </main>

      </div>
    );
  }

  // =====================================================
  // NORMAL USER PANEL
  // =====================================================

  if (loggedIn && role === "user") {
    return (
      <div className="app-layout">

        <aside className="sidebar">

          <h1 className="logo">
            RateHub
          </h1>

          <p className="sidebar-user">
            Welcome, {user?.name}
          </p>

          <button className="sidebar-btn active">
            🏪 Stores
          </button>

          <button
            className="sidebar-btn"
            onClick={() => {
              document
                .getElementById("user-password")
                ?.scrollIntoView({
                  behavior: "smooth",
                });
            }}
          >
            🔐 Change Password
          </button>

          <button
            className="logout-btn"
            onClick={handleLogout}
          >
            🚪 Logout
          </button>

        </aside>

        <main className="main-content">

          <h2>Available Stores</h2>

          <input
            className="search-input"
            type="text"
            placeholder="🔍 Search store by name or address..."
            value={storeSearch}
            onChange={(e) =>
              setStoreSearch(
                e.target.value
              )
            }
          />

          <div className="store-grid">

            {filteredStores.length === 0 ? (
              <p>No stores found.</p>
            ) : (
              filteredStores.map((store) => {

                const existingRating =
                  Number(
                    store.user_rating || 0
                  );

                const currentRating =
                  selectedRatings[store.id] ||
                  existingRating;

                return (
                  <div
                    className="store-card"
                    key={store.id}
                  >

                    <h3>
                      {store.name}
                    </h3>

                    <p>
                      {store.address}
                    </p>

                    <p className="overall-rating">
                      ⭐ Overall Rating:{" "}
                      {Number(
                        store.average_rating || 0
                      ).toFixed(2)}
                    </p>

                    {/* YOUR RATING */}

                    <div className="rating-section">

                      <span className="rating-label">
                        Your Rating
                      </span>

                      <div className="star-rating">

                        {[1, 2, 3, 4, 5].map(
                          (rating) => (
                            <button
                              key={rating}
                              type="button"
                              className={
                                Number(
                                  currentRating
                                ) >= rating
                                  ? "star-btn active"
                                  : "star-btn"
                              }
                              onClick={() =>
                                setSelectedRatings(
                                  (prev) => ({
                                    ...prev,
                                    [store.id]:
                                      rating,
                                  })
                                )
                              }
                            >
                              ★
                            </button>
                          )
                        )}

                      </div>

                      <span className="rating-value">
                        {currentRating
                          ? `${currentRating}/5`
                          : "Not rated"}
                      </span>

                    </div>

                    {/* SUBMIT RATING BUTTON */}

                    <button
                      type="button"
                      className="rating-submit-btn"
                      onClick={() =>
                        handleRatingSubmit(
                          store.id,
                          existingRating
                        )
                      }
                    >
                      Submit Rating
                    </button>

                  </div>
                );
              })
            )}

          </div>

          {/* CHANGE PASSWORD */}

          <div
            id="user-password"
            className="form-section"
          >

            <h2>Change Password</h2>

            <form
              className="form-card"
              onSubmit={handleChangePassword}
            >

              <input
                type="password"
                placeholder="Current Password"
                value={currentPassword}
                onChange={(e) =>
                  setCurrentPassword(
                    e.target.value
                  )
                }
              />

              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) =>
                  setNewPassword(
                    e.target.value
                  )
                }
              />

              <input
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(
                    e.target.value
                  )
                }
              />

              <button type="submit">
                Change Password
              </button>

              {passwordMessage && (
                <p className="success-message">
                  {passwordMessage}
                </p>
              )}

              {passwordError && (
                <p className="error-message">
                  {passwordError}
                </p>
              )}

            </form>

          </div>

        </main>

      </div>
    );
  }

  // =====================================================
  // LOGIN / SIGNUP PAGE
  // =====================================================

  return (
    <div className="auth-page">

      <div className="auth-card">

        <h1 className="logo">
          RateHub
        </h1>

        {!showSignup ? (
          <>
            <h2>Login</h2>

            <form onSubmit={handleLogin}>

              <input
                type="email"
                placeholder="Email"
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
                  setPassword(
                    e.target.value
                  )
                }
              />

              <button type="submit">
                Login
              </button>

            </form>

            {loginMessage && (
              <p className="success-message">
                {loginMessage}
              </p>
            )}

            {loginError && (
              <p className="error-message">
                {loginError}
              </p>
            )}

            <p className="switch-text">
              Don't have an account?
            </p>

            <button
              className="secondary-btn"
              onClick={() => {
                setShowSignup(true);
                setLoginError("");
                setLoginMessage("");
              }}
            >
              Create Account
            </button>
          </>
        ) : (
          <>
            <h2>Create Account</h2>

            <form onSubmit={handleSignup}>

              <input
                type="text"
                placeholder="Full Name (20-60 characters)"
                value={signupName}
                onChange={(e) =>
                  setSignupName(
                    e.target.value
                  )
                }
              />

              <input
                type="email"
                placeholder="Email"
                value={signupEmail}
                onChange={(e) =>
                  setSignupEmail(
                    e.target.value
                  )
                }
              />

              <input
                type="password"
                placeholder="Password"
                value={signupPassword}
                onChange={(e) =>
                  setSignupPassword(
                    e.target.value
                  )
                }
              />

              <textarea
                placeholder="Address"
                value={signupAddress}
                onChange={(e) =>
                  setSignupAddress(
                    e.target.value
                  )
                }
              />

              <button type="submit">
                Sign Up
              </button>

            </form>

            {signupMessage && (
              <p className="success-message">
                {signupMessage}
              </p>
            )}

            {signupError && (
              <p className="error-message">
                {signupError}
              </p>
            )}

            <p className="switch-text">
              Already have an account?
            </p>

            <button
              className="secondary-btn"
              onClick={() => {
                setShowSignup(false);
                setSignupError("");
                setSignupMessage("");
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

export default App;