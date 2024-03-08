import "laya/ModuleDef";
import "laya/ani/ModuleDef";
import "laya/d3/ModuleDef";
import "laya/d3/core/scene/Scene3D";
import "laya/d3/physics/ModuleDef";
import "laya/gltf/glTFLoader";
import "laya/spine/ModuleDef";
import "laya/ui/ModuleDef";

import { Laya } from "../../../Laya";
import { Shader3D } from "../../RenderEngine/RenderShader/Shader3D";
import { Sprite } from "../../display/Sprite";
import { Stage } from "../../display/Stage";

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
    sp.graphics.clipRect(10,10,400,200);
    sp.graphics.drawTriangles(tex,0,0,
        new Float32Array([10,10, 400,10, 400,400, 10,400]),
        new Float32Array([0,0, 1,0, 1,1, 0,1]), 
        new Uint16Array([0,1,2]),null,null);
    Laya.stage.addChild(sp);

    function renderloop(){
        requestAnimationFrame(renderloop);
    }
    requestAnimationFrame(renderloop)
}


test();