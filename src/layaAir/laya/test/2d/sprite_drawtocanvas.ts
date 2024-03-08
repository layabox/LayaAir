import { Laya } from "../../../Laya";
import { LengencyRenderEngine3DFactory } from "../../RenderDriver/DriverDesign/3DRenderPass/LengencyRenderEngine3DFactory";
import { Web3DRenderModuleFactory } from "../../RenderDriver/RenderModuleData/WebModuleData/3D/Web3DRenderModuleFactory";
import { WebUnitRenderModuleDataFactory } from "../../RenderDriver/RenderModuleData/WebModuleData/WebUnitRenderModuleDataFactory";
import { WebGL3DRenderPassFactory } from "../../RenderDriver/WebGLDriver/3DRenderPass/WebGL3DRenderPassFactory";
import { WebGLRenderDeviceFactory } from "../../RenderDriver/WebGLDriver/RenderDevice/WebGLRenderDeviceFactory";
import { WebGLRenderEngineFactory } from "../../RenderDriver/WebGLDriver/RenderDevice/WebGLRenderEngineFactory";
import { Laya3DRender } from "../../d3/RenderObjs/Laya3DRender";
import { Sprite } from "../../display/Sprite";
import { LayaGL } from "../../layagl/LayaGL";
import { Texture } from "../../resource/Texture";

var width=1024;
var height=1024;
async function test(){
    LayaGL.unitRenderModuleDataFactory = new WebUnitRenderModuleDataFactory();
    LayaGL.renderDeviceFactory = new WebGLRenderDeviceFactory();
    Laya3DRender.renderOBJCreate = new LengencyRenderEngine3DFactory();
    Laya3DRender.Render3DModuleDataFactory = new Web3DRenderModuleFactory();
    Laya3DRender.Render3DPassFactory = new WebGL3DRenderPassFactory();
    LayaGL.renderOBJCreate = new WebGLRenderEngineFactory();
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