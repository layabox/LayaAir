import { ILaya3D } from "../../../ILaya3D";
import { LayaGL } from "../../layagl/LayaGL";
import { RenderTextureDepthFormat } from "../../resource/RenderTextureFormat";
import { BaseCamera } from "../core/BaseCamera";
import { Camera } from "../core/Camera";
import { DirectionLight } from "../core/light/DirectionLight";
import { ShadowUtils } from "../core/light/ShdowUtils";
import { Scene3D } from "../core/scene/Scene3D";
import { Scene3DShaderDeclaration } from "../core/scene/Scene3DShaderDeclaration";
import { BoundBox } from "../math/BoundBox";
import { BoundSphere } from "../math/BoundSphere";
import { MathUtils3D } from "../math/MathUtils3D";
import { Matrix4x4 } from "../math/Matrix4x4";
import { Vector2 } from "../math/Vector2";
import { Vector3 } from "../math/Vector3";
import { Vector4 } from "../math/Vector4";
import { RenderTexture } from "../resource/RenderTexture";
import { ShaderData } from "../shader/ShaderData";


export class ShadowCasterPass {
	/**@internal */
	static _maxCascades: number = 4;

	/**@internal */
	static _tempVector30: Vector3 = new Vector3();
	/**@internal */
	static _tempVector31: Vector3 = new Vector3();
	/**@internal */
	static _tempVector32: Vector3 = new Vector3();
	/**@internal */
	static _tempVector33: Vector3 = new Vector3();
	/**@internal */
	static _tempVector34: Vector3 = new Vector3();
	/**@internal */
	static _tempVector35: Vector3 = new Vector3();
	/**@internal */
	static _tempVector36: Vector3 = new Vector3();
	/**@internal */
	static _tempVector37: Vector3 = new Vector3();
	/**@internal */
	static _tempBoundSphere0: BoundSphere = new BoundSphere(new Vector3(), 0);
	/**@internal */
	static _tempMatrix0: Matrix4x4 = new Matrix4x4();
	/**@internal */
	static _tempMatrix1: Matrix4x4 = new Matrix4x4();
	/**@internal */
	static _tempMatrix2: Matrix4x4 = new Matrix4x4();

	/**@internal */
	private _spiltDistance: number[] = [];
	/**@internal */
	private _currentPSSM: number = -1;
	/**@internal */
	_shadowMapCount: number = 3;
	/**@internal */
	_maxDistance: number = 200.0;
	/**@internal */
	private _ratioOfDistance: number = 1.0 / this._shadowMapCount;

	/**@internal */
	_light: DirectionLight;
	/**@internal */
	cameras: Camera[];
	/**@internal */
	private _shadowMapTextureSize: number = 1024;
	/**@internal */
	private _scene: Scene3D = null;
	/**@internal */
	private _boundingSphere: BoundSphere[] = new Array<BoundSphere>(ShadowCasterPass._maxCascades + 1);
	/**@internal */
	_boundingBox: BoundBox[] = new Array<BoundBox>(ShadowCasterPass._maxCascades + 1);
	/**@internal */
	private _frustumPos: Vector3[] = new Array<Vector3>((ShadowCasterPass._maxCascades + 1) * 4);
	/**@internal */
	private _uniformDistance: number[] = new Array<number>(ShadowCasterPass._maxCascades + 1);
	/**@internal */
	private _logDistance: number[] = new Array<number>(ShadowCasterPass._maxCascades + 1);
	/**@internal */
	private _dimension: Vector2[] = new Array<Vector2>(ShadowCasterPass._maxCascades + 1);
	/** @internal */
	private _PCFType: number = 0;
	/** @internal */
	private _tempScaleMatrix44: Matrix4x4 = new Matrix4x4();
	/** @internal */
	private _shadowPCFOffset: Vector2 = new Vector2(1.0 / 1024.0, 1.0 / 1024.0);
	/** @internal */
	private _shaderValueDistance: Vector4 = new Vector4();
	/** @internal */
	private _shaderValueLightVP: Float32Array = null;
	/** @internal */
	private _shaderValueVPs: Float32Array[];

	_shadowMap: RenderTexture;

	constructor() {
		this.cameras = [];
		this._shaderValueVPs = [];
		var i: number;
		for (i = 0; i < this._spiltDistance.length; i++) {
			this._spiltDistance[i] = 0.0;
		}

		for (i = 0; i < this._dimension.length; i++)
			this._dimension[i] = new Vector2();


		for (i = 0; i < this._frustumPos.length; i++)
			this._frustumPos[i] = new Vector3();


		for (i = 0; i < this._boundingBox.length; i++)
			this._boundingBox[i] = new BoundBox(new Vector3(), new Vector3());


		for (i = 0; i < this._boundingSphere.length; i++)
			this._boundingSphere[i] = new BoundSphere(new Vector3(), 0.0);

		Matrix4x4.createScaling(new Vector3(0.5, 0.5, 1.0), this._tempScaleMatrix44);
		this._tempScaleMatrix44.elements[12] = 0.5;
		this._tempScaleMatrix44.elements[13] = 0.5;
	}

	setInfo(scene: Scene3D, maxDistance: number, globalParallelDir: Vector3, shadowMapTextureSize: number, numberOfPSSM: number, PCFType: number): void {
		if (numberOfPSSM > ShadowCasterPass._maxCascades) {
			this._shadowMapCount = ShadowCasterPass._maxCascades;
		}
		this._scene = scene;
		this._maxDistance = maxDistance;
		this.shadowMapCount = numberOfPSSM;
		this._ratioOfDistance = 1.0 / this._shadowMapCount;
		for (var i: number = 0; i < this._spiltDistance.length; i++) {
			this._spiltDistance[i] = 0.0;
		}
		this._shadowMapTextureSize = shadowMapTextureSize;
		this._shadowPCFOffset.x = 1.0 / this._shadowMapTextureSize;
		this._shadowPCFOffset.y = 1.0 / this._shadowMapTextureSize;
		this.setPCFType(PCFType);
	}

	setPCFType(PCFtype: number): void {
		this._PCFType = PCFtype;
		var defineData: ShaderData = this._scene._shaderValues;
		switch (this._PCFType) {
			case 0:
				defineData.addDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_PCF_NO);
				defineData.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_PCF1);
				defineData.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_PCF2);
				defineData.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_PCF3);
				break;
			case 1:
				defineData.addDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_PCF1);
				defineData.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_PCF_NO);
				defineData.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_PCF2);
				defineData.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_PCF3);
				break;
			case 2:
				defineData.addDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_PCF2);
				defineData.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_PCF_NO);
				defineData.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_PCF1);
				defineData.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_PCF3);
				break;
			case 3:
				defineData.addDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_PCF3);
				defineData.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_PCF_NO);
				defineData.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_PCF1);
				defineData.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_PCF2);
				break;
		}
	}

	set shadowMapCount(value: number) {
		value = value > 0 ? value : 1;
		value = value <= ShadowCasterPass._maxCascades ? value : ShadowCasterPass._maxCascades;
		if (this._shadowMapCount != value) {
			this._shadowMapCount = value;
			this._ratioOfDistance = 1.0 / this._shadowMapCount;

			this._shaderValueLightVP = new Float32Array(value * 16);
			this._shaderValueVPs.length = value;
			for (var i: number = 0; i < value; i++)
				this._shaderValueVPs[i] = new Float32Array(this._shaderValueLightVP.buffer, i * 64);
		}
	}


	private _beginSampler(index: number, sceneCamera: Camera): void {
		this._currentPSSM = index;
		this._update(index, sceneCamera);
	}

	/**
	 * @internal
	 */
	endSampler(sceneCamera: Camera): void {
		this._currentPSSM = -1;
	}

	/**
	 * @internal
	 */
	_calcAllLightCameraInfo(sceneCamera: Camera): void {
		if (this._shadowMapCount === 1) {
			this._beginSampler(0, sceneCamera);
			this.endSampler(sceneCamera);
		} else {
			for (var i: number = 0, n: number = this._shadowMapCount + 1; i < n; i++) {
				this._beginSampler(i, sceneCamera);
				this.endSampler(sceneCamera);
			}
		}
	}

	/**
	 * @internal
	 */
	private _recalculate(nearPlane: number, fieldOfView: number, aspectRatio: number): void {
		this._calcSplitDistance(nearPlane);
		this._rebuildRenderInfo();
	}

	/**
	 * @internal
	 */
	private _update(index: number, sceneCamera: Camera): void {
		var nearPlane: number = sceneCamera.nearPlane;
		var fieldOfView: number = sceneCamera.fieldOfView;
		var aspectRatio: number = (<Camera>sceneCamera).aspectRatio;
		this._recalculate(nearPlane, fieldOfView, aspectRatio);
		this._uploadShaderValue();
		this._getLightViewProject(sceneCamera);
	}

	/**
	 * @internal
	 */
	private _uploadShaderValue(): void {
		var sceneSV: ShaderData = this._scene._shaderValues;
		switch (this._shadowMapCount) {
			case 1:
				sceneSV.addDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_PSSM1);
				sceneSV.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_PSSM2);
				sceneSV.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_PSSM3);
				break;
			case 2:
				sceneSV.addDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_PSSM2);
				sceneSV.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_PSSM1);
				sceneSV.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_PSSM3);
				break;
			case 3:
				sceneSV.addDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_PSSM3);
				sceneSV.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_PSSM1);
				sceneSV.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_PSSM2);
				break;
		}


		sceneSV.setVector(ILaya3D.Scene3D.SHADOWDISTANCE, this._shaderValueDistance);
		sceneSV.setBuffer(ILaya3D.Scene3D.SHADOWLIGHTVIEWPROJECT, this._shaderValueLightVP);
		sceneSV.setVector2(ILaya3D.Scene3D.SHADOWMAPPCFOFFSET, this._shadowPCFOffset);
	}

	/**
	 * @internal
	 */
	private _getLightViewProject(sceneCamera: Camera): void {
		var boundSphere: BoundSphere = ShadowCasterPass._tempBoundSphere0;
		// var viewProjectMatrix: Matrix4x4 = this.getFrustumMatrix(sceneCamera);
		var forward: Vector3 = ShadowCasterPass._tempVector30;
		sceneCamera._transform.getForward(forward);//TODO:normalize测试
		this.getBoundSphereByFrustum(sceneCamera.nearPlane, Math.min(sceneCamera.farPlane, this._maxDistance), sceneCamera.fieldOfView * MathUtils3D.Deg2Rad,
			sceneCamera.aspectRatio, sceneCamera._transform.position, forward, boundSphere);

		var lightWorld: Matrix4x4 = this._light._transform.worldMatrix;
		var lightUp: Vector3 = ShadowCasterPass._tempVector32;
		var lightSide: Vector3 = ShadowCasterPass._tempVector31;
		var lightForward: Vector3 = ShadowCasterPass._tempVector30;
		lightSide.setValue(lightWorld.getElementByRowColumn(0, 0), lightWorld.getElementByRowColumn(0, 1), lightWorld.getElementByRowColumn(0, 2));
		lightUp.setValue(lightWorld.getElementByRowColumn(1, 0), lightWorld.getElementByRowColumn(1, 1), lightWorld.getElementByRowColumn(1, 2));
		lightForward.setValue(-lightWorld.getElementByRowColumn(2, 0), -lightWorld.getElementByRowColumn(2, 1), -lightWorld.getElementByRowColumn(2, 2));
		// Vector3.normalize(lightUp, lightUp);
		// Vector3.normalize(lightSide, lightSide);
		// Vector3.normalize(lightForward, lightForward);

		var sizeSM: number = this._light.shadowResolution;
		for (var i: number = 0; i < 1; i++) {//TODO: split
			var center: Vector3 = boundSphere.center;
			var radius: number = boundSphere.radius;
			var diam: number = radius * 2.0;
			var sizeUnit: number = sizeSM / diam;
			var radiusUnit: number = diam / sizeSM;

			// to solve shdow swimming problem
			var upLen: number = Math.ceil(Vector3.dot(center, lightUp) * sizeUnit) * radiusUnit;
			var sideLen: number = Math.ceil(Vector3.dot(center, lightSide) * sizeUnit) * radiusUnit;
			var forwardLen: number = Vector3.dot(center, lightForward);

			center.x = lightUp.x * upLen + lightSide.x * sideLen + lightForward.x * forwardLen;
			center.y = lightUp.y * upLen + lightSide.y * sideLen + lightForward.y * forwardLen;
			center.z = lightUp.z * upLen + lightSide.z * sideLen + lightForward.z * forwardLen;

			var origin: Vector3 = ShadowCasterPass._tempVector31;
			Vector3.scale(lightForward, radius, origin);
			Vector3.subtract(center, origin, origin);

			var viewMatrix: Matrix4x4 = ShadowCasterPass._tempMatrix0;
			var projectMatrix: Matrix4x4 = ShadowCasterPass._tempMatrix1;
			var projectViewMatrix: Matrix4x4 = ShadowCasterPass._tempMatrix2;

			Matrix4x4.createLookAt(origin, center, lightUp, viewMatrix);
			Matrix4x4.createOrthoOffCenter(-radius, radius, -radius, radius, this._light._shadowNearPlane, diam, projectMatrix);
			Matrix4x4.multiply(projectMatrix, viewMatrix, projectViewMatrix);

			//TODO:剥离对Camera的依赖后可删除
			var curLightCamera: Camera = this.cameras[this._currentPSSM];
			viewMatrix.cloneTo(curLightCamera.viewMatrix);
			projectMatrix.cloneTo(curLightCamera.projectionMatrix);

			ShadowCasterPass.multiplyMatrixOutFloat32Array(this._tempScaleMatrix44, projectViewMatrix, this._shaderValueVPs[this._currentPSSM]);
		}
	}

	static ff: Vector3 = new Vector3();

	_float32: Float32Array = new Float32Array(1);
	/**
	 * @internal
	 */
	_toFloat32(value: number): number {
		this._float32[0] = value;
		return this._float32[0];
	}

	/**
	 * @internal
	 */
	private _rebuildRenderInfo(): void {
		var nNum: number = this._shadowMapCount + 1;
		var i: number;
		this.cameras.length = nNum;
		for (i = 0; i < nNum; i++) {
			if (!this.cameras[i]) {
				var camera: Camera = new Camera();
				camera.name = "lightCamera" + i;
				camera.clearColor = new Vector4(1.0, 1.0, 1.0, 1.0);
				this.cameras[i] = camera;
			}
		}
	}


	/**
	 * 计算两个矩阵的乘法
	 * @param	left left矩阵
	 * @param	right  right矩阵
	 * @param	out  输出矩阵
	 */
	static multiplyMatrixOutFloat32Array(left: Matrix4x4, right: Matrix4x4, out: Float32Array): void {
		var i: number, a: Float32Array, b: Float32Array, ai0: number, ai1: number, ai2: number, ai3: number;
		a = left.elements;
		b = right.elements;
		for (i = 0; i < 4; i++) {
			ai0 = a[i];
			ai1 = a[i + 4];
			ai2 = a[i + 8];
			ai3 = a[i + 12];
			out[i] = ai0 * b[0] + ai1 * b[1] + ai2 * b[2] + ai3 * b[3];
			out[i + 4] = ai0 * b[4] + ai1 * b[5] + ai2 * b[6] + ai3 * b[7];
			out[i + 8] = ai0 * b[8] + ai1 * b[9] + ai2 * b[10] + ai3 * b[11];
			out[i + 12] = ai0 * b[12] + ai1 * b[13] + ai2 * b[14] + ai3 * b[15];
		}
	}

	setShadowMapTextureSize(size: number): void {
		if (size !== this._shadowMapTextureSize) {
			this._shadowMapTextureSize = size;
			this._shadowPCFOffset.x = 1 / this._shadowMapTextureSize;
			this._shadowPCFOffset.y = 1 / this._shadowMapTextureSize;
		}
	}


	/**
	 * @internal
	 */
	start(): void {
		var shadowMap: RenderTexture = ShadowUtils.getTemporaryShadowTexture(this._shadowMapTextureSize, this._shadowMapTextureSize, RenderTextureDepthFormat.DEPTH_16);
		var sceneSV: ShaderData = this._scene._shaderValues;
		sceneSV.setTexture(ILaya3D.Scene3D.SHADOWMAPTEXTURE1, shadowMap);
		shadowMap._start();
		this._shadowMap = shadowMap;
	}


	//TOOD:TEMP
	tempViewPort(): void {
		var gl = LayaGL.instance;
		LayaGL.instance.viewport(0, 0, this._shadowMap.width, this._shadowMap.height);
		gl.enable(gl.SCISSOR_TEST);
		LayaGL.instance.scissor(0, 0, this._shadowMap.width, this._shadowMap.height);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	}

	/**
	 * @internal
	 */
	end(): void {
		var gl = LayaGL.instance;
		this._shadowMap._end();
		gl.disable(gl.SCISSOR_TEST);
	}

	/**
	 * @internal
	 */
	clear(): void {
		RenderTexture.recoverToPool(this._shadowMap);
		// this._shadowMap = null; TODO:
	}

	// /**
	//  * @internal
	//  */
	// getFrustumMatrix(camera: Camera): Matrix4x4 {
	// 	if (this._maxDistance < camera.farPlane) {
	// 		var projectionViewMatrix: Matrix4x4 = ShadowCasterPass._tempMatrix0;
	// 		Matrix4x4.createPerspective(camera.fieldOfView * MathUtils3D.Deg2Rad, camera.aspectRatio, camera.nearPlane, this._maxDistance, projectionViewMatrix);
	// 		Matrix4x4.multiply(projectionViewMatrix, camera.viewMatrix, projectionViewMatrix)
	// 		return projectionViewMatrix;
	// 	}
	// 	else {
	// 		return camera.projectionViewMatrix;
	// 	}
	// }

	/** @intenal */
	private _lastBuildSphereInfo: Vector4 = new Vector4();
	/** @intenal */
	private _lastFrustumSphere: Vector2 = new Vector2();

	/**
	 * @internal
	 */
	getBoundSphereByFrustum(near: number, far: number, fov: number, aspectRatio: number, cameraPos: Vector3, forward: Vector3, outBoundSphere: BoundSphere): void {
		var lastBuildInfo: Vector4 = this._lastBuildSphereInfo;
		var lastFrustumSphere: Vector2 = this._lastFrustumSphere;
		if (lastBuildInfo.x != near || lastBuildInfo.y != far || lastBuildInfo.z != fov || lastBuildInfo.w != aspectRatio) {
			// https://lxjk.github.io/2017/04/15/Calculate-Minimal-Bounding-Sphere-of-Frustum.html
			var centerZ: number;
			var radius: number;
			var k: number = Math.sqrt(1.0 + aspectRatio * aspectRatio) * Math.tan(fov / 2.0);
			var k2: number = k * k;
			var farSNear: number = far - near;
			var farANear: number = far + near;
			if (k2 > farSNear / farANear) {
				centerZ = far;
				radius = far * k;
			}
			else {
				centerZ = 0.5 * farANear * (1 + k2);
				radius = 0.5 * Math.sqrt(farSNear * farSNear + 2.0 * (far * far + near * near) * k2 + farANear * farANear * k2 * k2);
			}
			lastBuildInfo.setValue(near, far, fov, aspectRatio);
			lastFrustumSphere.setValue(centerZ, radius);
		}

		var center: Vector3 = outBoundSphere.center;
		outBoundSphere.radius = lastFrustumSphere.y;
		Vector3.scale(forward, lastFrustumSphere.x, center);
		Vector3.add(cameraPos, center, center);
	}

	/**
	 * @internal
	 */
	private _calcSplitDistance(nearPlane: number): void {//TODO:删除
		var far: number = this._maxDistance;
		var invNumberOfPSSM: number = 1.0 / this._shadowMapCount;
		var i: number;
		for (i = 0; i <= this._shadowMapCount; i++) {
			this._uniformDistance[i] = nearPlane + (far - nearPlane) * i * invNumberOfPSSM;
		}

		var farDivNear: number = far / nearPlane;
		for (i = 0; i <= this._shadowMapCount; i++) {
			var n: number = Math.pow(farDivNear, i * invNumberOfPSSM);
			this._logDistance[i] = nearPlane * n;
		}

		for (i = 0; i <= this._shadowMapCount; i++) {
			this._spiltDistance[i] = this._uniformDistance[i] * this._ratioOfDistance + this._logDistance[i] * (1.0 - this._ratioOfDistance);
		}

		this._shaderValueDistance.x = (this._spiltDistance[1] != undefined) && (this._spiltDistance[1]);
		this._shaderValueDistance.y = (this._spiltDistance[2] != undefined) && (this._spiltDistance[2]);
		this._shaderValueDistance.z = (this._spiltDistance[3] != undefined) && (this._spiltDistance[3]);
		this._shaderValueDistance.w = (this._spiltDistance[4] != undefined) && (this._spiltDistance[4]); //_spiltDistance[4]为undefine 微信小游戏
	}
}

