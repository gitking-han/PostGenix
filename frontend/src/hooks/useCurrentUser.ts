import { useState, useEffect } from "react";

const API = () => `${import.meta.env.VITE_API_URL}/api/auth/get-user`;

const authHeaders = () => ({
  "auth-token": localStorage.getItem("authToken") || "",
});

export const hasActiveProAccess = (user: any) => {
  if (!user) return false;

  const now = new Date();
  const stillInGrace = user.planEndsAt && new Date(user.planEndsAt) > now;

  return (
    user.plan === "pro" &&
    (
      user.subscriptionStatus === "active" ||
      user.subscriptionStatus === "trialing" ||
      (user.subscriptionStatus === "canceled" && stillInGrace)
    )
  );
};

export const useCurrentUser = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(API(), {
          headers: authHeaders(),
        });

        if (!response.ok) {
          const body = await response.json().catch(() => null);
          const message = body?.message || body?.error || "Unable to fetch user data.";
          if (!cancelled) setError(message);
          return;
        }

        const data = await response.json();
        if (!cancelled) setUser(data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unable to fetch user data.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchUser();

    return () => {
      cancelled = true;
    };
  }, []);

  return { user, loading, error };
};
