import {delay, loadRes} from './delay.js'
import { Laya } from 'Laya.js';
import { Sprite } from 'laya/display/Sprite.js';
import { Text } from 'laya/display/Text.js';
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

        // 先文字
        var tx1 = new Text();   
        tx1.text='A';
        tx1.pos(100,0);
        tx1.fontSize=40;
        tx1.color='red';
        sp.addChild(tx1);


        // 一个空的sprite ，有normal
        var sp2 = new Sprite();
        sp2.cacheAs='normal';       
        sp.addChild(sp2);

        await delay(10);  // 等待渲染结果
        (window as any).testEnd=true;   // 告诉测试程序可以停止了
    }
}

//激活启动类
new Main();
