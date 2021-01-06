import { Matrix } from "../../maths/Matrix"
import { ShaderDefines2D } from "../shader/d2/ShaderDefines2D"

export class RenderState2D {
    static _MAXSIZE: number = 99999999;
    /**@private 一个初始化的 <code>Matrix</code> 对象，不允许修改此对象内容。*/
    static EMPTYMAT4_ARRAY: number[] = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    static TEMPMAT4_ARRAY: number[] = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    static worldMatrix4: number[] = RenderState2D.TEMPMAT4_ARRAY;

    static worldMatrix: Matrix = new Matrix();
    static matWVP: any = null;// :Matrix4x4 = Matrix4x4.DEFAULT;		// 3d矩阵
    static worldAlpha: number = 1.0;

    static worldScissorTest: boolean = false;

    //public static var worldClipRect:Rectangle = new Rectangle(0, 0, _MAXSIZE, _MAXSIZE);
    static worldShaderDefines: ShaderDefines2D;
    static worldFilters: any[];

    static width: number = 0;
    static height: number = 0;
    /* 不知道 有什么用，删掉先
    public static function getMatrArray():Array {
        return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    }
    */
    //TODO:coverage
    static mat2MatArray(mat: Matrix, matArray: any[]): any[] {
        var m: Matrix = mat;
        var m4: any[] = matArray;
        m4[0] = m.a;
        m4[1] = m.b;
        m4[2] = RenderState2D.EMPTYMAT4_ARRAY[2];
        m4[3] = RenderState2D.EMPTYMAT4_ARRAY[3];
        m4[4] = m.c;
        m4[5] = m.d;
        m4[6] = RenderState2D.EMPTYMAT4_ARRAY[6];
        m4[7] = RenderState2D.EMPTYMAT4_ARRAY[7];
        m4[8] = RenderState2D.EMPTYMAT4_ARRAY[8];
        m4[9] = RenderState2D.EMPTYMAT4_ARRAY[9];
        m4[10] = RenderState2D.EMPTYMAT4_ARRAY[10];
        m4[11] = RenderState2D.EMPTYMAT4_ARRAY[11];
        m4[12] = m.tx;
        m4[13] = m.ty;
        m4[14] = RenderState2D.EMPTYMAT4_ARRAY[14];
        m4[15] = RenderState2D.EMPTYMAT4_ARRAY[15];
        return matArray;
    }

    static restoreTempArray(): void {
        RenderState2D.TEMPMAT4_ARRAY[0] = 1;
        RenderState2D.TEMPMAT4_ARRAY[1] = 0;
        RenderState2D.TEMPMAT4_ARRAY[4] = 0;
        RenderState2D.TEMPMAT4_ARRAY[5] = 1;
        RenderState2D.TEMPMAT4_ARRAY[12] = 0;
        RenderState2D.TEMPMAT4_ARRAY[13] = 0;
    }

    static clear(): void {
        RenderState2D.worldScissorTest = false;
        //worldFilters = null;
        RenderState2D.worldAlpha = 1;
        //worldClipRect.x = worldClipRect.y = 0;
        //worldClipRect.width = width;
        //worldClipRect.height = height;
    }

}


