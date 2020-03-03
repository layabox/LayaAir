import { LayaGL } from "../../layagl/LayaGL";
import { RenderTextureDepthFormat } from "../../resource/RenderTextureFormat";
import { BaseCamera } from "../core/BaseCamera";
import { Camera } from "../core/Camera";
import { DirectionLight } from "../core/light/DirectionLight";
import { ShadowCascadesMode } from "../core/light/ShadowCascadesMode";
import { ShadowMode } from "../core/light/ShadowMode";
import { ShadowUtils } from "../core/light/ShadowUtils";
import { RenderContext3D } from "../core/render/RenderContext3D";
import { Scene3D } from "../core/scene/Scene3D";
import { Scene3DShaderDeclaration } from "../core/scene/Scene3DShaderDeclaration";
import { FrustumCulling, ShadowCullInfo } from "../graphics/FrustumCulling";
import { MathUtils3D } from "../math/MathUtils3D";
import { Matrix4x4 } from "../math/Matrix4x4";
import { Plane } from "../math/Plane";
import { Vector3 } from "../math/Vector3";
import { Vector4 } from "../math/Vector4";
import { RenderTexture } from "../resource/RenderTexture";
import { Shader3D } from "../shader/Shader3D";
import { ShaderData } from "../shader/ShaderData";
import { ShadowSliceData } from "./ShadowSliceData";

/**
 * @internal
 */
export class ShadowCasterPass {
	/**@internal */
	private static _tempVector30: Vector3 = new Vector3();
	/**@internal */
	private static _tempMatrix0: Matrix4x4 = new Matrix4x4();

	/** @internal */
	static SHADOW_BIAS: number = Shader3D.propertyNameToID("u_ShadowBias");
	/** @internal */
	static SHADOW_LIGHT_DIRECTION: number = Shader3D.propertyNameToID("u_ShadowLightDirection");
	/** @internal */
	static SHADOW_SPLIT_SPHERES: number = Shader3D.propertyNameToID("u_ShadowSplitSpheres");
	/** @internal */
	static SHADOW_MATRICES: number = Shader3D.propertyNameToID("u_ShadowMatrices");
	/** @internal */
	static SHADOW_MAP_SIZE: number = Shader3D.propertyNameToID("u_ShadowMapSize");
	/** @internal */
	static SHADOW_MAP: number = Shader3D.propertyNameToID("u_ShadowMap");
	/** @internal */
	static SHADOW_PARAMS: number = Shader3D.propertyNameToID("u_ShadowParams");

	/** @internal */
	private static _maxCascades: number = 4;
	/**@internal */
	private static _cascadesSplitDistance: number[] = new Array(ShadowCasterPass._maxCascades + 1);
	/** @internal */
	private static _frustumPlanes: Plane[] = new Array(new Plane(new Vector3()), new Plane(new Vector3()), new Plane(new Vector3()), new Plane(new Vector3()), new Plane(new Vector3()), new Plane(new Vector3()));

	/** @internal */
	private _shadowBias: Vector4 = new Vector4();
	/** @internal */
	private _shadowParams: Vector4 = new Vector4();
	/** @internal */
	private _shadowMapSize: Vector4 = new Vector4();
	/** @internal */
	private _shadowMatrices: Float32Array = new Float32Array(16 * (ShadowCasterPass._maxCascades + 1));//the end is project prcision problem in shader
	/**@internal */
	private _splitBoundSpheres: Float32Array = new Float32Array(ShadowCasterPass._maxCascades * 4);
	/** @internal */
	private _cascadeCount: number = 0;
	/** @internal */
	private _shadowMapWidth: number = 0;
	/** @internal */
	private _shadowMapHeight: number = 0;
	/** @internal */
	private _shadowMap: RenderTexture;
	/** @internal */
	private _shadowSliceDatas: ShadowSliceData[] = [new ShadowSliceData(), new ShadowSliceData(), new ShadowSliceData(), new ShadowSliceData()];
	/**@internal */
	private _light: DirectionLight;
	/** @internal */
	private _lightUp: Vector3 = new Vector3();
	/** @internal */
	private _lightSide: Vector3 = new Vector3();
	/** @internal */
	private _lightForward: Vector3 = new Vector3();

	constructor() {
	}

	/**
     * @internal
     */
	private _setupShadowCasterShaderValues(context: RenderContext3D, shaderValues: ShaderData, shadowSliceData: ShadowSliceData, direction: Vector3, shadowBias: Vector4): void {
		shaderValues.setVector(ShadowCasterPass.SHADOW_BIAS, shadowBias);
		shaderValues.setVector3(ShadowCasterPass.SHADOW_LIGHT_DIRECTION, direction);

		var cameraSV: ShaderData = shadowSliceData.cameraShaderValue;//TODO:should optimization with shader upload.
		cameraSV.setMatrix4x4(BaseCamera.VIEWMATRIX, shadowSliceData.viewMatrix);
		cameraSV.setMatrix4x4(BaseCamera.PROJECTMATRIX, shadowSliceData.projectionMatrix);
		cameraSV.setMatrix4x4(BaseCamera.VIEWPROJECTMATRIX, shadowSliceData.viewProjectMatrix);
		context.viewMatrix = shadowSliceData.viewMatrix;
		context.projectionViewMatrix = shadowSliceData.projectionMatrix;
		context.projectionViewMatrix = shadowSliceData.viewProjectMatrix;
	}


	/**
	 * @internal
	 */
	private _setupShadowReceiverShaderValues(shaderValues: ShaderData): void {
		var light: DirectionLight = this._light;
		if (light.shadowCascadesMode !== ShadowCascadesMode.NoCascades)
			shaderValues.addDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_CASCADE);
		else
			shaderValues.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_CASCADE);
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
		shaderValues.setTexture(ShadowCasterPass.SHADOW_MAP, this._shadowMap);
		shaderValues.setBuffer(ShadowCasterPass.SHADOW_MATRICES, this._shadowMatrices);
		shaderValues.setVector(ShadowCasterPass.SHADOW_MAP_SIZE, this._shadowMapSize);
		shaderValues.setVector(ShadowCasterPass.SHADOW_PARAMS, this._shadowParams);
		shaderValues.setBuffer(ShadowCasterPass.SHADOW_SPLIT_SPHERES, this._splitBoundSpheres);
	}

	/**
	 * @internal
	 */
	update(camera: Camera, light: DirectionLight): void {
		this._light = light;
		var lightWorld: Matrix4x4 = ShadowCasterPass._tempMatrix0;
		var lightWorldE: Float32Array = lightWorld.elements;
		var lightUp: Vector3 = this._lightUp;
		var lightSide: Vector3 = this._lightSide;
		var lightForward: Vector3 = this._lightForward;
		Matrix4x4.createFromQuaternion(light._transform.rotation, lightWorld);//to remove scale problem
		lightSide.setValue(lightWorldE[0], lightWorldE[1], lightWorldE[2]);
		lightUp.setValue(lightWorldE[4], lightWorldE[5], lightWorldE[6]);
		lightForward.setValue(-lightWorldE[8], -lightWorldE[9], -lightWorldE[10]);

		var atlasResolution: number = light._shadowResolution;
		var cascadesMode: ShadowCascadesMode = light._shadowCascadesMode;
		var cascadesCount: number;
		var shadowTileResolution: number;
		var shadowMapWidth: number, shadowMapHeight: number;
		if (cascadesMode == ShadowCascadesMode.NoCascades) {
			cascadesCount = 1;
			shadowTileResolution = atlasResolution;
			shadowMapWidth = atlasResolution;
			shadowMapHeight = atlasResolution;
		}
		else {
			cascadesCount = cascadesMode == ShadowCascadesMode.TwoCascades ? 2 : 4;
			shadowTileResolution = ShadowUtils.getMaxTileResolutionInAtlas(atlasResolution, atlasResolution, cascadesCount);
			shadowMapWidth = shadowTileResolution * 2;
			shadowMapHeight = cascadesMode == ShadowCascadesMode.TwoCascades ? shadowTileResolution : shadowTileResolution * 2;
		}
		this._cascadeCount = cascadesCount;
		this._shadowMapWidth = shadowMapWidth;
		this._shadowMapHeight = shadowMapHeight;

		var splitDistance: number[] = ShadowCasterPass._cascadesSplitDistance;
		var frustumPlanes: Plane[] = ShadowCasterPass._frustumPlanes;
		var cameraNear: number = camera.nearPlane;
		var shadowFar: number = Math.min(camera.farPlane, light._shadowDistance);
		var shadowMatrices: Float32Array = this._shadowMatrices;
		var boundSpheres: Float32Array = this._splitBoundSpheres;
		ShadowUtils.getCascadesSplitDistance(light._shadowTwoCascadeSplits, light._shadowFourCascadeSplits, cameraNear, shadowFar, camera.fieldOfView * MathUtils3D.Deg2Rad, camera.aspectRatio, cascadesMode, splitDistance);
		ShadowUtils.getCameraFrustumPlanes(camera.projectionViewMatrix, frustumPlanes);
		var forward: Vector3 = ShadowCasterPass._tempVector30;
		camera._transform.getForward(forward);
		Vector3.normalize(forward, forward);
		for (var i: number = 0; i < cascadesCount; i++) {
			var sliceData: ShadowSliceData = this._shadowSliceDatas[i];
			sliceData.sphereCenterZ = ShadowUtils.getBoundSphereByFrustum(splitDistance[i], splitDistance[i + 1], camera.fieldOfView * MathUtils3D.Deg2Rad, camera.aspectRatio, camera._transform.position, forward, sliceData.splitBoundSphere);
			ShadowUtils.getDirectionLightShadowCullPlanes(frustumPlanes, i, splitDistance, cameraNear, lightForward, sliceData);
			ShadowUtils.getDirectionalLightMatrices(lightUp, lightSide, lightForward, i, light._shadowNearPlane, shadowTileResolution, sliceData, shadowMatrices);
			if (cascadesCount > 1)
				ShadowUtils.applySliceTransform(sliceData, shadowMapWidth, shadowMapHeight, i, shadowMatrices);
		}
		ShadowUtils.prepareShadowReceiverShaderValues(light, shadowMapWidth, shadowMapHeight, this._shadowSliceDatas, cascadesCount, this._shadowMapSize, this._shadowParams, shadowMatrices, boundSpheres);
	}

	/**
	 * @interal
	 */
	render(context: RenderContext3D, scene: Scene3D): void {
		var shaderValues: ShaderData = scene._shaderValues;
		context.pipelineMode = "ShadowCaster";
		ShaderData.setRuntimeValueMode(false);
		var shadowMap: RenderTexture = this._shadowMap = ShadowUtils.getTemporaryShadowTexture(this._shadowMapWidth, this._shadowMapHeight, RenderTextureDepthFormat.DEPTH_16);
		shadowMap._start();
		var light: DirectionLight = this._light;
		for (var i: number = 0, n: number = this._cascadeCount; i < n; i++) {
			var sliceData: ShadowSliceData = this._shadowSliceDatas[i];
			ShadowUtils.getShadowBias(light, sliceData.projectionMatrix, sliceData.resolution, this._shadowBias);
			this._setupShadowCasterShaderValues(context, shaderValues, sliceData, this._lightForward, this._shadowBias);
			var shadowCullInfo: ShadowCullInfo = FrustumCulling._shadowCullInfo;
			shadowCullInfo.position = sliceData.position;
			shadowCullInfo.cullPlanes = sliceData.cullPlanes;
			shadowCullInfo.cullPlaneCount = sliceData.cullPlaneCount;
			shadowCullInfo.cullSphere = sliceData.splitBoundSphere;
			shadowCullInfo.direction = this._lightForward;
			var needRender: boolean = FrustumCulling.cullingShadow(shadowCullInfo, scene, context);
			context.cameraShaderValue = sliceData.cameraShaderValue;
			Camera._updateMark++;
			var gl = LayaGL.instance;
			var resolution: number = sliceData.resolution;
			var offsetX: number = sliceData.offsetX;
			var offsetY: number = sliceData.offsetY;
			gl.enable(gl.SCISSOR_TEST);
			gl.viewport(offsetX, offsetY, resolution, resolution);
			gl.scissor(offsetX, offsetY, resolution, resolution);
			gl.clear(gl.DEPTH_BUFFER_BIT);
			if (needRender) {// if one cascade have anything to render.
				gl.scissor(offsetX + 1, offsetY + 1, resolution - 2, resolution - 2);//for no cascade is for the edge,for cascade is for the beyond maxCascade pixel can use (0,0,0) trick sample the shadowMap
				scene._opaqueQueue._render(context);//阴影均为非透明队列
			}
		}
		shadowMap._end();
		this._setupShadowReceiverShaderValues(shaderValues);
		ShaderData.setRuntimeValueMode(true);
		context.pipelineMode = "Forward";
	}

	/**
	 * @internal
	 */
	cleanUp(): void {
		RenderTexture.recoverToPool(this._shadowMap);
		this._shadowMap = null;
		this._light = null;
	}
}

