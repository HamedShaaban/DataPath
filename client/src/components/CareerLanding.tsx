import { ArrowRight, Layers3 } from "lucide-react";

export function CareerLanding({ onStart, onAccount, signedIn }: {
  onStart: () => void;
  onAccount: (mode: "login" | "register") => void;
  signedIn: boolean;
}) {
  return (
    <div className="career-landing welcome-page">
      <nav className="landing-nav" aria-label="Getting started">
        <a className="brand" href="#"><Layers3 /> DataPath</a>
        {!signedIn && <button className="secondary" onClick={() => onAccount("login")}>Sign in</button>}
      </nav>
      <section className="welcome-intro" aria-labelledby="welcome-title">
        <h1 id="welcome-title">Learn the data skills you need.</h1>
        <p>Choose a career or a single skill. Follow a guided plan, practise with real-world examples, and build projects at your pace.</p>
        <div className="welcome-actions">
          {signedIn ? (
            <button className="primary" onClick={onStart}>Find my path <ArrowRight size={16} /></button>
          ) : (
            <>
              <button className="primary" onClick={() => onAccount("register")}>Create account</button>
              <button className="secondary" onClick={onStart}>Find my path <ArrowRight size={16} /></button>
            </>
          )}
        </div>
        <p className="welcome-saving">{signedIn ? "Your account is ready. Choose what you want to learn next." : "Just exploring? Find a path as a guest. Guest progress stays in this browser; an account lets you save across devices."}</p>
      </section>
      <section className="welcome-next" aria-labelledby="welcome-next-title">
        <h2 id="welcome-next-title">What happens next</h2>
        <ol>
          <li><strong>Choose your direction</strong><p>A data career, tool, or language. You can review the topics before starting.</p></li>
          <li><strong>Make a plan that fits</strong><p>Pick your industry, starting level, and weekly study time.</p></li>
          <li><strong>Learn by doing</strong><p>Work through lessons, practice exercises, and portfolio projects.</p></li>
        </ol>
      </section>
    </div>
  );
}
