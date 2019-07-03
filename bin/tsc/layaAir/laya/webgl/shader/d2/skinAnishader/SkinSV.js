import { ShaderDefines2D } from "../ShaderDefines2D";
import { Value2D } from "../value/Value2D";
import { CONST3D2D } from "../../../utils/CONST3D2D";
export class SkinSV extends Value2D {
    //TODO:coverage
    constructor(type) {
        super(ShaderDefines2D.SKINMESH, 0);
        this.offsetX = 300;
        this.offsetY = 0;
        var _vlen = 8 * CONST3D2D.BYTES_PE;
        this.position = [2, WebGL2RenderingContext.FLOAT, false, _vlen, 0];
        this.texcoord = [2, WebGL2RenderingContext.FLOAT, false, _vlen, 2 * CONST3D2D.BYTES_PE];
        this.color = [4, WebGL2RenderingContext.FLOAT, false, _vlen, 4 * CONST3D2D.BYTES_PE];
    }
}
