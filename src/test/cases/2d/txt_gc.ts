import "laya/ModuleDef";
import "laya/ui/ModuleDef";
import "laya/ani/ModuleDef";

import { Laya } from "../../../layaAir/Laya";
import { Shader3D } from "../../../layaAir/laya/RenderEngine/RenderShader/Shader3D";
import { Stage } from "../../../layaAir/laya/display/Stage";
import { Sprite } from "../../../layaAir/laya/display/Sprite";
import { TextRender } from "../../../layaAir/laya/webgl/text/TextRender";
import { captureAndSend } from "../../result";

//HierarchyLoader和MaterialLoader等是通过前面的import完成的

let packurl = 'sample-resource/2d'
async function test(){
    //初始化引擎
    TextRender.atlasWidth=128;
    await Laya.init(0,0);
    Laya.stage.scaleMode = Stage.SCALE_FULL;
    Laya.stage.screenMode = Stage.SCREEN_NONE;
    Shader3D.debugMode = true;

    await Laya.loader.loadPackage(packurl);
    let tex = await Laya.loader.load('atlas/comp/image.png')
    let sp = new Sprite();
    //sp.graphics.drawTexture(tex,100,100,null,null,null);
    //先占用三张贴图
    sp.graphics.fillText('天地玄黄宇宙洪荒',100,100,'32px Arial','red',"left");
    sp.graphics.fillText('日月盈仄辰宿列张',100,130,'32px Arial','red',"left");
    sp.graphics.fillText('寒来暑往秋收冬藏',100,160,'32px Arial','red',"left");
    //sp.graphics.drawTexture(tex,100,300,null,null,null);
    Laya.stage.addChild(sp);

    //建立一个sprite，每张贴图的字都用一个，然后想法gc，应该渲染正确
    let sp1 = new Sprite();
    sp1.graphics.fillText('天日寒',0,0,'32px Arial','red',"left");
    sp1.pos(100,220);
    sp1.cacheAs='normal'
    Laya.stage.addChild(sp1);

    let txtRender = TextRender.textRenderInst;
    let txtRenderAtlasNum=0;
    txtRender.on('GC',()=>{
        txtRenderAtlasNum = txtRender.textAtlases.length;
    })

    let frm=0;
    function renderloop(){
        frm++;
        if(frm==100){
            sp.removeSelf();
            setTimeout(() => {
                if(txtRenderAtlasNum!=2) throw '错了，应该释放图集'
            }, 6000);
        }
        requestAnimationFrame(renderloop);
    }
    requestAnimationFrame(renderloop)
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