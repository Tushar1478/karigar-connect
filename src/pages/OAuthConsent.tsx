import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

type OAuthNamespace = {
  getAuthorizationDetails: (id: string) => Promise<{ data: any; error: any }>;
  approveAuthorization: (id: string) => Promise<{ data: any; error: any }>;
  denyAuthorization: (id: string) => Promise<{ data: any; error: any }>;
};

const oauth = (supabase.auth as unknown as { oauth: OAuthNamespace }).oauth;

const card: React.CSSProperties = {
  background: "#FFFFFF",
  border: "1px solid #E8E0D8",
  borderRadius: 24,
  padding: 32,
  maxWidth: 460,
  width: "100%",
};

const page: React.CSSProperties = {
  minHeight: "100vh",
  background: "#FFFAF6",
  color: "#2D1F0E",
  fontFamily: "'Sora', sans-serif",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "24px 16px",
};

export default function OAuthConsent() {
  const [params] = useSearchParams();
  const authorizationId = params.get("authorization_id") ?? "";
  const [details, setDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!authorizationId) {
        setError("Missing authorization_id");
        return;
      }
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        const next = window.location.pathname + window.location.search;
        window.location.href = "/login/customer?next=" + encodeURIComponent(next);
        return;
      }
      const { data, error } = await oauth.getAuthorizationDetails(authorizationId);
      if (!active) return;
      if (error) {
        setError(error.message);
        return;
      }
      const immediate = data?.redirect_url ?? data?.redirect_to;
      if (immediate && !data?.client) {
        window.location.href = immediate;
        return;
      }
      setDetails(data);
    })();
    return () => {
      active = false;
    };
  }, [authorizationId]);

  async function decide(approve: boolean) {
    setBusy(true);
    const { data, error } = approve
      ? await oauth.approveAuthorization(authorizationId)
      : await oauth.denyAuthorization(authorizationId);
    if (error) {
      setBusy(false);
      setError(error.message);
      return;
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      setError("No redirect returned by the authorization server.");
      return;
    }
    window.location.href = target;
  }

  const clientName = details?.client?.name ?? "an app";

  return (
    <main style={page}>
      <div style={card}>
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            background: "linear-gradient(135deg,#f97316,#fb923c)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontWeight: 700,
            fontSize: "1.25rem",
            marginBottom: 20,
          }}
        >
          K
        </div>

        {error ? (
          <>
            <h1 style={{ fontSize: "1.25rem", fontWeight: 800, margin: "0 0 8px" }}>
              Could not load this request
            </h1>
            <p style={{ color: "#6B5744", fontSize: "0.9rem", margin: 0 }}>{error}</p>
          </>
        ) : !details ? (
          <p style={{ color: "#6B5744", fontSize: "0.9rem", margin: 0 }}>Loading…</p>
        ) : (
          <>
            <h1 style={{ fontSize: "1.35rem", fontWeight: 800, margin: "0 0 10px" }}>
              Connect {clientName} to KarigarHub
            </h1>
            <p style={{ color: "#6B5744", fontSize: "0.9rem", lineHeight: 1.6, margin: "0 0 24px" }}>
              {clientName} will be able to search karigars, view and create your bookings, and read your
              profile — acting as you. You can revoke access at any time.
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <button
                disabled={busy}
                onClick={() => decide(true)}
                style={{
                  flex: 1,
                  padding: "12px 16px",
                  borderRadius: 12,
                  border: "none",
                  background: "linear-gradient(135deg,#f97316,#fb923c)",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  fontFamily: "'Sora', sans-serif",
                  cursor: busy ? "not-allowed" : "pointer",
                }}
              >
                Approve
              </button>
              <button
                disabled={busy}
                onClick={() => decide(false)}
                style={{
                  flex: 1,
                  padding: "12px 16px",
                  borderRadius: 12,
                  border: "1px solid #E8E0D8",
                  background: "#F7F2ED",
                  color: "#6B5744",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  fontFamily: "'Sora', sans-serif",
                  cursor: busy ? "not-allowed" : "pointer",
                }}
              >
                Deny
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
