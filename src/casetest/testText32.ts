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
        Laya.stage.addChild(sp);
        
        var t1 = new Text();
        t1.align='center';
        t1.valign='middle';
        t1.font='Microsoft YaHei';
        t1.fontSize = 22;
        t1.text = '推荐发现';       
        t1.color='#666666';
        Laya.stage.addChild(t1);

        var t2 = new Text();
        t2.pos(0,30);
        t2.align='center';
        t2.font='Arial';
        t2.fontSize = 22;
        t2.text = '创建排行';       
        t2.color='#666666';
        sp.addChild(t2);

        var t3 = new Text();
        t3.pos(0,60)
        t3.font='Arial';
        t3.align='center';
        t3.fontSize = 22;
        t3.text = '我fgh';       
        t3.color='#666666';
        sp.addChild(t3);

        let s=1.0;
        while(s<8.66){
            s+=0.02;
            await delay(10);
            sp.scale(s,s);
            Laya['textRender'].GC();    
            t1.valign='middle';
            t2.valign='middle';
            t3.valign='middle';
        }

        Laya['textRender'].GC();
        sp.scale(8.86,8.86);
        await delay(100); //等待结果。


        await delay(10);  // 等待渲染结果
        (window as any).testEnd=true;   // 告诉测试程序可以停止了
    }
}

//激活启动类
new Main();
