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
import { Stage } from "laya/display/Stage";
import { RenderSprite } from "laya/renders/RenderSprite";
import { Stat } from "laya/utils/Stat";

//HierarchyLoader和MaterialLoader等是通过前面的import完成的
let packurl = 'sample-resource/2d';
(window as any).testtime=1000; //多等一会儿
async function test(){
    //初始化引擎
    await Laya.init(0,0);
    Laya.stage.scaleMode = Stage.SCALE_FULL;
    Laya.stage.screenMode = Stage.SCREEN_NONE;
    Shader3D.debugMode = true;
    Stat.show();

    RenderSprite;
    await Laya.loader.loadPackage(packurl);
    let scene = await Laya.loader.load(packurl+'/cacheasbmp.ls');
    let inst = scene.create();
    inst._children[0].cacheAs='none';//'normal';
    Laya.stage.addChild(inst);

    function renderloop(){
        requestAnimationFrame(renderloop);
    }
    requestAnimationFrame(renderloop)
}


test();