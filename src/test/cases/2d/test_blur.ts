import "laya/ModuleDef";

import { Laya } from "Laya";
import { Shader3D } from "laya/RenderEngine/RenderShader/Shader3D";
import { Stage } from "laya/display/Stage";
import { Sprite } from "laya/display/Sprite";
import { BlurFilter } from "laya/filters/BlurFilter";
import { captureAndSend } from "../../result";
import { Config } from "Config";

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
    {
        let p = new Sprite();
        let sp = new Sprite();
        sp.scale(0.5, 0.5)
        sp.graphics.drawTexture(tex, 0, 0);
        p.addChild(sp);
        sp.pos(100, 120);
        Laya.stage.addChild(p);

        p.pos(200, 100)

        sp.filters = [new BlurFilter(10)];
        // setTimeout(() => {
        // }, 3000);
    }

    {
        let p = new Sprite();
        let sp = new Sprite();
        sp.scale(0.5, 0.5)
        sp.graphics.drawTexture(tex, 0, 0);
        //sp.graphics.drawRect(0,0,100,100,'red');
        p.addChild(sp);
        sp.pos(100, 100);
        Laya.stage.addChild(p);

        p.pos(10, 10)

        p.filters = [new BlurFilter(10)];
        // setTimeout(() => {
        // }, 3000);
    }    

    {
        let p = new Sprite();
        let sp = new Sprite();
        //sp.scale(0.5, 0.5)
        sp.graphics.drawRect(0,0,100,100,'red');
        p.addChild(sp);
        sp.pos(60, 60);
        Laya.stage.addChild(p);

        p.pos(10, 10)

        p.filters = [new BlurFilter(10)];
        // setTimeout(() => {
        // }, 3000);
    }        
}

//captureAndSend(null,[{time:100,rect:{x:0,y:0,width:500,height:500}}]);

test();