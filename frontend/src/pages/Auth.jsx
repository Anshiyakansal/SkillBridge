import AuthForm from "../components/auth/AuthForm";
import "../index.css";


export default function Auth() {
  return (
    
    
    <div className="auth-page">
      <div className="auth-left">
        <h3 className="logo">⚡ SkillBridge AI</h3>
        <h1>
          Bridging Skills <br />
          to <span>Opportunities</span>
        </h1>
        <p>
          AI-powered platform that evaluates you on real skills, not resumes.
        </p>

        <img
          src="/hero.png"  // put image in public folder
          alt="hero"
        />
      </div>

      <div className="auth-right">
        <AuthForm />
      </div>
    </div>
  );
}