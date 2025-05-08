import { Vector4 } from "../../../../maths/Vector4";
import { RenderTexture2D } from "../../../../resource/RenderTexture2D";
import { IRenderContext2D } from "../../../DriverDesign/2DRenderPass/IRenderContext2D";
import { ShaderData } from "../../../DriverDesign/RenderDevice/ShaderData";
import { PostProcess2D } from "../../WebModuleData/2D/PostProcess2D";
import { IRenderStruct2D } from "./IRenderStruct2D";

export interface IRender2DPass {
   enable: boolean;
   enableBatch: boolean;
   isSupport: boolean;
   root: IRenderStruct2D;
   
   postProcess: PostProcess2D;
   repaint: boolean;
   renderTexture: RenderTexture2D;
   priority: number;
   renderLayerMask: number;
   cullRect: Vector4;
   shaderData: ShaderData;

   setClearColor(r: number, g: number, b: number, a: number): void;
   addStruct(object: IRenderStruct2D, zOrder?: number): void;
   removeStruct(object: IRenderStruct2D, zOrder?: number): void;
   fowardRender(context: IRenderContext2D): void;
   render(context: IRenderContext2D): void;
   getRenderTexture(): RenderTexture2D;
   destroy(): void;
}