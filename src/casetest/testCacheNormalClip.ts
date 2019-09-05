import {delay} from './delay.js'
import { Laya } from 'Laya.js';
import { Sprite } from 'laya/display/Sprite.js';

class Main {
	constructor() {
        Laya.init(800,600);
		//Laya.stage.scaleMode = 'fixedwidth';
		Laya.stage.screenMode = 'none';
        //Laya.Stat.show();
        this.test1();
    }
    
    /**
     */
    async test1(){
        var sp1 = new Sprite();
        sp1.pos(100,100);
        //sp1.graphics.drawRect(0,0,100,100,'red');
        Laya.stage.addChild(sp1);
        sp1.graphics.clipRect(10,10,20,20);
        //sp1.cacheAs='normal';

        var sp2 = new Sprite();
        //sp2.graphics.clipRect(10,10,20,20);
        sp2.pos(10,10);
        sp2.graphics.drawRect(0,0,100,100,'green');
        //Laya.stage.addChild(sp2);
        sp2.cacheAs='normal';
        sp1.addChild(sp2);


        await delay(10);  // 等待渲染结果
        (window as any).testEnd=true;   // 告诉测试程序可以停止了
    }
}

//激活启动类
new Main();
