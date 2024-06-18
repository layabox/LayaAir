import { Laya } from "Laya";
import { Camera, CameraEventFlags } from "laya/d3/core/Camera";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Stage } from "laya/display/Stage";
import { Handler } from "laya/utils/Handler";
import { Shader3D } from "laya/RenderEngine/RenderShader/Shader3D";
import { Laya3DRender } from "laya/d3/RenderObjs/Laya3DRender";
import { WebUnitRenderModuleDataFactory } from "laya/RenderDriver/RenderModuleData/WebModuleData/WebUnitRenderModuleDataFactory"
import { Web3DRenderModuleFactory } from "laya/RenderDriver/RenderModuleData/WebModuleData/3D/Web3DRenderModuleFactory"
import { WebGL3DRenderPassFactory } from "laya/RenderDriver/WebGLDriver/3DRenderPass/WebGL3DRenderPassFactory"
import { WebGLRenderDeviceFactory } from "laya/RenderDriver/WebGLDriver/RenderDevice/WebGLRenderDeviceFactory"
import { LengencyRenderEngine3DFactory } from "laya/RenderDriver/DriverDesign/3DRenderPass/LengencyRenderEngine3DFactory"
import { LayaGL } from "laya/layagl/LayaGL";
import { WebGLRenderEngineFactory } from "laya/RenderDriver/WebGLDriver/RenderDevice/WebGLRenderEngineFactory"
import { WebGLRender2DProcess } from "laya/RenderDriver/WebGLDriver/2DRenderPass/WebGLRender2DProcess"
import { URL } from "laya/net/URL";
import { RTUintRenderModuleDataFactory } from "laya/RenderDriver/RenderModuleData/RuntimeModuleData/RTUintRenderModuleDataFactory";
import { GLESRenderDeviceFactory } from "laya/RenderDriver/OpenGLESDriver/RenderDevice/GLESRenderDeviceFactory";
import { RT3DRenderModuleFactory } from "laya/RenderDriver/RenderModuleData/RuntimeModuleData/3D/RT3DRenderModuleFactory";
import { GLES3DRenderPassFactory } from "laya/RenderDriver/OpenGLESDriver/3DRenderPass/GLES3DRenderPassFactory";
import { GLESRenderEngineFactory } from "laya/RenderDriver/OpenGLESDriver/RenderDevice/GLESRenderEngineFactory";
import { GLESRender2DProcess } from "laya/RenderDriver/OpenGLESDriver/2DRenderPass/GLESRender2DProcess";
import { LayaEnv } from "LayaEnv";
import { CommandBuffer } from "laya/d3/core/render/command/CommandBuffer";
//alert('')
export class loadExportWebResource {
    static commandBuffer: CommandBuffer;
    static cameraEventFlag: CameraEventFlags = CameraEventFlags.BeforeImageEffect;
    static camera: Camera;
    constructor() {
        if (!LayaEnv.isConch) {
            LayaGL.unitRenderModuleDataFactory = new WebUnitRenderModuleDataFactory();
            LayaGL.renderDeviceFactory = new WebGLRenderDeviceFactory();
            Laya3DRender.renderOBJCreate = new LengencyRenderEngine3DFactory();
            Laya3DRender.Render3DModuleDataFactory = new Web3DRenderModuleFactory();
            Laya3DRender.Render3DPassFactory = new WebGL3DRenderPassFactory();
            LayaGL.renderOBJCreate = new WebGLRenderEngineFactory();
            LayaGL.render2DRenderPassFactory = new WebGLRender2DProcess()
        } else {
            LayaGL.unitRenderModuleDataFactory = new RTUintRenderModuleDataFactory();
            LayaGL.renderDeviceFactory = new GLESRenderDeviceFactory();
            Laya3DRender.renderOBJCreate = new LengencyRenderEngine3DFactory();
            Laya3DRender.Render3DModuleDataFactory = new RT3DRenderModuleFactory();
            Laya3DRender.Render3DPassFactory = new GLES3DRenderPassFactory();
            LayaGL.renderOBJCreate = new GLESRenderEngineFactory();
            LayaGL.render2DRenderPassFactory = new GLESRender2DProcess()
        }

        //初始化引擎
        Laya.init(0, 0).then(() => {
            //Stat.show();
            Laya.stage.scaleMode = Stage.SCALE_FULL;
            Laya.stage.screenMode = Stage.SCREEN_NONE;
            Shader3D.debugMode = true;
            URL.basePath = "sample-resource/web";
            this.loadIDEResourcePakage();
        });
    }

    loadIDEResourcePakage() {
        Laya.loader.loadPackage("").then(this.loadSceneResource);
    }

    loadSceneResource() {
        //加载场景
        Scene3D.load("./ui3D.ls", Handler.create(this, function (scene: Scene3D): void {
            (<Scene3D>Laya.stage.addChild(scene));
        }));
    }
}
