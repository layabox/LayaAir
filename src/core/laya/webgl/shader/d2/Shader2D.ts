import { ShaderDefines2D } from "././ShaderDefines2D";
import { Bitmap } from "../../../resource/Bitmap"
	import { DrawStyle } from "../../canvas/DrawStyle"
	import { Shader } from "../Shader"

    import texture_vs from './files/texture.vs.glsl'
    
	export class Shader2D
	{
		/*[DISABLE-ADD-VARIABLE-DEFAULT-VALUE]*/
		
		 ALPHA:number = 1;
		 shader:Shader;
		 filters:any[];
		 defines:ShaderDefines2D = new ShaderDefines2D();
		 shaderType:number = 0;
		 colorAdd:any[];
		 fillStyle:DrawStyle = DrawStyle.DEFAULT;
		 strokeStyle:DrawStyle = DrawStyle.DEFAULT;
		 destroy():void {
			this.defines = null;
			this.filters = null;
		}
		
		 static __init__():void {
			var vs:string, ps:string;
			vs = __INCLUDESTR__("files/texture.vs");
			ps = __INCLUDESTR__("files/texture.ps");
			Shader.preCompile2D(0, ShaderDefines2D.TEXTURE2D, vs, ps, null);
			
			vs = __INCLUDESTR__("files/primitive.vs");
			ps = __INCLUDESTR__("files/primitive.ps");
			Shader.preCompile2D(0, ShaderDefines2D.PRIMITIVE, vs, ps, null);
			
			vs = __INCLUDESTR__("skinAnishader/skinShader.vs");
			ps = __INCLUDESTR__("skinAnishader/skinShader.ps");
			Shader.preCompile2D(0, ShaderDefines2D.SKINMESH, vs, ps, null);
		}
	}

