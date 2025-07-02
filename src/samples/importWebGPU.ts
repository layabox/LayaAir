import { Laya3DRender } from "laya/d3/RenderObjs/Laya3DRender";
import { LayaGL } from "laya/layagl/LayaGL";
import { WebGPURender2DProcess } from "laya/RenderDriver/WebGPUDriver/2DRenderPass/WebGPURender2DProcess";
import { WebGPU3DRenderPassFactory } from "laya/RenderDriver/WebGPUDriver/3DRenderPass/WebGPU3DRenderPassFactory";
import { WebGPURenderDeviceFactory } from "laya/RenderDriver/WebGPUDriver/RenderDevice/WebGPURenderDeviceFactory";

LayaGL.renderDeviceFactory = new WebGPURenderDeviceFactory();
LayaGL.render2DRenderPassFactory = new WebGPURender2DProcess();
Laya3DRender.Render3DPassFactory = new WebGPU3DRenderPassFactory();
