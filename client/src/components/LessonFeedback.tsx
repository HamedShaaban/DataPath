import { useState } from "react";
export function LessonFeedback({
  topicId,
  title,
}: {
  topicId: string;
  title: string;
}) {
  const [category, setCategory] = useState("Explanation is confusing");
  const [message, setMessage] = useState("");
  const [downloaded, setDownloaded] = useState(false);
  function download() {
    const text = `DataPath lesson feedback\nLesson: ${title}\nTopic ID: ${topicId}\nCategory: ${category}\nCreated: ${new Date().toISOString()}\n\n${message.trim()}\n`;
    const url = URL.createObjectURL(
      new Blob([text], { type: "text/plain;charset=utf-8" })
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `datapath-feedback-${topicId}.txt`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setDownloaded(true);
  }
  return (
    <details className="lesson-feedback">
      <summary>Something unclear? Give feedback on this lesson</summary>
      <div>
        <p>
          Tell us what you expected and where you got stuck. This creates a file
          for you to share; it does not send a message or include your account
          details. Drafts last only while this lesson stays open in the current
          workspace.
        </p>
        <label>
          What needs attention?
          <select
            value={category}
            onChange={event => {
              setCategory(event.target.value);
              setDownloaded(false);
            }}
          >
            {[
              "Explanation is confusing",
              "Example seems incorrect",
              "Missing beginner explanation",
              "Resource link is broken",
              "Exercise does not match the lesson",
              "Other suggestion",
            ].map(item => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label>
          Your feedback
          <textarea
            value={message}
            maxLength={2000}
            rows={4}
            onChange={event => {
              setMessage(event.target.value);
              setDownloaded(false);
            }}
            placeholder="For example: I understand the filter, but I need a worked example showing how the total changes."
          />
        </label>
        <small>{message.length} / 2,000 characters</small>
        <button
          className="secondary"
          disabled={!message.trim()}
          onClick={download}
        >
          Download feedback report
        </button>
        {downloaded && (
          <p role="status">
            Download requested. Share the file with the site owner when you are
            ready; nothing was sent automatically.
          </p>
        )}
      </div>
    </details>
  );
}
