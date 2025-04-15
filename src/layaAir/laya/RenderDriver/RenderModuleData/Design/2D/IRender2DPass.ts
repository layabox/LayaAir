import { Vector4 } from "../../../../maths/Vector4";
import { Context } from "../../../../renders/Context";
import { RenderTexture2D } from "../../../../resource/RenderTexture2D";
import { IRenderContext2D } from "../../../DriverDesign/2DRenderPass/IRenderContext2D";
import { IRenderStruct2D } from "./IRenderStruct2D";

export interface IRender2DPass{
   root:IRenderStruct2D;
   postProcess: boolean;
   repeat: boolean;
   renderTexture:RenderTexture2D;
   priority: number;
   renderLayerMask: number;
   cullRect: Vector4;
   addStruct(object: IRenderStruct2D, zOrder?: number): void;
   removeStruct(object: IRenderStruct2D, zOrder?: number): void;
   render(context: IRenderContext2D): void;
}