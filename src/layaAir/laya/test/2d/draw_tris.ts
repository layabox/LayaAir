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

/**
 * 注意这个的uv是基于图集本身而不是图集中的图片
 * 所以结果是图集整体作为贴图
 */
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
        new Float32Array([0,0, 1,0, 1,1, 0,1]),     //注意这里的是绝对的，如果是图集的话，必须是图集的uv，而不是单图的
        new Uint16Array([0,1,2]),null,null);
    Laya.stage.addChild(sp);

    function renderloop(){
        requestAnimationFrame(renderloop);
    }
    requestAnimationFrame(renderloop)
}


test();