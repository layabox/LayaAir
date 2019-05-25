import {delay} from './delay.js'

class Main {
	constructor() {
        Laya3D.init(800,600);
		//Laya.stage.scaleMode = 'fixedwidth';
		Laya.stage.screenMode = 'none';
        //Laya.Stat.show();
        this.test1();
    }
    
    /**
     */
    async test1(){
        var l = new Laya.WorkerLoader();
        var url = 'http://127.0.0.1:8888/res/monkey0.png';
        l.on(url, this, function(d:Laya.Texture2D) { 
            var sp = new Laya.Sprite();
            Laya.stage.addChild(sp);
            sp.graphics.drawTexture(new Laya.Texture(d));
        } );

        l.loadImage(url);
        
        await delay(10);  // 等待渲染结果
        (window as any).testEnd=true;   // 告诉测试程序可以停止了
    }
}

//激活启动类
new Main();
