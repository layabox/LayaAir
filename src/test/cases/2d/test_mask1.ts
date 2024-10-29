import "laya/d3/core/scene/Scene3D";
import "laya/ModuleDef";
import "laya/ui/ModuleDef";
import "laya/ani/ModuleDef";

import { Laya } from "Laya";
import { Shader3D } from "laya/RenderEngine/RenderShader/Shader3D";
import { Stage } from "laya/display/Stage";
import { Sprite } from "laya/display/Sprite";
import { Templet } from "laya/ani/bone/Templet";
import { Event } from "laya/events/Event";
import { URL } from "laya/net/URL";

//HierarchyLoader和MaterialLoader等是通过前面的import完成的

async function test(){
    //初始化引擎
    await Laya.init(0,0);
    Laya.stage.scaleMode = Stage.SCALE_FULL;
    Laya.stage.screenMode = Stage.SCREEN_NONE;
    Shader3D.debugMode = true;
    URL.basePath += "sample-resource/";

    var bg = new Sprite();
    bg.loadImage("res/bg2.png");
    Laya.stage.addChild(bg);

    let bg2 = new Sprite();
    bg2.loadImage("res/bg2.png");
    bg2.scale(3, 3);
    Laya.stage.addChild(bg2);

    //创建mask
    let maskSp = new Sprite();
    maskSp.loadImage("res/mask.png");
    maskSp.pivot(50, 50);

    //设置mask
    bg2.mask = maskSp;

    Laya.stage.on("mousemove", null, (e: Event)=>{
		bg2.x = -Laya.stage.mouseX * 2;
		bg2.y = -Laya.stage.mouseY * 2;

		maskSp.x = Laya.stage.mouseX;
		maskSp.y = Laya.stage.mouseY;
    });    
}




test();