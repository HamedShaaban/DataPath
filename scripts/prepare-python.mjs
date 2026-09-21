import {createRequire} from 'node:module';
import {dirname, resolve} from 'node:path';
import {mkdirSync, copyFileSync} from 'node:fs';
const require = createRequire(import.meta.url);
const source = dirname(require.resolve('pyodide/package.json'));
const target = resolve('client/public/python-runtime');
mkdirSync(target, {recursive:true});
for(const file of ['pyodide.mjs','pyodide.asm.mjs','pyodide.asm.wasm','python_stdlib.zip','pyodide-lock.json']) copyFileSync(resolve(source,file),resolve(target,file));
console.log('Prepared self-hosted Python runtime.');
