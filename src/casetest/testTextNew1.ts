import {delay} from './delay.js'
import { Text } from 'laya/display/Text.js';
import { Laya } from 'Laya.js';
import { Sprite } from 'laya/display/Sprite.js';
import { HTMLDivElement } from 'laya/html/dom/HTMLDivElement.js'
import { TextRender } from 'laya/webgl/text/TextRender.js';
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
        // uv保护
        TextRender.debugUV = true;
        var t0 = new Text();
        t0.cacheAs = 'normal';
        t0.font = 'Microsoft YaHei';
        t0.fontSize = 30;
        t0.text = '边';
        t0.color='blue';
        t0.pos(472.59, 0);
        Laya.stage.addChild(t0);
        //TextRender.debugUV = false;        

        // 1. 位置，斜体,粗体,emoji,阿拉伯正确。
        // 181226 发现chrome的雅黑偏上了，这个也没办法了
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

        // 
        var t2 = new Text();
        t2.fontSize = 50;
        t2.font='宋体';
        t2.text = '国\nI';           //这个I比较小可能会没有把背景清理干净
        t2.color = 'red';       
        t2.pos(0,100); 
        await delay(20);
        Laya.stage.addChild(t2);

        // 有缩放的居中
        var sp1 = new Sprite();
        sp1.scale(3,3);
        sp1.graphics.drawRect(0,0,100,30,null,'green',1);
        var t3 = new Text();
        t3.font='Arial';
        t3.fontSize=12;
        t3.color='red';
        t3.width=100;
        t3.height=30;        
        t3.align='center';
        t3.valign='middle';
        t3.text='MMMM';
        sp1.pos(100,100);
        Laya.stage.addChild(sp1);
        sp1.addChild(t3);
        //
        // 字体很小的时候的两种形式
        var t4 = new Sprite();
        t4.pos(420,80);
        t4.graphics.fillText('128',0,0,'10px Arial','red','left');
        t4.graphics.fillText('1234567890',0,20,'12px Arial','red','left');
        Laya.stage.addChild(t4);

        var t5 = new Text();
        t5.pos(420,115);
        t5.font = 'Arial';
        t5.fontSize = 10;
        t5.text = '128';
        t5.color = 'red';
        Laya.stage.addChild(t5);


        /*
        var t1 = new Text();
        t1.fontSize = 30;
        t1.text = 'A';       
        t1.color='red';
        */
        // htmlchar 的排版和缩放
        var html = new HTMLDivElement();
        var sp = new Sprite();
        sp.pos(0,220);
        sp.scale(2,2);
        html.style.fontSize = 18;
        html.style.color='red';
        html.x = html.x;
        html.y = html.y;
        html.innerHTML = "<a href='event:item_8030001'>A标签</a><br>换行";
        
        sp.addChild(html);
        Laya.stage.addChild(sp);

        await delay(10);  // 等待渲染结果
        (window as any).testEnd=true;   // 告诉测试程序可以停止了
    }
}

//激活启动类
new Main();
