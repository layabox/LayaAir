import "laya/d3/core/scene/Scene3D";
import "laya/ModuleDef";
import "laya/ui/ModuleDef";
import "laya/ani/ModuleDef";

import { Laya } from "../../../layaAir/Laya";
import { Shader3D } from "../../../layaAir/laya/RenderEngine/RenderShader/Shader3D";
import { Stage } from "../../../layaAir/laya/display/Stage";
import { Sprite } from "../../../layaAir/laya/display/Sprite";

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

    var gameContainer = new Sprite();
    gameContainer.graphics.drawTexture(tex,0,0,500,500)
    Laya.stage.addChild(gameContainer);

    //绘制遮罩区，含透明度，可见游戏背景
    var maskArea = new Sprite();
    maskArea.alpha = 0.5;
    maskArea.cacheAs='bitmap'
    maskArea.graphics.drawRect(0, 0, Laya.stage.width, Laya.stage.height, "#000000");
    Laya.stage.addChild(maskArea);

    //绘制一个圆形区域，利用叠加模式，从遮罩区域抠出可交互区
    let interactionArea = new Sprite();
    //设置叠加模式
    interactionArea.blendMode = "destination-out";
    interactionArea.graphics.clear();
    interactionArea.graphics.drawCircle(300,300,100, "#000000");
    maskArea.addChild(interactionArea);

}


test();