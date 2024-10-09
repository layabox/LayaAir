import "laya/d3/core/scene/Scene3D";
import "laya/ModuleDef";
import "laya/ui/ModuleDef";
import "laya/ani/ModuleDef";

import { Laya } from "../../../layaAir/Laya";
import { Shader3D } from "../../../layaAir/laya/RenderEngine/RenderShader/Shader3D";
import { Stage } from "../../../layaAir/laya/display/Stage";
import { Sprite } from "../../../layaAir/laya/display/Sprite";
import { Templet } from "../../../layaAir/laya/ani/bone/Templet";
import { Event } from "../../../layaAir/laya/events/Event";
import { URL } from "../../../layaAir/laya/net/URL";

//HierarchyLoader和MaterialLoader等是通过前面的import完成的

async function test(){
    //初始化引擎
    await Laya.init(0,0);
    Laya.stage.scaleMode = Stage.SCALE_FULL;
    Laya.stage.screenMode = Stage.SCREEN_NONE;
    Shader3D.debugMode = true;
    URL.basePath += "sample-resource/";
    let templet:Templet = await Laya.loader.load("res/spine/spineRes4/stretchyman.sk");

    //创建模式为1，可以启用换装
    let skanim = templet.buildArmature(1);
    skanim.x = 200;
    skanim.y = 400;
    skanim.scale(0.5, 0.5);
    Laya.stage.addChild(skanim);
    skanim.on(Event.STOPPED, null, ()=>{
        debugger;
    });

    let n = skanim.getAnimNum();
    skanim.play(0,true);
}


test();