import {delay} from './delay'
import {Laya3D} from "Laya3D"
import { Laya } from 'Laya';
import { Text } from 'laya/display/Text';
import { Sprite } from 'laya/display/Sprite';
import { HTMLChar } from 'laya/utils/HTMLChar';

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
        var sp = new Sprite();
        var g = sp.graphics;
        g.fillText('filltext',10,10,'30px Arial', 'red',null);
        g.fillBorderText('fillBorderText',10,40,'30px Arial', 'red','green',3,null);
        g.strokeText('stroketext',10,70,'60px Arial','red',3,null);
        var c1 = new HTMLChar();
        c1.char='ab'
        c1.charNum=2;
        c1.x=10;
        c1.y=10;
        var c2 = new HTMLChar();
        c2.char='c'
        c2.charNum=1;
        c2.x=60;
        c2.y=12;
        var words = [c1,c2];
        g.fillWords(words,10,120,'30px Arial','blue');
        g.fillBorderWords(words,10,160,'50px Arial','yellow','red',2);
        g.fillBorderWords(words,10,200,'50px Arial',null,'red',2);

        Laya.stage.addChild(sp);

        var sp1 = new Sprite();
        var g2 = sp1.graphics;
        g2.fillText('filltext1', 10,400,'30px Arial', 'red',null);
        g2.strokeText('filltext1', 10,430,'50px Arial', 'red',3,null);
        g2.fillBorderWords(words,10,460,'50px Arial',null,'red',2);

        g2.replaceTextColor('green');
        Laya.stage.addChild(sp1);
        await delay(10);  // 等待渲染结果
        (window as any).testEnd=true;   // 告诉测试程序可以停止了
    }
}

//激活启动类
new Main();
