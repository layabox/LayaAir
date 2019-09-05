
import {delay, loadRes} from './delay'
import { Laya } from 'Laya';
import { Sprite } from 'laya/display/Sprite';
import { Loader } from 'laya/net/Loader';
import { Image } from 'laya/ui/Image';
import { GlowFilter } from 'laya/filters/GlowFilter';
import { getResPath } from './resPath';

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
    
    async test1(){
        await loadRes(getResPath('atlas/comp.atlas'));

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

        // 加上mask的效果
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

        var img3 = new Image();
        img3.pos(300,300)
        img3.size(200,200);
        img3.sizeGrid='40,10,10,10,1';
        img3.skin = 'comp/bg.png';
        img2.mask=mask;
        Laya.stage.addChild(img3);

        // 加glow，减glow
        var glowFilter = new GlowFilter("#ffff00", 10, 0, 0);
        img3.filters=[glowFilter];
        await delay(10);
        img3.filters=null;
        //img2.mask=null;
       
        delay(10);
        (window as any).testEnd=true;   // 告诉测试程序可以停止了
    }
}

//激活启动类
new Main();
