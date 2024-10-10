import "laya/ModuleDef";
import "laya/ui/ModuleDef";
import "laya/ani/ModuleDef";

import { Laya } from "../../../layaAir/Laya";
import { Shader3D } from "../../../layaAir/laya/RenderEngine/RenderShader/Shader3D";
import { Stage } from "../../../layaAir/laya/display/Stage";
import { Sprite } from "../../../layaAir/laya/display/Sprite";
import { TextRender } from "../../../layaAir/laya/webgl/text/TextRender";
import { PrefabImpl } from "../../resource/PrefabImpl";
import { Stat } from "../../../layaAir/laya/utils/Stat";

/**
 * cacheas normal的优化效果
 * 大量的物体的移动
 */
let packurl = 'sample-resource/2d'

class testRole extends Sprite{
    curx=Math.random()*600;
    cury=Math.random()*600;
    vel=Math.random()*5;
    state=0;
    constructor(){
        super();
    }
    async init(){
        let sceneurl = packurl + '/fuza.ls';
        let scene: PrefabImpl = await Laya.loader.load(sceneurl);
        let inst = scene.create() as Sprite;
        this.addChild(inst);
        this.alpha=0.2
        this.cacheAs='normal'
        this.scale(0.2*this.vel,0.2*this.vel);
    }

    move(){
        this.curx+=this.vel;
        switch(this.state){
            case 0:
                if(this.curx>600){
                    this.state=1;
                }
                break;
            case 1://fadeout
                this.alpha-=0.01;
                if(this.alpha<0.01){
                    this.state=2;
                    this.curx=1;
                }
                break;
            case 2://fadein
                this.alpha+=0.01;
                if(this.alpha>0.2){
                    this.state=0;
                    this.alpha=0.2;
                }
                break;
        }
        this.pos(this.curx,this.cury);
   }
}

async function test(){
    //初始化引擎
    await Laya.init(0,0);
    Laya.stage.scaleMode = Stage.SCALE_FULL;
    Laya.stage.screenMode = Stage.SCREEN_NONE;
    Shader3D.debugMode = true;
    Stat.show();

    await Laya.loader.loadPackage(packurl, null, null);
    let tex = await Laya.loader.load('atlas/comp/image.png')
    let sp = new Sprite();
    sp.graphics.drawTexture(tex,100,100,null,null,null);
    //sp.graphics.drawTexture(tex,100,300,null,null,null);
    Laya.stage.addChild(sp);

    /*
    let curx=0;
    let cury=200;
    let sp1 = new Sprite();
    sp1.graphics.drawTexture(tex,0,0,100,100,null);
    sp1.pos(curx,cury);
    sp1.cacheAs='normal'
    Laya.stage.addChild(sp1);
    let sp2 = new Sprite();
    sp2.graphics.drawPoly(0,0,[0,0,100,0,100,100],'red','black')
    sp2.pos(20,20);
    sp1.addChild(sp2);
    */

    let roles:testRole[] = [];
    for(let i=0; i<1; i++){
        let r = new testRole();
        await r.init();
        roles.push(r);
        Laya.stage.addChild(r);
    }

    (window as any).rebuid=async (n:number)=>{
        roles.forEach(r=>{
            r.removeSelf();
        });
        roles.length=0;

        for(let i=0; i<n; i++){
            let r = new testRole();
            await r.init();
            roles.push(r);
            Laya.stage.addChild(r);
        }
    
    }

    function renderloop(){
        roles.forEach(r=>{
            r.move();
        });

        requestAnimationFrame(renderloop);
    }
    requestAnimationFrame(renderloop)
}


test();