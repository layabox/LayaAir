import { PostProcess2D } from "../../../../display/PostProcess2D";
import { Matrix } from "../../../../maths/Matrix";
import { Vector2 } from "../../../../maths/Vector2";
import { Vector4 } from "../../../../maths/Vector4";
import { RenderTexture2D } from "../../../../resource/RenderTexture2D";
import { IRenderContext2D } from "../../../DriverDesign/2DRenderPass/IRenderContext2D";
import { ShaderData } from "../../../DriverDesign/RenderDevice/ShaderData";
import { IRenderStruct2D } from "./IRenderStruct2D";

/** @ignore @blueprintIgnore */
export interface IRender2DPass {
   enable: boolean;
   enableBatch: boolean;
   isSupport: boolean;
   root: IRenderStruct2D;
   doClearColor: boolean;

   postProcess: PostProcess2D;
   mask: IRenderStruct2D;
   repaint: boolean;
   renderTexture: RenderTexture2D;
   priority: number;
   shaderData: ShaderData;

   offsetMatrix: Matrix;

   needRender(): boolean;
   setClearColor(r: number, g: number, b: number, a: number): void;
   fowardRender(context: IRenderContext2D): void;
   destroy(): void;
}

/** @ignore @blueprintIgnore */
export interface IRender2DPassManager {
   addPass(pass: IRender2DPass): void;
   removePass(pass: IRender2DPass): void;
   apply(context: IRenderContext2D): void;
   clear(): void;
}
