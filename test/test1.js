
const puppeteer = require('puppeteer-core');
var looksSame = require('looks-same');
var fs = require('fs');
var cases = fs.readdirSync('test');

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

puppeteer.launch({executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',args:[]}).then(
    async browser => {
        const page = await browser.newPage();
        page.setViewport({width:1024,height:800});

        page.on('console', msg => {
            console.log(msg.args().join(' '));
        });

        var testid=0;
        for await(const onecase of cases){
            // 必须是test开头的js文件
            if (!onecase.startsWith('test') || !onecase.endsWith('.js')){
                continue;
            }

            var js = onecase.substr(0,onecase.length-3);
            var cmppng=null;
            var cfg = testscfg[js];
            if(cfg){
                if(cfg.ignore) continue;
                cfg.compare && (cmppng=cfg.compare);
            }

            console.log('start [',testid,']',onecase);
            testid++;
            await page.goto('http://127.0.0.1:8888/test/index.html?'+js+'.js');
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
            const watchDog = page.waitForFunction('window.testEnd',{timeout:0});
            await watchDog;
            await page.screenshot({path: 'screenshot.png'});
            looksSame('screenshot.png', 'testResult/'+(cmppng ||(js+'.png')), {strict: true}, function(error, equal) {
                console.log('result', error, equal);
                if(!equal){
                    throw "err "+js;
                }
            });
        }
        await browser.close();
  });

