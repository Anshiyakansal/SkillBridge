import { useEffect, useRef, useState } from "react";
import { googleLogin } from "../../services/authServices";

export default function GoogleButton() {
  const [loading, setLoading] = useState(false);
  const buttonRef = useRef(null);

  const handleGoogleResponse = async (response) => {
    if (!response?.credential) {
      alert("Google sign-in failed");
      return;
    }

    setLoading(true);
    try {
      const res = await googleLogin({ id_token: response.credential });
      localStorage.setItem("token", res.data.token);
      window.location.href = "/dashboard";
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.detail || "Google login failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initGoogleButton = () => {
      if (!window.google?.accounts?.id || !buttonRef.current) return;

      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
      });

      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: "outline",
        size: "large",
        width: "100%",
      });
    };

    const interval = setInterval(() => {
      if (window.google?.accounts?.id && buttonRef.current) {
        initGoogleButton();
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <div ref={buttonRef} />
      <p style={{ fontSize: "0.85rem", marginTop: "0.75rem", color: "#555" }}>
        If the Google button does not load, refresh the page and ensure your
        client ID is correct.
      </p>
    </div>
  );
}
