import { ShaderDefines2D } from "../ShaderDefines2D"
	import { Value2D } from "../value/Value2D"
	import { WebGLContext } from "../../../WebGLContext"
	import { CONST3D2D } from "../../../utils/CONST3D2D"
	export class SkinSV extends Value2D {
		 texcoord:any;
		 position:any;
		 offsetX:number = 300;
		 offsetY:number = 0;
		
		//TODO:coverage
		constructor(type:any){
			super(ShaderDefines2D.SKINMESH, 0);
			var _vlen:number = 8 * CONST3D2D.BYTES_PE;
			this.position = [2, WebGLContext.FLOAT, false, _vlen, 0];
			this.texcoord = [2, WebGLContext.FLOAT, false, _vlen, 2 * CONST3D2D.BYTES_PE];
			this.color = [4, WebGLContext.FLOAT, false, _vlen, 4 * CONST3D2D.BYTES_PE];
		}
	
	}

    Value2D._initone(ShaderDefines2D.SKINMESH, SkinSV);    

