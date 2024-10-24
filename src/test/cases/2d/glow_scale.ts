import "laya/ModuleDef";

import { Laya } from "Laya";
import { Shader3D } from "laya/RenderEngine/RenderShader/Shader3D";
import { Stage } from "laya/display/Stage";
import { Sprite } from "laya/display/Sprite";
import { GlowFilter } from "laya/filters/GlowFilter";
import { Text } from "laya/display/Text";
import { Texture } from "laya/resource/Texture";

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
    sp.graphics.drawTexture(tex,0,0);
    let glow = new GlowFilter('#ffffff',10,0,0);
    sp.filters=[glow];
    Laya.stage.addChild(sp);

    //当glow对象在一个缩放的对象下面的时候，要能正确缩放
    let sp1 = new Sprite();
    sp1.scale(2,2);
    Laya.stage.addChild(sp1);
    let g1 = new Sprite();
    g1.graphics.drawTexture(tex,0,0);
    let glow1 = new GlowFilter('#ffffff',10,0,0);
    g1.filters=[glow1];
    g1.pos(50,50);
    sp1.addChild(g1);

    let g2 = new Sprite();
    g2.graphics.drawRect(tex.offsetX,tex.offsetY,tex.width,tex.height,null,'red',2);
    g2.pos(50,50);
    sp1.addChild(g2);


    let desc = new Text();
    desc.text=`glow的对象放大了，并且与红框相等`
    desc.color='red'
    desc.fontSize=32;
    desc.pos(100,600);
    Laya.stage.addChild(desc);    

}


test();