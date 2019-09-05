import {delay} from './delay.js'
import { Laya } from 'Laya.js';
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
     * cacheas normal 
     * 如果上层的clip改变了，cache好的内容必须要受到正确的影响。
     * 简单实现是暂时撤销cache
     */
    async test1(){
        var sp1 = new Sprite();
        sp1.pos(100,100);
        //sp1.graphics.drawRect(0,0,100,100,'red');
        Laya.stage.addChild(sp1);
        sp1.graphics.save();                                // clip 会累积，所以要save，restore
        sp1.graphics.clipRect(10,10,120,120);               // 正好这个方框大小的裁剪
        sp1.graphics.drawRect(10,10,120,120,null,'red');    // 画一个红色方框
        sp1.graphics.restore();
        //sp1.cacheAs='normal';

        var sp2 = new Sprite();
        //sp2.graphics.clipRect(10,10,20,20);
        sp2.pos(10,10);
        sp2.graphics.drawRect(0,0,100,100,'green');         // 从0开始，所以左上部分会被裁剪
        //Laya.stage.addChild(sp2);
        sp2.cacheAs='normal';
        sp1.addChild(sp2);

        await delay(1000);
        //sp2.cacheAs='none';
        sp1.graphics.clear();
        sp1.graphics.drawRect(10,10,300,300,null,'red');    // 画一个更大的红色方框
        sp1.graphics.clipRect(10,10,300,300);               // 裁剪变大，
        sp2.pos(100,100);

        await delay(10);  // 等待渲染结果
        (window as any).testEnd=true;   // 告诉测试程序可以停止了
    }
}

//激活启动类
new Main();
