/* The Python runtime is loaded only after init/solve, never at page startup. */
const PYODIDE_URL = 'https://cdn.jsdelivr.net/pyodide/v0.27.7/full/';
let runtimePromise;
let requests = Promise.resolve();

function progress(message) {
  self.postMessage({ type: 'progress', message });
}

async function fetchBytes(name) {
  const response = await fetch(new URL(`assets/${name}`, self.location.href));
  if (!response.ok) throw new Error(`Falha ao carregar ${name}: HTTP ${response.status}`);
  return new Uint8Array(await response.arrayBuffer());
}

async function verify(bytes, expected, label) {
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  const hash = Array.from(new Uint8Array(digest), v => v.toString(16).padStart(2, '0')).join('');
  if (hash !== expected) throw new Error(`Integridade inválida: ${label}`);
}

function boot() {
  if (!runtimePromise) {
    runtimePromise = (async () => {
      progress('Carregando motor Python…');
      const { loadPyodide } = await import(`${PYODIDE_URL}pyodide.mjs`);
      const pyodide = await loadPyodide({ indexURL: PYODIDE_URL });
      progress('Carregando NumPy e pesos originais…');
      const [, manifestBytes, modelBytes, archiveBytes] = await Promise.all([
        pyodide.loadPackage('numpy'), fetchBytes('manifest.json'),
        fetchBytes('model.npz'), fetchBytes('runtime.zip'),
      ]);
      const manifest = JSON.parse(new TextDecoder().decode(manifestBytes));
      await Promise.all([
        verify(modelBytes, manifest.model_sha256, 'pesos'),
        verify(archiveBytes, manifest.runtime_sha256, 'motor'),
      ]);
      pyodide.FS.writeFile('/model.npz', modelBytes);
      pyodide.FS.writeFile('/manifest.json', manifestBytes);
      pyodide.unpackArchive(archiveBytes, 'zip', { extractDir: '/runtime' });
      await pyodide.runPythonAsync(`
import sys
sys.path.insert(0, '/runtime')
import web_runtime
web_runtime.initialize('/manifest.json', '/model.npz')
`);
      self.postMessage({ type: 'ready', checkpoint_sha256: manifest.checkpoint_sha256,
        architecture: manifest.architecture, planning: manifest.planning });
      return pyodide;
    })().catch(error => {
      runtimePromise = undefined;
      throw error;
    });
  }
  return runtimePromise;
}

self.onmessage = ({ data }) => {
  requests = requests.then(async () => {
    const { type, id } = data;
    try {
      if (type !== 'init' && type !== 'solve') throw new Error('Solicitação desconhecida');
      const pyodide = await boot();
      if (type === 'init') {
        self.postMessage({ type: 'initialized', id });
        return;
      }
      progress('Analisando apenas o tabuleiro e as peças visíveis…');
      pyodide.globals.set('_browser_state_json', JSON.stringify(data.state));
      let output;
      try {
        output = await pyodide.runPythonAsync('web_runtime.solve(_browser_state_json)');
      } finally {
        pyodide.globals.delete('_browser_state_json');
      }
      self.postMessage({ type: 'result', id, ...JSON.parse(output) });
    } catch (error) {
      self.postMessage({ type: 'error', id, message: error.message || String(error) });
    }
  });
};
