import "laya/ModuleDef";

import { Laya } from "Laya";
import { Shader3D } from "laya/RenderEngine/RenderShader/Shader3D";
import { Stage } from "laya/display/Stage";
import { Sprite } from "laya/display/Sprite";
import { GlowFilter } from "laya/filters/GlowFilter";
import { Event } from "laya/events/Event";
import { BlurFilter } from "laya/filters/BlurFilter";

//HierarchyLoader和MaterialLoader等是通过前面的import完成的

let packurl = 'sample-resource/2d'
async function test(){
    //初始化引擎
    await Laya.init(0,0);
    Laya.stage.scaleMode = Stage.SCALE_FULL;
    Laya.stage.screenMode = Stage.SCREEN_NONE;
    Shader3D.debugMode = true;

    await Laya.loader.loadPackage(packurl);
    //let tex = await Laya.loader.load('atlas/comp/image.png')
    let sp = new Sprite();
    sp.anchorX=1;
    sp.anchorY=1;
    sp.pos(450,450)
    sp.size(100,100);
    sp.scale(2,2)
    sp.graphics.drawRect(0,0,100,100,'red')
    let glow = new GlowFilter('#ffffff',10,0,0);
    sp.filters=[glow];
    Laya.stage.addChild(sp);

    Laya.stage.on(Event.CLICK,()=>{
        if(sp.filters) sp.filters=null;
        else sp.filters = [new GlowFilter('#ffffff',10,0,0)]
    })
}


test();