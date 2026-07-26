import type { Coupon, CouponInput, ExtractedFields } from "../types";

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    let message = `שגיאה (${res.status})`;
    try {
      const data = await res.json();
      if (data?.error) message = data.error;
    } catch {
      /* ignore */
    }
    throw new ApiError(message, res.status);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  login: (pin: string) =>
    request<{ authenticated: boolean }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ pin }),
    }),
  logout: () => request<{ authenticated: boolean }>("/api/auth/logout", { method: "POST" }),
  me: () => request<{ authenticated: boolean }>("/api/auth/me"),

  listCoupons: (params: Record<string, string>) => {
    const query = new URLSearchParams(Object.entries(params).filter(([, v]) => v));
    const qs = query.toString();
    return request<Coupon[]>(`/api/coupons${qs ? `?${qs}` : ""}`);
  },
  createCoupon: (data: CouponInput) =>
    request<Coupon>("/api/coupons", { method: "POST", body: JSON.stringify(data) }),
  updateCoupon: (id: string, data: Partial<CouponInput>) =>
    request<Coupon>(`/api/coupons/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteCoupon: (id: string) => request<void>(`/api/coupons/${id}`, { method: "DELETE" }),
  setRedeemed: (id: string, redeemed: boolean) =>
    request<Coupon>(`/api/coupons/${id}/redeem`, {
      method: "PATCH",
      body: JSON.stringify({ redeemed }),
    }),

  uploadImage: async (
    file: Blob,
    filename: string,
  ): Promise<{ path: string; isPdfSourced: boolean; thumbnailPath: string }> => {
    const form = new FormData();
    form.append("image", file, filename);
    const res = await fetch("/api/upload", { method: "POST", credentials: "include", body: form });
    if (!res.ok) {
      let message = `שגיאה בהעלאת תמונה (${res.status})`;
      try {
        const data = await res.json();
        if (data?.error) message = data.error;
      } catch {
        /* ignore */
      }
      throw new ApiError(message, res.status);
    }
    return res.json();
  },

  extractCoupon: async (
    file: File,
  ): Promise<{ path: string; isPdfSourced: boolean; thumbnailPath: string; extracted: ExtractedFields }> => {
    const form = new FormData();
    form.append("image", file, file.name);
    const res = await fetch("/api/import/extract", { method: "POST", credentials: "include", body: form });
    if (!res.ok) {
      let message = `שגיאה בזיהוי אוטומטי (${res.status})`;
      try {
        const data = await res.json();
        if (data?.error) message = data.error;
      } catch {
        /* ignore */
      }
      throw new ApiError(message, res.status);
    }
    return res.json();
  },
};

export { ApiError };
