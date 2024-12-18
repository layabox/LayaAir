import "laya/ModuleDef";

import { Laya } from "Laya";
import { Stage } from "laya/display/Stage";
import { Sprite } from "laya/display/Sprite";
import { RenderSprite } from "laya/renders/RenderSprite";
import { VBox } from "laya/ui/VBox";
import { HBox } from "laya/ui/HBox";

//HierarchyLoader和MaterialLoader等是通过前面的import完成的
RenderSprite.cacheNormalEnable = false;
async function test(){
    //初始化引擎
    await Laya.init(0,0);
    Laya.stage.scaleMode = Stage.SCALE_FULL;
    Laya.stage.screenMode = Stage.SCREEN_NONE;

    let sp = new Sprite();
    //sp.graphics.clipRect(0,0,150,150);
    sp.graphics.drawRect(0,0,400,400,'gray','yellow',2)
    sp.pos(100,100)
    Laya.stage.addChild(sp);

    let box = new HBox();
    box.space=5;
    box.bgColor='#aabbcc';
    box.pos(10,10);
    box.width=230;
    box.height=300;
    sp.addChild(box);

    let sp1 = new Sprite();
    //要排版的话，需要明确指定自己的大小
    sp1.width=100;
    sp1.height=100;
    sp1.graphics.drawRect(0,0,100,100,'green');
    //sp1.pos(10,10);
    box.addChild(sp1);

    let sp2 = new Sprite();
    sp2.graphics.drawRect(0,0,50,50,'red');
    sp2.width=50;
    sp2.height=50;
    //sp2.pos(10,10);
    box.addChild(sp2);

    let sp3 = new Sprite();
    //要排版的话，需要明确指定自己的大小
    sp3.width=100;
    sp3.height=100;
    sp3.graphics.drawRect(0,0,100,100,'green');
    //sp1.pos(10,10);
    box.addChild(sp3);    
}


test();