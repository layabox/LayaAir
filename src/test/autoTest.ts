
import puppeteer  from 'puppeteer-core';
import {Launcher} from 'chrome-launcher';
import looksSame from 'looks-same';
import fs from 'fs';
import path from 'path'
import { fileURLToPath } from 'url';
var cases = fs.readdirSync('./cases/2d');
// 获取当前模块文件的路径
const __filename = fileURLToPath(import.meta.url);
// 获取当前模块文件所在的目录
const __dirname = path.dirname(__filename);

var screenShotDir = path.join(__dirname,'../../../src/test/screenshots');

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
        page.setViewport({width:1024,height:800});

        page.on('console', msg => {
            //console.log(msg.args().join(' '));
        });

        var testid=0;
        for await(const onecase of cases){
            // 必须是test开头的js文件
            if (/*!onecase.startsWith('test') ||*/ !onecase.endsWith('.js')){
                continue;
            }

            var js = onecase.substring(0,onecase.length-3);
            console.log('start [',testid,']',onecase,'http://127.0.0.1:3000/test.html?'+js);
            testid++;
            await page.goto('http://127.0.0.1:3000/test.html?'+js);

            // 等待页面加载完成
            // try{
            // await page.waitForFunction('window.testInfo !== undefined',{timeout: 5000});
            // }catch(e:any){
            //     console.error(`超时了，测试页面没有testInfo结构:${js}`)
            //     await browser.close();
            //     return;
            // }
            // 获取测试信息
            //const testInfo = await page.evaluate(() => (window as any).testInfo);   
            let testInfoPath = path.join(screenShotDir,`${js}_testInfo.json`);
            if(!fs.existsSync(testInfoPath)){
                console.error('没有这个文件:',testInfoPath);
                await browser.close();
                return;
            }
            const testInfo = await JSON.parse( await fs.readFileSync(testInfoPath,'utf-8'))
            let ctm=0;    
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
                let diff = await looksSame(`temp_screenshot_${i}.png`, answer, {strict: true});
                console.log(`Step ${i} result:`, diff.equal);

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
  });

