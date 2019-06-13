import { SubShader } from "././SubShader";
import { ShaderPass } from "././ShaderPass";
import { WebGL } from "laya/webgl/WebGL"
	import { ShaderCompile } from "laya/webgl/utils/ShaderCompile"
	
	/**
	 * <code>Shader3D</code> 类用于创建Shader3D。
	 */
	export class Shader3D {
		/**渲染状态_剔除。*/
		 static RENDER_STATE_CULL:number = 0;
		/**渲染状态_混合。*/
		 static RENDER_STATE_BLEND:number = 1;
		/**渲染状态_混合源。*/
		 static RENDER_STATE_BLEND_SRC:number = 2;
		/**渲染状态_混合目标。*/
		 static RENDER_STATE_BLEND_DST:number = 3;
		/**渲染状态_混合源RGB。*/
		 static RENDER_STATE_BLEND_SRC_RGB:number = 4;
		/**渲染状态_混合目标RGB。*/
		 static RENDER_STATE_BLEND_DST_RGB:number = 5;
		/**渲染状态_混合源ALPHA。*/
		 static RENDER_STATE_BLEND_SRC_ALPHA:number = 6;
		/**渲染状态_混合目标ALPHA。*/
		 static RENDER_STATE_BLEND_DST_ALPHA:number = 7;
		/**渲染状态_混合常量颜色。*/
		 static RENDER_STATE_BLEND_CONST_COLOR:number = 8;
		/**渲染状态_混合方程。*/
		 static RENDER_STATE_BLEND_EQUATION:number = 9;
		/**渲染状态_RGB混合方程。*/
		 static RENDER_STATE_BLEND_EQUATION_RGB:number = 10;
		/**渲染状态_ALPHA混合方程。*/
		 static RENDER_STATE_BLEND_EQUATION_ALPHA:number = 11;
		/**渲染状态_深度测试。*/
		 static RENDER_STATE_DEPTH_TEST:number = 12;
		/**渲染状态_深度写入。*/
		 static RENDER_STATE_DEPTH_WRITE:number = 13;
		
		/**shader变量提交周期，自定义。*/
		 static PERIOD_CUSTOM:number = 0;
		/**shader变量提交周期，逐材质。*/
		 static PERIOD_MATERIAL:number = 1;
		/**shader变量提交周期，逐精灵和相机，注：因为精灵包含MVP矩阵，为复合属性，所以摄像机发生变化时也应提交。*/
		 static PERIOD_SPRITE:number = 2;
		/**shader变量提交周期，逐相机。*/
		 static PERIOD_CAMERA:number = 3;
		/**shader变量提交周期，逐场景。*/
		 static PERIOD_SCENE:number = 4;
		
		/**@private */
		 static SHADERDEFINE_HIGHPRECISION:number;
		
		/**@private */
		private static _propertyNameCounter:number = 0;
		/**@private */
		private static _propertyNameMap:any = {};
		/**@private */
		private static _publicCounter:number = 0;
		
		
		/**@private */
		 _attributeMap:any=null;
		/**@private */
		 _uniformMap:any=null;
		/**@private */
		 static _globleDefines:any[] = [];
		/**@private */
		 static _preCompileShader:any = {};
		
		/**是否开启调试模式。 */
		 static debugMode:boolean = true;
		
		/**
		 * 通过Shader属性名称获得唯一ID。
		 * @param name Shader属性名称。
		 * @return 唯一ID。
		 */
		 static propertyNameToID(name:string):number {
			if (Shader3D._propertyNameMap[name] != null) {
				return Shader3D._propertyNameMap[name];
			} else {
				var id:number = Shader3D._propertyNameCounter++;
				Shader3D._propertyNameMap[name] = id;
				return id;
			}
		}
		
		/**
		 * @private
		 */
		 static addInclude(fileName:string, txt:string):void {
			txt=txt.replace(ShaderCompile._clearCR,"");//CRLF风格需要先去掉“\r",否则切分字符会出错导致宏定义编译错误等
			ShaderCompile.addInclude(fileName, txt);
		}
		
		/**
		 * @private
		 */
		 static registerPublicDefine(name:string):number {
			var value:number = Math.pow(2, Shader3D._publicCounter++);//TODO:超界处理
			Shader3D._globleDefines[value] = name;
			return value;
		}
		
		/**
		 * 编译shader。
		 * @param	name Shader名称。
		 * @param   subShaderIndex 子着色器索引。
		 * @param   passIndex  通道索引。
		 * @param	publicDefine 公共宏定义值。
		 * @param	spriteDefine 精灵宏定义值。
		 * @param	materialDefine 材质宏定义值。
		 */
		 static compileShader(name:string, subShaderIndex:number, passIndex:number, publicDefine:number, spriteDefine:number, materialDefine:number):void {
			var shader:Shader3D = Shader3D.find(name);
			if (shader) {
				var subShader:SubShader = shader.getSubShaderAt(subShaderIndex);
				if (subShader) {
					var pass:ShaderPass = subShader._passes[passIndex];
					if (pass) {
						if (WebGL.shaderHighPrecision)//部分低端移动设备不支持高精度shader,所以如果在PC端或高端移动设备输出的宏定义值需做判断移除高精度宏定义
							pass.withCompile(publicDefine, spriteDefine, materialDefine);
						else
							pass.withCompile(publicDefine - Shader3D.SHADERDEFINE_HIGHPRECISION, spriteDefine, materialDefine);
					} else {
						console.warn("Shader3D: unknown passIndex.");
					}
				} else {
					console.warn("Shader3D: unknown subShaderIndex.");
				}
			} else {
				console.warn("Shader3D: unknown shader name.");
			}
		}
		
		/**
		 * @private
		 * 添加预编译shader文件，主要是处理宏定义
		 */
		 static add(name:string,attributeMap:any=null, uniformMap:any=null, enableInstancing:boolean = false):Shader3D {
			return Shader3D._preCompileShader[name] = new Shader3D(name,attributeMap,uniformMap, enableInstancing);
		}
		
		/**
		 * 获取ShaderCompile3D。
		 * @param	name
		 * @return ShaderCompile3D。
		 */
		 static find(name:string):Shader3D {
			return Shader3D._preCompileShader[name];
		}
		
		/**@private */
		 _name:string;
		/**@private */
		 _enableInstancing:boolean = false;
		
		/**@private */
		 _subShaders:SubShader[] = [];
		
		/**
		 * 创建一个 <code>Shader3D</code> 实例。
		 */
		constructor(name:string,attributeMap:any, uniformMap:any, enableInstancing:boolean){
			
			this._name = name;
			this._attributeMap = attributeMap;
			this._uniformMap = uniformMap;
			this._enableInstancing = enableInstancing;
		}
		
		/**
		 * 添加子着色器。
		 * @param 子着色器。
		 */
		 addSubShader(subShader:SubShader):void {
			this._subShaders.push(subShader);
			subShader._owner = this;
		}
		
		/**
		 * 在特定索引获取子着色器。
		 * @param	index 索引。
		 * @return 子着色器。
		 */
		 getSubShaderAt(index:number):SubShader {
			return this._subShaders[index];
		}
	
	}


