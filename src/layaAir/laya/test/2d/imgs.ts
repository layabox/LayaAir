import "laya/d3/core/scene/Scene3D";
import "laya/ModuleDef";
import "laya/d3/ModuleDef";
import "laya/d3/physics/ModuleDef";
import "laya/ui/ModuleDef";
import "laya/ani/ModuleDef";
import "laya/spine/ModuleDef";
import "laya/gltf/glTFLoader";

import { Laya } from "../../../Laya";
import { Shader3D } from "../../RenderEngine/RenderShader/Shader3D";
import { Stage } from "../../display/Stage";
import { Sprite } from "../../display/Sprite";

//HierarchyLoader和MaterialLoader等是通过前面的import完成的

let packurl = 'sample-resource/2d'
async function test(){
    //初始化引擎
    await Laya.init(0,0);
    Laya.stage.scaleMode = Stage.SCALE_FULL;
    Laya.stage.screenMode = Stage.SCREEN_NONE;
    Shader3D.debugMode = true;

    await Laya.loader.loadPackage(packurl, null, null);
    let tex = await Laya.loader.load('atlas/comp/image.png')
    let sp = new Sprite();
    sp.graphics.drawTexture(tex,100,100,null,null,null,0.4);
    sp.graphics.drawTexture(tex,110,110,null,null,null,0.4);
    sp.graphics.drawTexture(tex,120,120,null,null,null,0.4);
    sp.graphics.drawTexture(tex,130,130,null,null,null,0.4);
    sp.graphics.drawTexture(tex,140,140,null,null,null,0.4);
    Laya.stage.addChild(sp);

    function renderloop(){
        requestAnimationFrame(renderloop);
    }
    requestAnimationFrame(renderloop)
}


test();