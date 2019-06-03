import {delay} from './delay.js'
import { Text } from 'laya/display/Text.js';
import { Laya } from 'Laya.js';

/**
 * 检查文字渲染正确
 */
class Main {
	constructor() {
        Laya.init(800,600);
		//Laya.stage.scaleMode = 'fixedwidth';
		Laya.stage.screenMode = 'none';
        //Laya.Stat.show();
        this.test1();
    }

    async test1(){
        var t1 = new Text();
        t1.fontSize = 30;
        t1.text = 'g';       // bug:最下面被裁掉了
        t1.color='red';
        Laya.stage.addChild(t1);

       
        await delay(10);  // 等待渲染结果
        (window as any).testEnd=true;   // 告诉测试程序可以停止了
    }
}

//激活启动类
new Main();
