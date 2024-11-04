
import puppeteer  from 'puppeteer-core';
import {Launcher} from 'chrome-launcher';
import looksSame from 'looks-same';
import fs from 'fs';
import path from 'path'
import { fileURLToPath } from 'url';

// 获取命令行参数
const args = process.argv.slice(2);
// 获取当前模块文件的路径
const __filename = fileURLToPath(import.meta.url);
// 获取当前模块文件所在的目录
const __dirname = path.dirname(__filename);

var screenShotDir = path.join(__dirname,'../../../src/test/screenshots');
//记录错误
let errPath =path.join(screenShotDir,'../error'); 
fs.mkdirSync(errPath, { recursive: true });
fs.rmdirSync(errPath,{recursive:true})

const chromePath = Launcher.getFirstInstallation();
console.log('发现chrome:',chromePath);

function delay(time:number) {
    return new Promise(function(resolve) { 
        setTimeout(resolve, time)
    });
}

puppeteer.launch({
    //headless: false,  // 设置为 false 以显示浏览器
    executablePath: chromePath,args:[]}).then(
    async browser => {
        const page = await browser.newPage();
        page.setViewport({width:1920,height:900});

        page.on('console', msg => {
            //console.log(msg.args().join(' '));
        });

        var testid=0;
        let errors:string[]=[]
        let casesToTest = args.length > 0 ? args : fs.readdirSync('./cases/2d');
        for await(const onecase of casesToTest){
            // 必须是test开头的js文件
            if (/*!onecase.startsWith('test') ||*/ !onecase.endsWith('.js')){
                continue;
            }

            var js = onecase.substring(0,onecase.length-3);
            console.log('start [',testid,']',onecase,'http://127.0.0.1:3000/test.html?'+js);
            testid++;
            await page.goto('http://127.0.0.1:3000/test.html?'+js);

            // 等待页面加载完成
            try{
                await page.waitForFunction('window.testEnd !== undefined',{timeout: 5000});
            }catch(e:any){
                console.error(`超时了，测试页面没有testEnd:${js}`)
                //await browser.close();
                continue;
            }
            // 获取测试信息
            //const testInfo = await page.evaluate(() => (window as any).testInfo);   
            let testInfoPath = path.join(screenShotDir,`${js}.json`);
            if(!fs.existsSync(testInfoPath)){
                console.error('没有这个文件:',testInfoPath);
                //await browser.close();
                continue;
            }
            const testInfo = await JSON.parse( await fs.readFileSync(testInfoPath,'utf-8'))
            let ctm=0;    
            let ok=true;
            for (let i = 0; i < testInfo.length; i++) {
                let {time, rect, answer} = testInfo[i];
                if(!answer)answer = js+'.png'
                answer = path.join(screenShotDir,answer);

                // 等待指定时间
                await delay(time-ctm);
                ctm = time;

                // 截取指定区域的截图
                const screenshot = await page.screenshot({
                    clip: rect,
                    path: `temp_screenshot_${i}.png`
                });

                // 比较截图
                let diff = await looksSame(`temp_screenshot_${i}.png`, answer, {strict: false});
                console.log(`Step ${i} result:`, diff.equal);
                if(!diff.equal){
                    ok=false;
                    errors.push(js);
                    //保存两个图片
                    fs.cpSync(`temp_screenshot_${i}.png`,path.join(errPath,`${js}_实际.png`));
                    fs.cpSync(answer,path.join(errPath,`${js}_期望.png`));
                    fs.unlinkSync(`temp_screenshot_${i}.png`);
                    break;
                }

                // 删除临时截图
                fs.unlinkSync(`temp_screenshot_${i}.png`);
            }                        
            /*
            await page.waitFor(1000);
            // 在页面上下文执行的方法
            const dimensions = await page.evaluate(() => {
                return {
                  width: document.documentElement.clientWidth,
                  height: document.documentElement.clientHeight,
                  deviceScaleFactor: window.devicePixelRatio
                };        
            });
            console.log('Dimensions:', dimensions);            
            */
        }
        await browser.close();
        console.log('错误例子：',errors)
        fs.writeFileSync('errors.txt',errors.join('\n'));
  });

