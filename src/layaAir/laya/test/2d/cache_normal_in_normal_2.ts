import "laya/ModuleDef";

import { Laya } from "../../../Laya";
import { Stage } from "../../display/Stage";
import { Sprite } from "../../display/Sprite";
import { RenderSprite } from "../../renders/RenderSprite";

//HierarchyLoader和MaterialLoader等是通过前面的import完成的
//RenderSprite.cacheNormalEnable = false;
/**
 * 这里面的裁剪目前有问题，但是暂时不好解决
 * 就是画cache的结果的时候，需要合并裁剪，但是如果cache的本地裁剪与父裁剪不在一个空间，例如cache有旋转，则目前的机制无法正确处理
 */
async function test(){
    //初始化引擎
    await Laya.init(0,0);
    Laya.stage.scaleMode = Stage.SCALE_FULL;
    Laya.stage.screenMode = Stage.SCREEN_NONE;

    let sp = new Sprite();
    sp.graphics.clipRect(0,0,450,450);
    sp.graphics.drawRect(0,0,200,200,'gray','yellow',2)
    sp.pos(100,100)

    //建立一个sprite，每张贴图的字都用一个，然后想法gc，应该渲染正确
    let sp1 = new Sprite();
    sp1.graphics.drawRect(0,0,100,100,'green');
    sp1.pos(10,10);
    sp1.rotation=10;
    sp1.name='parent normal'
    sp1.cacheAs='normal';

    let sp2 = new Sprite();
    sp2.graphics.drawRect(0,0,50,50,'red');
    sp2.pos(10,10);
    sp2.scale(0.5,0.5)

    let sp3 = new Sprite();
    sp3.graphics.drawRect(0,0,100,100,'blue');
    sp3.pos(10,10);
    sp3.rotation=-10;
    sp3.name='child normal1'
    sp3.cacheAs='normal'

    let sp4 = new Sprite();
    sp4.graphics.drawRect(0,0,50,50,'black');
    sp4.pos(10,10);


    let sp5 = new Sprite();
    sp5.graphics.drawRect(0,0,100,100,'#ff00ff');
    sp5.pos(50,10);
    sp5.rotation=-10;
    sp5.name='child normal2'
    sp5.cacheAs='normal'

    let sp6 = new Sprite();
    sp6.graphics.drawRect(0,0,50,50,'#ffee00');
    sp6.pos(10,10);

    Laya.stage.addChild(sp).addChild(sp1).addChild(sp2);
    sp2.addChild(sp3).addChild(sp4);
    sp2.addChild(sp5).addChild(sp6);

}


test();