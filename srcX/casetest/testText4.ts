import {delay} from './delay.js'
import { Laya } from 'Laya.js';
import { Text } from 'laya/display/Text.js';

/**
 * 检查文字渲染正确
 */
class Main {
	constructor() {
        Laya.init(800,600);
		//Laya.stage.scaleMode = 'fixedwidth';
		Laya.stage.screenMode = 'none';
        //Laya.Stat.show();
        this.test1();
    }

    async test1(){
        var t1 = new Text();
        t1.fontSize = 30;
        t1.text = '❤️🌹😢😊AB👩‍❤️‍💋‍👩CD😂';       
        t1.color='red';
        Laya.stage.addChild(t1);
        var t11 = new Text();
        t11.fontSize = 130;
        t11.pos(400,0);
        t11.text = 'ﷺ';         // 
        t11.color='blue';
        Laya.stage.addChild(t11);

        // 下面的现在还无法正确显示
        /*
        var ar = new Laya.ArabicReshaper();
        var t2 = new Text();
        t2.pos(0,30);
        t2.fontSize = 30;
        t2.text = ar.convertArabic('سلام');       
        t2.color='red';
        Laya.stage.addChild(t2);

        var t3 = new Text();
        t3.pos(0,60);
        t3.fontSize = 30;
        t3.text='ﷺă ฏ๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎ฏ ๎ ุ  ู कि';
        'ฏุุุ'
        t3.color='red';
        Laya.stage.addChild(t3);
        */

        await delay(10);  // 等待渲染结果
        (window as any).testEnd=true;   // 告诉测试程序可以停止了
    }
}

//激活启动类
new Main();
