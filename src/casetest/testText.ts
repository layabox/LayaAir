import {delay} from './delay'
import { Laya } from 'Laya';
import { Text } from 'laya/display/Text';
import { TextRender } from 'laya/webgl/text/TextRender';

export class Main {
	constructor() {
        Laya.init(800,600);
		//Laya.stage.scaleMode = 'fixedwidth';
		Laya.stage.screenMode = 'none';
        //Laya.Stat.show();
        this.test1();
    }
    
    /**
     * 某张文字贴图的一部分被释放后，应该能正确恢复。
     * 有cacheas  normal的情况
     */
    async test1(){
        // 先创建两个文字贴图，由于字体较大，4个字就占一张图。
        var t1 = new Text();
        t1.fontSize = 120;
        t1.text = 'abcd';       // 1是 abcd
        t1.color='red';
        t1.cacheAs='normal';
        Laya.stage.addChild(t1);

        var t2 = new Text();
        t2.pos(0,120);
        t2.fontSize = 120;
        t2.text = 'efgh';       // 2是efgh
        t2.color='red';
        Laya.stage.addChild(t2);

        await delay(10);
        // 上面两个隐藏掉，里面的文字不再使用。
        t1.visible=false;
        t2.visible=false;
        await delay(10);
        //t3 使用第一张的3个字，第二张的1个字，如果GC的话，会导致第二张被回收，第一张的d被释放
        var t3 = new Text();
        t3.pos(0,240);
        t3.text='abce';
        t3.fontSize=120;
        t3.color='red';
        Laya.stage.addChild(t3);
        await delay(10); //等待画出来
        //t3.visible=false;
        TextRender.textRenderInst.GC();

        await delay(10);
        t1.visible=true;    // 这时候d由于被释放了，应该触发重新创建
        await delay(10);  // 等待渲染结果
        (window as any).testEnd=true;   // 告诉测试程序可以停止了
    }
}

//激活启动类
new Main();
