import { sqlLabChallenges, sqlLabTables, type SqlLabRow } from "./sql-lab";
import {
  industryPractice,
  industryBrief,
  type Sector,
} from "./industry-practice";
const names: Record<string, string> = {
  customers: "entities",
  transactions: "events",
  customer_id: "entity_id",
  customer_name: "entity_name",
  segment: "category",
  transaction_id: "event_id",
  transaction_date: "event_date",
  amount: "measure_value",
  total_revenue: "total_value",
  payment_count: "event_count",
  payment_rank: "event_rank",
};
export function sqlVocabulary(text: string, sector: Sector) {
  if (sector === "banking") return text;
  return text.replace(
    /\b(customers|transactions|customer_id|customer_name|segment|transaction_id|transaction_date|amount|total_revenue|payment_count|payment_rank)\b/g,
    word => names[word]
  );
}
export function mapSqlRows(rows: SqlLabRow[], sector: Sector): SqlLabRow[] {
  if (sector === "banking") return rows.map(row => ({ ...row }));
  const context = industryPractice[sector];
  const named: Record<string, string> = {
    Nour: `${context.entity} A`,
    Omar: `${context.entity} B`,
    Mariam: `${context.entity} C`,
    Youssef: `${context.entity} D`,
    Salma: `${context.entity} E`,
    Ali: `${context.entity} F`,
    Hana: `${context.entity} G`,
    Retail: context.categories[0],
    SME: context.categories[1],
    Corporate: context.categories[2],
  };
  return rows.map(row =>
    Object.fromEntries(
      Object.entries(row).map(([key, value]) => [
        sqlVocabulary(key, sector),
        typeof value === "string" ? named[value] || value : value,
      ])
    )
  );
}
export function sqlContext(sector: Sector) {
  const context = industryPractice[sector];
  const prose = (text: string) =>
    sector === "banking"
      ? text
      : sqlVocabulary(text, sector)
          .replace(/customer-value/gi, "entity-value")
          .replace(/customers/gi, `${context.entity}s`)
          .replace(/customer/gi, context.entity)
          .replace(/transactions/gi, `${context.event}s`)
          .replace(/transaction/gi, context.event)
          .replace(/payments/gi, `${context.event}s`)
          .replace(/payment/gi, context.event)
          .replace(/revenue/gi, "total value");
  return {
    challenges: sqlLabChallenges.map(challenge => ({
      ...challenge,
      title: prose(challenge.title),
      brief: industryBrief(sector),
      task: prose(challenge.task),
      hints: challenge.hints.map(prose),
      starterSql: sqlVocabulary(challenge.starterSql, sector),
      referenceSql: sqlVocabulary(challenge.referenceSql, sector),
      expectedColumns: challenge.expectedColumns.map(c =>
        sqlVocabulary(c, sector)
      ),
      expectedRows: mapSqlRows(challenge.expectedRows, sector),
    })),
    tables: {
      [sqlVocabulary("customers", sector)]: mapSqlRows(
        sqlLabTables.customers,
        sector
      ),
      [sqlVocabulary("transactions", sector)]: mapSqlRows(
        sqlLabTables.transactions,
        sector
      ),
    },
  };
}
