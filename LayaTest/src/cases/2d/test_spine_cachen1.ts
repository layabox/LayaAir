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
import { Spine2DRenderNode } from "laya/spine/Spine2DRenderNode";
import { SpineTemplet } from "laya/spine/SpineTemplet";
import { Image } from "laya/ui/Image";

//HierarchyLoader和MaterialLoader等是通过前面的import完成的

let packurl = 'sample-resource/2d'
async function test() {
    //初始化引擎
    await Laya.init(0, 0);
    Laya.stage.scaleMode = Stage.SCALE_FULL;
    Laya.stage.screenMode = Stage.SCREEN_NONE;
    Shader3D.debugMode = true;

    await Laya.loader.loadPackage(packurl, null, null);
    let tex = await Laya.loader.load('atlas/comp/image.png')
    let sp = new Sprite();
    //sp.graphics.fillText('Abc文字',100,100,'36px Arial','red',"left");
    //sp.graphics.fillText('文字',100,150,'36px Arial','red',"left");
    //sp.graphics.fillTexture(tex,100,200,800,100);
    sp.graphics.drawTexture(tex, 100, 100);
    sp.cacheAs = 'normal'
    //Laya.stage.addChild(sp);

    let player = new Sprite();
    Laya.loader.load("sample-resource/2d/spine/spineboy-pma.skel").then((templete: SpineTemplet) => {
        //添加spine组件
        let com = player.addComponent(Spine2DRenderNode);
        com.source = "sample-resource/2d/spine/spineboy-pma.skel";
        com.animationName = "walk";
        player.width = 100;
        player.height = 100;
        player.pos(400, 600);
        com.paused();
        com.currentTime = 100;
    });
    Laya.stage.addChild(player);

    let sp1 = new Sprite();
    sp1.graphics.drawTexture(tex, 110, 110);
    sp1.cacheAs = 'normal'
    Laya.stage.addChild(sp1);

}


test();