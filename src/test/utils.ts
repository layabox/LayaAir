import { LengencyRenderEngine3DFactory } from "../layaAir/laya/RenderDriver/DriverDesign/3DRenderPass/LengencyRenderEngine3DFactory";
import { Web3DRenderModuleFactory } from "../layaAir/laya/RenderDriver/RenderModuleData/WebModuleData/3D/Web3DRenderModuleFactory";
import { WebUnitRenderModuleDataFactory } from "../layaAir/laya/RenderDriver/RenderModuleData/WebModuleData/WebUnitRenderModuleDataFactory";
import { WebGLRender2DProcess } from "../layaAir/laya/RenderDriver/WebGLDriver/2DRenderPass/WebGLRender2DProcess";
import { WebGL3DRenderPassFactory } from "../layaAir/laya/RenderDriver/WebGLDriver/3DRenderPass/WebGL3DRenderPassFactory";
import { WebGLRenderDeviceFactory } from "../layaAir/laya/RenderDriver/WebGLDriver/RenderDevice/WebGLRenderDeviceFactory";
import { WebGLRenderEngineFactory } from "../layaAir/laya/RenderDriver/WebGLDriver/RenderDevice/WebGLRenderEngineFactory";
import { Laya3DRender } from "../layaAir/laya/d3/RenderObjs/Laya3DRender";
import { LayaGL } from "../layaAir/laya/layagl/LayaGL";


export function usewebgl(){
    LayaGL.render2DRenderPassFactory = new WebGLRender2DProcess()
    LayaGL.unitRenderModuleDataFactory = new WebUnitRenderModuleDataFactory();
    LayaGL.renderDeviceFactory = new WebGLRenderDeviceFactory();
    Laya3DRender.renderOBJCreate = new LengencyRenderEngine3DFactory();
    Laya3DRender.Render3DModuleDataFactory = new Web3DRenderModuleFactory();
    Laya3DRender.Render3DPassFactory = new WebGL3DRenderPassFactory();
    LayaGL.renderOBJCreate = new WebGLRenderEngineFactory();

}