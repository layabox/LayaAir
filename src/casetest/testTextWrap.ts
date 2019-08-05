import {delay} from './delay.js'
import { Text } from 'laya/display/Text.js';
import { BitmapFont } from 'laya/display/BitmapFont.js';
import { Laya } from 'Laya.js';
import { ILaya } from 'ILaya.js';
import { Handler } from 'laya/utils/Handler.js';

export class Main {
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
		var txt = new Text();
		txt.text = "Layabox是HTML5引擎技术提供商与优秀的游戏发行商，面向AS/JS/TS开发者提供HTML5开发技术方案！";
		txt.width = 300;
		txt.fontSize = 40;
		txt.color = "#ffffff";
		//设置文本为多行文本
		txt.wordWrap = true;

		//txt.x = Laya.stage.width - txt.textWidth >> 1;
		//txt.y = Laya.stage.height - txt.textHeight >> 1;

		Laya.stage.addChild(txt);

      
        await delay(10);  // 等待渲染结果
        (window as any).testEnd=true;   // 告诉测试程序可以停止了
    }
}

//激活启动类
new Main();
