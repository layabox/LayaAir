
import {delay, loadRes} from './delay.js'
import { ColorFilter } from 'laya/filters/ColorFilter.js';
import { Laya } from 'Laya.js';
import { Image } from 'laya/ui/Image.js';
import { getResPath } from './resPath.js';

class Main {
	constructor() {
        Laya.init(800,600);
		//Laya.stage.scaleMode = 'fixedwidth';
		Laya.stage.screenMode = 'none';
        //Laya.Stat.show();
        this.test1();
    }
    
    /**
     * colorfilter多个的情况下，使用缓存的texture的问题
     */
    async test1(){
		var redMat=[
            1,0,0,0,0,
            0,0,0,0,0,
            0,0,0,0,0,
            0,0,0,1,0];
		var redFilter =new ColorFilter(redMat);

        await loadRes(getResPath('monkey0.png'));
        var sp = new Image();
        sp.skin = getResPath('monkey0.png');
        sp.filters=[redFilter];             // 先加一个
        var fs = sp.filters;    
        fs.push(redFilter);                 // 直接修改filter对象
        sp.filters=fs;                      // 外面直接修改可以避免赋值内部修改cacheas为'bitmap', 这样每次都会调用 Filter._filter
                                            // bug 是调用这个 Filter._filter 会一直生成RenderTarget
        Laya.stage.addChild(sp);

        await delay(10);
        sp.cacheAs='none';

        // 删除
        await delay(2000);
        Laya.stage.removeChild(sp);
        delay(100);
        
        (window as any).testEnd=true;   // 告诉测试程序可以停止了
    }
}

//激活启动类
new Main();
