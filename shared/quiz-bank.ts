import { copy } from "./catalog";

type TechnicalQuestion = {
  prompt: ReturnType<typeof copy>;
  options: ReturnType<typeof copy>[];
  answer: number;
  explanation: ReturnType<typeof copy>;
};

const q = (
  en: string,
  ar: string,
  options: Array<[string, string]>,
  answer: number,
  explanationEn: string,
  explanationAr: string
): TechnicalQuestion => ({
  prompt: copy(en, ar),
  options: options.map(([optionEn, optionAr]) => copy(optionEn, optionAr)),
  answer,
  explanation: copy(explanationEn, explanationAr),
});

export const technicalQuizBank: Record<string, TechnicalQuestion[]> = {
  "sql-10": [
    q("Which part initializes a recursive CTE?", "ما الذي يبدأ الاستعلام التكراري؟", [["The anchor term", "الجزء الأساسي"], ["ORDER BY", "الترتيب"], ["The final alias", "الاسم النهائي"]], 0, "The anchor produces the initial rows before recursive evaluation.", "ينتج الجزء الأساسي الصفوف الأولية قبل التكرار."),
    q("What reliably detects a repeated node on a traversal path?", "ما الذي يكشف عقدة مكررة في المسار؟", [["Rename the node column", "غيّر اسم العمود"], ["Track visited node identifiers", "تتبع معرفات العقد التي تمت زيارتها"], ["Sort by depth", "رتب حسب العمق"]], 1, "A visited-key path can detect cycles before revisiting a node.", "يكشف مسار المعرفات المزارة الدورات قبل تكرار الزيارة."),
    q("Does UNION guarantee termination when depth changes each iteration?", "هل يضمن UNION التوقف عندما يتغير العمق كل مرة؟", [["Yes, it compares only node IDs", "نعم، يقارن معرف العقدة فقط"], ["Yes, recursion stops at ten rows", "نعم، يتوقف عند عشرة صفوف"], ["No, rows with different depths remain distinct", "لا، الصفوف ذات الأعماق المختلفة تبقى مميزة"]], 2, "UNION deduplicates whole result rows, not only node identifiers.", "يزيل UNION تكرار الصف الكامل وليس معرف العقدة فقط."),
    q("What does a maximum depth limit establish?", "ماذا يضمن حد العمق؟", [["A traversal bound, not proof the hierarchy is valid", "حدًا للتنقل وليس إثبات صحة الهيكل"], ["Absence of all cycles", "غياب كل الدورات"], ["Every node was visited", "زيارة كل العقد"]], 0, "A limit bounds work but may truncate valid deeper nodes.", "يحد العمل لكنه قد يستبعد عقدًا أعمق صالحة."),
    q("Which input is essential for a cycle-safety test?", "ما المدخل الضروري لاختبار منع الدورات؟", [["Only sorted labels", "تسميات مرتبة فقط"], ["A path that leads back to an earlier node", "مسار يعود إلى عقدة سابقة"], ["Only a single root", "جذر واحد فقط"]], 1, "A repeated node tests the actual termination condition.", "تختبر العقدة المكررة شرط التوقف الفعلي."),
  ],
  "python-10": [
    q("What does calling a generator function return?", "ماذا تعيد دالة مولدة عند استدعائها؟", [["A list of all results", "قائمة بكل النتائج"], ["The sum of results", "مجموع النتائج"], ["A generator to consume lazily", "مولد للاستهلاك الكسول"]], 2, "Execution advances when the generator is consumed.", "يتقدم التنفيذ عند استهلاك المولد."),
    q("What happens after sum() exhausts a generator?", "ماذا يحدث بعد استهلاك sum للمولد؟", [["A second traversal produces no remaining items", "لا ينتج الاجتياز الثاني عناصر متبقية"], ["It restarts automatically", "يبدأ تلقائياً من جديد"], ["It returns the same total again", "يعيد نفس المجموع"]], 0, "Recreate the generator or arrange a single-pass calculation.", "أعد إنشاء المولد أو نظّم الحساب في مرور واحد."),
    q("Which operation materializes generator output?", "أي عملية تخزن مخرجات المولد كلها؟", [["A yielding filter", "مرشح يستخدم yield"], ["list(generator)", "list(generator)"], ["next(generator)", "next(generator)"]], 1, "list() collects all remaining results in memory.", "تجمع list كل النتائج المتبقية في الذاكرة."),
    q("What is needed for bounded-memory processing?", "ما المطلوب لمعالجة بذاكرة محدودة؟", [["Only use a generator name", "استخدام اسم مولد فقط"], ["Sort every row in memory", "ترتيب كل الصفوف في الذاكرة"], ["Both source and consumer avoid unbounded buffering", "تجنب التخزين غير المحدود في المصدر والمستهلك"]], 2, "Lazy production alone cannot prevent a consumer from retaining everything.", "الإنتاج الكسول وحده لا يمنع المستهلك من الاحتفاظ بكل شيء."),
    q("How should an empty stream total be tested?", "كيف تختبر مجموع تدفق فارغ؟", [["Use an empty source separately from an exhausted generator", "استخدم مصدرًا فارغًا منفصلًا عن مولد مستهلك"], ["Ignore empty inputs", "تجاهل المدخلات الفارغة"], ["Reuse an already consumed stream only", "أعد استخدام تدفق مستهلك فقط"]], 0, "Empty source and exhaustion are different cases even if both yield no rows.", "المصدر الفارغ والنفاد حالتان مختلفتان ولو لم ينتجا صفوفًا."),
  ],
  "sql-1": [
    q(
      "Which query returns active customers created during 2025?",
      "أنهي Query بترجع الـactive customers اللي اتعملوا خلال 2025؟",
      [
        [
          "SELECT * FROM customers WHERE active = true AND created_at >= '2025-01-01' AND created_at < '2026-01-01'",
          "SELECT * FROM customers WHERE active = true AND created_at >= '2025-01-01' AND created_at < '2026-01-01'",
        ],
        [
          "SELECT * FROM customers WHERE active = true OR created_at LIKE '2025%'",
          "SELECT * FROM customers WHERE active = true OR created_at LIKE '2025%'",
        ],
        [
          "SELECT active, created_at FROM customers GROUP BY active",
          "SELECT active, created_at FROM customers GROUP BY active",
        ],
      ],
      0,
      "The half-open date range is safe for timestamp values and AND requires both conditions.",
      "استخدام date range بالشكل ده آمن مع timestamp، وAND بتشترط إن الشرطين يتحققوا."
    ),
    q(
      "A WHERE clause contains `amount = NULL`. What happens?",
      "لو WHERE فيها `amount = NULL`، إيه اللي هيحصل؟",
      [
        ["It returns NULL amounts", "هترجع القيم اللي فيها NULL"],
        [
          "It returns no matching rows because NULL must be checked with IS NULL",
          "مش هترجع rows مطابقة لأن NULL لازم تتفحص بـ IS NULL",
        ],
        ["It converts NULL to zero", "هتحول NULL لصفر"],
      ],
      1,
      "SQL uses three-valued logic; compare NULL with IS NULL or IS NOT NULL.",
      "SQL بتستخدم three-valued logic؛ افحص NULL باستخدام IS NULL أو IS NOT NULL."
    ),
    q(
      "You only need customer_id and email. Which choice best limits data read and exposed?",
      "إنت محتاج customer_id وemail بس. أنهي اختيار بيقلل الـdata المقروءة والمكشوفة؟",
      [
        ["SELECT * FROM customers", "SELECT * FROM customers"],
        [
          "SELECT customer_id, email FROM customers",
          "SELECT customer_id, email FROM customers",
        ],
        ["SELECT COUNT(*) FROM customers", "SELECT COUNT(*) FROM customers"],
      ],
      1,
      "Select only the columns required by the task instead of using SELECT *.",
      "اختار الـcolumns المطلوبة بس بدل SELECT *."
    ),
  ],
  "sql-2": [
    q(
      "Which query keeps only regions whose total revenue exceeds 100000?",
      "أنهي Query بتحتفظ بس بالـregions اللي total revenue فيها أكبر من 100000؟",
      [
        [
          "SELECT region, SUM(revenue) FROM sales WHERE SUM(revenue) > 100000 GROUP BY region",
          "SELECT region, SUM(revenue) FROM sales WHERE SUM(revenue) > 100000 GROUP BY region",
        ],
        [
          "SELECT region, SUM(revenue) FROM sales GROUP BY region HAVING SUM(revenue) > 100000",
          "SELECT region, SUM(revenue) FROM sales GROUP BY region HAVING SUM(revenue) > 100000",
        ],
        [
          "SELECT region FROM sales HAVING revenue > 100000",
          "SELECT region FROM sales HAVING revenue > 100000",
        ],
      ],
      1,
      "WHERE filters rows before aggregation; HAVING filters groups after aggregation.",
      "WHERE بتفلتر الـrows قبل التجميع، وHAVING بتفلتر الـgroups بعد التجميع."
    ),
    q(
      "A table has 3 rows with amounts 10, 20 and NULL. What does COUNT(amount) return?",
      "Table فيها amounts: 10 و20 وNULL. إيه نتيجة COUNT(amount)؟",
      [
        ["3", "3"],
        ["2", "2"],
        ["30", "30"],
      ],
      1,
      "COUNT(column) ignores NULL values; COUNT(*) counts rows.",
      "COUNT(column) بتتجاهل NULL، لكن COUNT(*) بتحسب كل الـrows."
    ),
    q(
      "Why is `SELECT customer_id, order_date, SUM(amount) GROUP BY customer_id` invalid in strict SQL?",
      "ليه `SELECT customer_id, order_date, SUM(amount) GROUP BY customer_id` غير صحيح في strict SQL؟",
      [
        [
          "order_date is neither grouped nor aggregated",
          "order_date مش موجودة في GROUP BY ومش داخلة في aggregate",
        ],
        ["SUM cannot be used with GROUP BY", "SUM مينفعش مع GROUP BY"],
        ["customer_id must be removed", "لازم نشيل customer_id"],
      ],
      0,
      "Every selected non-aggregated column must be functionally determined or included in GROUP BY.",
      "كل column في SELECT ومش aggregate لازم تكون محددة وظيفياً أو موجودة في GROUP BY."
    ),
  ],
  "sql-3": [
    q(
      "Customers has 100 rows; 20 have no orders. Which join still returns all 100 customers?",
      "Customers فيها 100 row و20 منهم من غير orders. أنهي JOIN هترجع كل الـ100 customer؟",
      [
        ["Customers INNER JOIN Orders", "Customers INNER JOIN Orders"],
        ["Customers LEFT JOIN Orders", "Customers LEFT JOIN Orders"],
        ["Customers CROSS JOIN Orders", "Customers CROSS JOIN Orders"],
      ],
      1,
      "LEFT JOIN preserves every row from the left table and fills unmatched right columns with NULL.",
      "LEFT JOIN بتحافظ على كل rows من الجدول الشمال، والـcolumns الناقصة من اليمين بتكون NULL."
    ),
    q(
      "A customer has three orders. What happens after joining customers to orders on customer_id?",
      "Customer عنده 3 orders. إيه اللي بيحصل بعد JOIN على customer_id؟",
      [
        ["The customer appears once", "الـcustomer بيظهر مرة واحدة"],
        [
          "The customer appears three times, once per matching order",
          "الـcustomer بيظهر 3 مرات، مرة لكل order مطابقة",
        ],
        ["The orders are automatically summed", "الـorders بتتجمع تلقائياً"],
      ],
      1,
      "A one-to-many join repeats the one-side row for every matching many-side row.",
      "في one-to-many JOIN، row ناحية الـone بتتكرر مع كل row مطابقة ناحية الـmany."
    ),
    q(
      "A LEFT JOIN is followed by `WHERE orders.status = 'paid'`. Why can unmatched customers disappear?",
      "بعد LEFT JOIN فيه `WHERE orders.status = 'paid'`. ليه customers اللي مالهمش orders ممكن يختفوا؟",
      [
        [
          "WHERE rejects the NULL right-side rows, effectively behaving like an INNER JOIN",
          "WHERE بترفض rows اللي ناحية اليمين فيها NULL، فالسلوك يبقى زي INNER JOIN",
        ],
        [
          "LEFT JOIN never preserves rows",
          "LEFT JOIN عمرها ما بتحافظ على rows",
        ],
        ["status is automatically set to paid", "status بتتحول paid تلقائياً"],
      ],
      0,
      "Put the right-side filter in the ON clause when unmatched left rows must remain.",
      "لو عايز تحافظ على الـleft rows غير المطابقة، حط فلتر الجدول اليمين داخل ON."
    ),
  ],
  "sql-4": [
    q(
      "You need customers whose spend is above the overall average. Which shape is correct?",
      "عايز customers اللي spend بتاعهم أعلى من الـoverall average. أنهي شكل صحيح؟",
      [
        [
          "WHERE spend > (SELECT AVG(spend) FROM customers)",
          "WHERE spend > (SELECT AVG(spend) FROM customers)",
        ],
        ["WHERE spend > AVG(spend)", "WHERE spend > AVG(spend)"],
        ["HAVING spend > customers", "HAVING spend > customers"],
      ],
      0,
      "A scalar subquery can calculate the single average value used by the outer filter.",
      "Scalar subquery تقدر تحسب average واحدة تستخدمها الـouter query في الفلترة."
    ),
    q(
      "When is a CTE especially useful?",
      "إمتى CTE بتكون مفيدة جداً؟",
      [
        [
          "When splitting a multi-step transformation into named, testable stages",
          "لما تقسّم transformation متعددة الخطوات لمراحل لها أسماء وسهل تختبرها",
        ],
        ["When hiding every column name", "لما تخفي كل أسماء الـcolumns"],
        ["When avoiding all query planning", "لما تمنع query planning"],
      ],
      0,
      "Named stages improve readability and let you inspect intermediate logic.",
      "المراحل المسماة بتحسن readability وبتخليك تراجع الـlogic الوسيط."
    ),
    q(
      "What is required for a recursive CTE to stop?",
      "إيه المطلوب عشان recursive CTE تقف؟",
      [
        [
          "A termination condition that eventually produces no new rows",
          "termination condition توصل في الآخر لعدم إنتاج rows جديدة",
        ],
        ["An ORDER BY only", "ORDER BY بس"],
        ["A CROSS JOIN", "CROSS JOIN"],
      ],
      0,
      "Without a terminating predicate, recursion may continue until the database limit or fail.",
      "من غير terminating predicate، الـrecursion ممكن تكمل لحد database limit أو تفشل."
    ),
  ],
  "sql-5": [
    q(
      "Which expression ranks sales within each region without collapsing rows?",
      "أنهي expression بترتب sales جوه كل region من غير ما تدمج الـrows؟",
      [
        [
          "RANK() OVER (PARTITION BY region ORDER BY revenue DESC)",
          "RANK() OVER (PARTITION BY region ORDER BY revenue DESC)",
        ],
        [
          "GROUP BY region ORDER BY revenue",
          "GROUP BY region ORDER BY revenue",
        ],
        ["COUNT(*) WHERE region", "COUNT(*) WHERE region"],
      ],
      0,
      "Window functions calculate across related rows while preserving row-level detail.",
      "Window functions بتحسب عبر rows مرتبطة مع الحفاظ على تفاصيل كل row."
    ),
    q(
      "What is the difference between ROW_NUMBER() and RANK() when values tie?",
      "إيه الفرق بين ROW_NUMBER() وRANK() لما القيم تتساوى؟",
      [
        [
          "ROW_NUMBER gives unique sequence numbers; RANK gives tied rows the same rank and leaves gaps",
          "ROW_NUMBER بتدي رقم مختلف لكل row؛ RANK بتدي المتساويين نفس الرتبة وبتسيب gaps",
        ],
        ["They are always identical", "دايماً متطابقين"],
        ["RANK removes duplicate rows", "RANK بتحذف duplicate rows"],
      ],
      0,
      "Choose based on whether ties should share a position.",
      "اختار حسب هل القيم المتساوية لازم تشارك نفس الترتيب ولا لأ."
    ),
    q(
      "For a running total by account, what must the window include?",
      "عشان تعمل running total لكل account، الـwindow لازم تحتوي على إيه؟",
      [
        [
          "PARTITION BY account_id and ORDER BY transaction_date",
          "PARTITION BY account_id وORDER BY transaction_date",
        ],
        ["GROUP BY transaction_date only", "GROUP BY transaction_date بس"],
        ["DISTINCT account_id", "DISTINCT account_id"],
      ],
      0,
      "Partition resets the total per account; ordering defines accumulation sequence.",
      "PARTITION بتعيد بدء المجموع لكل account، وORDER BY بتحدد ترتيب التراكم."
    ),
  ],
  "sql-6": [
    q(
      "Which expression safely labels NULL email values as 'missing'?",
      "أنهي expression بتعرض NULL في email كـ 'missing'؟",
      [
        ["COALESCE(email, 'missing')", "COALESCE(email, 'missing')"],
        ["email = NULL", "email = NULL"],
        ["COUNT(email, 'missing')", "COUNT(email, 'missing')"],
      ],
      0,
      "COALESCE returns the first non-NULL expression.",
      "COALESCE بترجع أول expression مش NULL."
    ),
    q(
      "You need one latest row per customer. Which method is deterministic?",
      "عايز أحدث row واحدة لكل customer. أنهي طريقة deterministic؟",
      [
        [
          "ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY updated_at DESC, id DESC), then keep row_number = 1",
          "ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY updated_at DESC, id DESC)، وبعدها اختار row_number = 1",
        ],
        ["SELECT DISTINCT customer_id, *", "SELECT DISTINCT customer_id, *"],
        ["DELETE every repeated customer_id", "احذف كل customer_id متكرر"],
      ],
      0,
      "ROW_NUMBER with a complete tie-break order makes the retained row explicit.",
      "ROW_NUMBER مع tie-break كامل بتحدد بوضوح أنهي row هتفضل."
    ),
    q(
      "Why can `NOT IN (subquery)` surprise you when the subquery returns NULL?",
      "ليه `NOT IN (subquery)` ممكن تدي نتيجة مفاجئة لو الـsubquery رجعت NULL؟",
      [
        [
          "NULL can make comparisons UNKNOWN; NOT EXISTS is often safer",
          "NULL ممكن تخلي المقارنة UNKNOWN؛ وغالباً NOT EXISTS أأمن",
        ],
        ["NULL becomes zero", "NULL بتتحول لصفر"],
        [
          "NOT IN automatically removes the table",
          "NOT IN بتحذف الجدول تلقائياً",
        ],
      ],
      0,
      "SQL three-valued logic can prevent any row from satisfying NOT IN when NULL is present.",
      "three-valued logic في SQL ممكن تمنع أي row من مطابقة NOT IN لما NULL تكون موجودة."
    ),
  ],
  "sql-7": [
    q(
      "An EXPLAIN plan shows a sequential scan on 50 million rows for a selective filter. What should you inspect first?",
      "EXPLAIN بيعرض sequential scan على 50 مليون row مع filter انتقائي. تراجع إيه الأول؟",
      [
        [
          "Whether a suitable index exists and the predicate can use it",
          "هل فيه Index مناسبة وهل الـpredicate تقدر تستخدمها",
        ],
        ["The dashboard font", "خط الـdashboard"],
        ["Adding DISTINCT everywhere", "إضافة DISTINCT في كل مكان"],
      ],
      0,
      "A selective predicate may benefit from an index, but verify estimates and actual timing before changing it.",
      "Selective predicate ممكن تستفيد من Index، لكن راجع estimates وactual timing قبل أي تعديل."
    ),
    q(
      "Estimated rows are 100 but actual rows are 2,000,000. What does the gap suggest?",
      "Estimated rows = 100 لكن actual rows = 2,000,000. الفرق ده غالباً معناه إيه؟",
      [
        [
          "Statistics or cardinality estimates may be inaccurate",
          "الـstatistics أو cardinality estimates ممكن تكون غير دقيقة",
        ],
        ["The SQL syntax is invalid", "SQL syntax غير صحيحة"],
        ["The query returned no data", "الـquery مرجعتش data"],
      ],
      0,
      "Bad cardinality estimates can lead the optimizer to choose an expensive plan.",
      "Cardinality estimates غير الدقيقة ممكن تخلي optimizer يختار plan مكلفة."
    ),
    q(
      "Why use EXPLAIN ANALYZE carefully on a write statement?",
      "ليه تستخدم EXPLAIN ANALYZE بحذر مع write statement؟",
      [
        [
          "It may actually execute the statement",
          "ممكن تنفذ الـstatement فعلياً",
        ],
        ["It always drops indexes", "دايماً بتحذف Indexes"],
        ["It disables transactions", "بتوقف Transactions"],
      ],
      0,
      "ANALYZE executes the plan to collect real timing, so writes need a safe transaction or test environment.",
      "ANALYZE بتنّفذ الـplan عشان تجمع timing حقيقي، فـwrites محتاجة transaction آمنة أو test environment."
    ),
  ],
  "sql-8": [
    q(
      "A query filters by customer_id and orders by created_at DESC. Which composite index is the best starting candidate?",
      "Query بتفلتر بـ customer_id وبترتب created_at DESC. أنهي composite Index أفضل بداية؟",
      [
        ["(customer_id, created_at DESC)", "(customer_id, created_at DESC)"],
        [
          "(created_at, customer_id) only because dates are newer",
          "(created_at, customer_id) بس عشان التواريخ أحدث",
        ],
        [
          "An index on an unrelated status column",
          "Index على status غير مستخدمة",
        ],
      ],
      0,
      "Leading with the equality filter then the ordering column can support both access and order.",
      "بدء الـIndex بعمود equality filter وبعده عمود الترتيب ممكن يخدم الوصول والترتيب معاً."
    ),
    q(
      "Why can adding many indexes slow an OLTP workload?",
      "ليه إضافة Indexes كتير ممكن تبطّأ OLTP workload؟",
      [
        [
          "Every INSERT/UPDATE/DELETE may need to maintain those indexes",
          "كل INSERT/UPDATE/DELETE ممكن تحتاج تحدّث الـIndexes دي",
        ],
        ["Indexes disable SELECT", "Indexes بتوقف SELECT"],
        ["Indexes convert rows to JSON", "Indexes بتحول rows لـJSON"],
      ],
      0,
      "Indexes trade read speed for storage and write-maintenance cost.",
      "Indexes بتبادل سرعة القراءة مقابل storage وتكلفة تحديث أثناء الكتابة."
    ),
    q(
      "A predicate uses `LOWER(email) = ...` but the normal email index is ignored. What can help?",
      "Predicate بتستخدم `LOWER(email) = ...` والـIndex العادية على email مش مستخدمة. إيه اللي ممكن يساعد؟",
      [
        [
          "A functional index on LOWER(email), if supported",
          "Functional Index على LOWER(email) لو الـdatabase بتدعمها",
        ],
        ["A larger font", "خط أكبر"],
        ["Removing the WHERE clause", "حذف WHERE"],
      ],
      0,
      "Applying a function can make a plain column index unusable unless a matching functional index exists.",
      "استخدام function على الـcolumn ممكن يمنع استخدام Index العادية إلا لو فيه Functional Index مطابقة."
    ),
  ],
  "sql-9": [
    q(
      "Two transactions update the same account balance concurrently. Which property prevents intermediate states from being visible?",
      "اتنين Transactions بيعدّلوا نفس account balance في نفس الوقت. أنهي property تمنع ظهور intermediate states؟",
      [
        ["Isolation", "Isolation"],
        ["Projection", "Projection"],
        ["Aliasing", "Aliasing"],
      ],
      0,
      "Isolation controls how concurrent transactions observe each other's changes.",
      "Isolation بتتحكم في إزاي concurrent Transactions تشوف تغييرات بعض."
    ),
    q(
      "A transfer debits one account but crediting the other fails. What should happen?",
      "Transfer خصم من account لكن إضافة المبلغ للـaccount التاني فشلت. المفروض يحصل إيه؟",
      [
        ["ROLLBACK the whole transaction", "نعمل ROLLBACK للـTransaction كلها"],
        ["COMMIT the debit only", "نعمل COMMIT للخصم بس"],
        [
          "Retry the credit forever outside a transaction",
          "نكرر الإضافة للأبد بره Transaction",
        ],
      ],
      0,
      "Atomicity requires all steps to succeed or none to take effect.",
      "Atomicity معناها يا كل الخطوات تنجح يا مفيش خطوة يتثبت تأثيرها."
    ),
    q(
      "Under READ COMMITTED, can two reads in one transaction return different committed values?",
      "تحت READ COMMITTED، هل قراءتين في نفس Transaction ممكن يرجعوا قيم committed مختلفة؟",
      [
        [
          "Yes, a non-repeatable read is possible",
          "أيوه، non-repeatable read ممكن تحصل",
        ],
        ["No, it is identical to SERIALIZABLE", "لأ، هي نفس SERIALIZABLE"],
        ["Only if the table has no primary key", "بس لو مفيش Primary Key"],
      ],
      0,
      "READ COMMITTED prevents dirty reads but does not guarantee repeatable reads.",
      "READ COMMITTED بتمنع dirty reads، لكنها لا تضمن repeatable reads."
    ),
  ],
};

export type { TechnicalQuestion };
