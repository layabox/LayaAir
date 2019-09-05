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
     * cacheas normal 
     * 如果上层的clip改变了，cache好的内容必须要受到正确的影响。
     * 简单实现是暂时撤销cache
     */
    async test1(){
        var sp1 = new Sprite();
        sp1.graphics.drawPath(20, 20, [
            ['moveTo',0,0],
            ["arcTo", 500,0,500,30,30],
            ["arcTo", 500,300,470,300,30],
            ["arcTo", 0,300,0,270,30],
            ["arcTo", 0,0,30,0,30],
            ["closePath"]
        ],
        {
            fillStyle: "#00ffff"
        });
        Laya.stage.addChild(sp1);

        await delay(10);  // 等待渲染结果
        (window as any).testEnd=true;   // 告诉测试程序可以停止了
    }
}

//激活启动类
new Main();
