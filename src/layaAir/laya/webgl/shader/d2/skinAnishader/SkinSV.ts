import { ShaderDefines2D } from "../ShaderDefines2D"
import { Value2D } from "../value/Value2D"
import { CONST3D2D } from "../../../utils/CONST3D2D"
import { WebGLContext } from "../../../WebGLContext";
export class SkinSV extends Value2D {
	texcoord: any;
	position: any;
	offsetX: number = 300;
	offsetY: number = 0;

	//TODO:coverage
	constructor(type: any) {
		super(ShaderDefines2D.SKINMESH, 0);
		var gl: WebGLRenderingContext = WebGLContext.mainContext;
		var _vlen: number = 8 * CONST3D2D.BYTES_PE;
		this.position = [2, gl.FLOAT, false, _vlen, 0];
		this.texcoord = [2, gl.FLOAT, false, _vlen, 2 * CONST3D2D.BYTES_PE];
		this.color = [4, gl.FLOAT, false, _vlen, 4 * CONST3D2D.BYTES_PE];
	}

}


