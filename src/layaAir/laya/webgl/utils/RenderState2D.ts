import { ColorFilter } from "../../filters/ColorFilter";
import { Matrix } from "../../maths/Matrix"
import { ShaderDefines2D } from "../shader/d2/ShaderDefines2D"

export class RenderState2D {
    /**@private 一个初始化的 <code>Matrix</code> 对象，不允许修改此对象内容。*/
    static TEMPMAT4_ARRAY = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    static worldMatrix4 = RenderState2D.TEMPMAT4_ARRAY;

    static worldMatrix = new Matrix();
    static matWVP: any = null;// :Matrix4x4 = Matrix4x4.DEFAULT;		// 3d矩阵
    static worldAlpha = 1.0;

    static worldScissorTest = false;

    //public static var worldClipRect:Rectangle = new Rectangle(0, 0, _MAXSIZE, _MAXSIZE);
    static worldShaderDefines: ShaderDefines2D;
    static worldFilters: ColorFilter[];

    static width = 0;
    static height = 0;

    static InvertY = false;

    static restoreTempArray(): void {
        RenderState2D.TEMPMAT4_ARRAY[0] = 1;
        RenderState2D.TEMPMAT4_ARRAY[1] = 0;
        RenderState2D.TEMPMAT4_ARRAY[4] = 0;
        RenderState2D.TEMPMAT4_ARRAY[5] = 1;
        RenderState2D.TEMPMAT4_ARRAY[12] = 0;
        RenderState2D.TEMPMAT4_ARRAY[13] = 0;
    }

    static clear(): void {
        RenderState2D.worldAlpha = 1;
    }

}


