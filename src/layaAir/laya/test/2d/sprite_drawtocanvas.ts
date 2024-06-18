import { Laya } from "../../../Laya";
import { Sprite } from "../../display/Sprite";
var width=1024;
var height=1024;
async function test(){
    //初始化引擎
    await Laya.init(width,height);

    let sp = new Sprite();
    sp.graphics.drawRect(0,0,100,100,'red');
    sp.graphics.drawRect(10,10,80,80,'green');
    sp.graphics.drawRect(80,0,20,20,'blue');
    Laya.stage.addChild(sp);

    let n = 0;
    function renderloop(){
        n++;
        if(n==10){
            let canv = Sprite.drawToCanvas(sp,100,100,0,0).source;
            canv.style.position = 'absolute';
            canv.style.left = '100px';
            canv.style.top = '100px';            
            document.body.append( canv);
        }
        requestAnimationFrame(renderloop);
    }
    requestAnimationFrame(renderloop)
}


test();