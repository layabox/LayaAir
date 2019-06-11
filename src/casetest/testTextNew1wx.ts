import {delay} from './delay.js'
import { Laya } from 'Laya.js';
import { Text } from 'laya/display/Text.js';
import { TextRender } from 'laya/webgl/text/TextRender.js';
import { Sprite } from 'laya/display/Sprite.js';

/**
 * 检查新版文字渲染正确
 */
class Main {
	constructor() {
        Laya.init(800,600);
		Laya.stage.screenMode = 'none';
        //Laya.Stat.show();
        this.test1();
    }

    createFromTemp(t:Text,x:number, y:number,sx:number, sy:number){
        var ret =new Text();
        ret.fontSize=t.fontSize;
        ret.color=t.color;
        ret.font=t.font;
        ret.text=t.text;
        ret.pos(x,y);
        ret.scale(sx,sy);
        Laya.stage.addChild(ret);
        return ret;
    }

    async test1(){
        TextRender.isWan1Wan=true;
        // 1. 位置，斜体,粗体,emoji,阿拉伯正确。
        var strTxt = '口😂gM️سلام位किﷺă ฏ๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎';
        var t1 = new Text();
        t1.font = 'Microsoft YaHei';
        t1.scale(2, 3);
        t1.fontSize = 20;
        //t1.italic = true;
        t1.bold = true;
        t1.text = strTxt;
        t1.color='blue';
        t1.stroke = 2;
        t1.strokeColor = 'green';
        Laya.stage.addChild(t1);

        var t2 = new Text();
        t2.fontSize = 50;
        t2.font='宋体'
        t2.text = '国\nI';           //这个I比较小可能会没有把背景清理干净
        t2.color = 'red';       
        t2.pos(0,100); 
        await delay(20);
        Laya.stage.addChild(t2);

        // orix oriy 的缩放要一致
        var sp1 = new Sprite();
        sp1.pos(66,110);
        sp1.size(100, 110);
        sp1.graphics.drawRect(0, 0, 100, 110,null,'red',1);
        Laya.stage.addChild(sp1);
        var tx1 = new Text();
        tx1.pos(0, 24);
        tx1.size(100, 60);        
        tx1.text='8';
        tx1.font='SimHei';
        tx1.fontSize=60;
        tx1.color='red';
        tx1.align='center';
        sp1.addChild(tx1);

        await delay(10);
        sp1.scale(2,2);

        // 缩放不要互相影响
        /* 这个没有写出重现例子。只能ios多测
        var t3 = new Text();
        t3.font='Arial';
        t3.fontSize=16;
        t3.scale(2,2);
        t3.pos(60,100);
        t3.color='blue';
        t3.text='A';
        Laya.stage.addChild(t3);
        var t4 = new Text();
        t4.font='Arial';
        t4.fontSize=16;
        t4.scale(2.1,2.1);
        t4.pos(70,100);
        t4.color='blue';
        t4.text='A';
        Laya.stage.addChild(t4);
        */

        /*
        var t1 = new Text();
        t1.fontSize = 30;
        t1.text = 'A';       
        t1.color='red';
        */

        await delay(10);  // 等待渲染结果
        (window as any).testEnd=true;   // 告诉测试程序可以停止了
    }
}

//激活启动类
new Main();
