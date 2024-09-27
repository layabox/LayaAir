import "laya/ModuleDef";
import "laya/ui/ModuleDef";
import "laya/ani/ModuleDef";

import { Laya } from "../../../Laya";
import { Shader3D } from "../../RenderEngine/RenderShader/Shader3D";
import { Stage } from "../../display/Stage";
import { Sprite } from "../../display/Sprite";
import { Label } from "../../ui/Label";
import { Text } from "../../display/Text";

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
    let sp = new Sprite();
    sp.graphics.drawTexture(tex,100,100,null,null,null);
    sp.graphics.fillText('Abc文字',100,100,'36px Arial','red',"left");
    sp.graphics.drawTexture(tex,100,300,null,null,null);
    sp.graphics.drawRect(150,190,300,100,'white')
    sp.graphics.fillText('Abc文字一个',200,200,'36px Arial','#bbbbbb',"left");
    sp.graphics.fillText('Abc文字一个',200,230,'36px Arial','white',"left");
    Laya.stage.addChild(sp);

    {
        let sp = new Sprite();
        sp.graphics.clipRect(0,0,150,150);
        sp.graphics.drawPoly(0,0,[0,0,100,0, 100,100],'green','yellow',2)
        sp.pos(100,100)
        Laya.stage.addChild(sp);
    }

    let txt = new Text();
    txt.strikethrough=true;
    txt.strikethroughColor='red'
    txt.color='white';
    txt.fontSize=20;
    txt.text = 'aaa\nbbb';
    txt.pos(400,400);
    Laya.stage.addChild(txt);


    function renderloop(){
        requestAnimationFrame(renderloop);
    }
    requestAnimationFrame(renderloop)
}


test();