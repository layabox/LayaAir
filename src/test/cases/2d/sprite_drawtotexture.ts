import { Laya } from "Laya";
import { Sprite } from "laya/display/Sprite";
import { Texture } from "laya/resource/Texture";

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
            let rt = Sprite.drawToTexture(sp,100,100,0,0,null)
            let sp2 = new Sprite();
            sp2.graphics.drawTexture( new Texture(rt,Texture.INV_UV));
            sp2.x=120;
            Laya.stage.addChild(sp2)
        }
        requestAnimationFrame(renderloop);
    }
    requestAnimationFrame(renderloop)
}


test();