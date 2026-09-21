import { copy } from "./catalog";
// Authored cases: stable prompts, never model-generated curricula or interview banks.
export const interviewCases = {
  sql: copy(
    "A LEFT JOIN doubles reported revenue. How would you identify the cause, fix the query and prove totals are correct?",
    "ربط LEFT JOIN ضاعف الإيرادات المعلنة. كيف تحدد السبب وتصلح الاستعلام وتثبت صحة المجاميع؟"
  ),
  python: copy(
    "A CSV transformation runs out of memory at 5 GB. Explain how you would profile it, process it safely and test equivalence.",
    "تحويل ملف CSV بحجم ٥ جيجابايت يستنفد الذاكرة. كيف تقيس الأداء وتعالجه بأمان وتختبر تكافؤ النتائج؟"
  ),
  excel: copy(
    "A weekly workbook has manual copy-paste steps and inconsistent totals. Design a repeatable refresh and reconciliation process.",
    "ملف أسبوعي يعتمد على النسخ اليدوي ومجاميعه غير متسقة. صمم تحديثاً قابلاً للتكرار وعملية مطابقة."
  ),
  statistics: copy(
    "A campaign has a higher average conversion rate but a wide confidence interval. What can you conclude, and what data would you request?",
    "حملة لها متوسط تحويل أعلى وفترة ثقة واسعة. ما استنتاجك وما البيانات التي ستطلبها؟"
  ),
  cleaning: copy(
    "Customer age is missing in 30% of records, mostly in one channel. How would you investigate and choose a defensible treatment?",
    "العمر مفقود في ٣٠٪ من سجلات العملاء، معظمها من قناة واحدة. كيف تحقق وتختار معالجة يمكن تبريرها؟"
  ),
  powerbi: copy(
    "A DAX measure changes unexpectedly when a slicer is applied. Walk through the model, filter context and a validation approach.",
    "مقياس DAX يتغير بصورة غير متوقعة عند تطبيق مرشح. اشرح فحص النموذج وسياق التصفية والتحقق."
  ),
  tableau: copy(
    "A dashboard displays different totals at different levels of detail. Explain how you would investigate calculations and aggregation.",
    "لوحة تعرض مجاميع مختلفة عند مستويات تفاصيل مختلفة. كيف تحقق في الحسابات والتجميع؟"
  ),
  storytelling: copy(
    "An executive wants one slide on falling retention. What would you show, what uncertainty would you disclose and what decision would you ask for?",
    "مدير تنفيذي يريد شريحة عن انخفاض الاحتفاظ. ماذا تعرض وما عدم اليقين الذي توضحه وأي قرار تطلب؟"
  ),
  business: copy(
    "Two stakeholders disagree on the definition of an active customer. How would you resolve the requirement and document acceptance criteria?",
    "طرفان يختلفان حول تعريف العميل النشط. كيف تحسم المتطلب وتوثق معايير القبول؟"
  ),
  experimentation: copy(
    "An A/B test improves clicks but reduces completed purchases. How would you assess the result and make a launch recommendation?",
    "اختبار A/B يزيد النقرات ويقلل الشراء المكتمل. كيف تقيّم النتيجة وتوصي بقرار الإطلاق؟"
  ),
  modeling: copy(
    "Design an order-line fact table with customers who change address. Explain grain, keys and historical dimension handling.",
    "صمم جدول حقائق لبنود الطلبات مع عملاء يغيرون عناوينهم. اشرح مستوى التفاصيل والمفاتيح والتعامل مع تاريخ الأبعاد."
  ),
  pipelines: copy(
    "An ingestion job crashes after writing half its batch. How would you rerun it without loss or duplication and prove recovery?",
    "مهمة إدخال تعطلت بعد كتابة نصف الدفعة. كيف تعيد تشغيلها دون فقد أو تكرار وتثبت التعافي؟"
  ),
  dbt: copy(
    "An incremental dbt model misses late-arriving updates. Design a fix, tests and a safe backfill.",
    "نموذج dbt تزايدي يفوت تحديثات متأخرة. صمم إصلاحاً واختبارات وتعبئة آمنة للبيانات السابقة."
  ),
  airflow: copy(
    "A daily DAG depends on an unreliable API. Explain timeouts, retries, backfills, secret handling and alerting.",
    "مخطط يومي يعتمد على API غير موثوق. اشرح حدود الوقت وإعادة المحاولة والتعبئة وإدارة الأسرار والتنبيهات."
  ),
  spark: copy(
    "One Spark task takes much longer than the rest during a join. How would you diagnose skew and compare mitigation options?",
    "مهمة Spark تستغرق أكثر بكثير من غيرها أثناء الربط. كيف تشخص الانحراف وتقارن حلول المعالجة؟"
  ),
  kafka: copy(
    "A consumer restarts after processing a message but before committing its offset. What can happen, and how do you make the effect safe?",
    "مستهلك يعاد تشغيله بعد معالجة رسالة وقبل تثبيت الإزاحة. ما الذي قد يحدث وكيف تجعل الأثر آمناً؟"
  ),
  cloud: copy(
    "A data workload has unpredictable cost spikes. Explain how you would attribute costs, set controls and preserve reliability.",
    "حمل بيانات له ارتفاعات تكلفة غير متوقعة. كيف تنسب التكاليف وتضع ضوابط وتحافظ على الموثوقية؟"
  ),
  engineering: copy(
    "A container works locally but fails in CI. How would you investigate configuration, dependencies and reproducibility without exposing secrets?",
    "حاوية تعمل محلياً وتفشل في التكامل المستمر. كيف تفحص الإعدادات والاعتماديات وإمكانية التكرار دون كشف أسرار؟"
  ),
  ml: copy(
    "A model has 99% accuracy on a dataset with 1% fraud. Explain why that is insufficient and propose an evaluation and threshold strategy.",
    "نموذج دقته ٩٩٪ على بيانات نسبة الاحتيال فيها ١٪. لماذا لا يكفي ذلك؟ اقترح تقييماً واستراتيجية للعتبة."
  ),
  deep: copy(
    "Training loss falls while validation loss rises. Explain possible causes, experiments and how you would avoid selecting on the test set.",
    "خسارة التدريب تنخفض وخسارة التحقق ترتفع. اشرح الأسباب المحتملة والتجارب وكيف تتجنب الاختيار باستخدام مجموعة الاختبار."
  ),
  genai: copy(
    "A RAG assistant confidently cites an irrelevant document. Design a retrieval and answer-quality evaluation, including prompt-injection tests.",
    "مساعد RAG يستشهد بثقة بوثيقة غير مرتبطة. صمم تقييماً للاسترجاع وجودة الإجابة يشمل اختبارات حقن التعليمات."
  ),
  mlops: copy(
    "Prediction quality drops after deployment but input schemas have not changed. Explain drift monitoring, diagnosis and rollback criteria.",
    "جودة التنبؤ تنخفض بعد النشر رغم ثبات المخطط. اشرح مراقبة الانحراف والتشخيص ومعايير التراجع."
  ),
  governance: copy(
    "A critical metric has no owner and three competing definitions. Propose a stewardship process, decision rights and adoption measures.",
    "مقياس حاسم بلا مالك وله ثلاثة تعريفات متنافسة. اقترح عملية إشراف وصلاحيات قرار ومقاييس تبنٍّ."
  ),
  quality: copy(
    "A source sends duplicate IDs and late records. Define quality checks, severity, ownership and a remediation workflow.",
    "مصدر يرسل معرفات مكررة وسجلات متأخرة. عرّف فحوص الجودة والخطورة والملكية ومسار المعالجة."
  ),
  architecture: copy(
    "A team needs both hourly BI reports and low-latency operational analytics. Compare architecture options and their cost, consistency and recovery tradeoffs.",
    "فريق يحتاج تقارير أعمال كل ساعة وتحليلات تشغيلية منخفضة التأخير. قارن البنى ومفاضلات التكلفة والاتساق والتعافي."
  ),
  database: copy(
    "A production database is slow during peak traffic. How would you investigate queries, locks and indexes before making a safe change?",
    "قاعدة إنتاج بطيئة في الذروة. كيف تفحص الاستعلامات والأقفال والفهارس قبل إجراء تغيير آمن؟"
  ),
  product: copy(
    "A stakeholder asks for an AI feature with no defined user problem. How would you discover value, choose an MVP and set success and stop criteria?",
    "طرف يطلب ميزة ذكاء اصطناعي دون مشكلة مستخدم محددة. كيف تكتشف القيمة وتختار نسخة أولية وتحدد النجاح والتوقف؟"
  ),
  privacy: copy(
    "A team wants to reuse customer data for a new AI feature. What purpose, access, minimization and risk questions must be resolved first?",
    "فريق يريد إعادة استخدام بيانات العملاء لميزة ذكاء اصطناعي. ما أسئلة الغرض والوصول وتقليل البيانات والمخاطر التي يجب حسمها أولاً؟"
  ),
};
