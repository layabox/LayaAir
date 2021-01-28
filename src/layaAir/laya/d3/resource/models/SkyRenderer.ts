import { ILaya } from "../../../../ILaya";
import { LayaGL } from "../../../layagl/LayaGL";
import { Stat } from "../../../utils/Stat";
import { WebGLContext } from "../../../webgl/WebGLContext";
import { Camera } from "../../core/Camera";
import { Material } from "../../core/material/Material";
import { RenderContext3D } from "../../core/render/RenderContext3D";
import { Scene3D } from "../../core/scene/Scene3D";
import { Matrix4x4 } from "../../math/Matrix4x4";
import { Vector3 } from "../../math/Vector3";
import { DefineDatas } from "../../shader/DefineDatas";
import { ShaderData } from "../../shader/ShaderData";
import { ShaderInstance } from "../../shader/ShaderInstance";
import { SkyBox } from "./SkyBox";
import { SkyMesh } from "./SkyMesh";

/**
 * <code>SkyRenderer</code> 类用于实现天空渲染器。
 */
export class SkyRenderer {
	/** @internal */
	private static _tempMatrix0: Matrix4x4 = new Matrix4x4();
	/** @internal */
	private static _tempMatrix1: Matrix4x4 = new Matrix4x4();
	/** @internal */
	private static _compileDefine: DefineDatas = new DefineDatas();

	/** @internal */
	private _material: Material;
	/** @internal */
	private _mesh: SkyMesh = SkyBox.instance;

	/**
	 * 材质。
	 */
	get material(): Material {
		return this._material;
	}

	set material(value: Material) {
		if (this._material !== value) {
			(this._material) && (this._material._removeReference());
			(value) && (value._addReference());
			this._material = value;
		}
	}

	/**
	 * 网格。
	 */
	get mesh(): SkyMesh {
		return this._mesh;
	}

	set mesh(value: SkyMesh) {
		if (this._mesh !== value) {
			//(_mesh) && (_mesh._removeReference());//TODO:SkyMesh换成Mesh
			//value._addReference();
			this._mesh = value;
		}
	}

	/**
	 * 创建一个新的 <code>SkyRenderer</code> 实例。
	 */
	constructor() {
	}

	/**
	 * @internal
	 * 是否可用。
	 */
	_isAvailable(): boolean {
		return this._material && this._mesh ? true : false;
	}

	/**
	 * @internal
	 */
	_render(context: RenderContext3D): void {
		if (this._material && this._mesh) {
			var gl: WebGLRenderingContext = LayaGL.instance;
			var scene: Scene3D = context.scene;
			var cameraShaderValue: ShaderData = context.cameraShaderValue;
			var camera: Camera = context.camera;

			var noteValue: boolean = ShaderData._SET_RUNTIME_VALUE_MODE_REFERENCE_;
			ILaya.Render.supportWebGLPlusRendering && ShaderData.setRuntimeValueMode(false);

			WebGLContext.setCullFace(gl, false);
			WebGLContext.setDepthFunc(gl, gl.LEQUAL);
			WebGLContext.setDepthMask(gl, false);
			var comDef: DefineDatas = SkyRenderer._compileDefine;
			this._material._shaderValues._defineDatas.cloneTo(comDef);
			var shader: ShaderInstance = context.shader = this._material._shader.getSubShaderAt(0)._passes[0].withCompile(comDef);//TODO:调整SubShader代码
			var switchShader: boolean = shader.bind();//纹理需要切换shader时重新绑定 其他uniform不需要
			var switchShaderLoop: boolean = (Stat.loopCount !== shader._uploadMark);

			var uploadScene: boolean = (shader._uploadScene !== scene) || switchShaderLoop;
			if (uploadScene || switchShader) {
				shader.uploadUniforms(shader._sceneUniformParamsMap, scene._shaderValues, uploadScene);
				shader._uploadScene = scene;
			}

			var uploadCamera: boolean = (shader._uploadCameraShaderValue !== cameraShaderValue) || switchShaderLoop;
			if (uploadCamera || switchShader) {
				var viewMatrix: Matrix4x4 = SkyRenderer._tempMatrix0;
				var projectionMatrix: Matrix4x4 = SkyRenderer._tempMatrix1;
				camera.viewMatrix.cloneTo(viewMatrix);//视图矩阵逆矩阵的转置矩阵，移除平移和缩放
				camera.projectionMatrix.cloneTo(projectionMatrix);
				viewMatrix.setTranslationVector(Vector3._ZERO);

				if (camera.orthographic)
					Matrix4x4.createPerspective(camera.fieldOfView, camera.aspectRatio, camera.nearPlane, camera.farPlane, projectionMatrix);

				//无穷投影矩阵算法,DirectX右手坐标系推导
				//http://terathon.com/gdc07_lengyel.pdf

				//xScale  0     0                          0
				//0     yScale  0                          0
				//0       0    	-zfar /(zfar-znear)        -1.0
				//0       0     -znear*zfar /(zfar-znear)  0

				//xScale  0     0       0        mul   [x,y,z,0] =[xScale*x,yScale*y,-z,-z]
				//0     yScale  0       0		
				//0       0    	-1      -1.0	
				//0       0     -0      0

				//[xScale*x,yScale*y,-z,-z]=>[-xScale*x/z,-yScale*y/z,1]

				//xScale  0     0       0      
				//0     yScale  0       0		
				//0       0    	-1+e    -1.0	
				//0       0     -0  0

				var epsilon: number = 1e-6;
				var yScale: number = 1.0 / Math.tan(3.1416 * camera.fieldOfView / 180 * 0.5);
				projectionMatrix.elements[0] = yScale / camera.aspectRatio;
				projectionMatrix.elements[5] = yScale;
				projectionMatrix.elements[10] = epsilon - 1.0;
				projectionMatrix.elements[11] = -1.0;
				projectionMatrix.elements[14] = -0;//znear无穷小

				(<Camera>camera)._applyViewProject(context, viewMatrix, projectionMatrix);//TODO:优化 不应设置给Camera直接提交
				shader.uploadUniforms(shader._cameraUniformParamsMap, cameraShaderValue, uploadCamera);
				shader._uploadCameraShaderValue = cameraShaderValue;
			}

			var uploadMaterial: boolean = (shader._uploadMaterial !== this._material) || switchShaderLoop;
			if (uploadMaterial || switchShader) {
				shader.uploadUniforms(shader._materialUniformParamsMap, this._material._shaderValues, uploadMaterial);
				shader._uploadMaterial = this._material;
			}

			this._mesh._bufferState.bind();
			this._mesh._render(context);

			ILaya.Render.supportWebGLPlusRendering && ShaderData.setRuntimeValueMode(noteValue);

			WebGLContext.setDepthFunc(gl, gl.LESS);
			WebGLContext.setDepthMask(gl, true);
			camera._applyViewProject(context, camera.viewMatrix, camera.projectionMatrix);
		}
	}

	/**
	 * @internal
	 */
	destroy(): void {
		if (this._material) {
			this._material._removeReference();
			this._material = null;
		}

	}

}


