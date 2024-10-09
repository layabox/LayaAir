import "laya/ModuleDef";
import "laya/ani/ModuleDef";
import "laya/d3/ModuleDef";
import "laya/d3/core/scene/Scene3D";
import "laya/d3/physics/ModuleDef";
import "laya/gltf/glTFLoader";
import "laya/spine/ModuleDef";
import "laya/ui/ModuleDef";

import { Laya } from "../../../layaAir/Laya";
import { Shader3D } from "../../../layaAir/laya/RenderEngine/RenderShader/Shader3D";
import { Stage } from "../../../layaAir/laya/display/Stage";
import { usewebgl } from "../../../layaAir/laya/utils";
import { Event } from "../../../layaAir/laya/events/Event";
import { Sprite } from "../../../layaAir/laya/display/Sprite";

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
    let scene = (await Laya.loader.load(packurl+'/cacheasbmp.ls')).create();
    Laya.stage.addChild(scene);

    let state = new Sprite();
    Laya.stage.addChild(state);
    state.graphics.fillText('bitmap',100,100,'40px Arial','red','left');

    Laya.stage.on(Event.CLICK,()=>{
        let cur = scene._children[0].cacheAs;
        if(cur=='bitmap'){
            scene._children[0].cacheAs='none'
            state.graphics.clear();
            state.graphics.fillText('none',100,100,'40px Arial','red','left');
        }else{
            scene._children[0].cacheAs='bitmap'
            state.graphics.clear();
            state.graphics.fillText('bitmap',100,100,'40px Arial','red','left');
        }
    })
    function renderloop(){
        requestAnimationFrame(renderloop);
    }
    requestAnimationFrame(renderloop)
}


test();