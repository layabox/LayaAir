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
        var sp = new Sprite();
        //sp1.graphics.drawRect(0,0,100,100,'red');
        sp.graphics.drawPoly(10,10, [0, 0, 60, 0, 60,50], "#ffff00");
        sp.graphics.drawPath(100, 100, [["moveTo", 0, 0], ["lineTo", 100, 0],  ["lineTo", 100, 50], 
        ["lineTo", 0, 50],  ["lineTo", 0, 5], ["arcTo", 0, 0, 5, 0, 5], ["closePath"]], {fillStyle: "#00ffff"});
        Laya.stage.addChild(sp);

        await delay(10);  // 等待渲染结果
        (window as any).testEnd=true;   // 告诉测试程序可以停止了
    }
}

//激活启动类
new Main();
