import { Matrix } from "../../maths/Matrix";
export class RenderState2D {
    /* 不知道 有什么用，删掉先
    public static function getMatrArray():Array {
        return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    }
    */
    //TODO:coverage
    static mat2MatArray(mat, matArray) {
        var m = mat;
        var m4 = matArray;
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
    static restoreTempArray() {
        RenderState2D.TEMPMAT4_ARRAY[0] = 1;
        RenderState2D.TEMPMAT4_ARRAY[1] = 0;
        RenderState2D.TEMPMAT4_ARRAY[4] = 0;
        RenderState2D.TEMPMAT4_ARRAY[5] = 1;
        RenderState2D.TEMPMAT4_ARRAY[12] = 0;
        RenderState2D.TEMPMAT4_ARRAY[13] = 0;
    }
    static clear() {
        RenderState2D.worldScissorTest = false;
        //worldFilters = null;
        RenderState2D.worldAlpha = 1;
        //worldClipRect.x = worldClipRect.y = 0;
        //worldClipRect.width = width;
        //worldClipRect.height = height;
    }
}
RenderState2D._MAXSIZE = 99999999;
/**@private 一个初始化的 <code>Matrix</code> 对象，不允许修改此对象内容。*/
RenderState2D.EMPTYMAT4_ARRAY = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
RenderState2D.TEMPMAT4_ARRAY = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
RenderState2D.worldMatrix4 = RenderState2D.TEMPMAT4_ARRAY;
RenderState2D.worldMatrix = new Matrix();
RenderState2D.matWVP = null; // :Matrix4x4 = Matrix4x4.DEFAULT;		// 3d矩阵
RenderState2D.worldAlpha = 1.0;
RenderState2D.worldScissorTest = false;
RenderState2D.width = 0;
RenderState2D.height = 0;
