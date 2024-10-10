import "laya/ModuleDef";

import { Laya } from "../../../layaAir/Laya";
import { Stage } from "../../../layaAir/laya/display/Stage";
import { Sprite } from "../../../layaAir/laya/display/Sprite";
import { Box } from "../../../layaAir/laya/ui/Box";
import { Label } from "../../../layaAir/laya/ui/Label";
import { captureAndSend } from "../../result";

/**
 * 延迟删除一个cacheas bitmap中子对象，会导致绑定一个已经删除的贴图
 */

async function test(){
    //初始化引擎
    await Laya.init(0,0);
    Laya.stage.scaleMode = Stage.SCALE_FULL;
    Laya.stage.screenMode = Stage.SCREEN_NONE;

    let sp = new Box();
    //sp.graphics.clipRect(0,0,150,150);
    //sp.graphics.drawPoly(0,0,[0,0,100,0, 100,100],'green','yellow',2)
    //sp.graphics.drawRect(0,0,100,100,'red')
    sp.pos(100,100)
    sp.cacheAs='bitmap';

    let sp1 = new Sprite();
    sp1.graphics.drawRect(0,0,100,100,'green');
    sp.addChild(sp1);

    Laya.stage.addChild(sp);

    let txt = new Label();
    txt.text='A'
    txt.fontSize=30;
    txt.color='red'
    txt.pos(300,300);
    Laya.stage.addChild(txt);

    setTimeout(() => {
        sp1.visible=false;
    }, 1000);
}
/*
captureAndSend(null,[
    {
"time": 300,
"rect": {
  "x": 67,
  "y": 82,
  "width": 298,
  "height": 271
},
{
    "time": 2000,
    "rect": {
      "x": 67,
      "y": 82,
      "width": 298,
      "height": 271
    },
    }]);
*/
test();