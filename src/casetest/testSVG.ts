import {delay} from './delay.js'
import { Laya } from 'Laya.js';
import { Sprite } from 'laya/display/Sprite.js';

export class Main {
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
        sp1.pos(200,200);
        //sp1.graphics.drawRect(0,0,100,100,'red');
        sp1.graphics.drawLines(0,0,[-30,0,0,0,0,30],'red',20);
        sp1.graphics.drawCircle(0, 0, 30, null, '#ff0000', 2);
        sp1.graphics.drawCurves(0, 0, [0, 0, 19, -100, 39, 0, 58, 100, 78, 0, 97, -100, 117, 0, 136, 100, 156, 0], "#ff0000", 5);
        sp1.graphics.drawPath(0, -100, [
            ["moveTo", 5, 0],
            ["lineTo", 105, 0],
            ["arcTo", 110, 0, 110, 5, 5],
            ["lineTo", 110, 55],
            ["arcTo", 110, 60, 105, 60, 5],
            ["lineTo", 5, 60],
            ["arcTo", 0, 60, 0, 55, 5],
            ["lineTo", 0, 5],
            ["arcTo", 0, 0, 5, 0, 5],
            ["closePath"]
        ],
        {
            fillStyle: "#00ffff"
        });
        sp1.rotation=90;    // 旋转对宽度的影响
        Laya.stage.addChild(sp1);

        var sp2 = new Sprite();
        sp2.pos(300,300);
        sp2.scale(3,0.5);
        Laya.stage.addChild(sp2);

        var sp3 = new Sprite();
        sp3.graphics.drawLines(0,0,[-40,0,0,0,0,100],'red',10);
        sp3.graphics.drawCurves(0, 0, [0, 0, 19, -100, 39, 0, 58, 100, 78, 0, 97, -100, 117, 0, 136, 100, 156, 0], "green", 5)
        sp3.graphics.drawPie(10, 10, 100, 10, 60, "#00ffff");
        sp2.addChild(sp3);

        await delay(10);  // 等待渲染结果
        (window as any).testEnd=true;   // 告诉测试程序可以停止了
    }
}

//激活启动类
new Main();
