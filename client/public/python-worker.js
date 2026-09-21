import { loadPyodide } from "/python-runtime/pyodide.mjs";
self.onmessage = async ({ data }) => {
  try {
    const python = await loadPyodide({
      indexURL: new URL("/python-runtime/", self.location.origin).href,
      jsglobals: Object.create(null),
      stdout: () => {},
      stderr: () => {},
    });
    self.postMessage({ stage: "ready" });
    python.globals.set("_dp_source", data.source);
    python.globals.set("_dp_fixtures", data.fixtures);
    const output = await python.runPythonAsync(data.harness);
    self.postMessage({ output: String(output).slice(0, 10000) });
  } catch (error) {
    self.postMessage({ error: String(error).slice(-1000) });
  }
};
