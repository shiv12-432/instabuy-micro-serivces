export function getStoredSellerProfile() {
  try {
    return JSON.parse(localStorage.getItem('sellerProfile') || 'null');
  } catch {
    return null;
  }
}

export function normalizeSellerUser(user) {
  if (!user) return null;

  const sellerProfile = getStoredSellerProfile();
  const profileEmail = sellerProfile?.email?.trim().toLowerCase();
  const userEmail = user.email?.trim().toLowerCase();

  if (profileEmail && userEmail && profileEmail === userEmail && user.role === 'CUSTOMER') {
    const sellerUser = { ...user, role: 'SELLER', name: sellerProfile.storeName || sellerProfile.sellerName || user.name };
    localStorage.setItem('user', JSON.stringify(sellerUser));
    return sellerUser;
  }

  return user;
}

export function getStoredUser() {
  try {
    return normalizeSellerUser(JSON.parse(localStorage.getItem('user') || 'null'));
  } catch {
    return null;
  }
}

export function authHeaders(extra = {}) {
  const user = getStoredUser();
  return user?.token
    ? { ...extra, Authorization: `Bearer ${user.token}` }
    : extra;
}

export function authFetch(url, options = {}) {
  return fetch(url, {
    ...options,
    headers: authHeaders(options.headers || {}),
  }).then(async (res) => {
    if (res.status === 401) {
      // token expired — try refresh
      const user = getStoredUser();
      if (user?.refreshToken) {
        const refreshRes = await fetch('/api/auth/refresh', {
          method: 'POST',
          headers: { Authorization: `Bearer ${user.refreshToken}` },
        });
        if (refreshRes.ok) {
          const { token } = await refreshRes.json();
          const updated = { ...user, token };
          localStorage.setItem('user', JSON.stringify(updated));
          // retry original request with new token
          return fetch(url, {
            ...options,
            headers: { ...(options.headers || {}), Authorization: `Bearer ${token}` },
          });
        }
      }
      // refresh failed — clear session
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return res;
  });
}
