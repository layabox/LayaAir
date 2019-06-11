import {delay} from './delay.js'
import { Laya } from 'Laya.js';
import { Text } from 'laya/display/Text.js';
import { TextRender } from 'laya/webgl/text/TextRender.js';

/**
 * 检查新版文字的释放恢复是否正确
 */
class Main {
	constructor() {
        Laya.init(800,600);
		Laya.stage.screenMode = 'none';
        //Laya.Stat.show();
        this.test1();
    }

    createFromTemp(t:Text,x:number, y:number,sx:number, sy:number){
        var ret =new Text();
        ret.fontSize=t.fontSize;
        ret.color=t.color;
        ret.font=t.font;
        ret.text=t.text;
        ret.pos(x,y);
        ret.scale(sx,sy);
        Laya.stage.addChild(ret);
        return ret;
    }

    async test1(){
        // 使用小贴图，容易测试
        TextRender.atlasWidth=128;
        TextRender.destroyAtlasDt=1;
        TextRender.checkCleanTextureDt=1;
        TextRender.destroyUnusedTextureDt=1;

        var t1 = new Text();
        t1.fontSize = 50;
        t1.text = 'A';       
        t1.color='red';

        var t2 = this.createFromTemp(t1,0,0,1,1); t2.text='A\nB\nC\nD\n';
        var t3 = this.createFromTemp(t1,30,0,1,1); t3.text='E\nF\nG\nH';
        var t4 = this.createFromTemp(t1,60,0,1,1); t4.text='I\nJ\nK\nL';
        this.createFromTemp(t1,90,0,1,1).text='M\nO\nP\nQ';
        this.createFromTemp(t1,120,0,1,1).text='R\nS\na\nb';
        this.createFromTemp(t1,150,0,1,1).text = 'A\nO\nP\nQ';  //使用A
        var t8 = this.createFromTemp(t1,180,0,1,1);t8.text='c\n\n\n';
        this.createFromTemp(t1,210,0,1,1).text='E';

        await delay(20);

        t2.visible=false;
        t3.visible=false;
        t4.visible=false;

        await delay(10);
        TextRender.textRenderInst.GC();
        await delay(10);    // 过一帧再GC才能触发删除贴图
        TextRender.textRenderInst.GC();

        await delay(10);
        //t2.visible=true;

        await delay(10);  // 等待渲染结果
        (window as any).testEnd=true;   // 告诉测试程序可以停止了
    }
}

//激活启动类
new Main();
