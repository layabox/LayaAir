import {delay, loadRes} from './delay.js'
import { Laya } from 'Laya.js';
import { Sprite } from 'laya/display/Sprite.js';
import { getResPath } from './resPath.js';
import { Texture } from 'laya/resource/Texture.js';

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
        await loadRes(getResPath('monkey0.png'));

        var texture = Laya.loader.getRes(getResPath('monkey0.png'));
        var sp = new Sprite();
        Laya.stage.addChild(sp);
        sp.graphics.drawImage(texture, 0, 0);
        
        var sp1 = new Sprite();
        Laya.stage.addChild(sp1);
        
        var tex = sp.drawToTexture(400, 400, 0, 0,null);
        var canv = sp.drawToCanvas(400, 400, 0, 0);
        
        sp1.graphics.drawTexture(canv.getTexture(), 100, 100, 100, 100);
        sp1.graphics.drawTexture(tex as Texture, 140, 100, 100, 100);

        await delay(10);  // 等待渲染结果
        (window as any).testEnd=true;   // 告诉测试程序可以停止了
    }
}

//激活启动类
new Main();
