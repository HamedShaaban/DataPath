import { practiceDataset, type Sector } from "./industry-practice";
export function pythonFixtures(sector: Sector) {
  const rows = practiceDataset(sector);
  return [
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
