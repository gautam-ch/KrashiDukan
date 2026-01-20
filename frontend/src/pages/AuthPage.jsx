import { AuthForm } from "../components/AuthForm";

export function AuthPage({ onSignin, onSignup }) {
  return (
    <div className="app-shell">
      <div className="header">
        <div>
          <p className="muted" style={{ margin: 0 }}>Krashi Dukan</p>
          <h1 className="title">Pesticide shop console</h1>
        </div>
      </div>
      <AuthForm onSignin={onSignin} onSignup={onSignup} />
    </div>
  );
}
