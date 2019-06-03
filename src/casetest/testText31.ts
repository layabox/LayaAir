import {delay,loadRes} from './delay.js'
import { Laya } from 'Laya.js';
import { Sprite } from 'laya/display/Sprite.js';
import { Text } from 'laya/display/Text.js';

class Main {
	constructor() {
        Laya.init(800,600);
		//Laya.stage.scaleMode = 'fixedwidth';
		Laya.stage.screenMode = 'none';
        //Laya.Stat.show();
        this.test1();
    }
    
    /**
     * 几个文字效果
     */
    async test1(){

        // 构造贴图的时候，不要超过界限  [.WebGL-0000029268ED14C0]GL ERROR :GL_INVALID_VALUE : glTexSubImage2D: bad dimensions.
        var sp = new Sprite();
        sp.scale(7.6,7.6);
        Laya.stage.addChild(sp);
        
        var t1 = new Text();
        t1.fontSize = 22;
        t1.text = '排行';       
        t1.color='red';
        sp.addChild(t1);


        await delay(100); //等待结果。


        await delay(10);  // 等待渲染结果
        (window as any).testEnd=true;   // 告诉测试程序可以停止了
    }
}

//激活启动类
new Main();
