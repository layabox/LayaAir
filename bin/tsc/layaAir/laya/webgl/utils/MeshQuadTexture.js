import { Mesh2D } from "./Mesh2D";
/**
 * drawImage，fillRect等会用到的简单的mesh。每次添加必然是一个四边形。
 */
export class MeshQuadTexture extends Mesh2D {
    //private static var _num;
    constructor() {
        super(MeshQuadTexture.const_stride, 4, 4); //x,y,u,v,rgba
        this.canReuse = true;
        this.setAttributes(MeshQuadTexture._fixattriInfo);
        if (!MeshQuadTexture._fixib) {
            this.createQuadIB(MeshQuadTexture._maxIB); //每个quad 4个顶点。正好达到64k的索引。
            MeshQuadTexture._fixib = this._ib;
        }
        else {
            this._ib = MeshQuadTexture._fixib;
            this._quadNum = MeshQuadTexture._maxIB;
        }
    }
    /**
     *
     */
    static getAMesh(mainctx) {
        //console.log('getmesh');
        var ret = null;
        if (MeshQuadTexture._POOL.length) {
            ret = MeshQuadTexture._POOL.pop();
        }
        else
            ret = new MeshQuadTexture();
        // 先分配64k顶点的空间，这样可以避免浪费内存，否则后面增加内存的时候是成倍增加的，当快超过64k的时候，直接变成了128k
        mainctx && ret._vb._resizeBuffer(64 * 1024 * MeshQuadTexture.const_stride, false);
        return ret;
    }
    /**
     * 把本对象放到回收池中，以便getMesh能用。
     */
    /*override*/ releaseMesh() {
        this._vb.setByteLength(0);
        this.vertNum = 0;
        this.indexNum = 0;
        //_applied = false;
        MeshQuadTexture._POOL.push(this);
    }
    /*override*/ destroy() {
        //_ib.destroy(); ib是公用的。
        this._vb.destroy();
        this._vb.deleteBuffer();
    }
    /**
     *
     * @param	pos
     * @param	uv
     * @param	color
     * @param	clip   ox,oy,xx,xy,yx,yy
     * @param 	useTex 是否使用贴图。false的话是给fillRect用的
     */
    addQuad(pos, uv, color, useTex) {
        var vb = this._vb;
        var vpos = (vb._byteLength >> 2); //float数组的下标
        //x,y,u,v,rgba
        vb.setByteLength((vpos + MeshQuadTexture.const_stride) << 2); //是一个四边形的大小，也是这里填充的大小
        var vbdata = vb._floatArray32 || vb.getFloat32Array();
        var vbu32Arr = vb._uint32Array;
        var cpos = vpos;
        var useTexVal = useTex ? 0xff : 0;
        vbdata[cpos++] = pos[0];
        vbdata[cpos++] = pos[1];
        vbdata[cpos++] = uv[0];
        vbdata[cpos++] = uv[1];
        vbu32Arr[cpos++] = color;
        vbu32Arr[cpos++] = useTexVal;
        vbdata[cpos++] = pos[2];
        vbdata[cpos++] = pos[3];
        vbdata[cpos++] = uv[2];
        vbdata[cpos++] = uv[3];
        vbu32Arr[cpos++] = color;
        vbu32Arr[cpos++] = useTexVal;
        vbdata[cpos++] = pos[4];
        vbdata[cpos++] = pos[5];
        vbdata[cpos++] = uv[4];
        vbdata[cpos++] = uv[5];
        vbu32Arr[cpos++] = color;
        vbu32Arr[cpos++] = useTexVal;
        vbdata[cpos++] = pos[6];
        vbdata[cpos++] = pos[7];
        vbdata[cpos++] = uv[6];
        vbdata[cpos++] = uv[7];
        vbu32Arr[cpos++] = color;
        vbu32Arr[cpos++] = useTexVal;
        vb._upload = true;
    }
}
MeshQuadTexture.const_stride = 24; // 48;  24是不带clip的
MeshQuadTexture._maxIB = 16 * 1024;
MeshQuadTexture._fixattriInfo = [WebGL2RenderingContext.FLOAT, 4, 0,
    WebGL2RenderingContext.UNSIGNED_BYTE, 4, 16,
    WebGL2RenderingContext.UNSIGNED_BYTE, 4, 20];
MeshQuadTexture._POOL = [];
