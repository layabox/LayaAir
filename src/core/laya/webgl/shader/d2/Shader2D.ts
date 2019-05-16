import { ShaderDefines2D } from "././ShaderDefines2D";
	import { DrawStyle } from "../../canvas/DrawStyle"
	import { Shader } from "../Shader"

    import texture_vs from  './files/texture.vs.glsl';

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
			vs = require("./files/texture.vs.glsl");
			ps = require("./files/texture.ps.glsl");
			Shader.preCompile2D(0, ShaderDefines2D.TEXTURE2D, vs, ps, null);
			
			vs = require("./files/primitive.vs.glsl");
			ps = require("./files/primitive.ps.glsl");
			Shader.preCompile2D(0, ShaderDefines2D.PRIMITIVE, vs, ps, null);
			
			vs = require("./skinAnishader/skinShader.vs.glsl");
			ps = require("./skinAnishader/skinShader.ps.glsl");
			Shader.preCompile2D(0, ShaderDefines2D.SKINMESH, vs, ps, null);
		}
	}

