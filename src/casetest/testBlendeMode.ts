
import { delay, loadRes } from './delay'
import { Laya } from 'Laya';
import { Sprite } from 'laya/display/Sprite';
import { Image } from 'laya/ui/Image';
import { getResPath } from './resPath';
export class Main {
    constructor() {
        Laya.init(800, 600);
        //Laya.stage.scaleMode = 'fixedwidth';
        Laya.stage.screenMode = 'none';
        //Laya.Stat.show();
        Laya.stage.bgColor = '#ffffff';
        this.test1();
    }

    /**
     * 测试混合模式
     */
    async test1() {
        await loadRes(getResPath('monkey0.png'));

        //画图先
        var node = new Sprite();
        node.cacheAs = "bitmap";//设置缓存
        Laya.stage.addChild(node);
        node.width = Laya.stage.width;
        node.height = Laya.stage.height;
        //node = Laya.stage;

        var bg = new Sprite();
        bg.alpha = 0.5;
        bg.graphics.drawRect(0, 0, Laya.stage.width, Laya.stage.height, '#000000');
        node.addChild(bg);
        //创建遮罩
        var mask = new Sprite();
        mask.blendMode = "destination-out";    // 
        mask.graphics.clear();
        mask.graphics.drawRect(100, 100, 100, 100, '#000000');//画矩形如果没有先画圆形会黑
        node.addChild(mask);

        var m1 = new Sprite();
        m1.blendMode = "destination-out";
        m1.graphics.clear();
        m1.graphics.drawCircle(30, 30, 30, '#000000');
        m1.pos(0, 0);
        node.addChild(m1);
        var sp1 = new Image();
        sp1.skin = getResPath('monkey0.png');
        Laya.stage.addChild(sp1);

        var sp2 = new Image();
        sp2.pos(100, 0);
        sp2.skin = getResPath('monkey0.png');
        Laya.stage.addChild(sp2);
        delay(100);

        (window as any).testEnd = true;   // 告诉测试程序可以停止了
    }
}

new Main();