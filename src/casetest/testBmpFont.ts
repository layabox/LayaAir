import { delay } from './delay.js'
import { Text } from 'laya/display/Text.js';
import { BitmapFont } from 'laya/display/BitmapFont.js';
import { Laya } from 'Laya.js';
import { ILaya } from 'ILaya.js';
import { Handler } from 'laya/utils/Handler.js';
import { getResPath } from './resPath.js';

export class Main {
    constructor() {
        Laya.init(800, 600);
        //Laya.stage.scaleMode = 'fixedwidth';
        Laya.stage.screenMode = 'none';
        //Laya.Stat.show();

        let bmpfont = new BitmapFont();
        bmpfont.loadFont(getResPath('bitmapFont/test.fnt'), new Handler(this, this.test1, [bmpfont]));
    }

    /**
     */
    async test1(bmpfont: BitmapFont) {
        bmpfont.setSpaceWidth(10);

        var txt = new Text();
        txt.width = 250;
        txt.wordWrap = true;
        txt.text = "Do one thing at a time, and do well.";
        txt.font = 'testfont';
        txt.leading = 5;
        txt.pos(ILaya.stage.width - txt.width >> 1, ILaya.stage.height - txt.height >> 1);
        ILaya.stage.addChild(txt);

        await delay(10);  // 等待渲染结果
        (window as any).testEnd = true;   // 告诉测试程序可以停止了
    }
}

//激活启动类
new Main();
