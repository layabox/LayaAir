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
import { usewebgl } from "../../utils";
import { captureAndSend } from "../../result";

//HierarchyLoader和MaterialLoader等是通过前面的import完成的
usewebgl();
let packurl = 'sample-resource/2d'
async function test(){
    //初始化引擎
    await Laya.init(0,0);
    Laya.stage.scaleMode = Stage.SCALE_FULL;
    Laya.stage.screenMode = Stage.SCREEN_NONE;
    Shader3D.debugMode = true;

    await Laya.loader.loadPackage(packurl);
    let tex = await Laya.loader.load('atlas/comp/image.png')
    let sp = new Sprite();
    sp.pos(0,0);
    sp.graphics.drawTexture(tex);
    sp.graphics.drawRect(0,0,100,100,null,0xff,10);
    Laya.stage.addChild(sp);

    let sp1 = new Sprite();
    sp1.graphics.drawTexture(tex);
    sp1.x=100;
    sp1.y=100;
    sp.addChild(sp1);

    sp.cacheAs='bitmap';
    let n =0;

    function renderloop(){
        n++;
        if(n==100){
            sp1.pos(300,100);
            //TODO 设置pos应该自动导致重绘
            //sp1.repaint();
        }
        requestAnimationFrame(renderloop);
    }
    requestAnimationFrame(renderloop)
}
//captureAndSend(null,[{time:300,rect:{x:0,y:0,width:606,height:428}},{time:3000,rect:{x:0,y:0,width:795,height:428}}]);

test();