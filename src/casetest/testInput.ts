import {delay} from './delay.js'
import { Laya } from 'Laya.js';
import { Event } from 'laya/events/Event.js';
import { Render } from 'laya/renders/Render.js';
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
     * 各种输入事件的处理
     */
    async test1(){
        var sp1 = new Sprite();
        sp1.pos(10,10);
        sp1.size(10,10);
        //sp1.rotation=90;    // 旋转对宽度的影响
        sp1.graphics.drawRect(0,0,10,10,'red');
        Laya.stage.addChild(sp1);
        sp1.on('mousedown', this, (e:Event)=>{
            sp1.captureMouseEvent(false);
        }).on('mouseup', this, ()=>{
            sp1.releaseMouseEvent();
        });

        let sp2 = new Sprite();
        sp2.pos(30,10);
        sp2.size(10,10);
        sp2.graphics.drawRect(0,0,10,10,'green');
        Laya.stage.addChild(sp2);
        sp2.on('mousemove', sp2, (e:Event)=>{
            console.log('mm');
        }).on('mouseover', sp2, ()=>{
            console.log('over');
        }).on('mouseout', sp2, ()=>{
            console.log('out');
        });

        let canv:HTMLCanvasElement = Render.canvas;
        function sendMsg(type:string, x:number, y:number){
            canv.dispatchEvent( new MouseEvent(type,{clientX:x,clientY:y}));    
        }

        await delay(10);
        sendMsg('mousedown',11,11); // sp1 capture
        sendMsg('mousemove',21,11); // 经过一个空白点
        await delay(20);            // move 有时间过滤，需要延时
        sendMsg('mousemove',31,11); // 经过sp2, sp2应该触发 mousemove
        sendMsg('mouseup',21,11);

        await delay(10);  // 等待渲染结果
        (window as any).testEnd=true;   // 告诉测试程序可以停止了
    }
}

//激活启动类
new Main();
