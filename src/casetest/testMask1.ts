
import {delay, loadRes} from './delay.js'
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
     * 扇形mask ，角度减少的时候，会出错
     */
    async test1(){
        var fSp = new Sprite();
        fSp.graphics.drawRect(0, 0, 200, 200, 'red');
        var maskSp= new Sprite();
        maskSp.graphics.drawPie(100,100, 100, -80,-90, 'green');
        Laya.stage.addChild(fSp);
        fSp.mask = maskSp;
        //Laya.stage.addChild(maskSp);



        delay(100);
        
        (window as any).testEnd=true;   // 告诉测试程序可以停止了
    }
}

//激活启动类
new Main();
