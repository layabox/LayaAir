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

async function test(){
    //初始化引擎
    await Laya.init(0,0);
    Laya.stage.scaleMode = Stage.SCALE_FULL;
    Laya.stage.screenMode = Stage.SCREEN_NONE;
    TextRender.scaleFontWithCtx=false;

    let sp = new Sprite();
    sp.graphics.drawRect(0,0,30,30,'gray')
    sp.graphics.fillText('文',0,0,'36px Arial','red',"left");
    sp.pos(100,100)
    Laya.stage.addChild(sp);

    setTimeout(() => {
        sp.scale(4,4);
    }, 2000);
}
/*
captureAndSend(null,[{
    "time": 300,
    "rect": {
      "x": 77,
      "y": 62,
      "width": 196,
      "height": 181
    }},
    {
        "time": 3000,
        "rect": {
          "x": 77,
          "y": 62,
          "width": 196,
          "height": 181
        }}]   ); 
*/
test();