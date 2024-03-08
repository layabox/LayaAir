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
import { Stage } from "../../display/Stage";
import { usewebgl } from "./utils";

//HierarchyLoader和MaterialLoader等是通过前面的import完成的

usewebgl();
let packurl = 'sample-resource/2d'
async function test(){
    //初始化引擎
    await Laya.init(0,0);
    Laya.stage.scaleMode = Stage.SCALE_FULL;
    Laya.stage.screenMode = Stage.SCREEN_NONE;
    Shader3D.debugMode = true;

    await Laya.loader.loadPackage(packurl, null, null);
    let scene = await Laya.loader.load(packurl+'/cacheasbmp.ls');
    Laya.stage.addChild(scene.create());

    function renderloop(){
        requestAnimationFrame(renderloop);
    }
    requestAnimationFrame(renderloop)
}


test();