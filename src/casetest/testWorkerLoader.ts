import {delay} from './delay.js'
import { Laya } from 'Laya.js';
import { Texture2D } from 'laya/resource/Texture2D.js';
import { Texture } from 'laya/resource/Texture.js';
import { WorkerLoader } from 'laya/net/WorkerLoader.js';
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
        var l = new WorkerLoader();
        var url = 'http://127.0.0.1:8888/bin/res/monkey0.png';
        l.on(url, this, function(d:Texture2D) { 
            var sp = new Sprite();
            Laya.stage.addChild(sp);
            sp.graphics.drawTexture(new Texture(d));
        } );

        l.loadImage(url);
        
        await delay(10);  // 等待渲染结果
        (window as any).testEnd=true;   // 告诉测试程序可以停止了
    }
}

//激活启动类
new Main();
