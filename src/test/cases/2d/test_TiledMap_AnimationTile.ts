import "laya/d3/core/scene/Scene3D";
import "laya/ModuleDef";
import "laya/ui/ModuleDef";
import "laya/ani/ModuleDef";

import { Laya } from "../../../layaAir/Laya";
import { Shader3D } from "../../../layaAir/laya/RenderEngine/RenderShader/Shader3D";
import { Stage } from "../../../layaAir/laya/display/Stage";
import { Sprite } from "../../../layaAir/laya/display/Sprite";
import { Templet } from "../../../layaAir/laya/ani/bone/Templet";
import { Event } from "../../../layaAir/laya/events/Event";
import { URL } from "../../../layaAir/laya/net/URL";
import { TiledMap } from "../../../layaAir/laya/map/TiledMap";
import { Rectangle } from "../../../layaAir/laya/maths//Rectangle";
import { Handler } from "../../../layaAir/laya/utils/Handler";
import { RenderSprite } from "../../../layaAir/laya/renders/RenderSprite";

//HierarchyLoader和MaterialLoader等是通过前面的import完成的

async function test(){
    //初始化引擎
    await Laya.init(0,0);
    Laya.stage.scaleMode = Stage.SCALE_FULL;
    Laya.stage.screenMode = Stage.SCREEN_NONE;
    Shader3D.debugMode = true;
    (window as any).RenderSprite = RenderSprite;
    URL.basePath += "sample-resource/";

    let tiledMap = new TiledMap();
    tiledMap.createMap("res/tiledMap/orthogonal-test-movelayer.json", new Rectangle(0, 0, Laya.stage.width, Laya.stage.height), 
    Handler.create(null, ()=>{
        tiledMap.mapSprite().removeSelf();
        Laya.stage.addChild(tiledMap.mapSprite());
    }));
}


test();