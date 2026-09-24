import { careers, businessSectors } from "@shared/catalog";
import { useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Code2,
  Compass,
  Layers3,
} from "lucide-react";

export function CareerLanding({ onStart }: { onStart: () => void }) {
  const [answer, setAnswer] = useState<number | null>(null);
  return (
    <div className="career-landing">
      <div className="landing-nav">
        <a className="brand" href="#">
          <Layers3 /> DataPath<span>.</span>
        </a>
        <span>AMBITION → ABILITY</span>
        <button className="secondary" onClick={onStart}>
          Build my path <ArrowUpRight size={16} />
        </button>
      </div>
      <section className="landing-hero">
        <div className="landing-copy">
          <div className="eyebrow">YOUR CAREER. BUILT THROUGH PRACTICE.</div>
          <h1>
            Your next data role starts with <em>what you can do.</em>
          </h1>
          <p>
            Choose your direction. Practise with industry scenarios. Turn what
            you learn into work you can show.
          </p>
          <div className="landing-actions">
            <button className="primary" onClick={onStart}>
              Find my path <ArrowRight size={18} />
            </button>
            <a href="#first-challenge">Try a quick challenge ↗</a>
          </div>
          <small>
            No coding experience needed · Start as a guest · Learn at your pace
          </small>
        </div>
        <div
          className="career-map"
          aria-label="Example journey from learning to a portfolio"
        >
          <div className="map-top">
            <span>YOUR NEXT CHAPTER</span>
            <Compass size={22} />
          </div>
          <div className="map-destination">
            <small>CHOOSE A DIRECTION</small>
            <h2>
              From curious
              <br />
              to capable.
            </h2>
          </div>
          <ol>
            {[
              [
                "01",
                "Learn the foundations",
                "A path shaped around your goals",
              ],
              ["02", "Make it work", "SQL, Python, spreadsheets & more"],
              ["03", "Build your evidence", "Projects that tell your story"],
            ].map(([n, title, sub]) => (
              <li key={n}>
                <span>{n}</span>
                <div>
                  <strong>{title}</strong>
                  <small>{sub}</small>
                </div>
                <ArrowUpRight size={18} />
              </li>
            ))}
          </ol>
          <div className="map-footer">
            <span className="live-dot" /> One focused step at a time
          </div>
        </div>
      </section>
      <div className="landing-facts">
        <div>
          <strong>{careers.length}</strong>
          <span>career directions</span>
        </div>
        <div>
          <strong>{businessSectors.length}</strong>
          <span>industry contexts</span>
        </div>
        <div>
          <strong>Your pace</strong>
          <span>a plan that fits your week</span>
        </div>
      </div>
      <section className="landing-challenge" id="first-challenge">
        <div>
          <div className="eyebrow">GET A FEEL FOR IT · 30 SECONDS</div>
          <h2>
            Small challenge.
            <br />
            Real analytical thinking.
          </h2>
          <p>
            A shop needs its completed sales total. Pending orders don’t count.
            What should the report show?
          </p>
          <span className="sample-label">
            Sample exercise · no progress recorded
          </span>
        </div>
        <div className="challenge-demo">
          <div className="demo-title">
            <Code2 size={18} />
            <strong>Your first investigation</strong>
            <span>RETAIL</span>
          </div>
          <table>
            <caption className="sr-only">Sample retail orders</caption>
            <thead>
              <tr>
                <th>Order</th>
                <th>Status</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>#101</td>
                <td>Completed</td>
                <td>$120</td>
              </tr>
              <tr>
                <td>#102</td>
                <td>Pending</td>
                <td>$80</td>
              </tr>
              <tr>
                <td>#103</td>
                <td>Completed</td>
                <td>$60</td>
              </tr>
            </tbody>
          </table>
          <div
            className="demo-answers"
            role="group"
            aria-label="Choose the completed sales total"
          >
            {[260, 180, 120].map(value => (
              <button
                key={value}
                aria-pressed={answer === value}
                className={answer === value ? "chosen" : ""}
                onClick={() => setAnswer(value)}
              >
                ${value}
              </button>
            ))}
          </div>
          <div className="demo-feedback" aria-live="polite">
            {answer === null ? (
              "Choose a total to check your reasoning."
            ) : answer === 180 ? (
              <>
                <Check size={16} /> Exactly. $120 + $60 = $180. Filter by status
                before adding.
              </>
            ) : (
              "Try again: exclude the $80 pending order, then add both completed orders."
            )}
          </div>
        </div>
      </section>
      {answer === 180 && (
        <button className="primary" onClick={onStart}>
          Learn how to do this, step by step →
        </button>
      )}
      <section className="landing-evidence">
        <div>
          <div className="eyebrow">BUILD SOMETHING YOU CAN TALK ABOUT</div>
          <h2>Make your learning visible.</h2>
          <p>
            Your chosen career and industry shape the work ahead. Practise a
            skill, build a project, then prepare to explain your decisions.
          </p>
          <button className="primary" onClick={onStart}>
            Make my next move <ArrowRight size={18} />
          </button>
        </div>
        <article className="portfolio-preview">
          <span>EXAMPLE PROJECT DIRECTION</span>
          <h3>
            Retail performance
            <br />
            investigation
          </h3>
          <div className="preview-bars" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
          </div>
          <p>
            Clean the data. Find the pattern. Explain what the business should
            do next.
          </p>
          <div className="preview-tags">
            <span>Analysis</span>
            <span>Visualisation</span>
            <span>Business story</span>
          </div>
        </article>
      </section>
      <footer className="landing-footer">
        <strong>DataPath.</strong>
        <span>Your ambition deserves a direction.</span>
        <button onClick={onStart}>
          Start your journey <ArrowUpRight size={16} />
        </button>
      </footer>
    </div>
  );
}
