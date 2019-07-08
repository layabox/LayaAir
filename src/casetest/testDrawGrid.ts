
import {delay, loadRes} from './delay.js'
import { Laya } from 'Laya.js';
import { Sprite } from 'laya/display/Sprite.js';
import { Loader } from 'laya/net/Loader.js';
import { Image } from 'laya/ui/Image.js';

/**
 * autobitmap 的drawgrid实现
 */
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
        await loadRes('res/atlas/comp.atlas');

        // graphics 
        var tex = Loader.getRes('comp/bg.png');
        var sp1 = new Sprite();
        Laya.stage.addChild(sp1);
        sp1.graphics.draw9Grid(tex,0,0,200,200,[40, 10, 10, 10,1]);

        //autobitmap
        var img = new Image();
        img.pos(300,0)
        img.size(200,200);
        img.sizeGrid='40,10,10,10,1';
        img.skin = 'comp/bg.png';
        Laya.stage.addChild(img);
        
        var img2 = new Image();
        img2.pos(0,300)
        img2.size(200,200);
        img2.sizeGrid='40,10,10,10,1';
        img2.skin = 'comp/bg.png';
        var mask = new Sprite();
        mask.graphics.drawRect(0,0,100,100,'green');
        img2.mask=mask;
        //img2.cacheAs='bitmap'
        Laya.stage.addChild(img2);

       
        delay(10);
        (window as any).testEnd=true;   // 告诉测试程序可以停止了
    }
}

//激活启动类
new Main();
