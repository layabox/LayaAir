import "laya/ModuleDef";
import "laya/ui/ModuleDef";
import "laya/ani/ModuleDef";

import { Laya } from "Laya";
import { Shader3D } from "laya/RenderEngine/RenderShader/Shader3D";
import { Stage } from "laya/display/Stage";
import { Sprite } from "laya/display/Sprite";
import { TextRender } from "laya/webgl/text/TextRender";
import { captureAndSend } from "../../result";
import { TextTexture } from "laya/webgl/text/TextTexture";
import { Stat } from "laya/utils/Stat";
import { LayaGL } from "laya/layagl/LayaGL";
import { GPUEngineStatisticsInfo } from "laya/RenderEngine/RenderEnum/RenderStatInfo";
import { Text } from "laya/display/Text";

//HierarchyLoader和MaterialLoader等是通过前面的import完成的

let packurl = 'sample-resource/2d'
async function test(){
    //初始化引擎
    TextRender.atlasWidth=128;
    await Laya.init(0,0);
    Laya.stage.scaleMode = Stage.SCALE_FULL;
    Laya.stage.screenMode = Stage.SCREEN_NONE;
    Shader3D.debugMode = true;
    LayaGL.renderEngine._enableStatistics = true;

    let st = LayaGL.renderEngine.getStatisticsInfo(GPUEngineStatisticsInfo.M_GPUMemory);
    let tex = new TextTexture(512,512);
    let st2 = LayaGL.renderEngine.getStatisticsInfo(GPUEngineStatisticsInfo.M_GPUMemory);
    tex.destroy();
    let st1 = LayaGL.renderEngine.getStatisticsInfo(GPUEngineStatisticsInfo.M_GPUMemory);
    if(st==st1 && st2>st){
        let sp = new Text();
        sp.color='white'
        sp.text ='OK'
        sp.fontSize=32;
        sp.pos(100,100)
        Laya.stage.addChild(sp);    
    }
}

/*
captureAndSend(null,
[{
    "time": 300,
    "rect": {
      "x": 77,
      "y": 74,
      "width": 297,
      "height": 237
    }},
    {
        "time": 3000,
        "rect": {
          "x": 77,
          "y": 74,
          "width": 297,
          "height": 237
        }}]);
*/
test();