import { Scene } from "laya/display/Scene";
import { Laya3DRender } from "laya/d3/RenderObjs/Laya3DRender";
import { LayaGL } from "laya/layagl/LayaGL";
import { LengencyRenderEngine3DFactory } from "laya/RenderDriver/DriverDesign/3DRenderPass/LengencyRenderEngine3DFactory";
import { LayaXRender2DProcess } from "laya/RenderDriver/LayaXDriver/2DRenderPass/LayaXRender2DProcess";
import { LayaX3DRenderPassFactory } from "laya/RenderDriver/LayaXDriver/3DRenderPass/LayaX3DRenderPassFactory";
import { LayaXRenderDeviceFactory } from "laya/RenderDriver/LayaXDriver/RenderDevice/LayaXRenderDeviceFactory";
import { LayaX3DRenderModuleFactory } from "laya/RenderDriver/LayaXDriver/RenderModuleData/LayaX3DRenderModuleFactory";
import { LayaXUnitRenderModuleDataFactory } from "laya/RenderDriver/LayaXDriver/RenderModuleData/LayaXUnitRenderModuleDataFactory";
import { GLESRender2DProcess } from "laya/RenderDriver/OpenGLESDriver/2DRenderPass/GLESRender2DProcess";
import { GLES3DRenderPassFactory } from "laya/RenderDriver/OpenGLESDriver/3DRenderPass/GLES3DRenderPassFactory";
import { GLESRenderDeviceFactory } from "laya/RenderDriver/OpenGLESDriver/RenderDevice/GLESRenderDeviceFactory";
import { RT3DRenderModuleFactory } from "laya/RenderDriver/RenderModuleData/RuntimeModuleData/3D/RT3DRenderModuleFactory";
import { RTStatisContext } from "laya/RenderDriver/RenderModuleData/RuntimeModuleData/RTStatisticContext";
import { RTUintRenderModuleDataFactory } from "laya/RenderDriver/RenderModuleData/RuntimeModuleData/RTUintRenderModuleDataFactory";
import { Web3DRenderModuleFactory } from "laya/RenderDriver/RenderModuleData/WebModuleData/3D/Web3DRenderModuleFactory";
import { WebUnitRenderModuleDataFactory } from "laya/RenderDriver/RenderModuleData/WebModuleData/WebUnitRenderModuleDataFactory";
import { LayaEnv } from "LayaEnv";
import { Laya } from "Laya";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Stage } from "laya/display/Stage";
import { Shader3D } from "laya/RenderEngine/RenderShader/Shader3D";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { URL } from "laya/net/URL";
import { Browser } from "laya/utils/Browser";
import { Main } from "../../../Main";
import { WebGL3DRenderPassFactory } from "laya/RenderDriver/WebGLDriver/3DRenderPass/WebGL3DRenderPassFactory";
import { WebGLRenderDeviceFactory } from "laya/RenderDriver/WebGLDriver/RenderDevice/WebGLRenderDeviceFactory";
import { WebGLRender2DProcess } from "laya/RenderDriver/WebGLDriver/2DRenderPass/WebGLRender2DProcess";
export class IDE_anySceneLoad {
    constructor() {
        if (!LayaGL.renderDeviceFactory) {
            /**
             * renderEngineFactiry 的初始化
            */
            if (LayaEnv.isLayaX) {
                // LayaX rendering backend (Rust/wgpu)
                LayaGL.unitRenderModuleDataFactory = new LayaXUnitRenderModuleDataFactory();
                LayaGL.renderDeviceFactory = new LayaXRenderDeviceFactory();
                Laya3DRender.renderOBJCreate = new LengencyRenderEngine3DFactory();
                Laya3DRender.Render3DModuleDataFactory = new LayaX3DRenderModuleFactory();
                Laya3DRender.Render3DPassFactory = new LayaX3DRenderPassFactory();
                LayaGL.render2DRenderPassFactory = new LayaXRender2DProcess();
                //LayaGL.statAgent = new RTStatisContext();
            } else if (!LayaEnv.isConch || (LayaEnv.isConch && (window as any).conchConfig.getGraphicsAPI() == 2)) {
                LayaGL.unitRenderModuleDataFactory = new WebUnitRenderModuleDataFactory();
                LayaGL.renderDeviceFactory = new WebGLRenderDeviceFactory();
                Laya3DRender.renderOBJCreate = new LengencyRenderEngine3DFactory();
                Laya3DRender.Render3DModuleDataFactory = new Web3DRenderModuleFactory();
                Laya3DRender.Render3DPassFactory = new WebGL3DRenderPassFactory();
                LayaGL.render2DRenderPassFactory = new WebGLRender2DProcess();
            } else {
                // Native GLES rendering backend
                LayaGL.unitRenderModuleDataFactory = new RTUintRenderModuleDataFactory();
                LayaGL.renderDeviceFactory = new GLESRenderDeviceFactory();
                Laya3DRender.renderOBJCreate = new LengencyRenderEngine3DFactory();
                Laya3DRender.Render3DModuleDataFactory = new RT3DRenderModuleFactory();
                Laya3DRender.Render3DPassFactory = new GLES3DRenderPassFactory();
                LayaGL.render2DRenderPassFactory = new GLESRender2DProcess();
                LayaGL.statAgent = new RTStatisContext();
            }
        }

        if (Main.box3D) {
            URL.basePath += "IDE_ExportPath/web/";
        } else {
            URL.basePath += "sample-resource/IDE_ExportPath/web/";
        }
        Browser.loadLib("js/bundle.js");
        //初始化引擎
        Laya.init(0, 0).then(() => {
            Laya.loader.loadPackage("").then(() => {
                Stat.show();
                Laya.stage.scaleMode = Stage.SCALE_FULL;
                Laya.stage.screenMode = Stage.SCREEN_NONE;
                Shader3D.debugMode = true;
                //加载场景
                Scene.open("resources/scene/2D/Advance/Render_Particle2D.ls");
            });
        });
    }
}


