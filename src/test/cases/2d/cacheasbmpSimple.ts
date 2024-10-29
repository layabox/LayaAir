import "laya/ModuleDef";
import "laya/ani/ModuleDef";
import "laya/d3/ModuleDef";
import "laya/d3/core/scene/Scene3D";
import "laya/d3/physics/ModuleDef";
import "laya/gltf/glTFLoader";
import "laya/spine/ModuleDef";
import "laya/ui/ModuleDef";

import { Laya } from "Laya";
import { Shader3D } from "laya/RenderEngine/RenderShader/Shader3D";
import { Stage } from "laya/display/Stage";
import { RenderSprite } from "laya/renders/RenderSprite";
import { Sprite } from "laya/display/Sprite";

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
    sp.graphics.drawTexture(tex,10,100,null,null,null);
    sp.graphics.fillText('Abc文字',100,100,'36px Arial','red',"left");
    sp.graphics.drawTexture(tex,100,100,null,null,null);
    sp.cacheAs='bitmap';
    Laya.stage.addChild(sp);

    function renderloop(){
        requestAnimationFrame(renderloop);
    }
    requestAnimationFrame(renderloop)
}

async function test_0(){
    //最简单的，连图片都没有
    await Laya.init(0,0);
    Laya.stage.scaleMode = Stage.SCALE_FULL;
    Laya.stage.screenMode = Stage.SCREEN_NONE;
    Shader3D.debugMode = true;

    let sp = new Sprite();
    sp.graphics.drawRect(0,0,100,100,'red');
    //sp.cacheAs='bitmap';
    sp.pos(10,10);
    Laya.stage.addChild(sp);
}

async function test_1(){
    //简单图片，不在图集中
    await Laya.init(0,0);
    Laya.stage.scaleMode = Stage.SCALE_FULL;
    Laya.stage.screenMode = Stage.SCREEN_NONE;
    Shader3D.debugMode = true;

    await Laya.loader.loadPackage(packurl, null, null);
    let tex = await Laya.loader.load('sample-resource/2d/test.png')
    let sp = new Sprite();
    sp.graphics.drawTexture(tex,0,0,null,null,null);
    sp.cacheAs='bitmap';
    sp.pos(10,10);
    Laya.stage.addChild(sp);
}

async function test_2(){
    //初始化引擎
    await Laya.init(0,0);
    Laya.stage.scaleMode = Stage.SCALE_FULL;
    Laya.stage.screenMode = Stage.SCREEN_NONE;
    Shader3D.debugMode = true;

    await Laya.loader.loadPackage(packurl, null, null);
    let tex = await Laya.loader.load('atlas/comp/image.png')
    let sp = new Sprite();
    sp.graphics.drawTexture(tex,10,100,null,null,null);
    sp.cacheAs='bitmap';
    Laya.stage.addChild(sp);

}

async function test_3(){
    //初始化引擎
    await Laya.init(0,0);
    Laya.stage.scaleMode = Stage.SCALE_FULL;
    Laya.stage.screenMode = Stage.SCREEN_NONE;
    Shader3D.debugMode = true;

    await Laya.loader.loadPackage(packurl, null, null);
    let tex = await Laya.loader.load('atlas/comp/image.png')
    let sp = new Sprite();
    sp.graphics.drawTexture(tex,10,100,null,null,null);
    sp.cacheAs='bitmap';

    sp._cacheStyle._calculateCacheRect(sp, "bitmap" , 0, 0);
    let bound = sp._cacheStyle.cacheRect;
    if(!(bound.x==38 && bound.y==100 && bound.width==313 && bound.height==449)){
        throw ""
    }

    Laya.stage.addChild(sp);

}
//如果上面的效果不对
function functionTest(){

}

test();