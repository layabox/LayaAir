import { Value2D } from "./Value2D";
import { WebGL } from "../../../WebGL"
	import { ShaderDefines2D } from "../ShaderDefines2D"
	
	export class TextureSV extends Value2D
	{
		 u_colorMatrix:any[];
		 strength : number = 0;
		 blurInfo:any[] = null;
		 colorMat : Float32Array = null;
		 colorAlpha : Float32Array = null;
		constructor(subID:number=0){
			super(ShaderDefines2D.TEXTURE2D, subID);
			this._attribLocation = ['posuv', 0, 'attribColor', 1, 'attribFlags', 2];// , 'clipDir', 3, 'clipRect', 4];
		}
		/**
		 * @override
		 */
		  clear():void
		{
			this.texture = null;
			this.shader = null;
			this.defines._value=this.subID;
			//defines.setValue(0);
		}
    }

    // 放在这里容易导致这个文件被排除
    //Value2D._initone(ShaderDefines2D.TEXTURE2D, TextureSV);
    //Value2D._initone(ShaderDefines2D.TEXTURE2D | ShaderDefines2D.FILTERGLOW, TextureSV);
