const API_URL = "https://store-rating-platform-mtuu.onrender.com/api";

const getToken = () => localStorage.getItem("token");

// LOGIN
export const loginUser = async (email, password, role) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: email.trim().toLowerCase(),
      password,
      role,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Login failed");
  }

  return data;
};

// SIGNUP
export const signupUser = async (
  name,
  email,
  address,
  password,
  role = "user"
) => {
  const selectedRole = role || "user";

  const response = await fetch(`${API_URL}/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      address: address.trim(),
      password,
      role: selectedRole,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Signup failed");
  }

  return data;
};

// ADMIN DASHBOARD
export const getAdminDashboard = async () => {
  const response = await fetch(`${API_URL}/admin/dashboard`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to load admin dashboard"
    );
  }

  return data;
};

// ADMIN USERS
export const getAdminUsers = async () => {
  const response = await fetch(`${API_URL}/admin/users`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to load users");
  }

  return Array.isArray(data)
    ? data
    : data.users || [];
};

// ADMIN USER DETAILS
export const getAdminUserDetails = async (userId) => {
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
      data.message || "Failed to load user details"
    );
  }

  return data;
};

// GET STORES FOR NORMAL USER
export const getStores = async () => {
  const response = await fetch(`${API_URL}/stores`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to load stores"
    );
  }

  return Array.isArray(data)
    ? data
    : data.stores || [];
};

// SUBMIT RATING
export const submitRating = async (store_id, rating) => {
  const response = await fetch(`${API_URL}/ratings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({
      store_id,
      rating,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to submit rating"
    );
  }

  return data;
};

// UPDATE RATING
export const updateRating = async (store_id, rating) => {
  const response = await fetch(`${API_URL}/ratings`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({
      store_id,
      rating,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to update rating"
    );
  }

  return data;
};

// ADMIN STORES
export const getAdminStores = async () => {
  const response = await fetch(`${API_URL}/admin/stores`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to load admin stores"
    );
  }

  return Array.isArray(data)
    ? data
    : data.stores || [];
};

// CREATE ADMIN USER
export const createAdminUser = async (
  name,
  email,
  password,
  role
) => {
  const response = await fetch(`${API_URL}/admin/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to create user"
    );
  }

  return data;
};

// CREATE ADMIN STORE
export const createAdminStore = async (
  name,
  address,
  owner_id
) => {
  const response = await fetch(`${API_URL}/admin/stores`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({
      name: name.trim(),
      address: address.trim(),
      owner_id,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to create store"
    );
  }

  return data;
};

// OWNER DASHBOARD
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
      data.message || "Failed to load owner dashboard"
    );
  }

  return data;
};

// CHANGE PASSWORD
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
      data.message || "Failed to change password"
    );
  }

  return data;
};
