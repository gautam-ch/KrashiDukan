import { useState } from "react";

export function AuthForm({ onSignin, onSignup }) {
  const [mode, setMode] = useState("signin");
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const handleChange = (field, value) => setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === "signin") {
      onSignin?.(form.email, form.password);
    } else {
      onSignup?.(form.name, form.email, form.password);
    }
  };

  return (
    <div className="card">
      <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
        <h3>{mode === "signin" ? "Sign in" : "Sign up"}</h3>
        <button className="ghost" onClick={() => setMode(mode === "signin" ? "signup" : "signin")}>
          {mode === "signin" ? "Need an account?" : "Have an account?"}
        </button>
      </div>
      <form className="stack" onSubmit={handleSubmit}>
        {mode === "signup" && (
          <label>
            Name
            <input value={form.name} onChange={(e) => handleChange("name", e.target.value)} required />
          </label>
        )}
        <label>
          Email
          <input type="email" value={form.email} onChange={(e) => handleChange("email", e.target.value)} required />
        </label>
        <label>
          Password
          <input type="password" value={form.password} onChange={(e) => handleChange("password", e.target.value)} required />
        </label>
        <button type="submit">{mode === "signin" ? "Sign in" : "Create account"}</button>
      </form>
    </div>
  );
}
