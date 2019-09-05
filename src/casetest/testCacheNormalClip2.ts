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
        // 另外一种情况。cacheas normal的对象本身有clip，父对象有偏移，这时候clip也要偏移。有bug是clip没有加父对象的偏移导致错误
        // _copyClipInfo(submit, _globalClipMatrix); 这时候如果是cacheas normal， ctx的当前矩阵的偏移被去掉了，导致保存的clip也是去掉偏移的
        var sp3 = new Sprite();
        Laya.stage.addChild(sp3);
        sp3.pos(100,100);           // 父对象的偏移
        var sp4 = new Sprite();
        sp3.addChild(sp4);
        sp4.cacheAs='normal';       // 本对象设置normal。 
        var sp5 = new Sprite(); 
        sp4.addChild(sp5);
        sp4.graphics.clipRect(0,0,20,20);   
        sp5.graphics.drawRect(0,0,100,100,'red');


        await delay(10);  // 等待渲染结果
        (window as any).testEnd=true;   // 告诉测试程序可以停止了
    }
}

//激活启动类
new Main();
