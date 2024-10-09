
import puppeteer  from 'puppeteer-core';
import {Launcher} from 'chrome-launcher';
import looksSame from 'looks-same';
import fs from 'fs';
var cases = fs.readdirSync('./cases/2d');

/**
 * 遍历test目录下面的所有的以test开始的js文件执行，并从testResult中比对结果。
 * 下面的配置中可以配置这个test使用另外的比对图片，或者忽略这个test
 */
var testscfg={
    'testCacheAs1':{compare:'testCache1.png'},
    'testCacheNormal':{ignore:true},
    'testCacheNormalClip':{compare:'cacheAsNormalClip.png'},
    'testCacheNormalClip2':{compare:'cacheAsNormalClip2.png'},
    'testText2':{compare:'testText.png'},
    'testColorFilter':{ignore:true},
    'testInput':{ignore:true},
    'testMask1':{ignore:true},
    'testSpine1':{ignore:true},
    'testSpinePerf1':{ignore:true},
    'testText31':{ignore:true},
    'testText32':{ignore:true},
};

const chromePath = Launcher.getFirstInstallation();
console.log('发现chrome:',chromePath);

function delay(time:number) {
    return new Promise(function(resolve) { 
        setTimeout(resolve, time)
    });
}

puppeteer.launch({executablePath: chromePath,args:[]}).then(
    async browser => {
        const page = await browser.newPage();
        page.setViewport({width:1024,height:800});

        page.on('console', msg => {
            console.log(msg.args().join(' '));
        });

        var testid=0;
        for await(const onecase of cases){
            // 必须是test开头的js文件
            if (/*!onecase.startsWith('test') ||*/ !onecase.endsWith('.js')){
                continue;
            }

            var js = onecase.substr(0,onecase.length-3);
            var cmppng=null;
            var cfg = testscfg[js];
            if(cfg){
                if(cfg.ignore) continue;
                cfg.compare && (cmppng=cfg.compare);
            }

            console.log('start [',testid,']',onecase,'http://127.0.0.1:3000/test.html?'+js);
            testid++;
            await page.goto('http://127.0.0.1:3000/test.html?'+js);

            // 等待页面加载完成
            try{
            await page.waitForFunction('window.testInfo !== undefined',{timeout: 5000});
            }catch(e:any){
                console.error(`超时了，测试页面没有testInfo结构:${js}`)
                await browser.close();
                return;
            }
            // 获取测试信息
            const testInfo = await page.evaluate(() => (window as any).testInfo);    
            let ctm=0;    
            for (let i = 0; i < testInfo.length; i++) {
                let {time, rect, answer} = testInfo[i];
                if(!answer)answer = js+'.png'

                // 等待指定时间
                await delay(time-ctm);
                ctm = time;

                // 截取指定区域的截图
                const screenshot = await page.screenshot({
                    clip: rect,
                    path: `temp_screenshot_${i}.png`
                });

                // 比较截图
                let equal = await looksSame(`temp_screenshot_${i}.png`, `testResult/${answer}`, {strict: true});
                console.log(`Step ${i + 1} result:`, equal);

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

