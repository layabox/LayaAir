
import {delay, loadRes} from './delay.js'
import { Laya } from 'Laya.js';
import { Text } from 'laya/display/Text.js';

class Main {
	constructor() {
        Laya.init(800,600);
		//Laya.stage.scaleMode = 'fixedwidth';
		Laya.stage.screenMode = 'none';
        //Laya.Stat.show();
        this.test1();
    }
    
    /**
     * 微软雅黑会偏上，从而导致上面被裁剪了
     */
    async test1(){
        var t1 = new Text();
        t1.pos(100,100);
        t1.color='red';
        t1.bold=true;
        t1.fontSize=16;
        t1.font='Microsoft YaHei';
        t1.text = '有';
        t1.align='center';
        Laya.stage.addChild(t1);

        delay(100);
        
        (window as any).testEnd=true;   // 告诉测试程序可以停止了
    }
}

//激活启动类
new Main();
