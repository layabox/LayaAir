import { LayaGL } from "../../layagl/LayaGL";
import { RenderTextureDepthFormat } from "../../resource/RenderTextureFormat";
import { BaseCamera } from "../core/BaseCamera";
import { Camera } from "../core/Camera";
import { DirectionLight } from "../core/light/DirectionLight";
import { ShadowCascadesMode } from "../core/light/ShadowCascadesMode";
import { ShadowMode } from "../core/light/ShadowMode";
import { ShadowUtils } from "../core/light/ShadowUtils";
import { Scene3D } from "../core/scene/Scene3D";
import { Scene3DShaderDeclaration } from "../core/scene/Scene3DShaderDeclaration";
import { Matrix4x4 } from "../math/Matrix4x4";
import { Plane } from "../math/Plane";
import { Vector3 } from "../math/Vector3";
import { Vector4 } from "../math/Vector4";
import { RenderTexture } from "../resource/RenderTexture";
import { Shader3D } from "../shader/Shader3D";
import { ShaderData } from "../shader/ShaderData";
import { ShadowSliceData } from "./ShadowSliceData";
import { ShadowCullInfo, FrustumCulling } from "../graphics/FrustumCulling";
import { RenderQueue } from "../core/render/RenderQueue";
import { RenderContext3D } from "../core/render/RenderContext3D";

/**
 * 
 */
export class ShadowCasterPass {
	/** @internal */
	static SHADOW_BIAS: number = Shader3D.propertyNameToID("u_ShadowBias");
	/** @internal */
	static SHADOW_LIGHT_DIRECTION: number = Shader3D.propertyNameToID("u_ShadowLightDirection");
	/** @internal */
	static SHADOWDISTANCE: number = Shader3D.propertyNameToID("u_shadowPSSMDistance");
	/** @internal */
	static SHADOWLIGHT_VIEW_PROJECTS: number = Shader3D.propertyNameToID("u_ShadowLightViewProjects");
	/** @internal */
	static SHADOW_MAP_SIZE: number = Shader3D.propertyNameToID("u_ShadowMapSize");
	/** @internal */
	static SHADOW_MAP: number = Shader3D.propertyNameToID("u_ShadowMap");
	/** @internal */
	static SHADOW_PARAMS: number = Shader3D.propertyNameToID("u_ShadowParams");

	/** @internal */
	private static _maxCascades: number = 4;
	/**@internal */
	private static _cascadesSplitDistance: number[] = new Array(5);// max split plane is 5
	/** @internal */
	private static _frustumPlanes: Plane[] = new Array(new Plane(new Vector3()), new Plane(new Vector3()), new Plane(new Vector3()), new Plane(new Vector3()), new Plane(new Vector3()), new Plane(new Vector3()));

	/** @internal */
	private _shadowBias: Vector4 = new Vector4();
	/** @internal */
	private _shadowParams: Vector4 = new Vector4();
	/** @internal */
	private _shadowMapSize: Vector4 = new Vector4();
	/** @internal */
	private _shadowMatrices: Float32Array = new Float32Array(16 * 4);
	/**@internal */
	private _cascadeSplitDistances: Vector4[] = [new Vector4(), new Vector4(), new Vector4(), new Vector4()];
	/**@internal */
	private _cascadeCount: number = 0;
	/**@internal */
	private _shadowMapWith: number = 0;
	/**@internal */
	private _shadowMapHeight: number = 0;


	/** */
	_shadowMap: RenderTexture;
	/**@internal */
	_shadowSliceDatas: ShadowSliceData[] = [new ShadowSliceData(), new ShadowSliceData(), new ShadowSliceData(), new ShadowSliceData()];


	/**@internal */
	private _light: DirectionLight;

	constructor() {
	}





	/**
	 * @internal
	 */
	start(): void {
		var shadowMapSize: number = this._light._shadowResolution;
		var shadowMap: RenderTexture = ShadowUtils.getTemporaryShadowTexture(shadowMapSize, shadowMapSize, RenderTextureDepthFormat.DEPTH_16);
		var sceneSV: ShaderData = (<Scene3D>this._light._scene)._shaderValues;
		sceneSV.setTexture(ShadowCasterPass.SHADOW_MAP, shadowMap);
		shadowMap._start();
		this._shadowMap = shadowMap;
	}


	/**
	 * @internal
	 */
	clear(): void {
		RenderTexture.recoverToPool(this._shadowMap);
		// this._shadowMap = null; TODO:
	}

	/**
     * @internal
     */
	private _setupShadowCasterShaderValues(shaderValues: ShaderData, direction: Vector3, shadowBias: Vector4, viewMatrix: Matrix4x4, projectMatrix: Matrix4x4, projectViewMatrix: Matrix4x4): void {
		shaderValues.setVector(ShadowCasterPass.SHADOW_BIAS, shadowBias);
		shaderValues.setVector3(ShadowCasterPass.SHADOW_LIGHT_DIRECTION, direction);

		var cameraSV: ShaderData = this._shadowSliceDatas[0].cameraShaderValue;//TODO:
		cameraSV.setMatrix4x4(BaseCamera.VIEWMATRIX, viewMatrix);
		cameraSV.setMatrix4x4(BaseCamera.PROJECTMATRIX, projectMatrix);
		cameraSV.setMatrix4x4(BaseCamera.VIEWPROJECTMATRIX, projectViewMatrix);
	}

	/**
	 * @internal
	 */
	private _setupShadowReceiverShaderValues(shaderValues: ShaderData): void {
		var light: DirectionLight = this._light;

		if (light.shadowCascadesMode !== ShadowCascadesMode.NoCascades)
			shaderValues.addDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_CASCADES);
		else
			shaderValues.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_CASCADES);

		switch (light.shadowMode) {
			case ShadowMode.Hard:
				shaderValues.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_SOFT_SHADOW_LOW);
				shaderValues.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_SOFT_SHADOW_HIGH);
				break;
			case ShadowMode.SoftLow:
				shaderValues.addDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_SOFT_SHADOW_LOW);
				shaderValues.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_SOFT_SHADOW_HIGH);
				break;
			case ShadowMode.SoftHigh:
				shaderValues.addDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_SOFT_SHADOW_HIGH);
				shaderValues.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_SOFT_SHADOW_LOW);
				break;
		}
		var shadowMapSize: number = light._shadowResolution;//TODO:
		this._shadowMapSize.setValue(1.0 / shadowMapSize, 1.0 / shadowMapSize, shadowMapSize, shadowMapSize);
		shaderValues.setBuffer(ShadowCasterPass.SHADOWLIGHT_VIEW_PROJECTS, this._shadowMatrices);
		shaderValues.setVector(ShadowCasterPass.SHADOW_MAP_SIZE, this._shadowMapSize);
		this._shadowParams.setValue(light._shadowStrength, 0.0, 0.0, 0.0);
		shaderValues.setVector(ShadowCasterPass.SHADOW_PARAMS, this._shadowParams);
	}

	/**
	 * @internal
	 */
	update(camera: Camera, light: DirectionLight): void {
		this._light = light;
		light.transform.worldMatrix.getForward(light._direction);
		Vector3.normalize(light._direction, light._direction);//TODO:应该优化移除
		var atlasResolution: number = light._shadowResolution;
		var cascadesMode: ShadowCascadesMode = light._shadowCascadesMode;
		var cascadesCount: number;
		var shadowTileResolution: number;
		if (cascadesMode == ShadowCascadesMode.NoCascades) {
			cascadesCount = 1;
			this._shadowMapHeight = atlasResolution;
			this._shadowMapWith = atlasResolution;
			shadowTileResolution = atlasResolution;
		}
		else {
			cascadesCount = cascadesMode == ShadowCascadesMode.TwoCascades ? 2 : 4;
			shadowTileResolution = ShadowUtils.getMaxTileResolutionInAtlas(atlasResolution, atlasResolution, cascadesCount);
			this._shadowMapHeight = shadowTileResolution * 2;
			if (cascadesMode == ShadowCascadesMode.TwoCascades)
				this._shadowMapWith = shadowTileResolution;
			else
				this._shadowMapWith = shadowTileResolution * 2;
		}
		this._cascadeCount = cascadesCount;

		var splitDistance: number[] = ShadowCasterPass._cascadesSplitDistance;
		var frustumPlanes: Plane[] = ShadowCasterPass._frustumPlanes;
		ShadowUtils.getCascadesSplitDistance(light._shadowTwoCascadeSplits, light._shadowFourCascadeSplits, Math.min(camera.farPlane, light._shadowDistance) - camera.nearPlane, cascadesMode, splitDistance);
		ShadowUtils.getCameraFrustumPlanes(camera.projectionViewMatrix, frustumPlanes);
		var cameraRange: number = camera.farPlane - camera.nearPlane;
		for (var i: number = 0; i < cascadesCount; i++) {
			var sliceDatas: ShadowSliceData = this._shadowSliceDatas[i];
			ShadowUtils.getDirectionLightShadowCullPlanes(frustumPlanes, i, splitDistance, cameraRange, light._direction, sliceDatas);
			ShadowUtils.getDirectionalLightMatrices(camera, light, i, light._shadowNearPlane, shadowTileResolution, sliceDatas, this._shadowMatrices);
		}
	}

	/**
	 * @interal
	 */
	render(context: RenderContext3D, scene: Scene3D): void {
		var shaderValues: ShaderData = scene._shaderValues;
		context.pipelineMode = "ShadowCaster";
		ShaderData.setRuntimeValueMode(false);
		var light: DirectionLight = this._light;
		for (var i: number = 0; i < this._cascadeCount; i++) {
			var sliceData: ShadowSliceData = this._shadowSliceDatas[i];
			var projectMatrix: Matrix4x4 = sliceData.projectionMatrix;
			ShadowUtils.getShadowBias(light, projectMatrix, light._shadowResolution, this._shadowBias);
			this._setupShadowCasterShaderValues(shaderValues, light._direction, this._shadowBias, sliceData.viewMatrix, projectMatrix, sliceData.viewProjectMatrix);
			var shadowCullInfo: ShadowCullInfo = FrustumCulling._shadowCullInfo;
			shadowCullInfo.position = sliceData.position;
			shadowCullInfo.cullPlanes = sliceData.cullPlanes;
			shadowCullInfo.cullPlaneCount = sliceData.cullPlaneCount;
			FrustumCulling.cullingShadow(shadowCullInfo, scene, context)

			this.start();
			context.cameraShaderValue = sliceData.cameraShaderValue;
			Camera._updateMark++;
			var gl = LayaGL.instance;
			var resolution: number = sliceData.resolution;
			gl.clearColor(0, 0, 0, 0);
			gl.enable(gl.SCISSOR_TEST);
			// gl.colorMask(false,false,false,false);
			LayaGL.instance.viewport(sliceData.offsetX, sliceData.offsetY, resolution, resolution);
			LayaGL.instance.scissor(sliceData.offsetX + 4, sliceData.offsetY + 4, resolution - 8, resolution - 8);
			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
			scene._opaqueQueue._render(context);//阴影均为非透明队列
			gl.disable(gl.SCISSOR_TEST);
			// gl.colorMask(true,true,true,true);
			this._shadowMap._end();
		}
		this._setupShadowReceiverShaderValues(shaderValues);
		ShaderData.setRuntimeValueMode(true);
		context.pipelineMode = "Forward";
	}
}

