import { useState } from "react";
import { businessSectors, careers, skills, skillById } from "@shared/catalog";
import { learningPathTitle, makePlan, requirements, type LearningState, type Profile } from "@shared/learning";
import { fitRecommendedPace, recommendPaths } from "@shared/path-recommendation";

export function GuidedSetup({ state, done, cancel }: { state: LearningState; done: (profile: Profile) => void; cancel?: () => void }) {
  const [profile, setProfile] = useState<Profile>(() => structuredClone(state.profile));
  const [step, setStep] = useState(0);
  const [interest, setInterest] = useState("analytics");
  const [coding, setCoding] = useState(1);
  const [automatic, setAutomatic] = useState(true);
  const [error, setError] = useState("");
  const patch = (change: Partial<Profile>) => setProfile(p => ({ ...p, ...change }));
  const draft = { ...state, profile };
  const plan = makePlan(draft);
  const matches = recommendPaths(profile, interest, coding);
  const titles = ["Your goal", "Your starting point", "Your study time", "Your recommended path"];
  function next() {
    setError("");
    if (step === 2) {
      if (!Number.isInteger(profile.hoursPerWeek) || profile.hoursPerWeek < 1 || profile.hoursPerWeek > 60 || !Number.isInteger(profile.weeks) || profile.weeks < 1 || profile.weeks > 104) {
        setError("Choose 1–60 hours per week and a target of 1–104 weeks."); return;
      }
      const selected = { ...profile, role: profile.learningMode === "career" ? matches[0].role.id : profile.role };
      setProfile(automatic ? fitRecommendedPace({ ...state, profile: selected }) : selected);
    }
    if (step === 3) done(profile); else setStep(step + 1);
  }
  return <section className="guided-setup" aria-labelledby="setup-heading">
    <p className="setup-step">Step {step + 1} of 4</p>
    <h1 id="setup-heading">{titles[step]}</h1>
    <p>Answer a few questions to shape your learning plan. You can change it later in settings.</p>
    <form onSubmit={event => { event.preventDefault(); next(); }}>
      {step === 0 && <>
        <label>What do you want to learn?<select value={profile.learningMode} onChange={e => patch({ learningMode: e.target.value as Profile["learningMode"], skillTargets: {} })}><option value="career">Prepare for a data career</option><option value="skill">Learn one tool, skill, or language</option></select></label>
        {profile.learningMode === "career" ? <>
          <label>What kind of work interests you?<select value={interest} onChange={e => setInterest(e.target.value)}><option value="analytics">Explore data and find patterns</option><option value="business">Help teams make business decisions</option><option value="engineering">Build data systems and pipelines</option><option value="ai">Build machine learning and AI systems</option><option value="governance">Improve data quality and governance</option></select></label>
          <label>How much coding would you like to do?<select value={coding} onChange={e => setCoding(Number(e.target.value))}><option value={0}>Prefer tools with little coding</option><option value={1}>Some coding alongside analysis</option><option value={2}>Coding is a main interest</option></select></label>
        </> : <>
          <label>Which skill?<select value={profile.focusSkill} onChange={e => patch({ focusSkill: e.target.value })}>{skills.map(s => <option key={s.id} value={s.id}>{s.title.en}</option>)}</select></label>
          <label>How deep would you like to go?<select value={profile.targetLevel} onChange={e => patch({ targetLevel: Number(e.target.value) })}><option value={1}>Foundations</option><option value={2}>Practical intermediate skills</option><option value={3}>Advanced techniques</option></select></label>
        </>}
        <label>Why are you learning?<select value={profile.motivation} onChange={e => patch({ motivation: e.target.value as Profile["motivation"] })}><option value="start">Start my first career</option><option value="switch">Change careers</option><option value="grow">Improve in my current role</option></select></label>
        <label>Which industry should the practice examples use?<select value={profile.sector} onChange={e => patch({ sector: e.target.value as Profile["sector"] })}>{businessSectors.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}</select></label>
      </>}
      {step === 1 && <>
        <label>Your experience with data<select value={profile.experience} onChange={e => patch({ experience: e.target.value as Profile["experience"] })}><option value="new">Completely new</option><option value="junior">Some study or beginner projects</option><option value="mid">Regular professional use</option><option value="expert">Advanced professional use</option></select></label>
        <p>Leave skills at “New to this” if unsure. These are self-ratings, not verified achievements. Higher levels remove earlier lessons from your plan.</p>
        <details><summary>Set my current skill levels (optional)</summary>{skills.map(s => <label key={s.id}>{s.title.en}<select value={profile.assessment[s.id] ?? 0} onChange={e => patch({ assessment: { ...profile.assessment, [s.id]: Number(e.target.value) } })}><option value={0}>New to this</option><option value={1}>Comfortable with foundations</option><option value={2}>Can use it independently</option><option value={3}>Advanced experience</option></select></label>)}</details>
      </>}
      {step === 2 && <>
        <label>Hours you can realistically study each week<input type="number" min={1} max={60} required value={profile.hoursPerWeek} onChange={e => patch({ hoursPerWeek: Number(e.target.value) })} /></label>
        <label>How should we set your schedule?<select value={automatic ? "auto" : "manual"} onChange={e => setAutomatic(e.target.value === "auto")}><option value="auto">Recommend a duration for my available time</option><option value="manual">I have a target date</option></select></label>
        {!automatic && <label>Target duration in weeks<input type="number" min={1} max={104} required value={profile.weeks} onChange={e => patch({ weeks: Number(e.target.value) })} /></label>}
        <label>Resource budget<select value={profile.resources} onChange={e => patch({ resources: e.target.value as Profile["resources"] })}><option value="free">Free resources only</option><option value="mixed">Free and paid resources</option></select></label>
        <label>Learning language<select value={profile.language} onChange={e => patch({ language: e.target.value as Profile["language"] })}><option value="en">English</option><option value="ar">Arabic</option></select></label>
      </>}
      {step === 3 && <>
        <h2>{learningPathTitle(profile).en}</h2>
        {profile.learningMode === "career" && <>
          <p>Suggested from your preferred work, coding interest, and self-rated skills. This is a curriculum match, not a prediction of job success.</p>
          <ul>{matches.find(m => m.role.id === profile.role)?.reasons.map(reason => <li key={reason}>{reason}</li>)}</ul>
          <label>Keep this career or choose another<select value={profile.role} onChange={e => { const nextProfile = { ...profile, role: e.target.value }; setProfile(automatic ? fitRecommendedPace({ ...state, profile: nextProfile }) : nextProfile); }}>{careers.map(c => <option value={c.id} key={c.id}>{c.title.en}{matches[0].role.id === c.id ? " (suggested)" : ""}</option>)}</select></label>
        </>}
        <p>{plan.topics.filter(t => !t.done).length} remaining topics · {plan.remainingHours} estimated hours · {profile.hoursPerWeek} hours per week</p>
        <p>Your target: {profile.weeks} weeks. {automatic ? "Includes approximately 15% extra time for review, up to a 104-week planning window." : "Uses your chosen target."} This is an estimate, not a deadline.</p>
        {!plan.feasible && <p role="status">This workload needs about {plan.recommendedWeeks} weeks at your available pace. Go back to adjust your schedule or start with a narrower skill.</p>}
        <h3>Skills in your plan</h3><ul>{Object.entries(requirements(profile)).map(([id, level]) => <li key={id}>{skillById[id].title.en}: {['', 'foundations', 'intermediate', 'advanced'][level]}</li>)}</ul>
        <p>Industry examples: {businessSectors.find(s => s.id === profile.sector)?.title}. Your earlier lessons are adjusted to the skill levels you reported. Projects and practice follow the selected path.</p>
      </>}
      {error && <p role="alert">{error}</p>}
      <div className="welcome-actions"><button type="button" className="secondary" onClick={() => step ? setStep(step - 1) : cancel?.()} disabled={!step && !cancel}>Back</button><button type="submit" className="primary">{step === 3 ? "Use this learning path" : "Continue"}</button></div>
    </form>
  </section>;
}
