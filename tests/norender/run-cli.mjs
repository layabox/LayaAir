// node tests/norender/run-cli.mjs /path/to/layaair/Resources
// Runs the installed CLI in an isolated copy with NoRender rebuilt from this checkout.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { rollup } from 'rollup';
import ts from 'typescript';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const sourceResources = path.resolve(process.argv[2] || path.join(os.homedir(), '.layaair/3.4.2/Resources'));
if (!fs.existsSync(path.join(sourceResources, 'cli-main.js'))) throw new Error('Pass the installed CLI Resources directory');
const workspace = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'laya-norender-cli-')));
const resources = path.join(workspace, 'Resources');
const backend = path.join(root, 'src/layaAir/laya/RenderDriver/NoRenderDriver');
console.log('CLI test workspace:', workspace);
fs.mkdirSync(resources);
for (const file of fs.readdirSync(sourceResources)) {
    if (file === 'engine') continue;
    // The entry point must have the staged __dirname; other resources are read-only links.
    if (file === 'cli-main.js') fs.copyFileSync(path.join(sourceResources, file), path.join(resources, file));
    else fs.symlinkSync(path.join(sourceResources, file), path.join(resources, file));
}
fs.mkdirSync(path.join(resources, 'engine'));
for (const file of fs.readdirSync(path.join(sourceResources, 'engine'))) {
    if (file === 'libs') continue;
    fs.symlinkSync(path.join(sourceResources, 'engine', file), path.join(resources, 'engine', file));
}
const libs = path.join(resources, 'engine/libs');
fs.mkdirSync(libs);
for (const file of fs.readdirSync(path.join(sourceResources, 'engine/libs'))) {
    if (file === 'laya.no-render.js' || file === 'laya.no-render.js.map') continue;
    fs.symlinkSync(path.join(sourceResources, 'engine/libs', file), path.join(libs, file));
}
const files = fs.readdirSync(backend, { recursive: true }).filter(file => file.endsWith('.ts'));
// Use the type-aware emitter so imported const enums are inlined like buildEngine.mjs.
const configPath = path.join(root, 'src/layaAir/tsconfig.json');
const config = ts.readConfigFile(configPath, ts.sys.readFile);
const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, path.dirname(configPath));
const program = ts.createProgram(files.map(file => path.join(backend, file)), {
    ...parsed.options, module: ts.ModuleKind.ESNext, noEmit: false, declaration: false,
    composite: false, incremental: false, sourceMap: false
});
const compiled = new Map();
for (const file of files) {
    const source = path.join(backend, file);
    program.emit(program.getSourceFile(source), (output, contents) => {
        if (output.endsWith('.js')) compiled.set(source, contents);
    });
}
console.log('Built NoRender from', files.length, 'current source files');
const bundle = await rollup({
    input: 'no-render-entry',
    context: 'window',
    external: ['Laya'],
    onwarn(warning, warn) { if (warning.code !== 'CIRCULAR_DEPENDENCY') warn(warning); },
    plugins: [{
        name: 'no-render-source',
        resolveId(id, importer) {
            if (id === 'no-render-entry') return id;
            if (id === 'Laya') return { id, external: true };
            const resolved = path.resolve(importer === 'no-render-entry' ? root : path.dirname(importer), id);
            if (resolved.startsWith(backend + path.sep)) return resolved.endsWith('.ts') ? resolved : resolved + '.ts';
            return { id: 'Laya', external: true };
        },
        load(id) {
            if (id === 'no-render-entry') return files.map(file => `export * from ${JSON.stringify(path.join(backend, file))};`).join('\n');
            const code = compiled.get(id);
            if (!code) throw new Error('No compiled source: ' + id);
            return code;
        }
    }]
});
await bundle.write({ file: path.join(libs, 'laya.no-render.js'), format: 'iife', name: 'Laya', extend: true, globals: { Laya: 'Laya' } });
await bundle.close();

async function run(args, marker) {
    console.log('CLI:', args.join(' '));
    return await new Promise((resolve, reject) => {
        const child = spawn(process.execPath, [path.join(resources, 'cli-main.js'), ...args], {
            cwd: root, stdio: ['ignore', 'pipe', 'pipe']
        });
        let output = '';
        const timer = setTimeout(() => { child.kill('SIGKILL'); reject(new Error('CLI timed out after 120 seconds')); }, 120000);
        child.stdout.on('data', chunk => { output += chunk; process.stdout.write(chunk); });
        child.stderr.on('data', chunk => { output += chunk; process.stderr.write(chunk); });
        child.on('error', error => { clearTimeout(timer); reject(error); });
        child.on('close', (status, signal) => {
            clearTimeout(timer);
            if (status !== 0 || (marker && !output.includes(marker)))
                reject(new Error(`CLI failed: exit=${status}, signal=${signal}`));
            else resolve(output);
        });
    });
}
const project = path.join(workspace, 'project');
await run(['create', 'NoRenderRegression', '-p', project, '-t', '3D empty project']);
// The bundled 3D template still writes the removed Scene3D.fogRange property.
// Keep it intact and create a separate fixture compatible with the current schema.
const scene = JSON.parse(fs.readFileSync(path.join(project, 'assets/Scene.ls'), 'utf8'));
for (const child of scene._$child || []) {
    if (child._$type === 'Scene3D') delete child.fogRange;
}
const fixture = 'assets/NoRenderRegression.ls';
fs.writeFileSync(path.join(project, fixture), JSON.stringify(scene, null, 2));
await run(['run', '-p', project, '--skip-package-install', '--disable-plugins',
    '--script=NoRenderCliRegression.run', '--script-file=' + path.join(root, 'tests/norender/cli-regression.ts')],
    'NORENDER_CLI_PASS');
const validation = await run(['validate', fixture, '-p', project, '--skip-package-install']);
if (!/"valid":\s*true/.test(validation) || /"valid":\s*false/.test(validation))
    throw new Error('CLI scene resource validation failed');
await run(['export-package', fixture, '-p', project, '-o', 'output/norender.layapkg', '--skip-package-install']);
if (!fs.existsSync(path.join(project, 'output/norender.layapkg')) ||
    fs.statSync(path.join(project, 'output/norender.layapkg')).size === 0)
    throw new Error('CLI resource package was not produced');
console.log('CLI integration, scene validation and package export passed. Artifacts retained at:', workspace);
