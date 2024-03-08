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
    let tex = await Laya.loader.load('atlas/comp/image.png')
    let sp = new Sprite();
    sp.graphics.drawTexture(tex);
    Laya.stage.addChild(sp);

    let sp1 = new Sprite();
    sp1.graphics.drawTexture(tex);
    sp1.x=100;
    sp1.y=100;
    sp.addChild(sp1);

    sp.cacheAs='bitmap'
    let n =0;

    function renderloop(){
        n++;
        if(n==100){
            sp1.pos(300,100);
        }
        requestAnimationFrame(renderloop);
    }
    requestAnimationFrame(renderloop)
}


test();