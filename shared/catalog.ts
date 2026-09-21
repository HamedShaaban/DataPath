export type Lang = "en" | "ar";
export type Copy = { en: string; ar: string };
export const copy = (en: string, ar: string): Copy => ({ en, ar });
export interface Topic {
  id: string;
  title: Copy;
  level: number;
  hours: number;
  prerequisites: string[];
}
export interface Skill {
  id: string;
  title: Copy;
  topics: Topic[];
  resource: {
    title: string;
    url: string;
    language: "en" | "both";
    cost: "free";
  };
}
export interface Career {
  id: string;
  title: Copy;
  description: Copy;
  family: string;
  requirements: Record<string, number>;
}
export const businessSectors = [
  {
    id: "banking",
    title: "Banking",
    context:
      "Learn how deposits, lending, payments, credit risk and regulatory reporting create and use data.",
    metrics: [
      "approval rate",
      "default rate",
      "net interest margin",
      "fraud loss",
      "customer lifetime value",
    ],
    knowledge: [
      "retail and corporate banking products",
      "credit lifecycle and risk",
      "KYC / AML controls",
      "financial reconciliation",
      "data privacy and audit trails",
    ],
    project:
      "Build a lending or transaction-risk analysis with explainable decisions and control checks.",
  },
  {
    id: "finance",
    title: "Finance & investment",
    context:
      "Understand financial statements, markets, portfolios, forecasting and the controls behind financial decisions.",
    metrics: ["revenue growth", "margin", "cash flow", "return", "volatility"],
    knowledge: [
      "income statement, balance sheet and cash flow",
      "budgeting and forecasting",
      "portfolio and market risk",
      "valuation basics",
      "financial controls",
    ],
    project:
      "Create an auditable performance and forecast model with scenarios and risk commentary.",
  },
  {
    id: "marketing",
    title: "Marketing & advertising",
    context:
      "Connect acquisition, campaign, channel and customer behavior data to profitable growth decisions.",
    metrics: [
      "conversion rate",
      "CAC",
      "ROAS",
      "retention",
      "incremental lift",
    ],
    knowledge: [
      "funnels and attribution",
      "segmentation",
      "campaign experimentation",
      "customer lifecycle",
      "privacy and consent",
    ],
    project:
      "Evaluate a campaign or acquisition funnel and recommend where to change spend.",
  },
  {
    id: "healthcare",
    title: "Healthcare",
    context:
      "Work with clinical, operational and claims data while protecting patient safety and confidentiality.",
    metrics: [
      "readmission rate",
      "length of stay",
      "utilisation",
      "claim denial rate",
      "care outcome",
    ],
    knowledge: [
      "clinical and claims workflows",
      "health data terminology",
      "quality and safety measures",
      "privacy and access control",
      "bias and population differences",
    ],
    project:
      "Analyse care operations or outcomes with explicit privacy, bias and clinical-safety limitations.",
  },
  {
    id: "retail",
    title: "Retail & e-commerce",
    context:
      "Use product, order, inventory and customer data to improve commercial and fulfilment decisions.",
    metrics: [
      "conversion rate",
      "average order value",
      "sell-through",
      "stockout rate",
      "repeat purchase rate",
    ],
    knowledge: [
      "merchandising and assortment",
      "inventory flow",
      "pricing and promotions",
      "customer cohorts",
      "fulfilment and returns",
    ],
    project:
      "Build a commercial performance view that connects demand, inventory and customer behavior.",
  },
  {
    id: "technology",
    title: "Technology & SaaS",
    context:
      "Measure digital products, subscriptions and platform reliability across the customer lifecycle.",
    metrics: ["activation", "retention", "MRR", "churn", "service reliability"],
    knowledge: [
      "product event data",
      "subscription economics",
      "experimentation",
      "software delivery lifecycle",
      "observability and incident analysis",
    ],
    project:
      "Diagnose activation or retention and design an experiment with guardrail metrics.",
  },
  {
    id: "telecom",
    title: "Telecommunications",
    context:
      "Connect network, billing and customer data to improve service quality and retention.",
    metrics: [
      "churn",
      "ARPU",
      "dropped-call rate",
      "network availability",
      "first-call resolution",
    ],
    knowledge: [
      "subscriber lifecycle",
      "network performance",
      "billing and usage records",
      "service operations",
      "capacity planning",
    ],
    project:
      "Build a churn or service-quality analysis linking customer behavior with network signals.",
  },
  {
    id: "government",
    title: "Government & public services",
    context:
      "Use administrative and service data to improve equitable delivery, accountability and policy decisions.",
    metrics: [
      "service completion",
      "processing time",
      "coverage",
      "cost per case",
      "equity gap",
    ],
    knowledge: [
      "policy and service design",
      "administrative data quality",
      "public accountability",
      "accessibility and inclusion",
      "privacy and records governance",
    ],
    project:
      "Evaluate a public service outcome with transparent methodology and equity checks.",
  },
  {
    id: "general",
    title: "Not sure / cross-industry",
    context:
      "Build portable data skills using common business processes before specialising in one industry.",
    metrics: [
      "quality",
      "cycle time",
      "cost",
      "growth",
      "customer satisfaction",
    ],
    knowledge: [
      "business models",
      "process mapping",
      "metric design",
      "stakeholder decisions",
      "privacy and data governance",
    ],
    project:
      "Solve a public-data business case and clearly explain the decision, evidence and limitations.",
  },
] as const;
export const sectorById = Object.fromEntries(
  businessSectors.map(sector => [sector.id, sector])
);
export const catalogVersion = "2026.09.19";
const definitions: Array<
  [string, string, string, string, string, string, string, string]
> = [
  [
    "sql",
    "SQL",
    "SQL",
    "SELECT and WHERE|التحديد والتصفية;GROUP BY and HAVING|التجميع وشروطه;INNER and LEFT JOIN|الربط الداخلي والخارجي",
    "Subqueries and CTEs|الاستعلامات الفرعية وCTE;Window functions|الدوال النافذية;NULLs and deduplication|القيم الفارغة وإزالة التكرار",
    "Execution plans|خطط التنفيذ;Indexes and optimization|الفهارس وتحسين الأداء;Transactions and isolation|المعاملات والعزل",
    "https://www.postgresql.org/docs/current/tutorial.html",
    "PostgreSQL tutorial",
  ],
  [
    "python",
    "Python",
    "Python",
    "Variables and collections|المتغيرات والمجموعات;Functions and control flow|الدوال والتحكم;Files and exceptions|الملفات والاستثناءات",
    "Pandas transformations|تحويل البيانات باستخدام Pandas;Testing functions|اختبار الدوال;APIs and environments|واجهات API والبيئات",
    "Profiling and memory|قياس الأداء والذاكرة;Packaging reusable code|بناء حزم قابلة لإعادة الاستخدام;Concurrency patterns|أنماط التزامن",
    "https://docs.python.org/3/tutorial/",
    "Python tutorial",
  ],
  [
    "excel",
    "Excel",
    "Excel",
    "Tables and data types|الجداول وأنواع البيانات;Formulas and references|الصيغ والمراجع;Sorting and filtering|الترتيب والتصفية",
    "Pivot tables|الجداول المحورية;Lookups and validation|البحث والتحقق;Power Query transformations|تحويلات Power Query",
    "Data models and measures|نماذج البيانات والمقاييس;Scenario analysis|تحليل السيناريوهات;Auditable reporting|تقارير قابلة للتدقيق",
    "https://support.microsoft.com/en-us/excel",
    "Microsoft Excel help",
  ],
  [
    "statistics",
    "Statistics",
    "الإحصاء",
    "Distributions and summaries|التوزيعات والملخصات;Sampling and bias|العينات والتحيز;Probability fundamentals|أساسيات الاحتمالات",
    "Confidence intervals|فترات الثقة;Hypothesis tests|اختبارات الفرضيات;Regression and assumptions|الانحدار وافتراضاته",
    "Causal inference|الاستدلال السببي;Bayesian reasoning|الاستدلال البايزي;Time series diagnostics|تشخيص السلاسل الزمنية",
    "https://www.openintro.org/book/os/",
    "OpenIntro Statistics",
  ],
  [
    "cleaning",
    "Data cleaning",
    "تنظيف البيانات",
    "Missing values|القيم المفقودة;Types and parsing|الأنواع والتحليل;Duplicates and outliers|التكرارات والقيم المتطرفة",
    "Validation rules|قواعد التحقق;Reproducible transformations|تحويلات قابلة للتكرار;Reconciliation|مطابقة البيانات",
    "Quality monitoring|مراقبة الجودة;Schema drift|تغير مخطط البيانات;Root cause analysis|تحليل السبب الجذري",
    "https://pandas.pydata.org/docs/getting_started/intro_tutorials/",
    "Pandas tutorials",
  ],
  [
    "powerbi",
    "Power BI",
    "Power BI",
    "Import and transform|الاستيراد والتحويل;Relationships and grain|العلاقات ومستوى التفاصيل;Visual selection|اختيار المرئيات",
    "DAX measures|مقاييس DAX;Filter context|سياق التصفية;Accessible dashboards|لوحات معلومات متاحة للجميع",
    "Row-level security|أمان الصفوف;Performance tuning|تحسين الأداء;Deployment and refresh|النشر والتحديث",
    "https://learn.microsoft.com/en-us/training/powerplatform/power-bi",
    "Microsoft Learn Power BI",
  ],
  [
    "tableau",
    "Tableau",
    "Tableau",
    "Connect data|ربط البيانات;Dimensions and measures|الأبعاد والمقاييس;Charts and filters|الرسوم والمرشحات",
    "Calculated fields|الحقول المحسوبة;Table calculations|حسابات الجداول;Dashboard actions|إجراءات اللوحة",
    "Level of detail expressions|تعبيرات مستوى التفاصيل;Extract performance|أداء المستخرجات;Governed publishing|النشر المنضبط",
    "https://help.tableau.com/current/pro/desktop/en-us/default.htm",
    "Tableau documentation",
  ],
  [
    "storytelling",
    "Data storytelling",
    "سرد القصص بالبيانات",
    "Audience and decision|الجمهور والقرار;Chart selection|اختيار الرسم;Context and comparison|السياق والمقارنة",
    "Narrative structure|بناء القصة;Uncertainty communication|توضيح عدم اليقين;Executive summaries|الملخصات التنفيذية",
    "Persuasive recommendations|توصيات مقنعة;Stakeholder critique|مراجعة أصحاب المصلحة;Decision impact measurement|قياس أثر القرار",
    "https://analysisfunction.civilservice.gov.uk/policy-store/data-visualisation-charts/",
    "UK Analysis Function chart guidance",
  ],
  [
    "business",
    "Business analysis",
    "تحليل الأعمال",
    "Stakeholder discovery|تحديد أصحاب المصلحة;Requirements and scope|المتطلبات والنطاق;KPIs and metric definitions|تعريف مؤشرات الأداء",
    "Process mapping|رسم العمليات;Acceptance criteria|معايير القبول;Prioritization and tradeoffs|الأولويات والمفاضلات",
    "Benefits realization|تحقيق الفوائد;Operating models|نماذج التشغيل;Strategy and measurement|الاستراتيجية والقياس",
    "https://www.iiba.org/business-analysis-blogs/",
    "IIBA business analysis articles",
  ],
  [
    "experimentation",
    "Experimentation",
    "التجارب",
    "Hypotheses and metrics|الفرضيات والمقاييس;Random assignment|التوزيع العشوائي;Control groups|المجموعات الضابطة",
    "Power and sample size|القوة وحجم العينة;Guardrail metrics|مقاييس الحماية;Experiment analysis|تحليل التجربة",
    "Sequential testing|الاختبارات المتتابعة;Interference and bias|التداخل والتحيز;Causal designs|التصميمات السببية",
    "https://www.itl.nist.gov/div898/handbook/pri/pri.htm",
    "NIST experimental design",
  ],
  [
    "modeling",
    "Data modeling",
    "نمذجة البيانات",
    "Entities and keys|الكيانات والمفاتيح;Normalization|التطبيع;Grain and relationships|مستوى التفاصيل والعلاقات",
    "Star schemas|المخططات النجمية;Slowly changing dimensions|الأبعاد بطيئة التغير;Semantic models|النماذج الدلالية",
    "Domain modeling|نمذجة المجالات;Schema evolution|تطور المخطط;Model performance|أداء النموذج",
    "https://learn.microsoft.com/en-us/power-bi/guidance/star-schema",
    "Microsoft star schema guidance",
  ],
  [
    "pipelines",
    "ETL / ELT",
    "استخراج وتحويل وتحميل البيانات",
    "Batch ingestion|إدخال البيانات على دفعات;Transform and load|التحويل والتحميل;Idempotency|ثبات نتيجة إعادة التنفيذ",
    "Incremental loads|التحميل التزايدي;Backfills and retries|التعبئة السابقة وإعادة المحاولة;Data contracts|عقود البيانات",
    "Change data capture|التقاط التغييرات;Lineage and observability|تتبع المنشأ والمراقبة;Recovery design|تصميم التعافي",
    "https://learn.microsoft.com/en-us/azure/architecture/data-guide/relational-data/etl",
    "Microsoft ETL guide",
  ],
  [
    "dbt",
    "dbt",
    "dbt",
    "Sources and models|المصادر والنماذج;References and DAGs|المراجع ومخططات الاعتماد;Schema tests|اختبارات المخطط",
    "Incremental models|النماذج التزايدية;Snapshots|اللقطات;Documentation and lineage|التوثيق وتتبع المنشأ",
    "Macros and packages|الماكرو والحزم;CI and deployment|التكامل المستمر والنشر;Model optimization|تحسين النماذج",
    "https://docs.getdbt.com/docs/build/projects",
    "dbt documentation",
  ],
  [
    "airflow",
    "Airflow",
    "Airflow",
    "DAGs and tasks|المهام ومخططات الاعتماد;Scheduling|الجدولة;Task dependencies|اعتماد المهام",
    "Retries and backfills|إعادة المحاولة والتعبئة;Connections and secrets|الاتصالات والأسرار;Testing DAGs|اختبار المخططات",
    "Executor selection|اختيار المنفذ;Monitoring and SLAs|المراقبة واتفاقيات الخدمة;Scaling orchestration|توسيع التنسيق",
    "https://airflow.apache.org/docs/apache-airflow/stable/tutorial/index.html",
    "Apache Airflow tutorials",
  ],
  [
    "spark",
    "Apache Spark",
    "Apache Spark",
    "DataFrames and schemas|إطارات البيانات والمخططات;Transformations and actions|التحويلات والإجراءات;Partitions|الأقسام",
    "Joins and shuffles|الربط وإعادة التوزيع;Caching|التخزين المؤقت;Spark SQL|SQL في سبارك",
    "Skew optimization|تحسين انحراف البيانات;Structured streaming|البث المنظم;Cluster tuning|ضبط العناقيد",
    "https://spark.apache.org/docs/latest/sql-getting-started.html",
    "Apache Spark guide",
  ],
  [
    "kafka",
    "Streaming / Kafka",
    "البث وكافكا",
    "Topics and partitions|الموضوعات والأقسام;Producers and consumers|المنتجون والمستهلكون;Offsets|إزاحات القراءة",
    "Consumer groups|مجموعات المستهلكين;Delivery semantics|ضمانات التسليم;Schema compatibility|توافق المخططات",
    "Stream processing|معالجة التدفقات;Failure recovery|التعافي من الأعطال;Capacity planning|تخطيط السعة",
    "https://kafka.apache.org/documentation/",
    "Apache Kafka documentation",
  ],
  [
    "cloud",
    "Cloud platforms",
    "المنصات السحابية",
    "Storage and compute|التخزين والحوسبة;Identity and access|الهوية والوصول;Cost fundamentals|أساسيات التكلفة",
    "Warehouses and lakes|المستودعات والبحيرات;Network boundaries|حدود الشبكات;Infrastructure as code|البنية التحتية ككود",
    "Resilience and DR|المرونة والتعافي;Cost optimization|تحسين التكلفة;Architecture tradeoffs|مفاضلات البنية",
    "https://learn.microsoft.com/en-us/training/azure/",
    "Microsoft Learn Azure",
  ],
  [
    "engineering",
    "Git, Linux & Docker",
    "Git ولينكس وDocker",
    "Git commits and branches|الحفظ والفروع;Shell and files|الطرفية والملفات;Container basics|أساسيات الحاويات",
    "Code review and tests|مراجعة الكود والاختبارات;Images and networks|الصور والشبكات;CI pipelines|مسارات التكامل المستمر",
    "Reproducible deployments|نشر قابل للتكرار;Supply chain controls|ضوابط سلسلة التوريد;Incident response|الاستجابة للحوادث",
    "https://docs.docker.com/get-started/",
    "Docker getting started",
  ],
  [
    "ml",
    "Machine learning",
    "تعلم الآلة",
    "Train and test splits|تقسيم التدريب والاختبار;Baselines and metrics|خطوط الأساس والمقاييس;Regression and classification|الانحدار والتصنيف",
    "Cross validation|التحقق المتقاطع;Feature engineering|هندسة الخصائص;Imbalance and calibration|عدم التوازن والمعايرة",
    "Explainability and fairness|التفسير والإنصاف;Hyperparameter search|البحث عن المعلمات;Leakage and robustness|تسرب البيانات والمتانة",
    "https://scikit-learn.org/stable/user_guide.html",
    "scikit-learn user guide",
  ],
  [
    "deep",
    "Deep learning",
    "التعلم العميق",
    "Tensors and gradients|الموترات والتدرجات;Neural networks|الشبكات العصبية;Training loops|حلقات التدريب",
    "Regularization|التنظيم;Embeddings and attention|التضمينات والانتباه;Transfer learning|نقل التعلم",
    "Distributed training|التدريب الموزع;Model compression|ضغط النماذج;Evaluation and ablations|التقييم واختبارات الإزالة",
    "https://pytorch.org/tutorials/",
    "PyTorch tutorials",
  ],
  [
    "genai",
    "Generative AI / RAG",
    "الذكاء الاصطناعي التوليدي",
    "Tokens and context|الرموز والسياق;Prompt design|تصميم التعليمات;Structured outputs|المخرجات المنظمة",
    "Embeddings and retrieval|التضمينات والاسترجاع;RAG evaluation|تقييم التوليد المعزز;Tool calling|استدعاء الأدوات",
    "Prompt injection defenses|مقاومة حقن التعليمات;Quality and cost evaluation|تقييم الجودة والتكلفة;Human oversight|الإشراف البشري",
    "https://huggingface.co/learn/llm-course/chapter1/1",
    "Hugging Face LLM course",
  ],
  [
    "mlops",
    "MLOps",
    "عمليات تعلم الآلة",
    "Experiment tracking|تتبع التجارب;Model registry|سجل النماذج;Serving APIs|واجهات تقديم النماذج",
    "Model pipelines|مسارات النماذج;Monitoring and drift|المراقبة والانحراف;Deployment strategies|استراتيجيات النشر",
    "Feature stores|مخازن الخصائص;Rollback and retraining|التراجع وإعادة التدريب;Production reliability|موثوقية الإنتاج",
    "https://mlflow.org/docs/latest/index.html",
    "MLflow documentation",
  ],
  [
    "governance",
    "Data governance",
    "حوكمة البيانات",
    "Ownership and stewardship|الملكية والإشراف;Glossaries and catalogs|المسارد والفهارس;Classification|التصنيف",
    "Retention and access|الاحتفاظ والوصول;Lineage and policies|تتبع المنشأ والسياسات;Quality accountability|مسؤولية الجودة",
    "Governance operating model|نموذج تشغيل الحوكمة;Risk and audit evidence|المخاطر وأدلة التدقيق;Governance metrics|مقاييس الحوكمة",
    "https://learn.microsoft.com/en-us/purview/data-governance-overview",
    "Microsoft Purview governance",
  ],
  [
    "quality",
    "Data quality",
    "جودة البيانات",
    "Quality dimensions|أبعاد الجودة;Profiling|فحص البيانات;Rule definition|تعريف القواعد",
    "Automated checks|الفحوص الآلية;Issue triage|فرز المشكلات;Quality scorecards|بطاقات الجودة",
    "Quality SLAs|اتفاقيات مستوى الجودة;Prevention controls|ضوابط الوقاية;Continuous monitoring|المراقبة المستمرة",
    "https://docs.greatexpectations.io/docs/core/introduction/",
    "Great Expectations documentation",
  ],
  [
    "architecture",
    "Data architecture",
    "بنية البيانات",
    "Workload requirements|متطلبات الأحمال;System boundaries|حدود النظام;Storage patterns|أنماط التخزين",
    "Lakehouse and warehouse|البحيرة والمستودع;Integration patterns|أنماط التكامل;Security boundaries|حدود الأمان",
    "Consistency tradeoffs|مفاضلات الاتساق;Architecture decisions|قرارات البنية;Capacity and resilience|السعة والمرونة",
    "https://learn.microsoft.com/en-us/azure/architecture/data-guide/",
    "Microsoft data architecture guide",
  ],
  [
    "database",
    "Database administration",
    "إدارة قواعد البيانات",
    "Roles and permissions|الأدوار والصلاحيات;Backups and restores|النسخ والاستعادة;Database monitoring|مراقبة قواعد البيانات",
    "Index maintenance|صيانة الفهارس;Replication|النسخ المتماثل;Lock analysis|تحليل الأقفال",
    "Recovery drills|تدريبات التعافي;High availability|الإتاحة العالية;Capacity and upgrades|السعة والترقيات",
    "https://www.postgresql.org/docs/current/admin.html",
    "PostgreSQL administration",
  ],
  [
    "product",
    "Data product management",
    "إدارة منتجات البيانات",
    "Problem discovery|اكتشاف المشكلة;User outcomes|نتائج المستخدم;Product metrics|مقاييس المنتج",
    "Roadmap prioritization|تحديد أولويات الخطة;Experiment decisions|قرارات التجارب;Delivery and adoption|التسليم والتبني",
    "Product strategy|استراتيجية المنتج;AI risk evaluation|تقييم مخاطر الذكاء الاصطناعي;Portfolio decisions|قرارات محفظة المنتجات",
    "https://www.gov.uk/service-manual/agile-delivery",
    "GOV.UK agile delivery",
  ],
  [
    "privacy",
    "Privacy & responsible AI",
    "الخصوصية والذكاء الاصطناعي المسؤول",
    "Data minimization|تقليل البيانات;Consent and purpose|الموافقة والغرض;Bias awareness|الوعي بالتحيز",
    "Privacy by design|الخصوصية حسب التصميم;Risk assessments|تقييم المخاطر;Access reviews|مراجعة الوصول",
    "AI risk management|إدارة مخاطر الذكاء الاصطناعي;Assurance evidence|أدلة الضمان;Incident accountability|المساءلة عن الحوادث",
    "https://www.nist.gov/itl/ai-risk-management-framework",
    "NIST AI RMF",
  ],
];
export const skills: Skill[] = definitions.map(
  ([id, en, ar, b, i, a, url, title]) => ({
    id,
    title: copy(en, ar),
    resource: {
      title,
      url,
      language: url.includes("learn.microsoft") ? "both" : "en",
      cost: "free",
    },
    topics: [b, i, a].flatMap((group, li) =>
      group.split(";").map((pair, ti) => {
        const [en, ar] = pair.split("|");
        const index = li * 3 + ti;
        return {
          id: `${id}-${index + 1}`,
          title: copy(en, ar),
          level: li + 1,
          hours: [3, 5, 8][li],
          prerequisites: index ? [`${id}-${index}`] : [],
        };
      })
    ),
  })
);
export const skillById = Object.fromEntries(skills.map(s => [s.id, s]));
export const careers: Career[] = [
  {
    id: "data-analyst",
    title: { en: "Data Analyst", ar: "محلل بيانات" },
    description: {
      en: "Turn data into clear business decisions.",
      ar: "حوّل البيانات إلى قرارات أعمال واضحة.",
    },
    family: "analytics",
    requirements: {
      sql: 2,
      excel: 2,
      statistics: 2,
      cleaning: 2,
      powerbi: 2,
      storytelling: 2,
      business: 1,
    },
  },
  {
    id: "bi-analyst",
    title: { en: "BI Analyst", ar: "محلل ذكاء الأعمال" },
    description: {
      en: "Build trusted metrics and dashboards.",
      ar: "ابنِ مقاييس ولوحات معلومات موثوقة.",
    },
    family: "analytics",
    requirements: {
      sql: 2,
      modeling: 2,
      powerbi: 3,
      excel: 2,
      quality: 1,
      storytelling: 2,
    },
  },
  {
    id: "business-analyst",
    title: { en: "Data Business Analyst", ar: "محلل أعمال البيانات" },
    description: {
      en: "Connect stakeholder needs to data solutions.",
      ar: "اربط احتياجات أصحاب المصلحة بحلول البيانات.",
    },
    family: "business",
    requirements: {
      business: 3,
      excel: 2,
      sql: 1,
      storytelling: 3,
      product: 1,
      modeling: 1,
    },
  },
  {
    id: "product-analyst",
    title: { en: "Product Analyst", ar: "محلل منتجات" },
    description: {
      en: "Understand behavior and evaluate experiments.",
      ar: "افهم السلوك وقيّم التجارب.",
    },
    family: "analytics",
    requirements: {
      sql: 3,
      statistics: 3,
      experimentation: 3,
      python: 2,
      storytelling: 2,
      product: 2,
    },
  },
  {
    id: "analytics-engineer",
    title: { en: "Analytics Engineer", ar: "مهندس تحليلات" },
    description: {
      en: "Build tested, reusable analytical models.",
      ar: "ابنِ نماذج تحليلية مختبرة وقابلة لإعادة الاستخدام.",
    },
    family: "engineering",
    requirements: {
      sql: 3,
      modeling: 3,
      dbt: 3,
      engineering: 2,
      quality: 2,
      cloud: 2,
    },
  },
  {
    id: "data-engineer",
    title: { en: "Data Engineer", ar: "مهندس بيانات" },
    description: {
      en: "Deliver reliable pipelines and data platforms.",
      ar: "أنشئ مسارات ومنصات بيانات موثوقة.",
    },
    family: "engineering",
    requirements: {
      sql: 3,
      python: 3,
      modeling: 2,
      pipelines: 3,
      airflow: 2,
      spark: 2,
      kafka: 2,
      cloud: 2,
      engineering: 2,
    },
  },
  {
    id: "cloud-data-engineer",
    title: { en: "Cloud Data Engineer", ar: "مهندس بيانات سحابية" },
    description: {
      en: "Design resilient cloud data workloads.",
      ar: "صمّم أحمال بيانات سحابية مرنة.",
    },
    family: "engineering",
    requirements: {
      sql: 2,
      python: 2,
      pipelines: 3,
      cloud: 3,
      engineering: 3,
      architecture: 2,
      governance: 1,
    },
  },
  {
    id: "data-architect",
    title: { en: "Data Architect", ar: "معماري بيانات" },
    description: {
      en: "Design systems, standards and integration patterns.",
      ar: "صمّم الأنظمة والمعايير وأنماط التكامل.",
    },
    family: "engineering",
    requirements: {
      sql: 3,
      modeling: 3,
      architecture: 3,
      cloud: 3,
      governance: 2,
      pipelines: 2,
      business: 2,
    },
  },
  {
    id: "database-admin",
    title: { en: "Database Administrator", ar: "مسؤول قواعد البيانات" },
    description: {
      en: "Protect availability, recovery and performance.",
      ar: "احمِ الإتاحة والتعافي والأداء.",
    },
    family: "engineering",
    requirements: {
      sql: 3,
      database: 3,
      engineering: 2,
      cloud: 2,
      privacy: 2,
      modeling: 2,
    },
  },
  {
    id: "data-scientist",
    title: { en: "Data Scientist", ar: "عالم بيانات" },
    description: {
      en: "Use statistics and models to solve problems.",
      ar: "استخدم الإحصاء والنماذج لحل المشكلات.",
    },
    family: "ai",
    requirements: {
      python: 3,
      sql: 2,
      statistics: 3,
      cleaning: 2,
      ml: 3,
      experimentation: 2,
      storytelling: 2,
    },
  },
  {
    id: "ml-engineer",
    title: { en: "Machine Learning Engineer", ar: "مهندس تعلم الآلة" },
    description: {
      en: "Build and deploy reliable prediction systems.",
      ar: "ابنِ أنظمة تنبؤ موثوقة وانشرها.",
    },
    family: "ai",
    requirements: {
      python: 3,
      statistics: 2,
      ml: 3,
      deep: 2,
      mlops: 3,
      engineering: 3,
      cloud: 2,
    },
  },
  {
    id: "ai-engineer",
    title: { en: "AI Engineer", ar: "مهندس ذكاء اصطناعي" },
    description: {
      en: "Build useful AI applications with evaluation.",
      ar: "ابنِ تطبيقات ذكاء اصطناعي مفيدة مع التقييم.",
    },
    family: "ai",
    requirements: {
      python: 3,
      ml: 2,
      genai: 3,
      engineering: 2,
      cloud: 2,
      privacy: 2,
      mlops: 2,
    },
  },
  {
    id: "genai-engineer",
    title: { en: "Generative AI Engineer", ar: "مهندس ذكاء اصطناعي توليدي" },
    description: {
      en: "Build retrieval, evaluation and safe AI workflows.",
      ar: "ابنِ الاسترجاع والتقييم ومسارات ذكاء اصطناعي آمنة.",
    },
    family: "ai",
    requirements: {
      python: 3,
      deep: 2,
      genai: 3,
      mlops: 2,
      engineering: 2,
      privacy: 3,
    },
  },
  {
    id: "mlops-engineer",
    title: { en: "MLOps Engineer", ar: "مهندس عمليات تعلم الآلة" },
    description: {
      en: "Operate and monitor production models.",
      ar: "شغّل نماذج الإنتاج وراقبها.",
    },
    family: "ai",
    requirements: {
      python: 3,
      ml: 2,
      mlops: 3,
      cloud: 3,
      engineering: 3,
      pipelines: 2,
    },
  },
  {
    id: "governance-specialist",
    title: { en: "Data Governance Specialist", ar: "أخصائي حوكمة البيانات" },
    description: {
      en: "Create ownership, policies and trusted data.",
      ar: "أنشئ الملكية والسياسات والبيانات الموثوقة.",
    },
    family: "governance",
    requirements: {
      governance: 3,
      quality: 3,
      privacy: 3,
      business: 2,
      modeling: 1,
      sql: 1,
    },
  },
  {
    id: "quality-analyst",
    title: { en: "Data Quality Analyst", ar: "محلل جودة البيانات" },
    description: {
      en: "Measure, investigate and prevent data defects.",
      ar: "قِس عيوب البيانات وحقق فيها وامنعها.",
    },
    family: "governance",
    requirements: {
      sql: 2,
      cleaning: 3,
      quality: 3,
      python: 2,
      governance: 2,
      storytelling: 2,
    },
  },
  {
    id: "data-steward",
    title: { en: "Data Steward", ar: "مشرف بيانات" },
    description: {
      en: "Maintain definitions, ownership and quality.",
      ar: "حافظ على التعريفات والملكية والجودة.",
    },
    family: "governance",
    requirements: {
      governance: 3,
      quality: 2,
      business: 2,
      privacy: 2,
      excel: 2,
      sql: 1,
    },
  },
  {
    id: "data-product-manager",
    title: {
      en: "Data / AI Product Manager",
      ar: "مدير منتجات البيانات والذكاء الاصطناعي",
    },
    description: {
      en: "Lead useful, responsible data and AI products.",
      ar: "قُد منتجات بيانات وذكاء اصطناعي مفيدة ومسؤولة.",
    },
    family: "business",
    requirements: {
      product: 3,
      business: 3,
      storytelling: 3,
      experimentation: 2,
      governance: 2,
      genai: 1,
      privacy: 2,
    },
  },
];
export const careerById = Object.fromEntries(careers.map(r => [r.id, r]));
// Minimum prerequisite skill levels; expanded transitively by the planner.
export const dependencies: Record<string, Record<string, number>> = {
  cleaning: { python: 1 },
  powerbi: { modeling: 1 },
  pipelines: { sql: 1, python: 1 },
  dbt: { sql: 2, modeling: 1 },
  airflow: { python: 1, pipelines: 1 },
  spark: { python: 1, sql: 1 },
  kafka: { pipelines: 1 },
  ml: { python: 2, statistics: 2 },
  deep: { ml: 1 },
  genai: { python: 1 },
  mlops: { ml: 1, engineering: 1 },
  architecture: { modeling: 1, cloud: 1 },
  experimentation: { statistics: 2 },
};
export const paidResources = [
  {
    id: "coursera",
    title: "Google Data Analytics Professional Certificate",
    url: "https://www.coursera.org/professional-certificates/google-data-analytics",
    skills: ["excel", "sql", "cleaning", "storytelling"],
    language: "en",
    cost: "paid",
  },
] as const;
export const sources = [
  {
    title: "WEF Future of Jobs 2025",
    url: "https://www.weforum.org/publications/the-future-of-jobs-report-2025/digest/",
  },
  {
    title: "Microsoft career paths",
    url: "https://learn.microsoft.com/en-us/training/career-paths/",
  },
];

export const videoResources = [
  {
    id: "sql-en",
    language: "en",
    skills: ["sql"],
    title: "SQL full-course videos · freeCodeCamp.org",
    url: "https://www.youtube.com/results?search_query=freeCodeCamp+SQL+full+course",
  },
  {
    id: "analytics-en",
    language: "en",
    skills: ["sql", "excel", "powerbi", "tableau", "cleaning"],
    title: "Data analyst portfolio tutorials · Alex The Analyst",
    url: "https://www.youtube.com/results?search_query=Alex+The+Analyst+data+analyst+portfolio",
  },
  {
    id: "engineering-en",
    language: "en",
    skills: ["pipelines", "dbt", "airflow", "spark", "kafka", "cloud"],
    title: "Data engineering projects · Data with Zach",
    url: "https://www.youtube.com/results?search_query=Data+with+Zach+data+engineering+projects",
  },
  {
    id: "python-en",
    language: "en",
    skills: ["python", "ml", "deep", "genai"],
    title: "Python and machine-learning courses · freeCodeCamp.org",
    url: "https://www.youtube.com/results?search_query=freeCodeCamp+Python+machine+learning+course",
  },
  {
    id: "sql-ar",
    language: "ar",
    skills: ["sql", "database"],
    title: "شرح SQL بالعربي · Mahara-Tech",
    url: "https://www.youtube.com/results?search_query=MaharaTech+SQL+بالعربي",
  },
  {
    id: "analytics-ar",
    language: "ar",
    skills: ["excel", "powerbi", "tableau", "storytelling"],
    title: "تحليل البيانات وPower BI بالعربي",
    url: "https://www.youtube.com/results?search_query=تحليل+البيانات+Power+BI+كورس+بالعربي",
  },
  {
    id: "python-ar",
    language: "ar",
    skills: ["python", "ml", "deep", "genai"],
    title: "Python بالعربي · Elzero Web School",
    url: "https://www.youtube.com/results?search_query=Elzero+Python+بالعربي",
  },
  {
    id: "data-ar",
    language: "ar",
    skills: ["statistics", "cleaning", "ml", "governance", "quality"],
    title: "Data Science بالعربي · دروس ومشروعات",
    url: "https://www.youtube.com/results?search_query=Data+Science+بالعربي+مشروع",
  },
] as const;

export const toolbox = [
  {
    id: "vscode",
    title: "Visual Studio Code",
    why: "Write, run and debug SQL, Python and configuration files in one reproducible workspace.",
    url: "https://code.visualstudio.com/",
    skills: ["python", "sql", "engineering", "pipelines", "ml", "genai"],
  },
  {
    id: "git",
    title: "Git",
    why: "Track every change, recover earlier work and show employers how a project evolved.",
    url: "https://git-scm.com/downloads",
    skills: ["engineering", "python", "dbt", "mlops", "pipelines"],
  },
  {
    id: "python-tool",
    title: "Python",
    why: "Automate data work and build reusable analysis, pipelines and machine-learning systems.",
    url: "https://www.python.org/downloads/",
    skills: ["python", "cleaning", "ml", "deep", "genai", "pipelines"],
  },
  {
    id: "postgres",
    title: "PostgreSQL",
    why: "Learn production-grade relational data, query design, transactions and performance locally.",
    url: "https://www.postgresql.org/download/",
    skills: ["sql", "database", "modeling", "pipelines"],
  },
  {
    id: "docker",
    title: "Docker Desktop",
    why: "Package applications and dependencies so data systems run consistently across machines.",
    url: "https://docs.docker.com/get-started/get-docker/",
    skills: ["engineering", "pipelines", "mlops", "airflow", "kafka", "spark"],
  },
  {
    id: "powerbi-tool",
    title: "Power BI Desktop",
    why: "Model business data and deliver governed interactive reports to decision makers.",
    url: "https://www.microsoft.com/en-us/download/details.aspx?id=58494",
    skills: ["powerbi"],
  },
  {
    id: "tableau-tool",
    title: "Tableau Public",
    why: "Create and publicly share visual analysis and portfolio-ready data stories.",
    url: "https://public.tableau.com/app/discover",
    skills: ["tableau", "storytelling"],
  },
  {
    id: "jupyter",
    title: "JupyterLab",
    why: "Explore data step by step while keeping code, output, charts and explanations together.",
    url: "https://jupyter.org/install",
    skills: ["python", "statistics", "ml", "deep"],
  },
] as const;
