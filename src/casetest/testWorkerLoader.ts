import { delay } from './delay.js'
import { Laya } from 'Laya.js';
import { Texture2D } from 'laya/resource/Texture2D.js';
import { Texture } from 'laya/resource/Texture.js';
import { WorkerLoader } from 'laya/net/WorkerLoader.js';
import { Sprite } from 'laya/display/Sprite.js';

class Main {
    constructor() {
        Laya.init(800, 600);
        //Laya.stage.scaleMode = 'fixedwidth';
        Laya.stage.screenMode = 'none';
        //Laya.Stat.show();
        this.test1();
    }

    /**
     */
    async test1() {
        console.warn('请在火狐浏览器打开');
        const workerLoader = new WorkerLoader();
        const url = 'http://127.0.0.1:8888/bin/res/pixi/laser01.png';
        workerLoader.on(url, this, function (bitmap: ImageBitmap) {
            const texture2D = new Texture2D();
            texture2D.loadImageSource(bitmap);// 火狐浏览器显示异常
            // texture2D.loadImageSource(bitmap, true);// 正常
            const sp = new Sprite();
            Laya.stage.addChild(sp);
            sp.graphics.drawTexture(new Texture(texture2D));
        });

        workerLoader.loadImage(url);

        await delay(10);  // 等待渲染结果
        (window as any).testEnd = true;   // 告诉测试程序可以停止了
    }
}

//激活启动类
new Main();
