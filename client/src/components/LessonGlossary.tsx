import { useState } from "react";
const terms = [
  [
    "Function",
    "A named set of instructions that receives inputs and can return an answer. In a Python exercise, solve(rows) receives the supplied records.",
  ],
  [
    "Return",
    "Send a result back from a function. Printing displays text; it does not necessarily return the answer that a checker expects.",
  ],
  [
    "Loop",
    "Repeat instructions for each item, such as adding the amount of each completed order.",
  ],
  [
    "Formula",
    "An expression that calculates an answer from values or cells, such as adding two spreadsheet amounts.",
  ],
  [
    "Measure",
    "In a reporting tool, a calculation evaluated for the current filters, such as total value for the selected region.",
  ],
  [
    "Filter context",
    "The filters currently affecting a report calculation. Choosing a region can change which records a measure uses.",
  ],
  [
    "Test case",
    "An input with an expected result, used to check whether a solution follows the rule.",
  ],
  [
    "Hidden dataset",
    "Additional practice data used by the checker. It tests whether your solution works beyond the displayed example.",
  ],

  [
    "Dataset",
    "A collection of related records, such as a table of shop orders.",
  ],
  ["Row / record", "One observation in a table. For example, one order."],
  [
    "Column / field",
    "One type of information stored for every row, such as the order amount.",
  ],
  [
    "Grain",
    "What one row represents. An order table and an order-item table have different grains.",
  ],
  ["Filter", "Keep only records that match a rule, such as completed orders."],
  [
    "Aggregation",
    "Combine values into a summary, such as a total or a count for each region.",
  ],
  [
    "Alias",
    "A temporary name used in a query to make a table or result easier to refer to.",
  ],
  [
    "Join",
    "Match records from two tables using related fields, such as customer IDs.",
  ],
  [
    "NULL / missing value",
    "Information that is unknown or absent. It is not automatically zero.",
  ],
  [
    "Business key",
    "The field or fields that identify a real-world item, such as an order ID.",
  ],
  [
    "Validation",
    "Check that data or an answer follows the intended rules. Recalculate a small example to check a total.",
  ],
  [
    "Edge case",
    "An unusual input worth checking, such as an empty table, zero, or a missing amount.",
  ],
  [
    "Metric",
    "A defined measurement, such as the number of completed orders. Specify exactly what is counted.",
  ],
  [
    "Denominator",
    "The number you divide by in a fraction or rate. For a completion rate, it might be all eligible orders.",
  ],
  [
    "Bias",
    "A systematic distortion in a result, for example from surveying only one kind of customer.",
  ],
  [
    "Evidence",
    "Work you save to show what you did: the input, method, output and your explanation.",
  ],
];
const arabic: Record<string, [string, string]> = {
  Function: [
    "دالة",
    "تعليمات لها اسم تستقبل مدخلات وقد تعيد نتيجة. في تمرين Python تستقبل solve(rows) السجلات المعطاة.",
  ],
  Return: [
    "إرجاع نتيجة",
    "إرسال النتيجة من الدالة. طباعة نص لا تعني بالضرورة إرجاع الإجابة التي يتوقعها الاختبار.",
  ],
  Loop: ["حلقة تكرار", "تكرار تعليمات لكل عنصر، مثل جمع مبلغ كل طلب مكتمل."],
  Formula: [
    "صيغة حسابية",
    "تعبير يحسب نتيجة من قيم أو خلايا، مثل جمع مبلغين في جدول بيانات.",
  ],
  Measure: [
    "مقياس محسوب",
    "حساب في أداة تقارير يتأثر بالفلاتر الحالية، مثل إجمالي القيمة للمنطقة المختارة.",
  ],
  "Filter context": [
    "سياق التصفية",
    "الفلاتر المؤثرة حالياً في الحساب. اختيار منطقة قد يغيّر السجلات الداخلة في المقياس.",
  ],
  "Test case": [
    "حالة اختبار",
    "مدخلات ونتيجة متوقعة للتحقق من أن الحل يتبع القاعدة.",
  ],
  "Hidden dataset": [
    "بيانات اختبار إضافية",
    "بيانات يستخدمها المصحح للتحقق من عمل الحل خارج المثال المعروض.",
  ],
  Dataset: ["مجموعة بيانات", "سجلات مرتبطة ببعضها، مثل جدول طلبات متجر."],
  "Row / record": ["صف أو سجل", "ملاحظة واحدة في الجدول، مثل طلب واحد."],
  "Column / field": [
    "عمود أو حقل",
    "نوع واحد من المعلومات لكل صف، مثل مبلغ الطلب.",
  ],
  Grain: [
    "مستوى تفصيل الصف",
    "ما يمثله الصف الواحد. صف الطلب يختلف عن صف الصنف داخل الطلب.",
  ],
  Filter: [
    "تصفية",
    "الاحتفاظ بالسجلات المطابقة لقاعدة، مثل الطلبات المكتملة فقط.",
  ],
  Aggregation: [
    "تجميع",
    "تلخيص القيم في مجموع أو عدد لكل فئة، مثل إجمالي كل منطقة.",
  ],
  Alias: [
    "اسم مستعار",
    "اسم مؤقت في الاستعلام لتسهيل الإشارة إلى جدول أو نتيجة.",
  ],
  Join: [
    "ربط الجداول",
    "مطابقة سجلات جدولين باستخدام حقول مرتبطة، مثل معرف العميل.",
  ],
  "NULL / missing value": [
    "قيمة مفقودة",
    "معلومة مجهولة أو غير موجودة. لا تعني صفراً تلقائياً.",
  ],
  "Business key": [
    "مفتاح التعريف",
    "حقل أو مجموعة حقول تعرّف عنصراً في العمل، مثل معرف الطلب.",
  ],
  Validation: [
    "التحقق",
    "التأكد من اتباع البيانات أو الإجابة للقواعد المطلوبة. احسب مثالاً صغيراً يدوياً لمراجعة المجموع.",
  ],
  "Edge case": [
    "حالة حدية",
    "مدخل غير معتاد يستحق الاختبار، مثل جدول فارغ أو مبلغ يساوي صفراً أو قيمة مفقودة.",
  ],
  Metric: [
    "مؤشر",
    "قياس محدد مثل عدد الطلبات المكتملة. وضّح بدقة ما يدخل في الحساب.",
  ],
  Denominator: [
    "المقام",
    "العدد الذي تقسم عليه لحساب نسبة. في نسبة الإكمال قد يكون عدد كل الطلبات المؤهلة.",
  ],
  Bias: [
    "تحيز",
    "انحراف منهجي في النتيجة، مثل استطلاع رأي نوع واحد من العملاء فقط.",
  ],
  Evidence: [
    "دليل العمل",
    "عمل تحفظه لبيان ما فعلته: المدخلات والطريقة والنتيجة وتفسيرك.",
  ],
};
export function LessonGlossary({
  language = "en",
}: {
  language?: "en" | "ar";
}) {
  const [query, setQuery] = useState("");
  const isArabic = language === "ar";
  const matches = terms.filter(([term, definition]) =>
    `${term} ${definition} ${arabic[term]?.join(" ") || ""}`
      .toLowerCase()
      .includes(query.trim().toLowerCase())
  );
  return (
    <details className="lesson-glossary" dir={isArabic ? "rtl" : "ltr"}>
      <summary>
        {isArabic
          ? "مصطلح غير واضح؟ افتح القاموس المبسط"
          : "Unfamiliar word? Open the plain-language glossary"}
      </summary>
      <div>
        <label>
          {isArabic ? "ابحث بالعربية أو الإنجليزية" : "Find a term"}
          <input
            type="search"
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder={
              isArabic
                ? "مثلاً: تجميع، تحقق، أو alias…"
                : "Try grain, alias or validation…"
            }
          />
        </label>
        <dl>
          {matches.map(([term, definition]) => (
            <div key={term}>
              <dt>
                {isArabic ? (
                  <>
                    {arabic[term]?.[0]} · <bdi>{term}</bdi>
                  </>
                ) : (
                  term
                )}
              </dt>
              <dd>{isArabic ? arabic[term]?.[1] || definition : definition}</dd>
            </div>
          ))}
        </dl>
        {!matches.length && (
          <p role="status">
            {isArabic
              ? "لا توجد نتائج. جرّب كلمة أقصر أو امسح البحث لعرض كل المصطلحات."
              : "No matching term yet. Try a shorter word or clear the search to see all definitions."}
          </p>
        )}
      </div>
    </details>
  );
}
