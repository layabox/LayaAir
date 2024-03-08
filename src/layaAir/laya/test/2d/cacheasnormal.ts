import "laya/d3/core/scene/Scene3D";
import "laya/ModuleDef";
import "laya/d3/ModuleDef";
import "laya/d3/physics/ModuleDef";
import "laya/ui/ModuleDef";
import "laya/ani/ModuleDef";
import "laya/spine/ModuleDef";
import "laya/gltf/glTFLoader";

import { Laya } from "../../../Laya";
import { LengencyRenderEngine3DFactory } from "../../RenderDriver/DriverDesign/3DRenderPass/LengencyRenderEngine3DFactory";
import { Web3DRenderModuleFactory } from "../../RenderDriver/RenderModuleData/WebModuleData/3D/Web3DRenderModuleFactory";
import { WebUnitRenderModuleDataFactory } from "../../RenderDriver/RenderModuleData/WebModuleData/WebUnitRenderModuleDataFactory";
import { WebGL3DRenderPassFactory } from "../../RenderDriver/WebGLDriver/3DRenderPass/WebGL3DRenderPassFactory";
import { WebGLRenderDeviceFactory } from "../../RenderDriver/WebGLDriver/RenderDevice/WebGLRenderDeviceFactory";
import { WebGLRenderEngineFactory } from "../../RenderDriver/WebGLDriver/RenderDevice/WebGLRenderEngineFactory";
import { Shader3D } from "../../RenderEngine/RenderShader/Shader3D";
import { Laya3DRender } from "../../d3/RenderObjs/Laya3DRender";
import { Stage } from "../../display/Stage";
import { LayaGL } from "../../layagl/LayaGL";

//HierarchyLoader和MaterialLoader等是通过前面的import完成的

let packurl = 'sample-resource/2d'
async function test(){
    LayaGL.unitRenderModuleDataFactory = new WebUnitRenderModuleDataFactory();
    LayaGL.renderDeviceFactory = new WebGLRenderDeviceFactory();
    Laya3DRender.renderOBJCreate = new LengencyRenderEngine3DFactory();
    Laya3DRender.Render3DModuleDataFactory = new Web3DRenderModuleFactory();
    Laya3DRender.Render3DPassFactory = new WebGL3DRenderPassFactory();
    LayaGL.renderOBJCreate = new WebGLRenderEngineFactory();
    //初始化引擎
    await Laya.init(0,0);
    Laya.stage.scaleMode = Stage.SCALE_FULL;
    Laya.stage.screenMode = Stage.SCREEN_NONE;
    Shader3D.debugMode = true;

    await Laya.loader.loadPackage(packurl, null, null);
    let scene = await Laya.loader.load(packurl+'/cacheasbmp.ls');
    Laya.stage.addChild(scene.create());

    function renderloop(){
        requestAnimationFrame(renderloop);
    }
    requestAnimationFrame(renderloop)
}


test();