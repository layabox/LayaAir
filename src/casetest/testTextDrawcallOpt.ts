import {delay, loadRes} from './delay.js'
import { Laya } from 'Laya.js';
import { Sprite } from 'laya/display/Sprite.js';
import { Image } from 'laya/ui/Image.js';
import { Text } from 'laya/display/Text.js';
import { getResPath } from './resPath.js';

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
        Laya.stage.drawCallOptimize=true;
        var sp1 = new Sprite();
        Laya.stage.addChild(sp1);

        await loadRes(getResPath('monkey0.png'));

        let spa = new Sprite();
        spa.graphics.clipRect(0,0,100,100);
        var spb = new Sprite();

        Laya.stage.addChild(spa);
        Laya.stage.addChild(spb);

        var sp = new Image();
        sp.skin = getResPath('monkey0.png');
        spa.addChild(sp);

        var t1 = new Text();
        t1.fontSize = 20;
        t1.pos(50,0);
        t1.text = '部分显示';       
        t1.color='red';
        spa.addChild(t1);

        let sp2 = new Image();
        sp2.skin=getResPath('monkey0.png');
        sp2.pos(100,0);
        spb.addChild(sp2);

        let t2 = new Text();
        t2.fontSize=20;
        t2.text='看不见我';
        t2.color='red';
        t2.pos(150,0);
        spb.addChild(t2);


        await delay(10);  // 等待渲染结果
        (window as any).testEnd=true;   // 告诉测试程序可以停止了
    }
}

//激活启动类
new Main();
