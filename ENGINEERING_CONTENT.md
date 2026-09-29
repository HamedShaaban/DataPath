# ETL and dbt content notes

18 authored English lessons and 18 matching external-tool tasks cover all three levels of ETL / ELT and dbt. Existing topic IDs, quizzes and prerequisite ordering are preserved. Practice follows the selected industry and level. Tasks requiring timestamps, versions or batch identifiers explicitly ask for documented synthetic extensions to the starter data.

Examples are small instructional walkthroughs or project fragments, not complete runnable deployments. dbt requires an external project and compatible adapter; DataPath does not execute these submissions. Rubrics remain self-review and never produce automatic verification. Arabic worked-example parity remains a separate content task.

Primary references checked 2026-09-24:
- [Microsoft ETL/ELT architecture](https://learn.microsoft.com/en-us/azure/architecture/data-guide/relational-data/etl)
- [dbt incremental models](https://docs.getdbt.com/docs/build/incremental-models)
- [dbt data tests](https://docs.getdbt.com/docs/build/data-tests)
- [dbt snapshots](https://docs.getdbt.com/docs/build/snapshots)

Version-sensitive details (incremental strategies, snapshot deletion behavior and adapter configuration) are intentionally identified as requiring verification against the learner's pinned external dbt version. No claim of exactly-once delivery, statistical validity, model quality or measured performance is made by these exercises.

## Airflow and Spark extension — 2026-09-24

Added nine Airflow and nine Spark walkthroughs, each with a matching level-gated external task. Combined engineering coverage is now 36 authored topics/cases. Airflow examples are workflow designs and outcome tables; Spark snippets assume an external PySpark session and the explicitly described tiny DataFrame. These are not tested Airflow deployments or Spark jobs. Learners must record their pinned versions and observed results. Alerting APIs, executor options and streaming recovery behavior require version-specific checks.

Additional primary references:
- [Airflow best practices](https://airflow.apache.org/docs/apache-airflow/stable/best-practices.html)
- [Airflow DAG runs and data intervals](https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/dag-run.html)
- [Airflow executors](https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/executor/index.html)
- [Spark SQL getting started](https://spark.apache.org/docs/latest/sql-getting-started.html)
- [Spark performance tuning](https://spark.apache.org/docs/latest/sql-performance-tuning.html)
- [Structured Streaming watermark API](https://spark.apache.org/docs/latest/api/python/reference/pyspark.sql/api/pyspark.sql.DataFrame.withWatermark.html)

Arabic authored explanations/examples remain pending. The extension does not represent full Arabic parity or an executable Airflow/Spark runtime.
