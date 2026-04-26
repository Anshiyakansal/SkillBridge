import { useState } from "react";
import { login, signup } from "../../services/authServices";

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    // ✅ validation
    if (!form.email || !form.password) {
      alert("Please fill all fields");
      return;
    }

    setLoading(true);

    try {
      let res;

      if (isLogin) {
        res = await login(form);

        // ✅ store token
        localStorage.setItem("token", res.data.token);

        alert("Login successful");

        // ✅ redirect
        window.location.href = "/dashboard";
      } else {
        await signup(form);

        alert("Signup successful");

        // switch to login
        setIsLogin(true);

        // clear form
        setForm({ email: "", password: "" });
      }

    } catch (err) {
      console.log(err);
      alert(err?.response?.data?.detail || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-card">

      {/* Tabs */}
      <div className="tabs">
        <span
          className={isLogin ? "active" : ""}
          onClick={() => setIsLogin(true)}
        >
          Login
        </span>

        <span
          className={!isLogin ? "active" : ""}
          onClick={() => setIsLogin(false)}
        >
          Sign Up
        </span>
      </div>

      {/* Welcome text */}
      <p className="welcome">
        {isLogin
          ? "Welcome back! Please login to continue"
          : "Create your account to get started"}
      </p>

      {/* Email */}
      <label>Email</label>
      <input
        autoFocus
        type="email"
        name="email"
        placeholder="you@example.com"
        value={form.email}
        onChange={handleChange}
      />

      {/* Password */}
      <label>Password</label>
      <input
        type="password"
        name="password"
        placeholder="Enter your password"
        value={form.password}
        onChange={handleChange}
      />

      {/* Row */}
      <div className="row">
        <label className="remember">
          <input type="checkbox" value="remember" />
          <p>Remember me</p>
         </label>

        <span className="forgot">Forgot password?</span>
      </div>

      {/* Submit */}
      <button onClick={handleSubmit} disabled={loading}>
        {loading ? "Please wait..." : isLogin ? "Login" : "Sign Up"}
      </button>

      {/* Divider */}
      <div className="divider">
        <span></span> or continue with <span></span>
      </div>

      {/* Google */}
      <button className="google-btn">
        Continue with Google
      </button>

      {/* Toggle */}
      <p className="toggle">
        {isLogin
          ? "Don't have an account?"
          : "Already have an account?"}

        <span onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? " Sign up" : " Login"}
        </span>
      </p>

    </div>
  );
}