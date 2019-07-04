
import {delay, loadRes} from './delay'
import { Sprite } from 'laya/display/Sprite';
import { Laya } from 'Laya';
import { Texture } from 'laya/resource/Texture';

class Main {
	constructor() {
        Laya.init(800,600);
        Laya.stage.screenMode = 'none';
        this.test1();
    }
    
    /**
     * drawTriangle的mask的问题
     * 1. 没有正确计算大小
     * 2. 没有加载texture的情况下，一旦加载了要能更新
     */
    async test1(){
        var fSp = new Sprite();
        var tex = new Texture();
        tex.load('./res/monkey0.png');
        fSp.graphics.drawTriangles(tex,0,0,
            new Float32Array([0,0, 200, 0, 200, 200, 0, 200]), 
            new Float32Array([0,0,1,0,1,1,0,1]), 
            new Uint16Array([0,1,2,0,2,3]));
        var maskSp= new Sprite();
        maskSp.graphics.drawPie(100,100, 100, 0,190, 'green');
        Laya.stage.addChild(fSp);
        fSp.mask = maskSp;
        //Laya.stage.addChild(maskSp);

        delay(100);
        
        (window as any).testEnd=true;   // 告诉测试程序可以停止了
    }
}

//激活启动类
new Main();
