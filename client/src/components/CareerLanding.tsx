import {
  ArrowRight,
  BrainCircuit,
  Code2,
  Database,
  Layers3,
  Moon,
  Network,
  Sparkles,
  Sun,
} from "lucide-react";

export function CareerLanding({ onStart, onAccount, signedIn, theme, onToggleTheme }: {
  onStart: () => void;
  onAccount: (mode: "login" | "register") => void;
  signedIn: boolean;
  theme: "light" | "dark";
  onToggleTheme: () => void;
}) {
  return (
    <div className="career-landing welcome-page">
      <nav className="landing-nav" aria-label="Getting started">
        <a className="brand" href="#"><Layers3 /> DataPath</a>
        <div className="landing-nav-actions">
          <button
            className="icon-button"
            onClick={onToggleTheme}
            aria-label={theme === "light" ? "Enable dark mode" : "Enable light mode"}
            title={theme === "light" ? "Dark mode" : "Light mode"}
          >
            {theme === "light" ? <Moon size={17} /> : <Sun size={17} />}
          </button>
          {!signedIn && <button className="secondary" onClick={() => onAccount("login")}>Sign in</button>}
        </div>
      </nav>
      <section className="welcome-intro" aria-labelledby="welcome-title">
        <div className="welcome-copy">
          <span className="system-label"><span /> DATA · AI · ML · LLM</span>
          <h1 id="welcome-title">Build skills for the intelligent data stack.</h1>
          <p>Move from data foundations to machine learning and LLM systems with a guided path, hands-on labs, and portfolio-ready projects.</p>
          <div className="welcome-actions">
            {signedIn ? (
              <button className="primary" onClick={onStart}>Build my learning path <ArrowRight size={16} /></button>
            ) : (
              <>
                <button className="primary" onClick={() => onAccount("register")}>Start learning</button>
                <button className="secondary" onClick={onStart}>Explore as guest <ArrowRight size={16} /></button>
              </>
            )}
          </div>
          <p className="welcome-saving">{signedIn ? "Your account is ready. Choose what you want to learn next." : "No paywall. Guest progress stays in this browser; create an account to sync across devices."}</p>
        </div>
        <aside className="ai-path-visual" aria-label="Example learning path from data foundations to LLM systems">
          <div className="ai-path-head">
            <span><Network size={16} /> Adaptive learning graph</span>
            <span className="ai-live-status"><i /> LIVE</span>
          </div>
          <div className="ai-path-nodes">
            <div className="ai-path-node is-complete">
              <span><Database size={18} /></span>
              <div><small>01 · FOUNDATION</small><strong>Data & SQL</strong></div>
              <b>READY</b>
            </div>
            <div className="ai-path-connector"><span /></div>
            <div className="ai-path-node is-active">
              <span><Code2 size={18} /></span>
              <div><small>02 · BUILD</small><strong>Python pipelines</strong></div>
              <b>NEXT</b>
            </div>
            <div className="ai-path-connector"><span /></div>
            <div className="ai-path-node">
              <span><BrainCircuit size={18} /></span>
              <div><small>03 · MODEL</small><strong>Machine learning</strong></div>
              <b>LOCKED</b>
            </div>
            <div className="ai-path-connector"><span /></div>
            <div className="ai-path-node">
              <span><Sparkles size={18} /></span>
              <div><small>04 · SHIP</small><strong>LLM applications</strong></div>
              <b>LOCKED</b>
            </div>
          </div>
          <footer><span>PATH_04</span><span>PROJECT BASED</span><span>SELF PACED</span></footer>
        </aside>
      </section>
      <section className="welcome-next" aria-labelledby="welcome-next-title">
        <div className="welcome-section-heading">
          <span className="system-label">HOW DATAPATH WORKS</span>
          <h2 id="welcome-next-title">A direct route from concepts to shipped work.</h2>
        </div>
        <ol>
          <li><span className="landing-next-icon"><Network size={19} /></span><strong>Map your stack</strong><p>Choose a role or focus skill. DataPath connects the prerequisites and removes what you already know.</p></li>
          <li><span className="landing-next-icon"><BrainCircuit size={19} /></span><strong>Learn in context</strong><p>Follow a plan built around your level, industry, schedule, and preferred depth.</p></li>
          <li><span className="landing-next-icon"><Code2 size={19} /></span><strong>Prove it by building</strong><p>Practise in real runtimes, complete projects, and collect evidence of what you can do.</p></li>
        </ol>
      </section>
    </div>
  );
}
