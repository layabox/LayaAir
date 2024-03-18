import "laya/ModuleDef";

import { Laya } from "../../../Laya";
import { Shader3D } from "../../RenderEngine/RenderShader/Shader3D";
import { Stage } from "../../display/Stage";
import { Sprite } from "../../display/Sprite";
import { GlowFilter } from "../../filters/GlowFilter";
import { Texture2D } from "../../resource/Texture2D";
import { Texture } from "../../resource/Texture";

//HierarchyLoader和MaterialLoader等是通过前面的import完成的

let packurl = 'sample-resource/2d'
async function test(){
    //初始化引擎
    await Laya.init(0,0);
    Laya.stage.scaleMode = Stage.SCALE_FULL;
    Laya.stage.screenMode = Stage.SCREEN_NONE;
    Shader3D.debugMode = true;

    await Laya.loader.loadPackage(packurl, null, null);
    let tex = new Texture(Texture2D.whiteTexture);
    let sp = new Sprite();
    sp.graphics.drawTexture(tex,0,0,100,100,null);
    let glow = new GlowFilter('#ff00ff',30,-10,-10);
    //TODO 如果偏移太大，还是会被裁剪
    sp.filters=[glow];
    sp.pos(100,100);
    Laya.stage.addChild(sp);

    function renderloop(){
        requestAnimationFrame(renderloop);
    }
    requestAnimationFrame(renderloop)
}


test();