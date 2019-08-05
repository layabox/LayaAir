import {delay} from './delay.js'
import { Text } from 'laya/display/Text.js';
import { BitmapFont } from 'laya/display/BitmapFont.js';
import { FontClip} from 'laya/ui/FontClip'
import { Laya } from 'Laya.js';
import { ILaya } from 'ILaya.js';
import { Handler } from 'laya/utils/Handler.js';

export class Main {
	constructor() {
        Laya.init(800,600);
        Laya.stage.screenMode = 'none';
        Laya.loader.load('res/atlas/atlas/comp.atlas', Handler.create(this, this.test1));
    }
    
    /**
     */
    async test1( ){
        let fc = new FontClip();
        fc.skin = 'comp/fontClip_num.png';
        fc.sheet = "0123456789";
        fc.value = "9527";
        fc.x = 20;
        fc.y = 20;
        Laya.stage.addChild(fc);
        
        await delay(10);  // 等待渲染结果
        (window as any).testEnd=true;   // 告诉测试程序可以停止了
    }
}

//激活启动类
new Main();
