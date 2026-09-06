const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://store-rating-platform-mtuu.onrender.com";

const getToken = () => localStorage.getItem("token");

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
};

// ==================== AUTH ====================

export const loginUser = async (data) => {
  const response = await fetch(
    `${API_BASE_URL}/api/auth/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: data.email,
        password: data.password,
        role: data.role,
      }),
    }
  );

  return handleResponse(response);
};

export const signupUser = async (data) => {
  const response = await fetch(
    `${API_BASE_URL}/api/auth/signup`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        address: data.address,
        password: data.password,
        role: data.role || "user",
      }),
    }
  );

  return handleResponse(response);
};

export const changePassword = async (data) => {
  const response = await fetch(
    `${API_BASE_URL}/api/auth/change-password`,
    {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      }),
    }
  );

  return handleResponse(response);
};

// ==================== ADMIN ====================

export const getAdminDashboardStats = async () => {
  const response = await fetch(
    `${API_BASE_URL}/api/admin/dashboard`,
    {
      method: "GET",
      headers: authHeaders(),
    }
  );

  const data = await handleResponse(response);

  return {
    totalUsers: data.totalUsers ?? 0,
    totalStores: data.totalStores ?? 0,
    totalRatings: data.totalRatings ?? 0,
  };
};

export const getAdminUsers = async (
  search = "",
  role = "",
  sortBy = "name",
  order = "asc"
) => {
  const params = new URLSearchParams();

  if (search) params.append("search", search);
  if (role) params.append("role", role);
  if (sortBy) params.append("sortBy", sortBy);
  if (order) params.append("order", order);

  const response = await fetch(
    `${API_BASE_URL}/api/admin/users?${params.toString()}`,
    {
      method: "GET",
      headers: authHeaders(),
    }
  );

  const data = await handleResponse(response);

  return data.users || data || [];
};

export const getAdminStores = async (
  search = "",
  sortBy = "name",
  order = "asc"
) => {
  const params = new URLSearchParams();

  if (search) params.append("search", search);
  if (sortBy) params.append("sortBy", sortBy);
  if (order) params.append("order", order);

  const response = await fetch(
    `${API_BASE_URL}/api/admin/stores?${params.toString()}`,
    {
      method: "GET",
      headers: authHeaders(),
    }
  );

  const data = await handleResponse(response);

  return data.stores || data || [];
};

export const createAdminUser = async (userData) => {
  const response = await fetch(
    `${API_BASE_URL}/api/admin/users`,
    {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(userData),
    }
  );

  return handleResponse(response);
};

export const createAdminStore = async (storeData) => {
  const response = await fetch(
    `${API_BASE_URL}/api/admin/stores`,
    {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(storeData),
    }
  );

  return handleResponse(response);
};

export const getUserDetails = async (userId) => {
  const response = await fetch(
    `${API_BASE_URL}/api/admin/users/${userId}`,
    {
      method: "GET",
      headers: authHeaders(),
    }
  );

  const data = await handleResponse(response);

  return data.user || data;
};

// ==================== FIXED: ADMIN STORE VIEW ====================

export const getStoreDetails = async (storeId) => {
  const response = await fetch(
    `${API_BASE_URL}/api/admin/stores/${storeId}`,
    {
      method: "GET",
      headers: authHeaders(),
    }
  );

  const data = await handleResponse(response);

  return data.store || data;
};

// ==================== STORES ====================

export const getStores = async () => {
  const response = await fetch(
    `${API_BASE_URL}/api/stores`,
    {
      method: "GET",
      headers: authHeaders(),
    }
  );

  const data = await handleResponse(response);

  return data.stores || data || [];
};

// ==================== RATINGS ====================

export const submitRating = async (data) => {
  const response = await fetch(
    `${API_BASE_URL}/api/ratings`,
    {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        store_id: data.store_id,
        rating: Number(data.rating),
      }),
    }
  );

  return handleResponse(response);
};

export const updateRating = async (data) => {
  const response = await fetch(
    `${API_BASE_URL}/api/ratings`,
    {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify({
        store_id: data.store_id,
        rating: Number(data.rating),
      }),
    }
  );

  return handleResponse(response);
};

// ==================== OWNER ====================

export const getOwnerDashboard = async () => {
  const response = await fetch(
    `${API_BASE_URL}/api/owner/dashboard`,
    {
      method: "GET",
      headers: authHeaders(),
    }
  );

  return handleResponse(response);
};