import { resolveIfNotPlainOrUrl, baseUrl as pageBaseUrl, parseImportMap, resolveImportMap } from './common.js';
import { analyzeModuleSyntax } from './lexer.js';

let id = 0;
const registry = {};

// support browsers without dynamic import support (eg Firefox 6x)
let dynamicImport;
try {
  dynamicImport = (0, eval)('u=>import(u)');
}
catch (e) {
  if (typeof document !== 'undefined') {
    self.addEventListener('error', e => importShim.e = e.error);
    dynamicImport = blobUrl => {
      const topLevelBlobUrl = createBlob(
        `import*as m from'${blobUrl}';self.importShim.l=m;self.importShim.e=null`
      );
  
      const s = document.createElement('script');
      s.type = 'module';
      s.src = topLevelBlobUrl;
      document.head.appendChild(s);
      return new Promise((resolve, reject) => {
        s.addEventListener('load', () => {
          document.head.removeChild(s);
          if (importShim.e)
            return reject(importShim.e);
          resolve(importShim.l);
        });
      });
    };
  }  
}

async function loadAll (load, loaded) {
  if (load.b || loaded[load.u])
    return;
  loaded[load.u] = true;
  await load.L;
  await Promise.all(load.d.map(dep => loadAll(dep, loaded)));
}

/**
 * 加载入口
 * @param {string} url 
 * @param {string} source 
 */
async function topLevelLoad (url, source) {
  const load = getOrCreateLoad(url, source);
  // 加载所有需要的模块文件
  await loadAll(load, {});
  // 构造依赖树。构造load的b:Blob
  resolveDeps(load, {});
  console.log('---start load ',load.r);
  const module = await dynamicImport(load.b);
  // if the top-level load is a shell, run its update function
  if (load.s){
    (await dynamicImport(load.s)).u$_(module);
  }
  return module;
}

async function importShim (id) {
  const parentUrl = arguments.length === 1 ? pageBaseUrl : (id = arguments[1], arguments[0]);
  return topLevelLoad(await resolve(id, parentUrl));
}

self.importShim = importShim;

const meta = {};
const wasmModules = {};

Object.defineProperties(importShim, {
  m: { value: meta },
  w: { value: wasmModules },
  l: { value: undefined, writable: true },
  e: { value: undefined, writable: true }
});

/**
 * 
 * @param {any} load 
 * @param {any} seen  记录已经加载的模块
 */
async function resolveDeps (load, seen) {
  if (load.b)
    return;
  seen[load.u] = true;

  let source = load.S;
  let resolvedSource;

  for (const depLoad of load.d)
    if (!seen[depLoad.u])  // 如果依赖的模块还没有加载，则递归创建
      resolveDeps(depLoad, seen);
  
  if (!load.a[0].length) {// 如果没有依赖
    resolvedSource = source;
  }
  else {
    // once all deps have loaded we can inline the dependency resolution blobs
    // and define this blob
    let lastIndex = 0;
    resolvedSource = '';
    let depIndex = 0;
    // 替换所有的import，变成 import blob
    for (let i = 0; i < load.a[0].length; i++) {
      const { s: start, e: end, d: dynamicImportIndex } = load.a[0][i];
      // dependency source replacements
      if (dynamicImportIndex === -1) {
        const depLoad = load.d[depIndex++];
        let blobUrl = depLoad.b;
        if (!blobUrl) {
            // 如果依赖项还没有对应的blob说明遇到循环依赖了（从root到端，在端没有完成的时候，路径上的blob都为空，如果依赖的blob为空了，说明构成循环了）
          // circular shell creation
          if (!(blobUrl = depLoad.s)) {// 如果有shell不存在
            let hasDefault = false;
            blobUrl = depLoad.s = createBlob(`export function u$_(m){${
                depLoad.a[1].map(
                  name => name === 'default' ? `$_default=m.default` : `${name}=m.${name}`
                ).join(',')
              }}${
                depLoad.a[1].map(name => 
                  name === 'default' ? (hasDefault = true, `let $_default;export{$_default as default}`) : `export let ${name}`
                ).join(';')
              }\n//# sourceURL=${depLoad.r}?cycle`);
          }
        }
        // circular shell execution
        else if (depLoad.s) {// 如果存在shell
          resolvedSource += source.slice(lastIndex, start - 1) + '/*' + source.slice(start - 1, end + 1) + '*/' + source.slice(start - 1, start) + blobUrl + source[end] + `;import*as m$_${depIndex} from'${depLoad.b}';import{u$_ as u$_${depIndex}}from'${depLoad.s}';u$_${depIndex}(m$_${depIndex})`;
          lastIndex = end + 1;
          depLoad.s = undefined;
          continue;
        }
        resolvedSource += source.slice(lastIndex, start - 1) + '/*' + source.slice(start - 1, end + 1) + '*/' + source.slice(start - 1, start) + blobUrl;
        lastIndex = end;
      }
      // import.meta
      else if (dynamicImportIndex === -2) {
        meta[load.r] = { url: load.r };
        resolvedSource += source.slice(lastIndex, start) + 'importShim.m[' + JSON.stringify(load.r) + ']';
        lastIndex = end;
      }
      // dynamic import
      else {
        resolvedSource += source.slice(lastIndex, start) + 'importShim' + source.slice(start + 6, end) + JSON.stringify(load.r) + ', ';
        lastIndex = end;
      }
    }
    // 源码加上剩余的部分
    resolvedSource += source.slice(lastIndex);
  }

  // 如果是glsl的处理
    if(load.e == '.glsl'||load.e == '.vs' || load.e == '.ps' || load.e == '.fs'){
      resolvedSource = 'export default \`'+resolvedSource+'\`';
  }

  load.b = createBlob(resolvedSource + '\n//# sourceURL=' + load.r);
  load.S = undefined;
}

/**
 * 创建一个BlobUrl,返回是类似 "blob:https://developer.mozilla.org/b749ed8c-efb3-405c-8731-94ba2ee61690"
 * 等效于一个实际的url
 * @param {string} source 
 */
const createBlob = source => 
    URL.createObjectURL(new Blob([source], { type: 'application/javascript' }));

function getOrCreateLoad (url, source) {
    var ext = url.substr(url.lastIndexOf('.'));
    switch(ext){
        case '.js':
        case '.glsl':
        case '.vs':
        case '.ps':
        case '.fs':
        case '.txt':
            break;
        default:
            url = url+'.js';
            break;
    }

  let load = registry[url];
  if (load)
    return load;

  load = registry[url] = {
    // url
    u: url,
    // response url
    r: undefined,
    // fetchPromise
    f: undefined,
    // source
    S: undefined,
    // linkPromise
    L: undefined,
    // analysis
    a: undefined,
    // deps
    d: undefined,
    // blobUrl
    b: undefined,
    // shellUrl
    s: undefined,
    // ext
    e: ext,
  };

  load.f = (async () => {
    if (!source) {
        //console.log('fetch1', url);
      const res = await fetch(url);
      if (!res.ok)
        throw new Error(`${res.status} ${res.statusText} ${res.url}`);

      load.r = res.url;

      if (res.url.endsWith('.wasm')) {
        const module = wasmModules[url] = await (WebAssembly.compileStreaming ? WebAssembly.compileStreaming(res) : WebAssembly.compile(await res.arrayBuffer()));
    
        let deps = WebAssembly.Module.imports ? WebAssembly.Module.imports(module).map(impt => impt.module) : [];
    
        const aDeps = [];
        load.a = [aDeps, WebAssembly.Module.exports(module).map(expt => expt.name)];
    
        const depStrs = deps.map(dep => JSON.stringify(dep));
    
        let curIndex = 0;
        load.S = depStrs.map((depStr, idx) => {
            const index = idx.toString();
            const strStart = curIndex + 17 + index.length;
            const strEnd = strStart + depStr.length - 2;
            aDeps.push({
              s: strStart,
              e: strEnd,
              d: -1
            });
            curIndex += strEnd + 3;
            return `import*as m${index} from${depStr};`
          }).join('') +
          `const module=importShim.w[${JSON.stringify(url)}],exports=new WebAssembly.Instance(module,{` +
          depStrs.map((depStr, idx) => `${depStr}:m${idx},`).join('') +
          `}).exports;` +
          load.a[1].map(name => name === 'default' ? `export default exports.${name}` : `export const ${name}=exports.${name}`).join(';');
    
        return deps;
      }

      source = await res.text();
    }
    // .a[0] 解析出本模块依赖的所有的其他模块的名字所在的位置
    load.a = analyzeModuleSyntax(source);
    if (load.a[2])
      importShim.err = [source, load.a[2]];
    load.S = source;
    // 根据位置获得对应的字符串，返回所有依赖的库的字符串数组
    let deps = load.a[0].filter(d => d.d === -1).map(d => source.slice(d.s, d.e));
    /*
    if(deps.filter(d=>{
        if(d.indexOf('/ui/View')>0){
            debugger;
        }
    })){}
    */
    return deps;
  })();

  load.L = load.f.then(async deps => {
    load.d = await Promise.all(deps.map(async depId => {
      const depLoad = getOrCreateLoad(await resolve(depId, load.r));
      await depLoad.f;
      return depLoad;
    }));
  });

  return load;
}

let importMap, importMapPromise;
if (typeof document !== 'undefined') {
  const scripts = document.getElementsByTagName('script');
  for (let i = 0; i < scripts.length; i++) {
    const script = scripts[i];
    if (script.type === 'importmap-shim' && !importMapPromise) {
      if (script.src) {
        importMapPromise = (async function () {
          importMap = parseImportMap(await (await fetch(script.src)).json(), script.src.slice(0, script.src.lastIndexOf('/') + 1));
        })();
      }
      else {
        importMap = parseImportMap(JSON.parse(script.innerHTML), pageBaseUrl);
      }
    }
    // this works here because there is a .then before resolve
    else if (script.type === 'module-shim') {
      if (script.src)
        topLevelLoad(script.src);
      else{
        topLevelLoad(`${pageBaseUrl}?${id++}`, script.innerHTML);
      }
    }
  }
}

importMap = importMap || { imports: {}, scopes: {} };

/**
 * 
 * @param {string} id 
 * @param {string} parentUrl 
 */
async function resolve (id, parentUrl) {
  parentUrl = parentUrl || pageBaseUrl;

  if (importMapPromise)
    return importMapPromise
    .then(function () {
      return resolveImportMap(id, parentUrl, importMap);
    });
  return resolveImportMap(id, parentUrl, importMap);
}
