import "laya/d3/core/scene/Scene3D";
import "laya/ModuleDef";
import "laya/d3/ModuleDef";
import "laya/d3/physics/ModuleDef";
import "laya/ui/ModuleDef";
import "laya/ani/ModuleDef";
import "laya/spine/ModuleDef";
import "laya/gltf/glTFLoader";

import { Laya } from "Laya";
import { Shader3D } from "laya/RenderEngine/RenderShader/Shader3D";
import { Stage } from "laya/display/Stage";
import { Sprite } from "laya/display/Sprite";
import { Text } from "laya/display/Text";

let packurl = 'sample-resource/2d'
async function test(){
    //初始化引擎
    await Laya.init(0,0);
    Laya.stage.scaleMode = Stage.SCALE_FULL;
    Laya.stage.screenMode = Stage.SCREEN_NONE;
    Shader3D.debugMode = true;

    await Laya.loader.loadPackage(packurl, null, null);
    let tex = await Laya.loader.load('atlas/comp/image.png')

    //parnet设置drawCallOptimize，就会在子中应用。主要是攒text渲染，text不打断合并，在render离开子的时候集中渲染文字
    let parent = new Sprite();
    parent.drawCallOptimize=true;
    Laya.stage.addChild(parent);

    let sp = new Sprite();
    sp.graphics.drawTexture(tex,100,100,null,null,null);
    parent.addChild(sp);

    let txt = new Sprite();
    txt.graphics.fillText('Abc文字',100,100,'36px Arial','red',"left");
    parent.addChild(txt);

}


test();