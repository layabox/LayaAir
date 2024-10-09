import "laya/ModuleDef";

import { Laya } from "../../../layaAir/Laya";
import { Stage } from "../../../layaAir/laya/display/Stage";
import { Sprite } from "../../../layaAir/laya/display/Sprite";
import { Image } from "../../../layaAir/laya/ui/Image";
import { Stat } from "../../../layaAir/laya/utils/Stat";
import { StatUI } from "../../../layaAir/laya/ui/StatUI";
import { Text } from "../../../layaAir/laya/display/Text";
StatUI;

//HierarchyLoader和MaterialLoader等是通过前面的import完成的
let packurl = 'sample-resource/2d'
async function test(){
    //初始化引擎
    await Laya.init(0,0);
    Laya.stage.scaleMode = Stage.SCALE_FULL;
    Laya.stage.screenMode = Stage.SCREEN_NONE;
    Stat.show();
    (window as any).Stat = Stat;

    await Laya.loader.loadPackage(packurl, null, null);

    let cirMask = new Sprite();
    let img = new Image("atlas/comp/image.png");
    Laya.stage.addChild( img ) ;
    img.x = img.y = 300;
    img.mask = cirMask;
    img.scale(0.5,0.5);
    let now=0;

    let desc = new Text();
    desc.text=`统计面板的BufferMemory不应该增加`
    desc.color='red'
    desc.fontSize=32;
    desc.pos(100,600);
    Laya.stage.addChild(desc);    


    function renderloop(){
        let dt = Laya.timer.delta/1000;
        cirMask.graphics.clear(true);
        cirMask.graphics.drawPie(1000/2,1000/2, 1000/2 ,-90, -90+360* now  ,"#FFFFFF");
        now+= dt;
        if(now >1) now -= 1;

        requestAnimationFrame(renderloop);
    }
    requestAnimationFrame(renderloop)
}


test();