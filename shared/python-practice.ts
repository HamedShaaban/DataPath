import { practiceDataset, type Sector } from "./industry-practice";
export function pythonFixtures(sector: Sector, challengeId?: string) {
  const rows = practiceDataset(sector);
  const fixtures = [
    rows,
    rows
      .map(row => ({
        ...row,
        id: row.id + 10,
        value: row.value === null ? null : row.value + 17,
      }))
      .reverse(),
    [],
    [
      {
        id: 10,
        entity: "Edge",
        category: "Test",
        value: 0,
        status: "completed",
      },
      {
        id: 11,
        entity: "Edge",
        category: "Test",
        value: null,
        status: "completed",
      },
      {
        id: 12,
        entity: "Edge",
        category: "Test",
        value: 999,
        status: "pending",
      },
    ],
  ];
  if (challengeId === "python-stream-summary") fixtures[3].push(
    { id: 13, entity: "Edge", category: "Test", value: -7, status: "completed" },
    { id: 14, entity: "Edge", category: "Test", value: 12, status: "completed" }
  );
  return fixtures;
}
export function expectedPython(
  id: string,
  rows: ReturnType<typeof practiceDataset>
) {
  if (id === "python-clean")
    return rows
      .filter(r => r.value === null)
      .map(r => r.id)
      .sort((a, b) => a - b);
  const values = rows
    .filter(r => r.status === "completed" && r.value !== null)
    .map(r => r.value!);
  const total = values.reduce((a, b) => a + b, 0);
  if (id === "python-stream-summary") return [values.length, total, values.length ? Math.min(...values) : null, values.length ? Math.max(...values) : null];
  return id === "python-debug"
    ? values.length
      ? total / values.length
      : 0
    : total;
}
// JSON inputs are passed through interpreter globals, never interpolated into code.
export const pythonHarness = `
import json as _dp_json
import ast as _dp_ast
_tree = _dp_ast.parse(_dp_source)
for _node in _dp_ast.walk(_tree):
    if isinstance(_node, (_dp_ast.Import, _dp_ast.ImportFrom)):
        _names = [a.name for a in _node.names] if isinstance(_node, _dp_ast.Import) else [_node.module or '']
        if any(name.split('.')[0] not in ('math', 'statistics', 'json', 'collections') for name in _names):
            raise ValueError('This practice supports standard math, statistics, json and collections imports only.')
_namespace = {}
exec(compile(_tree, '<practice>', 'exec'), _namespace)
if not callable(_namespace.get('solve')):
    raise ValueError('Define a function named solve(rows).')
_outputs = [_namespace['solve'](rows) for rows in _dp_json.loads(_dp_fixtures)]
_dp_json.dumps(_outputs)
`;

// Only this exercise changes the input contract; existing exercises still receive lists.
export function pythonHarnessFor(id: string) {
  if (id !== "python-stream-summary") return pythonHarness;
  return pythonHarness.replace(
    "_outputs = [_namespace['solve'](rows) for rows in _dp_json.loads(_dp_fixtures)]",
    `class _OnePassRows:
    def __init__(self, rows):
        self._rows = rows
        self._used = False
    def __iter__(self):
        if self._used:
            raise ValueError('One-pass input: rows cannot be traversed twice. Update all accumulators in a single loop.')
        self._used = True
        return iter(self._rows)
_outputs = [_namespace['solve'](_OnePassRows(rows)) for rows in _dp_json.loads(_dp_fixtures)]`
  );
}
