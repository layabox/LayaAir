import { SkyMesh } from "././SkyMesh";
import { SkyBox } from "././SkyBox";
import { BaseCamera } from "../../core/BaseCamera"
	import { BaseMaterial } from "../../core/material/BaseMaterial"
	import { SkyBoxMaterial } from "../../core/material/SkyBoxMaterial"
	import { RenderContext3D } from "../../core/render/RenderContext3D"
	import { Scene3D } from "../../core/scene/Scene3D"
	import { ShaderInstance } from "../../shader/ShaderInstance"
	import { LayaGL } from "laya/layagl/LayaGL"
	import { Stat } from "laya/utils/Stat"
	import { WebGLContext } from "laya/webgl/WebGLContext"
	
	/**
	 * <code>SkyRenderer</code> 类用于实现天空渲染器。
	 */
	export class SkyRenderer {
		/** @private */
		private _material:BaseMaterial;
		/** @private */
		private _mesh:SkyMesh = SkyBox.instance;
		
		/**
		 * 获取材质。
		 * @return 材质。
		 */
		 get material():BaseMaterial {
			return this._material;
		}
		
		/**
		 * 设置材质。
		 * @param 材质。
		 */
		 set material(value:BaseMaterial) {
			if (this._material !== value) {
				(this._material) && (this._material._removeReference());
				(value) && (value._addReference());
				this._material = value;
			}
		}
		
		/**
		 * 获取网格。
		 * @return 网格。
		 */
		 get mesh():SkyMesh {
			return this._mesh;
		}
		
		/**
		 * 设置网格。
		 * @param 网格。
		 */
		 set mesh(value:SkyMesh) {
			if (this._mesh !== value) {
				//(_mesh) && (_mesh._removeReference());//TODO:SkyMesh换成Mesh
				//value._addReference();
				this._mesh = value;
			}
		}
		
		/**
		 * 创建一个新的 <code>SkyRenderer</code> 实例。
		 */
		constructor(){
		}
		
		/**
		 * @private
		 * 是否可用。
		 */
		 _isAvailable():boolean {
			return this._material && this._mesh;
		}
		
		/**
		 * @private
		 */
		 _render(state:RenderContext3D):void {
			if (this._material && this._mesh) {
				var gl:WebGLContext = LayaGL.instance;
				var scene:Scene3D = state.scene;
				var camera:BaseCamera = state.camera;
				
				WebGLContext.setCullFace(gl, false);
				WebGLContext.setDepthFunc(gl, WebGLContext.LEQUAL);
				WebGLContext.setDepthMask(gl, false);
				var shader:ShaderInstance = state.shader = this._material._shader.getSubShaderAt(0)._passes[0].withCompile(0, 0, this._material._shaderValues._defineValue);//TODO:调整SubShader代码
				var switchShader:boolean = shader.bind();//纹理需要切换shader时重新绑定 其他uniform不需要
				var switchShaderLoop:boolean = (Stat.loopCount !== shader._uploadMark);
				
				var uploadScene:boolean = (shader._uploadScene !== scene) || switchShaderLoop;
				if (uploadScene || switchShader) {
					shader.uploadUniforms(shader._sceneUniformParamsMap, scene._shaderValues, uploadScene);
					shader._uploadScene = scene;
				}
				
				var uploadCamera:boolean = (shader._uploadCamera !== camera) || switchShaderLoop;
				if (uploadCamera || switchShader) {
					shader.uploadUniforms(shader._cameraUniformParamsMap, camera._shaderValues, uploadCamera);
					shader._uploadCamera = camera;
				}
				
				var uploadMaterial:boolean = (shader._uploadMaterial !== this._material) || switchShaderLoop;
				if (uploadMaterial || switchShader) {
					shader.uploadUniforms(shader._materialUniformParamsMap, this._material._shaderValues, uploadMaterial);
					shader._uploadMaterial = this._material;
				}
				
				this._mesh._bufferState.bind();
				this._mesh._render(state);
				WebGLContext.setDepthFunc(gl, WebGLContext.LESS);
				WebGLContext.setDepthMask(gl, true);
			}
		}
		
		/**
		 * @private
		 */
		 destroy():void {
			if (this._material) {
				this._material._removeReference();
				this._material = null;
			}
		
		}
	
	}


