import { useState } from "react";
export function InterviewGuide({ arabic = false }: { arabic?: boolean }) {
  const [stage, setStage] = useState(0);
  const steps = arabic
    ? [
        [
          "افهم السؤال",
          "ابدأ بالقرار أو المشكلة. وضّح ما تعرفه وما تحتاج إلى سؤاله قبل اختيار الحل.",
          "ما الافتراض الذي قد يغيّر إجابتك؟",
        ],
        [
          "اشرح طريقتك",
          "اذكر خطوتين أو ثلاثاً بترتيب واضح. اربط كل خطوة بالهدف، ولا تكتفِ بسرد أسماء الأدوات.",
          "لماذا اخترت هذه الطريقة؟ وما البديل؟",
        ],
        [
          "تحقق من النتيجة",
          "استخدم مثالاً صغيراً، أو مقارنة مستقلة، أو حالة قد يفشل فيها الحل. في الأسئلة السلوكية، اشرح مساهمتك والنتيجة الفعلية.",
          "كيف ستكتشف أن نتيجتك خاطئة؟",
        ],
        [
          "اختم بوضوح",
          "لخّص الاستنتاج وحدوده والخطوة التالية. استخدم موقفاً دراسياً إن لم تكن لديك خبرة مهنية، واذكر ذلك بصراحة.",
          "ما الذي ستغيّره إذا كان لديك وقت أو بيانات إضافية؟",
        ],
      ]
    : [
        [
          "Clarify the problem",
          "Start with the decision or problem. Say what you know and what you would ask before choosing a solution.",
          "Which assumption could change your answer?",
        ],
        [
          "Explain your approach",
          "Give two or three steps in order. Connect each step to the goal instead of listing tools. For a past experience, describe what you actually did.",
          "Why this approach, and what alternative did you consider?",
        ],
        [
          "Check your result",
          "Use a small example, an independent comparison or an input that could break the solution. For a behavioural question, explain your contribution and the actual outcome.",
          "How would you discover that your conclusion was wrong?",
        ],
        [
          "State the outcome and limits",
          "Finish with a conclusion, its limitations and the next action. If you lack work experience, use a study project and say so honestly.",
          "What would you change with more time or better data?",
        ],
      ];
  return (
    <details className="interview-guide">
      <summary>
        {arabic
          ? "تحتاج مساعدة لتنظيم إجابتك؟"
          : "Need help structuring your answer?"}
      </summary>
      <div className="interview-guide-body">
        <p>
          {arabic
            ? "تدرّب دون مؤقت أولاً. هذه أسئلة إرشادية وليست إجابة نموذجية أو تقييماً آلياً."
            : "Practise without the timer first. These prompts guide your thinking; they are not a model answer or an automatic assessment."}
        </p>
        <div
          className="review-filters"
          role="group"
          aria-label={arabic ? "خطوات الإجابة" : "Answer stages"}
        >
          {steps.map(([title], index) => (
            <button
              key={title}
              className={stage === index ? "chip selected" : "chip"}
              aria-pressed={stage === index}
              onClick={() => setStage(index)}
            >
              {index + 1}. {title}
            </button>
          ))}
        </div>
        <div aria-live="polite">
          <h3>{steps[stage][0]}</h3>
          <p>{steps[stage][1]}</p>
          <strong>
            {arabic ? "سؤال متابعة للتدرب:" : "Rehearse a follow-up:"}
          </strong>
          <p>{steps[stage][2]}</p>
        </div>
        <small>
          {arabic
            ? "اكتب إجابتك في الحقل أدناه؛ لا يُسجَّل تصفح هذه الخطوات كإجابة."
            : "Write your response in the answer field below. Browsing these prompts does not count as an interview answer."}
        </small>
      </div>
    </details>
  );
}
