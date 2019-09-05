import {delay,loadRes} from './delay.js'
import { Laya } from 'Laya.js';
import { Image } from 'laya/ui/Image.js';
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
     * 几个文字效果
     */
    async test1(){
        await loadRes(getResPath('monkey0.png'));
        var sp = new Image();
        sp.skin = getResPath('monkey0.png');
        sp.pos(100,100);
        Laya.stage.addChild(sp);

        // 拆分字符的错误
        var t1 = new Text();
        t1.fontSize = 30;
        t1.font='宋体';
        t1.text = '这😂念胡还是月古？？？？？❤️？';       
        t1.color='red';
        Laya.stage.addChild(t1);

        //合并错误
        var t2 = new Text();
        t2.fontSize = 30;
        t2.pos(10,100);
        t2.font='宋体';
        t2.text = '红旗青盖互明末黑沙白浪相吞屠';       
        t2.color='red';
        Laya.stage.addChild(t2);

        var sp2 = new Image();
        sp2.skin = getResPath('monkey0.png');
        sp2.pos(200,200);       
        Laya.stage.addChild(sp2); 

        //TODO 怎么检查应该有3次drawcall

        await delay(100); //等待结果。

        //t2.text='drawcall='+Laya.Stat.drawCall;


        await delay(10);  // 等待渲染结果
        (window as any).testEnd=true;   // 告诉测试程序可以停止了
    }
}

//激活启动类
new Main();
