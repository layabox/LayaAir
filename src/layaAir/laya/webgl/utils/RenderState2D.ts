import { ColorFilter } from "../../filters/ColorFilter";
import { Matrix } from "../../maths/Matrix"
import { ShaderDefines2D } from "../shader/d2/ShaderDefines2D"

const TEMPMAT4_ARRAY = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

export class RenderState2D {

    static worldMatrix4 = TEMPMAT4_ARRAY;

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
        TEMPMAT4_ARRAY[0] = 1;
        TEMPMAT4_ARRAY[1] = 0;
        TEMPMAT4_ARRAY[4] = 0;
        TEMPMAT4_ARRAY[5] = 1;
        TEMPMAT4_ARRAY[12] = 0;
        TEMPMAT4_ARRAY[13] = 0;
    }

    static clear(): void {
        RenderState2D.worldAlpha = 1;
    }

}


