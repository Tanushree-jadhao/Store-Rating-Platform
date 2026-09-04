const API_URL = "http://localhost:5000/api";

const getToken = () => localStorage.getItem("token");

// =========================
// LOGIN
// =========================
export const loginUser = async (email, password) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Login failed");
  }

  return data;
};

// =========================
// SIGNUP
// =========================
export const signupUser = async (
  name,
  email,
  password,
  address
) => {
  const response = await fetch(
    `${API_URL}/auth/signup`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        password,
        address,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Signup failed"
    );
  }

  return data;
};

// =========================
// ADMIN DASHBOARD
// =========================
export const getAdminDashboard = async () => {
  const response = await fetch(
    `${API_URL}/admin/dashboard`,
    {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to load admin dashboard"
    );
  }

  return data;
};

// =========================
// ADMIN - GET ALL USERS
// =========================
export const getAdminUsers = async () => {
  const response = await fetch(
    `${API_URL}/admin/users`,
    {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to load users"
    );
  }

  return data;
};

// =========================
// ADMIN - GET USER DETAILS
// =========================
export const getAdminUserDetails = async (
  userId
) => {
  const response = await fetch(
    `${API_URL}/admin/users/${userId}`,
    {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to load user details"
    );
  }

  return data;
};

// =========================
// GET STORES
// =========================
export const getStores = async () => {
  const response = await fetch(
    `${API_URL}/stores`,
    {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to load stores"
    );
  }

  return data;
};

// =========================
// SUBMIT NEW RATING
// =========================
export const submitRating = async (
  store_id,
  rating
) => {
  const response = await fetch(
    `${API_URL}/ratings`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({
        store_id,
        rating,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to submit rating"
    );
  }

  return data;
};

// =========================
// UPDATE EXISTING RATING
// =========================
export const updateRating = async (
  store_id,
  rating
) => {
  const response = await fetch(
    `${API_URL}/ratings`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({
        store_id,
        rating,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to update rating"
    );
  }

  return data;
};

// =========================
// ADMIN - GET ALL STORES
// =========================
export const getAdminStores = async () => {
  const response = await fetch(
    `${API_URL}/admin/stores`,
    {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to load admin stores"
    );
  }

  return data;
};

// =========================
// ADMIN - CREATE USER
// =========================
export const createAdminUser = async (
  name,
  email,
  password,
  role
) => {
  const response = await fetch(
    `${API_URL}/admin/users`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({
        name,
        email,
        password,
        role,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to create user"
    );
  }

  return data;
};

// =========================
// ADMIN - CREATE STORE
// =========================
export const createAdminStore = async (
  name,
  address,
  owner_id
) => {
  const response = await fetch(
    `${API_URL}/admin/stores`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({
        name,
        address,
        owner_id,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to create store"
    );
  }

  return data;
};

// =========================
// OWNER - GET DASHBOARD
// =========================
export const getOwnerDashboard = async () => {
  const response = await fetch(
    `${API_URL}/owner/dashboard`,
    {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to load owner dashboard"
    );
  }

  return data;
};

// =========================
// CHANGE PASSWORD
// =========================
export const changePassword = async (
  currentPassword,
  newPassword
) => {
  const response = await fetch(
    `${API_URL}/auth/change-password`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({
        currentPassword,
        newPassword,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to change password"
    );
  }

  return data;
};