import "laya/ModuleDef";
import "laya/ui/ModuleDef";
import "laya/ani/ModuleDef";

import { Laya } from "Laya";
import { Shader3D } from "laya/RenderEngine/RenderShader/Shader3D";
import { Stage } from "laya/display/Stage";
import { Sprite } from "laya/display/Sprite";
import { TextRender } from "laya/webgl/text/TextRender";
import { captureAndSend } from "../../result";

//HierarchyLoader和MaterialLoader等是通过前面的import完成的

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
    sp.graphics.fillText('根',0,0,'32px Arial','red',"left");
    //sp.graphics.drawTexture(tex,100,100,null,null,null);
    //sp.graphics.drawTexture(tex,100,300,null,null,null);
    sp.rotation=45;
    sp.pos(100,100)
    Laya.stage.addChild(sp);

    //建立一个sprite，每张贴图的字都用一个，然后想法gc，应该渲染正确
    let sp1 = new Sprite();
    sp1.graphics.fillText('子',0,0,'32px Arial','red',"left");
    //sp1.graphics.drawTexture(tex,0,0,null,null,null);
    sp1.pos(100,100);
    sp.addChild(sp1)
    sp1.cacheAs='normal';

    function renderloop(){
        requestAnimationFrame(renderloop);
    }
    requestAnimationFrame(renderloop)
}


test();