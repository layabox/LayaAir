import "laya/d3/core/scene/Scene3D";
import "laya/ModuleDef";
import "laya/ui/ModuleDef";
import "laya/ani/ModuleDef";

import { Laya } from "../../../layaAir/Laya";
import { Stage } from "../../../layaAir/laya/display/Stage";    
import { Event } from "../../../layaAir/laya/events/Event";
import { URL } from "../../../layaAir/laya/net/URL";
import { TiledMap } from "../../../layaAir/laya/map/TiledMap";
import { Rectangle } from "../../../layaAir/laya/maths//Rectangle";
import { Handler } from "../../../layaAir/laya/utils/Handler";
import { RenderSprite } from "../../../layaAir/laya/renders/RenderSprite";
import { Browser } from "../../../layaAir/laya/utils/Browser";

//HierarchyLoader和MaterialLoader等是通过前面的import完成的

async function test(){
    let mLastMouseX=0;
    let mLastMouseY=0;
    let mX=0;
    let mY=0;

    //初始化引擎
    await Laya.init(0,0);
    Laya.stage.scaleMode = Stage.SCALE_FULL;
    Laya.stage.screenMode = Stage.SCREEN_NONE;
    Laya.stage.on(Event.MOUSE_DOWN, null, ()=>{
		mLastMouseX = Laya.stage.mouseX;
		mLastMouseY = Laya.stage.mouseY;
		Laya.stage.on(Event.MOUSE_MOVE, null, mouseMov);
    }).on(Event.MOUSE_UP, null, ()=>{
		mX = mX - (Laya.stage.mouseX - mLastMouseX);
		mY = mY - (Laya.stage.mouseY - mLastMouseY);
		Laya.stage.off(Event.MOUSE_MOVE, null, mouseMov);
    });

    function mouseMov(e:Event){
        tiledMap.moveViewPort(mX - (Laya.stage.mouseX - mLastMouseX), mY - (Laya.stage.mouseY - mLastMouseY));            
    }

    (window as any).RenderSprite = RenderSprite;
    URL.basePath += "sample-resource/";

    let tiledMap = new TiledMap();

    //创建地图，适当的时候调用destroy销毁地图
    tiledMap.createMap("res/tiledMap/desert.json", new Rectangle(0, 0, Browser.width, Browser.height), 
        new Handler(null, ()=>{
            Laya.stage.addChild(tiledMap.mapSprite());
            tiledMap.changeViewPort(mX, mY, Browser.width, Browser.height);
        }));
}


test();