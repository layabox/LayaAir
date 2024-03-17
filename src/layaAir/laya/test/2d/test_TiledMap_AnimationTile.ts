import "laya/d3/core/scene/Scene3D";
import "laya/ModuleDef";
import "laya/ui/ModuleDef";
import "laya/ani/ModuleDef";

import { Laya } from "../../../Laya";
import { Shader3D } from "../../RenderEngine/RenderShader/Shader3D";
import { Stage } from "../../display/Stage";
import { Sprite } from "../../display/Sprite";
import { Templet } from "../../ani/bone/Templet";
import { Event } from "../../events/Event";
import { URL } from "../../net/URL";
import { TiledMap } from "../../map/TiledMap";
import { Rectangle } from "../../maths/Rectangle";
import { Handler } from "../../utils/Handler";
import { RenderSprite } from "../../renders/RenderSprite";

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