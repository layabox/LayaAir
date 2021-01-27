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
import { ShadowSliceData, ShadowSpotData } from "./ShadowSliceData";
import { LightSprite, LightType } from "../core/light/LightSprite";
import { SpotLight } from "../core/light/SpotLight";
import { BoundFrustum } from "../math/BoundFrustum";

export enum ShadowLightType{
	/**直射光 */
	DirectionLight,
	/**聚光 */
	SpotLight,
	/**点光 */
	PointLight
}

/**
 * @internal
 * <code>ShadowCasterPass</code> 类用于实现阴影渲染管线
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
	static SHADOW_SPOTMAP_SIZE: number = Shader3D.propertyNameToID("u_SpotShadowMapSize");
	/** @internal */
	static SHADOW_SPOTMAP:number = Shader3D.propertyNameToID("u_SpotShadowMap");
	/** @internal */
	static SHADOW_SPOTMATRICES:number = Shader3D.propertyNameToID("u_SpotViewProjectMatrix");
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
	private _shadowSpotMapSize: Vector4 = new Vector4();
	/** @internal */
	private _shadowMatrices: Float32Array = new Float32Array(16 * (ShadowCasterPass._maxCascades));
	/** @internal */
	private _shadowSpotMatrices:Matrix4x4 = new Matrix4x4();
	/**@internal */
	private _splitBoundSpheres: Float32Array = new Float32Array(ShadowCasterPass._maxCascades * 4);
	/** @internal */
	private _cascadeCount: number = 0;
	/** @internal */
	private _shadowMapWidth: number = 0;
	/** @internal */
	private _shadowMapHeight: number = 0;
	/** @internal */
	private _shadowDirectLightMap: RenderTexture;
	/** @internal */
	private _shadowSpotLightMap:RenderTexture;
	/** @internal */
	private _shadowSliceDatas: ShadowSliceData[] = [new ShadowSliceData(), new ShadowSliceData(), new ShadowSliceData(), new ShadowSliceData()];
	/** @internal */
	private _shadowSpotData:ShadowSpotData = new ShadowSpotData();
	/**@internal */
	private _light: LightSprite;
	/** @internal */
	private _lightUp: Vector3 = new Vector3();
	/** @internal */
	private _lightSide: Vector3 = new Vector3();
	/** @internal */
	private _lightForward: Vector3 = new Vector3();

	constructor() {
		this._shadowSpotData.cameraCullInfo.boundFrustum = new BoundFrustum(new Matrix4x4());
	}

	/**
	 * 设置阴影级联数据模式
	 * @internal
	 * @param context 渲染上下文
	 * @param shaderValues 渲染数据
	 * @param shadowSliceData 分级数据
	 * @param LightParam 灯光属性
	 * @param shadowparams 阴影属性
	 * @param shadowBias 阴影偏移
	 * @param lightType 灯光类型
	 */
	private _setupShadowCasterShaderValues(context: RenderContext3D, shaderValues: ShaderData, shadowSliceData: any, LightParam: Vector3,shadowparams:Vector4, shadowBias: Vector4,lightType:LightType): void {
		shaderValues.setVector(ShadowCasterPass.SHADOW_BIAS, shadowBias);
		switch(lightType)
		{
			case LightType.Directional:
				shaderValues.setVector3(ShadowCasterPass.SHADOW_LIGHT_DIRECTION, LightParam);
				break;
			case LightType.Spot:
				shaderValues.setVector(ShadowCasterPass.SHADOW_PARAMS,shadowparams);
				break;
			case LightType.Point:
				break;
		}
		

		var cameraSV: ShaderData = shadowSliceData.cameraShaderValue;//TODO:should optimization with shader upload.
		cameraSV.setMatrix4x4(BaseCamera.VIEWMATRIX, shadowSliceData.viewMatrix);
		cameraSV.setMatrix4x4(BaseCamera.PROJECTMATRIX, shadowSliceData.projectionMatrix);
		cameraSV.setMatrix4x4(BaseCamera.VIEWPROJECTMATRIX, shadowSliceData.viewProjectMatrix);
		context.viewMatrix = shadowSliceData.viewMatrix;
		context.projectionMatrix = shadowSliceData.projectionMatrix;
		context.projectionViewMatrix = shadowSliceData.viewProjectMatrix;
	}
	

	/**
	 *设置直射光接受阴影的模式
	 * @internal
	 * @param shaderValues 渲染数据
	 */
	private _setupShadowReceiverShaderValues(shaderValues: ShaderData): void {
		var light: DirectionLight = <DirectionLight>this._light;
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
		shaderValues.setTexture(ShadowCasterPass.SHADOW_MAP, this._shadowDirectLightMap);
		shaderValues.setBuffer(ShadowCasterPass.SHADOW_MATRICES, this._shadowMatrices);
		shaderValues.setVector(ShadowCasterPass.SHADOW_MAP_SIZE, this._shadowMapSize);
		shaderValues.setVector(ShadowCasterPass.SHADOW_PARAMS, this._shadowParams);
		shaderValues.setBuffer(ShadowCasterPass.SHADOW_SPLIT_SPHERES, this._splitBoundSpheres);
	}

	/**
	 * 设置聚光接受阴影的模式
	 * @internal
	 * @param shaderValues 渲染数据
	 */
	private _setupSpotShadowReceiverShaderValues(shaderValues:ShaderData):void{
		var spotLight:SpotLight = <SpotLight>this._light;
		switch(spotLight.shadowMode){
			case ShadowMode.Hard:
				shaderValues.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_SPOT_SOFT_SHADOW_HIGH);
				shaderValues.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_SPOT_SOFT_SHADOW_LOW);
				break;
			case ShadowMode.SoftLow:
				shaderValues.addDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_SPOT_SOFT_SHADOW_LOW);
				shaderValues.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_SPOT_SOFT_SHADOW_HIGH);
				break;
			case ShadowMode.SoftHigh:
				shaderValues.addDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_SPOT_SOFT_SHADOW_HIGH);
				shaderValues.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_SPOT_SOFT_SHADOW_LOW);
				break;
		}
		shaderValues.setTexture(ShadowCasterPass.SHADOW_SPOTMAP,this._shadowSpotLightMap);
		shaderValues.setMatrix4x4(ShadowCasterPass.SHADOW_SPOTMATRICES,this._shadowSpotMatrices)
		shaderValues.setVector(ShadowCasterPass.SHADOW_SPOTMAP_SIZE, this._shadowSpotMapSize);
		shaderValues.setVector(ShadowCasterPass.SHADOW_PARAMS,this._shadowParams);
	}


	/**
	 * 更新阴影数据
	 * @internal
	 * @param camera 渲染相机
	 * @param light 灯光
	 * @param lightType 灯光类型
	 */
	update(camera: Camera, light: LightSprite,lightType:ShadowLightType): void {
		switch(lightType){
			case ShadowLightType.DirectionLight:
				this._light = light;
				var lightWorld: Matrix4x4 = ShadowCasterPass._tempMatrix0;
				var lightWorldE: Float32Array = lightWorld.elements;
				var lightUp: Vector3 = this._lightUp;
				var lightSide: Vector3 = this._lightSide;
				var lightForward: Vector3 = this._lightForward;
				//光的的空间矩阵，旁边 上面 前面
				Matrix4x4.createFromQuaternion(light._transform.rotation, lightWorld);//to remove scale problem
				lightSide.setValue(lightWorldE[0], lightWorldE[1], lightWorldE[2]);
				lightUp.setValue(lightWorldE[4], lightWorldE[5], lightWorldE[6]);
				lightForward.setValue(-lightWorldE[8], -lightWorldE[9], -lightWorldE[10]);
				//设置分辨率
				var atlasResolution: number = light._shadowResolution;
				var cascadesMode: ShadowCascadesMode = (<DirectionLight>light)._shadowCascadesMode;
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
				ShadowUtils.getCascadesSplitDistance((<DirectionLight>light)._shadowTwoCascadeSplits, (<DirectionLight>light)._shadowFourCascadeSplits, cameraNear, shadowFar, camera.fieldOfView * MathUtils3D.Deg2Rad, camera.aspectRatio, cascadesMode, splitDistance);
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
				ShadowUtils.prepareShadowReceiverShaderValues((<DirectionLight>light), shadowMapWidth, shadowMapHeight, this._shadowSliceDatas, cascadesCount, this._shadowMapSize, this._shadowParams, shadowMatrices, boundSpheres);
				break;
			case ShadowLightType.SpotLight:
				this._light = light;
				var lightWorld:Matrix4x4 = ShadowCasterPass._tempMatrix0;
				var lightForward:Vector3 = this._lightForward;
				var shadowResolution:number = this._light._shadowResolution;
				this._shadowMapWidth = shadowResolution;
				this._shadowMapHeight = shadowResolution;
				var shadowSpotData:ShadowSpotData = this._shadowSpotData;
				ShadowUtils.getSpotLightShadowData(shadowSpotData,<SpotLight>this._light,shadowResolution,this._shadowParams,this._shadowSpotMatrices,this._shadowSpotMapSize);
				break;
			case ShadowLightType.PointLight:
				//TODO:
				break;
			default:
				throw ("There is no shadow of this type")
				break;
		}
	
	}

	/**
	 * 渲染阴影帧缓存
	 * @internal
	 * @param context 渲染上下文
	 * @param scene 3DScene场景
	 * @param lightType 阴影类型
	 */
	render(context: RenderContext3D, scene: Scene3D,lightType:ShadowLightType): void {
		switch(lightType){
			case ShadowLightType.DirectionLight:
				var shaderValues: ShaderData = scene._shaderValues;
				context.pipelineMode = "ShadowCaster";
				ShaderData.setRuntimeValueMode(false);
				var shadowMap: RenderTexture = this._shadowDirectLightMap = ShadowUtils.getTemporaryShadowTexture(this._shadowMapWidth, this._shadowMapHeight, RenderTextureDepthFormat.DEPTH_16);
				shadowMap._start();
				var light: DirectionLight = <DirectionLight>this._light;
				for (var i: number = 0, n: number = this._cascadeCount; i < n; i++) {
					var sliceData: ShadowSliceData = this._shadowSliceDatas[i];
					ShadowUtils.getShadowBias(light, sliceData.projectionMatrix, sliceData.resolution, this._shadowBias);
					this._setupShadowCasterShaderValues(context, shaderValues, sliceData, this._lightForward,this._shadowParams, this._shadowBias,LightType.Directional);
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
				context.pipelineMode = context.configPipeLineMode;
				break;
			case ShadowLightType.SpotLight:
				var shaderValues:ShaderData = scene._shaderValues;
				context.pipelineMode = "ShadowCaster";
				ShaderData.setRuntimeValueMode(false);
				var spotlight: SpotLight = <SpotLight>this._light;
				var shadowMap:RenderTexture = this._shadowSpotLightMap = ShadowUtils.getTemporaryShadowTexture(this._shadowMapWidth,this._shadowMapHeight,RenderTextureDepthFormat.DEPTH_16);
				shadowMap._start();
				var shadowSpotData:ShadowSpotData = this._shadowSpotData;
				ShadowUtils.getShadowBias(spotlight,shadowSpotData.projectionMatrix,shadowSpotData.resolution,this._shadowBias);
				this._setupShadowCasterShaderValues(context,shaderValues,shadowSpotData,this._light.transform.position,this._shadowParams,this._shadowBias,LightType.Spot);
				var needRender:boolean = FrustumCulling.cullingSpotShadow(shadowSpotData.cameraCullInfo,scene,context);
				context.cameraShaderValue = shadowSpotData.cameraShaderValue;
				Camera._updateMark++;
				var gl = LayaGL.instance;
				gl.enable(gl.SCISSOR_TEST);
				gl.viewport(shadowSpotData.offsetX, shadowSpotData.offsetY, shadowSpotData.resolution, shadowSpotData.resolution);
				gl.scissor(shadowSpotData.offsetX, shadowSpotData.offsetY,shadowSpotData.resolution, shadowSpotData.resolution);
				gl.clear(gl.DEPTH_BUFFER_BIT);
			
				if(needRender){
					 gl.scissor(shadowSpotData.offsetX,shadowSpotData.offsetY,shadowSpotData.resolution,shadowSpotData.resolution);
					scene._opaqueQueue._render(context);
				}
				shadowMap._end();
				this._setupSpotShadowReceiverShaderValues(shaderValues);
				ShaderData.setRuntimeValueMode(true);
				context.pipelineMode = context.configPipeLineMode;
				break;
			case ShadowLightType.PointLight:
				//TODO:
				break;
			default:
				throw ("There is no shadow of this type")
				break;
		}
	
	}

	/**
	 * 清理阴影数据
	 * @internal
	 */
	cleanUp(): void {
		this._shadowDirectLightMap && RenderTexture.recoverToPool(this._shadowDirectLightMap);
		this._shadowSpotLightMap && RenderTexture.recoverToPool(this._shadowSpotLightMap);
		this._shadowDirectLightMap = null;
		this._shadowSpotLightMap = null;
		this._light = null;
		
	}
}

