import {delay,loadRes} from './delay.js'
import { Laya } from 'Laya.js';
import { Skeleton } from 'laya/ani/bone/Skeleton.js'
import { getResPath } from './resPath.js';

class Main {
	constructor() {
        Laya.init(800,600);
		//Laya.stage.scaleMode = 'fixedwidth';
        Laya.stage.screenMode = 'none';
        //Laya.Stat.show();
        this.test1();
    }
    
    addsp(){
        var sk = new Skeleton();
        Laya.stage.addChild(sk);
        sk.pos(Math.random()*800,Math.random()*600);
        sk.load(getResPath('spine/vine.sk'));
        sk.scale(0.1,0.1);
    }

    /**
     * spine动画
     */
    async test1(){

        var sk = new Skeleton();
        Laya.stage.addChild(sk);
        sk.pos(300,300);
        sk.load(getResPath('spine/vine.sk'));

        for(var i=0; i<400;i++)
            this.addsp();

        await delay(10);  // 等待渲染结果
        (window as any).testEnd=true;   // 告诉测试程序可以停止了
    }
}

//激活启动类
new Main();
