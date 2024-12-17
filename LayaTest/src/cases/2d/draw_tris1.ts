import "laya/ModuleDef";
import "laya/ani/ModuleDef";
import "laya/d3/ModuleDef";
import "laya/d3/core/scene/Scene3D";
import "laya/d3/physics/ModuleDef";
import "laya/gltf/glTFLoader";
import "laya/spine/ModuleDef";
import "laya/ui/ModuleDef";

import { Laya } from "Laya";
import { Shader3D } from "laya/RenderEngine/RenderShader/Shader3D";
import { Sprite } from "laya/display/Sprite";
import { Stage } from "laya/display/Stage";

/**
 * 先画triangles，然后drawTexture，由于走了_inner_drawTexture的三角形和texture的优化流程，导致
 * 后面的drawtexture不显示
 */
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
    //sp.graphics.clipRect(10,10,400,200);
    sp.graphics.drawTriangles(tex,0,10,
        new Float32Array([10,10, 400,10, 400,400, 10,400]),
        new Float32Array([0,0, 1,0, 1,1, 0,1]), 
        new Uint16Array([0,1,2]),null,null);

    sp.graphics.drawTexture(tex,100,100,100,100);

    Laya.stage.addChild(sp);
}


test();