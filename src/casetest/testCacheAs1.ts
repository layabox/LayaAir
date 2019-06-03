
import {delay, loadRes} from './delay.js'
import { Sprite } from 'laya/display/Sprite.js';
import { Laya } from 'Laya.js';
import { Image } from 'laya/ui/Image.js';
import { Box } from 'laya/ui/Box.js';

class Main {
	constructor() {
        Laya.init(800,600);
		//Laya.stage.scaleMode = 'fixedwidth';
		Laya.stage.screenMode = 'none';
        //Laya.Stat.show();
        this.test1();
    }
    
    /**
     * 某个节点cacehas normal ，其某级子节点 cacheas bitmap 要能正确显示
     */
    async test1(){
        await loadRes('./res/monkey0.png');
        var sp = new Image();
        var mask = new Sprite();
        mask.graphics.drawCircle(50,50,50,'green');
        sp.mask=mask;
        sp.skin = './res/monkey0.png';

        var sp1 = new Sprite();
        sp1.addChild(sp);

        var sp2 = new Sprite();
        sp2.addChild(sp1);
        sp2.cacheAs='normal';
        sp2.pos(100,100);
        Laya.stage.addChild(sp2);

        // cache as normal 的pivot
        var box = new Box();
        box.size(200, 200);
        box.graphics.drawRect(0, 0, box.width, box.height, "#00ff00");
        box.anchorY = 1;
        box.cacheAs = "normal";
        //box.cacheAs = "bitmap";
        var sp3 = new Sprite();
        sp3.graphics.drawRect(0, 0, 100, 100, "#ff0000");
        box.addChild(sp3);
        
        Laya.stage.addChild(box);
        box.pos(300, 300);


        // cache as bitmap 的pivot
        var box2 = new Box();
        box2.size(200, 200);
        box2.graphics.drawRect(0, 0, box.width, box.height, "#00ff00");
        box2.anchorY = 1;
        box2.cacheAs = "bitmap";
        var sp4 = new Sprite();
        sp4.graphics.drawRect(0, 0, 100, 100, "#ff0000");
        box2.addChild(sp4);
        
        Laya.stage.addChild(box2);
        box2.pos(500, 300);


        delay(100);
        
        (window as any).testEnd=true;   // 告诉测试程序可以停止了
    }
}

//激活启动类
new Main();
