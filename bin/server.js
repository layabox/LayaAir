/**
需要先整体编译，然后关掉，使用这里的watch
功能：
1. 请求test会返回tsc/layaAir/laya/test/2d下面的所有的文件列表
2. 如果请求没有扩展名的文件，会转成js文件
3. watch编译ts
    1. 监听目录，修改后最简单的编译到指定目录 
    2. 修改文件后会给客户端发消息，客户端可以就此刷新

 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const WebSocket = require('ws');
const chokidar = require('chokidar');
const ts = require('typescript');
const http = require('http');

const app = express();

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// 存储所有连接的客户端
const clients = new Set();
wss.on('connection', (ws) => {
    clients.add(ws);
    ws.on('close', () => clients.delete(ws));
  });

const port = 3000;

var outdir;

function watchAndCompile(srcDir, outDir) {
    outdir = outDir;
    if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
    }

    const watcher = chokidar.watch(srcDir, {
        ignored: /(^|[\/\\])\../,
        persistent: true,
        awaitWriteFinish: {
            stabilityThreshold: 2000,
            pollInterval: 100
          },
          usePolling: false, // 设置为 true 如果需要使用轮询模式
          interval: 100, // 轮询间隔，仅在 usePolling 为 true 时使用        
    });

    watcher.on('change', (filePath) => {
        const relativePath = path.relative(srcDir, filePath);
        console.log('变化:', relativePath)
        const outPath = path.join(outDir, relativePath);
        const fileExt = path.extname(filePath);

        fs.mkdirSync(path.dirname(outPath), { recursive: true });

        if (fileExt === '.ts') {
            compileTypeScript(filePath, outPath);
        } else if (fileExt === '.glsl' || fileExt === '.vs') {
            copyFile(filePath, outPath);
        }
        
        // 通知所有连接的客户端
        const message = JSON.stringify({ type: 'fileChanged', file: relativePath });
        clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });

    console.log(`Watching ${srcDir} for changes...`);
}

function findCorrespondingTsFile(jsFilePath) {
    console.log(`查找${jsFilePath}的源文件`)
    const possibleTsPath = jsFilePath.replace('.js', '.ts');
    const srcPath = path.join(process.cwd(), '../src');
    //const testPath = path.join(process.cwd(), '../test');
    
    //注意加上tsc
    const relativePath = path.relative(path.join(__dirname,'tsc'), possibleTsPath);
    const srcTsPath = path.join(srcPath, relativePath);
    //const testTsPath = path.join(testPath, relativePath);

    if (fs.existsSync(srcTsPath)) {
        return srcTsPath;
    } 
    // else if (fs.existsSync(testTsPath)) {
    //     return testTsPath;
    // }
    return null;
}

function compileTypeScript(filePath, outPath) {
    const source = fs.readFileSync(filePath, 'utf8');
    const result = ts.transpileModule(source, {
        compilerOptions: {
            module: ts.ModuleKind.ESNext,
            target: ts.ScriptTarget.ES2017,
            //removeComments: true,
        },
    });

    const jsPath = outPath.replace('.ts', '.js');
    fs.mkdirSync(path.dirname(jsPath), { recursive: true });
    //用 writeFileSync 可能有写磁盘的延迟，所以用fd
    const fd = fs.openSync(jsPath, 'w');
    fs.writeSync(fd, result.outputText);
    fs.fsyncSync(fd);
    fs.closeSync(fd);
    //fs.writeFileSync(jsPath, result.outputText);
    console.log(`编译到: ${path.relative(outdir, jsPath)}`);
    return result.outputText;
}

function copyFile(src, dest) {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
    console.log(`拷贝到: ${ path.relative(outdir,dest)}`);
}

// 使用示例
watchAndCompile( path.join(process.cwd(),'../src'), './tsc/');
watchAndCompile( path.join(process.cwd(),'../test'), './tsc/test/');

// 列出所有的2d测试
app.get('/test', (req, res) => {
    const directoryPath = path.join(__dirname, 'tsc/layaAir/laya/test/2d'); // 'test'目录路径
    fs.readdir(directoryPath, function (err, files) {
        // 处理读取目录的错误
        if (err) {
            res.status(500).send('Unable to read directory');
            return console.log('Unable to scan directory: ' + err);
        } 
        let content = '<h1>测试用例</h1><ul>';
        // 遍历目录中的文件
        files.forEach(function (file) {
			const extension = path.extname(file);
			if (extension === '.js') {
				// 为每个文件生成列表项
				content += `<li><a href="test.html?${file.substring(0,file.length-3)}">${file}</a></li>`;
			}
        });
        content += '</ul>';
        // 发送生成的HTML到客户端
        res.send(content);
    });
});

app.use((req, res, next) => {
	//如果是目录，但是不是以/结尾的，算文件，避免express返回301。因为遇到一个问题 SceneRenderManager.js所在目录有一个 SceneRenderManager 目录
	console.log(req.path);
    let filePath = path.join(__dirname, req.path);
	
    // 检查原始文件是否存在
    if (!fs.existsSync(filePath)) {
        // 尝试.js扩展名
        let jsFilePath = filePath;
        if(!path.extname(filePath)) //只有没有扩展名的才加.js
            jsFilePath = `${filePath}.js`;
        if (fs.existsSync(jsFilePath)) {
            req.url += '.js'; // 修改请求路径
        }else{
            //如果js文件不存在。可能是没有编译
            const srcFilePath = findCorrespondingTsFile(jsFilePath);
            if (srcFilePath) {
                if(path.extname(srcFilePath)=='.ts'){
                    // 找到对应的 TS 文件，编译它
                    let jscontent = compileTypeScript(srcFilePath, jsFilePath);
                    if (fs.existsSync(jsFilePath)) {
                        // 编译成功,直接发送给客户端
                        res.type('application/javascript').send(jscontent);
                        //res.sendFile(jsFilePath);
                        next();
                        //req.url += '.js'; // 修改请求路径
                    }else{
                        console.log('编译失败:',req.path);
                    }
                }else{
                    //直接拷贝
                    copyFile(srcFilePath, jsFilePath);
                    //由于会有延迟，直接再发送一下内容
                    //let fc = fs.readFileSync(srcFilePath,'utf-8');
                    //res.type('application/javascript').send(fc);
                }
            }
        }
    }else{
		try{
			const stats = fs.statSync(filePath);
			if (stats.isDirectory() && !req.path.endsWith('/')) {
				let jsFilePath = `${filePath}.js`;
				if (fs.existsSync(jsFilePath)) {
					req.url += '.js'; // 修改请求路径
				}
			}
		}catch(e){
		}
	}
    next();
});


// 用于处理 .glsl 或 .fs 文件的中间件
app.use((req, res, next) => {
    const fileTypes = ['.glsl','.vs', '.fs'];
    const extension = path.extname(req.path).toLowerCase();

    if (fileTypes.includes(extension)) {
        const filePath = path.join(__dirname, req.path);
        if (fs.existsSync(filePath)) {
            fs.readFile(filePath, 'utf8', (err, data) => {
                if (err) {
                    res.status(500).send(`Error reading file: ${err}`);
                    return;
                }

                // 创建导出字符串的js文件内容
                const jsContent = `export default ${JSON.stringify(data)};`;
                res.type('application/javascript').send(jsContent);
            });
        } else {
            // 如果文件不存在，则继续请求流程
            next();
        }
    } else {
        // 如果不是请求.glsl或.fs文件，继续请求流程
        next();
    }
});



// 设置正确的 MIME 类型为 "application/javascript"
app.use((req, res, next) => {
    if (req.path.endsWith('.js')||req.url.endsWith('.js')) {
        res.type('application/javascript');
    }
    next();
});

// 使用express的静态文件中间件
app.use(express.static(__dirname));

// 启动服务器
server.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});


   process.on('uncaughtException', (error) => {
     console.error('Uncaught Exception:', error);
     // 可选择根据错误情况结束进程 process.exit(1);
   });

   process.on('unhandledRejection', (reason, promise) => {
     console.error('Unhandled Rejection at:', promise, 'reason:', reason);
     // 可选择根据错误情况结束进程 process.exit(1);
   });