import type { Sector } from "@shared/industry-practice";
import { executeSqlChallenge } from "@shared/sql-engine";
self.onmessage = async (
  event: MessageEvent<{ challengeId: string; query: string; sector?: Sector }>
) => {
  try {
    self.postMessage(
      await executeSqlChallenge(
        event.data.challengeId,
        event.data.query,
        event.data.sector
      )
    );
  } catch {
    self.postMessage({
      passed: false,
      executed: false,
      columns: [],
      rows: [],
      checks: [],
      message: "The lab could not start. Please try again.",
    });
  }
};
