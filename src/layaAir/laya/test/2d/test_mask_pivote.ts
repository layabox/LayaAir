import "laya/d3/core/scene/Scene3D";
import "laya/ModuleDef";
import "laya/ui/ModuleDef";
import "laya/ani/ModuleDef";

import { Laya } from "../../../Laya";
import { Shader3D } from "../../RenderEngine/RenderShader/Shader3D";
import { Stage } from "../../display/Stage";
import { Sprite } from "../../display/Sprite";

//设置了pivote后的mask效果

function addPosMask(x:number, y:number,color:string){
    let pos = new Sprite();
    //h
    pos.graphics.drawLine(x-10,y,x+10,y,color);
    //v
    pos.graphics.drawLine(x,y-10,x,y+10,color);
    Laya.stage.addChild(pos);
    return pos;
}

async function test(){
    //初始化引擎
    await Laya.init(0,0);
    Laya.stage.scaleMode = Stage.SCALE_FULL;
    Laya.stage.screenMode = Stage.SCREEN_NONE;
    Shader3D.debugMode = true;
    
    let sp = new Sprite();
    sp.graphics.drawRect(0,0,100,100,'red','yellow',3);
    sp.pivot(50,50)
    sp.pos(100,100);
    //sp.rotation=-90;
    Laya.stage.addChild(sp);

    let mask = new Sprite();
    //mask.graphics.drawPie(50,50,50,0,90,'white');
    sp.mask=mask;
    mask.pivot(50,50);
    mask.pos(50,50)
    //sp.addChild(mask);
    //Laya.stage.addChild

    addPosMask(100,100,'green');


    let end = 0;
    function renderloop(){
        mask.graphics.drawPie(50,50,50,0,end,'white');
        end++;
        if(end>360)end=0;
        requestAnimationFrame(renderloop);
    }
    requestAnimationFrame(renderloop)
}


test();