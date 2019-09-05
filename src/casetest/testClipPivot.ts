import {delay} from './delay.js'
import { Laya } from 'Laya.js';
import { Rectangle } from 'laya/maths/Rectangle.js';
import { Sprite } from 'laya/display/Sprite.js';

class Main {
	constructor() {
        Laya.init(800,600);// 无canvas模式了
		//Laya.stage.scaleMode = 'fixedwidth';
		Laya.stage.screenMode = 'none';
        //Laya.Stat.show();
        this.test1();
    }
    
    /**
     */
    async test1(){
        var sp1 = new Sprite();
        sp1.graphics.drawRect(0,0,100,100,'red');
        //sp1.graphics.drawRect(25,25,50,50,'green');
        //sp1.graphics.drawRect(40,40,20,20,'blue');
        sp1.pos(100,100);
        sp1.pivot(50,50);
        //sp1.scale(2,2);
        sp1.scrollRect=new Rectangle(-50,-50,80,80);// 视口移到-50,-50
        Laya.stage.addChild(sp1);

        var sp2 = new Sprite();
        sp2.graphics.drawRect(100,0,1,100,'gray');
        sp2.graphics.drawRect(0,100,100,1,'gray');
        Laya.stage.addChild(sp2)

        await delay(10);  // 等待渲染结果
        (window as any).testEnd=true;   // 告诉测试程序可以停止了
    }
}

//激活启动类
new Main();
