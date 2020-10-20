
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

        //autobitmap
        var img = new Image();
        img.pos(0,0)
        img.size(200,200);
        img.skin = 'comp/bg.png';
        Laya.stage.addChild(img);        

        //autobitmap
        var img2 = new Image();
        img2.pos(300,0)
        img2.size(200,200);
        img2.sizeGrid='40,10,10,10,1';
        img2.skin = 'comp/bg.png';
        Laya.stage.addChild(img2);

        await delay(1000);
        img.graphics.fillText('XXXXX',10,10,null,'red',null);
        img2.graphics.fillText('XXXXX',10,10,null,'blue',null);
       
        await delay(10);
        (window as any).testEnd=true;   // 告诉测试程序可以停止了
    }
}

//激活启动类
new Main();
