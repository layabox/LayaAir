import "laya/ModuleDef";

import { Laya } from "../../../layaAir/Laya";
import { Shader3D } from "../../../layaAir/laya/RenderEngine/RenderShader/Shader3D";
import { Stage } from "../../../layaAir/laya/display/Stage";
import { Sprite } from "../../../layaAir/laya/display/Sprite";
import { BlurFilter } from "../../filters/BlurFilter";
import { GlowFilter } from "../../filters/GlowFilter";

/**
 * 多个glow的话，允许使用同一个对象
 */

let packurl = 'sample-resource/2d'
async function test(){
    //初始化引擎
    await Laya.init(0,0);
    Laya.stage.scaleMode = Stage.SCALE_FULL;
    Laya.stage.screenMode = Stage.SCREEN_NONE;
    Shader3D.debugMode = true;

    await Laya.loader.loadPackage(packurl, null, null);
    let sp = new Sprite();
    sp.width=200;
    sp.pos(100,100);
    sp.graphics.drawRect(20,20,10,10,'white');
    sp.graphics.drawRect(40,40,100,100,'white');
    let g = new GlowFilter('#ff00ff',1,-10,-10);
    let b = new BlurFilter(10)
    sp.filters=[g,g,b,b];
    Laya.stage.addChild(sp);

    let ss = new Sprite();
    ss.pos(100,100);
    ss.graphics.drawRect(0,0,200,200,null,'red');
    Laya.stage.addChild(ss);

    function renderloop(){
        sp.repaint();
        requestAnimationFrame(renderloop);
    }
    requestAnimationFrame(renderloop)    
}


test();