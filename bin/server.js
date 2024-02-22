const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 3000;

app.use((req, res, next) => {
	//如果是目录，但是不是以/结尾的，算文件，避免express返回301。因为遇到一个问题 SceneRenderManager.js所在目录有一个 SceneRenderManager 目录
	console.log(req.path);
    let filePath = path.join(__dirname, req.path);

	
    // 检查原始文件是否存在
    if (!fs.existsSync(filePath)) {
        // 尝试.js扩展名
        let jsFilePath = `${filePath}.js`;
        if (fs.existsSync(jsFilePath)) {
            req.url += '.js'; // 修改请求路径
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
app.listen(port, () => {
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