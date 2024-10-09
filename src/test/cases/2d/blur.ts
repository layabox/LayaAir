import "laya/ModuleDef";

import { Laya } from "../../../layaAir/Laya";
import { Shader3D } from "../../../layaAir/laya/RenderEngine/RenderShader/Shader3D";
import { Stage } from "../../../layaAir/laya/display/Stage";
import { Sprite } from "../../../layaAir/laya/display/Sprite";
import { BlurFilter } from "../../../layaAir/laya/filters/BlurFilter";
import { captureAndSend } from "../../result";
import { Config } from "../../../layaAir/Config";

//HierarchyLoader和MaterialLoader等是通过前面的import完成的

let packurl = 'sample-resource/2d'
async function test(){
    //初始化引擎
    await Laya.init(0,0);
    Laya.stage.scaleMode = Stage.SCALE_FULL;
    Laya.stage.screenMode = Stage.SCREEN_NONE;
    Shader3D.debugMode = true;
    Config.preserveDrawingBuffer=false;

    await Laya.loader.loadPackage(packurl);
    let tex = await Laya.loader.load('atlas/comp/image.png')
    let sp = new Sprite();
    sp.graphics.drawTexture(tex,0,0);
    sp.filters=[new BlurFilter(10)];
    Laya.stage.addChild(sp);
}

captureAndSend(null,[{time:3000,rect:{x:0,y:0,width:500,height:500}}]);

test();