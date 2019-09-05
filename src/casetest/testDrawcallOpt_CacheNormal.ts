import {delay, loadRes} from './delay.js'
import { Laya } from 'Laya.js';
import { Sprite } from 'laya/display/Sprite.js';
import { Text } from 'laya/display/Text.js';
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
     * cacheas normal 移动位置。
     */
    async test1(){
        await loadRes(getResPath('monkey0.png'));
        var sp = new Sprite();
        sp.drawCallOptimize=true;       // 优化
        sp.pos(100,100);
        Laya.stage.addChild(sp);

        var sp2 = new Sprite();
        sp2.cacheAs='normal';           // 加 normal
        sp.addChild(sp2);

        var tx1 = new Text();   
        tx1.text='A';
        tx1.pos(100,0);
        tx1.fontSize=40;
        tx1.color='red';
        sp2.addChild(tx1);

        var i1 = new Image();
        i1.skin = getResPath('monkey0.png');
        sp2.addChild(i1);

        var t2 = new Text();   
        t2.text='B';
        t2.pos(200,0);
        t2.fontSize=40;
        t2.color='red';
        sp2.addChild(t2);

        var t3 = new Text();   
        t3.text='C';
        t3.pos(230,0);
        t3.fontSize=40;
        t3.color='red';
        sp.addChild(t3);        

        await delay(10);
        //sp2.pos(50,30);
        

        await delay(10);  // 等待渲染结果
        (window as any).testEnd=true;   // 告诉测试程序可以停止了
    }
}

//激活启动类
new Main();
