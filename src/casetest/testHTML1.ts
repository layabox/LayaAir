import {delay} from './delay'
import {Laya3D} from "Laya3D"
import { Laya } from 'Laya';
import { HTMLDivElement } from 'laya/html/dom/HTMLDivElement';

export class Main {
	constructor() {
        Laya3D.init(800,600);
        Laya.stage.screenMode = 'none';
        Laya.stage.bgColor='gray'
        this.test1();
    }
    
    /**
     * 某张文字贴图的一部分被释放后，应该能正确恢复。
     * 有cacheas  normal的情况
     */
    async test1(){
        var aaa = new HTMLDivElement();
        aaa.innerHTML = "<p>亲爱的玩家：</p><p>{sp8}这是一个测试公告例子</p><p>{sp8}可以改<font color='#ff0000'>颜色</font>改字体</p><p>{sp1}</p><p>{sp8}上面是一个空行</p><p>{sp8}可以加超链接，但得注意本行中<a href='http://huanle.dozenking.com' target='_blank'>超链接后面不能加内容</a>中文</p><p>{sp100}达人客服敬上</p>";
        //aaa.innerHTML = "<p>亲爱的玩家：</p>";
        aaa.pos(100,100);
        aaa.scaleX = aaa.scaleY = 3;
        Laya.stage.addChild(aaa);

        await delay(10);  // 等待渲染结果
        (window as any).testEnd=true;   // 告诉测试程序可以停止了
    }
}

//激活启动类
new Main();
