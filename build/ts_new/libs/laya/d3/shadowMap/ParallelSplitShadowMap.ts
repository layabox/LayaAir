import { ILaya3D } from "../../../ILaya3D";
import { BaseTexture } from "../../resource/BaseTexture";
import { BaseCamera } from "../core/BaseCamera";
import { Camera } from "../core/Camera";
import { Scene3D } from "../core/scene/Scene3D";
import { Scene3DShaderDeclaration } from "../core/scene/Scene3DShaderDeclaration";
import { BoundBox } from "../math/BoundBox";
import { BoundFrustum } from "../math/BoundFrustum";
import { BoundSphere } from "../math/BoundSphere";
import { Matrix4x4 } from "../math/Matrix4x4";
import { Vector2 } from "../math/Vector2";
import { Vector3 } from "../math/Vector3";
import { Vector4 } from "../math/Vector4";
import { RenderTexture } from "../resource/RenderTexture";
import { ShaderData } from "../shader/ShaderData";
import { RenderTextureFormat, RenderTextureDepthFormat } from "../../resource/RenderTextureFormat";

/**
 * ...
 * @author ...
 */
export class ParallelSplitShadowMap {
	/**@internal */
	static MAX_PSSM_COUNT: number = 3;

	/**@internal */
	static _tempVector30: Vector3 = new Vector3();

	/**@internal */
	private lastNearPlane: number;
	/**@internal */
	private lastFieldOfView: number;
	/**@internal */
	private lastAspectRatio: number;

	/**@internal */
	private _spiltDistance: number[] = [];
	/**@internal */
	private _currentPSSM: number = -1;
	/**@internal */
	private _shadowMapCount: number = 3;
	/**@internal */
	private _maxDistance: number = 200.0;
	/**@internal */
	private _ratioOfDistance: number = 1.0 / this._shadowMapCount;
	/**@internal */
	private _globalParallelLightDir: Vector3 = new Vector3(0, -1, 0);
	/**@internal */
	private _statesDirty: boolean = true;
	/**@internal */
	cameras: Camera[];
	/**@internal */
	private _shadowMapTextureSize: number = 1024;
	/**@internal */
	private _scene: Scene3D = null;
	/**@internal */
	private _boundingSphere: BoundSphere[] = new Array<BoundSphere>(ParallelSplitShadowMap.MAX_PSSM_COUNT + 1);
	/**@internal */
	_boundingBox: BoundBox[] = new Array<BoundBox>(ParallelSplitShadowMap.MAX_PSSM_COUNT + 1);
	/**@internal */
	private _frustumPos: Vector3[] = new Array<Vector3>((ParallelSplitShadowMap.MAX_PSSM_COUNT + 1) * 4);
	/**@internal */
	private _uniformDistance: number[] = new Array<number>(ParallelSplitShadowMap.MAX_PSSM_COUNT + 1);
	/**@internal */
	private _logDistance: number[] = new Array<number>(ParallelSplitShadowMap.MAX_PSSM_COUNT + 1);
	/**@internal */
	private _dimension: Vector2[] = new Array<Vector2>(ParallelSplitShadowMap.MAX_PSSM_COUNT + 1);
	/** @internal */
	private _PCFType: number = 0;
	/** @internal */
	private _tempLookAt3: Vector3 = new Vector3();
	/** @internal */
	private _tempLookAt4: Vector4 = new Vector4();
	/** @internal */
	private _tempValue: Vector4 = new Vector4();
	/** @internal */
	private _tempPos: Vector3 = new Vector3();
	/** @internal */
	private _tempLightUp: Vector3 = new Vector3();
	/** @internal */
	private _tempMin: Vector4 = new Vector4();
	/** @internal */
	private _tempMax: Vector4 = new Vector4();
	/** @internal */
	private _tempMatrix44: Matrix4x4 = new Matrix4x4;
	/**@internal */
	private _splitFrustumCulling: BoundFrustum = new BoundFrustum(Matrix4x4.DEFAULT);
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

	constructor() {
		this.cameras = [];
		this._shaderValueVPs = [];
		var i: number;
		for (i = 0; i < this._spiltDistance.length; i++) {
			this._spiltDistance[i] = 0.0;
		}

		for (i = 0; i < this._dimension.length; i++) {
			this._dimension[i] = new Vector2();
		}

		for (i = 0; i < this._frustumPos.length; i++) {
			this._frustumPos[i] = new Vector3();
		}

		for (i = 0; i < this._boundingBox.length; i++) {
			this._boundingBox[i] = new BoundBox(new Vector3(), new Vector3());
		}

		for (i = 0; i < this._boundingSphere.length; i++) {
			this._boundingSphere[i] = new BoundSphere(new Vector3(), 0.0);
		}

		Matrix4x4.createScaling(new Vector3(0.5, 0.5, 1.0), this._tempScaleMatrix44);
		this._tempScaleMatrix44.elements[12] = 0.5;
		this._tempScaleMatrix44.elements[13] = 0.5;
	}

	setInfo(scene: Scene3D, maxDistance: number, globalParallelDir: Vector3, shadowMapTextureSize: number, numberOfPSSM: number, PCFType: number): void {
		if (numberOfPSSM > ParallelSplitShadowMap.MAX_PSSM_COUNT) {
			this._shadowMapCount = ParallelSplitShadowMap.MAX_PSSM_COUNT;
		}
		this._scene = scene;
		this._maxDistance = maxDistance;
		this.shadowMapCount = numberOfPSSM;
		this._globalParallelLightDir = globalParallelDir;
		this._ratioOfDistance = 1.0 / this._shadowMapCount;
		for (var i: number = 0; i < this._spiltDistance.length; i++) {
			this._spiltDistance[i] = 0.0;
		}
		this._shadowMapTextureSize = shadowMapTextureSize;
		this._shadowPCFOffset.x = 1.0 / this._shadowMapTextureSize;
		this._shadowPCFOffset.y = 1.0 / this._shadowMapTextureSize;
		this.setPCFType(PCFType);
		this._statesDirty = true;
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

	getPCFType(): number {
		return this._PCFType;
	}

	setFarDistance(value: number): void {
		if (this._maxDistance != value) {
			this._maxDistance = value;
			this._statesDirty = true;
		}
	}

	getFarDistance(): number {
		return this._maxDistance;
	}

	set shadowMapCount(value: number) {
		value = value > 0 ? value : 1;
		value = value <= ParallelSplitShadowMap.MAX_PSSM_COUNT ? value : ParallelSplitShadowMap.MAX_PSSM_COUNT;
		if (this._shadowMapCount != value) {
			this._shadowMapCount = value;
			this._ratioOfDistance = 1.0 / this._shadowMapCount;
			this._statesDirty = true;

			this._shaderValueLightVP = new Float32Array(value * 16);
			this._shaderValueVPs.length = value;
			for (var i: number = 0; i < value; i++)
				this._shaderValueVPs[i] = new Float32Array(this._shaderValueLightVP.buffer, i * 64);
		}
	}

	get shadowMapCount(): number {
		return this._shadowMapCount;
	}


	private _beginSampler(index: number, sceneCamera: BaseCamera): void {
		if (index < 0 || index > this._shadowMapCount) //TODO:
			throw new Error("ParallelSplitShadowMap: beginSample invalid index");

		this._currentPSSM = index;
		this._update(sceneCamera);
	}

	/**
	 * @internal
	 */
	endSampler(sceneCamera: BaseCamera): void {
		this._currentPSSM = -1;
	}

	/**
	 * @internal
	 */
	_calcAllLightCameraInfo(sceneCamera: BaseCamera): void {
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
		this._calcBoundingBox(fieldOfView, aspectRatio);
		this._rebuildRenderInfo();
	}

	/**
	 * @internal
	 */
	private _update(sceneCamera: BaseCamera): void {
		var nearPlane: number = sceneCamera.nearPlane;
		var fieldOfView: number = sceneCamera.fieldOfView;
		var aspectRatio: number = ((<Camera>sceneCamera)).aspectRatio;
		if (this._statesDirty || this.lastNearPlane !== nearPlane || this.lastFieldOfView !== fieldOfView || this.lastAspectRatio !== aspectRatio) {//TODO:同一场景多摄像机频繁切换仍会重新计算,将包围矩阵存到摄像机自身可解决
			this._recalculate(nearPlane, fieldOfView, aspectRatio);
			this._uploadShaderValue();
			this._statesDirty = false;
			this.lastNearPlane = nearPlane;
			this.lastFieldOfView = fieldOfView;
			this.lastAspectRatio = aspectRatio;
		}
		//calcSplitFrustum(sceneCamera);
		this._calcLightViewProject(sceneCamera);
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
		switch (this._shadowMapCount) {
			case 3:
				sceneSV.setTexture(ILaya3D.Scene3D.SHADOWMAPTEXTURE1, this.cameras[1].renderTarget);
				sceneSV.setTexture(ILaya3D.Scene3D.SHADOWMAPTEXTURE2, this.cameras[2].renderTarget)
				sceneSV.setTexture(ILaya3D.Scene3D.SHADOWMAPTEXTURE3, this.cameras[3].renderTarget);
				break;
			case 2:
				sceneSV.setTexture(ILaya3D.Scene3D.SHADOWMAPTEXTURE1, this.cameras[1].renderTarget);
				sceneSV.setTexture(ILaya3D.Scene3D.SHADOWMAPTEXTURE2, this.cameras[2].renderTarget);
				break;
			case 1:
				sceneSV.setTexture(ILaya3D.Scene3D.SHADOWMAPTEXTURE1, this.cameras[1].renderTarget);
				break;
		}
	}

	/**
	 * @internal
	 */
	private _calcSplitDistance(nearPlane: number): void {
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

		this._shaderValueDistance.x = (this._spiltDistance[1]!=undefined) && (this._spiltDistance[1]);
		this._shaderValueDistance.y = (this._spiltDistance[2]!=undefined) && (this._spiltDistance[2]);
		this._shaderValueDistance.z = (this._spiltDistance[3]!=undefined) && (this._spiltDistance[3]);
		this._shaderValueDistance.w = (this._spiltDistance[4]!=undefined) && (this._spiltDistance[4]);; //_spiltDistance[4]为undefine 微信小游戏
	}

	/**
	 * @internal
	 */
	_calcBoundingBox(fieldOfView: number, aspectRatio: number): void {
		var fov: number = 3.1415926 * fieldOfView / 180.0;

		var halfTanValue: number = Math.tan(fov / 2.0);

		var height: number;
		var width: number;
		var distance: number;

		var i: number;
		for (i = 0; i <= this._shadowMapCount; i++) {
			distance = this._spiltDistance[i];
			height = distance * halfTanValue;
			width = height * aspectRatio;

			var temp: any = this._frustumPos[i * 4 + 0];
			temp.x = -width;// distance * 0.0 - height * 0.0 + width * -1.0
			temp.y = -height;//distance * 0.0 - height * 1.0 + width * 0.0
			temp.z = -distance;// distance * -1.0 - height * 0.0 + width * 0.0

			temp = this._frustumPos[i * 4 + 1];
			temp.x = width;// distance * 0.0 - height * 0.0 - width * -1.0
			temp.y = -height;// distance * 0.0 - height * 1.0 - width * 0.0
			temp.z = -distance;//distance * -1.0 - height * 0.0 - width * 0.0

			temp = this._frustumPos[i * 4 + 2];
			temp.x = -width;// distance * 0.0 + width * -1 + height * 0.0
			temp.y = height;// distance * 0.0 + width * 0.0 + height * 1.0
			temp.z = -distance;// distance * -1.0 + width * 0.0 + height * 0.0

			temp = this._frustumPos[i * 4 + 3];
			temp.x = width;// distance * 0.0 - width * -1 + height * 0.0
			temp.y = height;// distance * 0.0 - width * 0.0 + height * 1.0
			temp.z = -distance;// distance * -1.0 - width * 0.0 + height * 0.0

			temp = this._dimension[i];
			temp.x = width;
			temp.y = height;
		}

		var d: Vector2;
		var min: Vector3;
		var max: Vector3;
		var center: Vector3;
		for (i = 1; i <= this._shadowMapCount; i++) {

			d = this._dimension[i];
			min = this._boundingBox[i].min;

			min.x = -d.x;
			min.y = -d.y;
			min.z = -this._spiltDistance[i];

			max = this._boundingBox[i].max;
			max.x = d.x;
			max.y = d.y;
			max.z = -this._spiltDistance[i - 1];

			center = this._boundingSphere[i].center;
			center.x = (min.x + max.x) * 0.5;
			center.y = (min.y + max.y) * 0.5;
			center.z = (min.z + max.z) * 0.5;
			this._boundingSphere[i].radius = Math.sqrt(Math.pow(max.x - min.x, 2) + Math.pow(max.y - min.y, 2) + Math.pow(max.z - min.z, 2)) * 0.5;
		}

		min = this._boundingBox[0].min;
		d = this._dimension[this._shadowMapCount];
		min.x = -d.x;
		min.y = -d.y;
		min.z = -this._spiltDistance[this._shadowMapCount];

		max = this._boundingBox[0].max;
		max.x = d.x;
		max.y = d.y;
		max.z = -this._spiltDistance[0];

		center = this._boundingSphere[0].center;
		center.x = (min.x + max.x) * 0.5;
		center.y = (min.y + max.y) * 0.5;
		center.z = (min.z + max.z) * 0.5;
		this._boundingSphere[0].radius = Math.sqrt(Math.pow(max.x - min.x, 2) + Math.pow(max.y - min.y, 2) + Math.pow(max.z - min.z, 2)) * 0.5;
	}

	calcSplitFrustum(sceneCamera: BaseCamera): void {
		if (this._currentPSSM > 0) {
			Matrix4x4.createPerspective(3.1416 * sceneCamera.fieldOfView / 180.0, ((<Camera>sceneCamera)).aspectRatio, this._spiltDistance[this._currentPSSM - 1], this._spiltDistance[this._currentPSSM], this._tempMatrix44);
		} else {
			Matrix4x4.createPerspective(3.1416 * sceneCamera.fieldOfView / 180.0, ((<Camera>sceneCamera)).aspectRatio, this._spiltDistance[0], this._spiltDistance[this._shadowMapCount], this._tempMatrix44);
		}
		Matrix4x4.multiply(this._tempMatrix44, ((<Camera>sceneCamera)).viewMatrix, this._tempMatrix44);
		this._splitFrustumCulling.matrix = this._tempMatrix44;
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

			var shadowMap: RenderTexture = this.cameras[i].renderTarget;
			if (shadowMap == null || shadowMap.width != this._shadowMapTextureSize || shadowMap.height != this._shadowMapTextureSize) {
				(shadowMap) && (shadowMap.destroy());
				shadowMap = new RenderTexture(this._shadowMapTextureSize, this._shadowMapTextureSize, RenderTextureFormat.R8G8B8A8, RenderTextureDepthFormat.DEPTH_16);
				shadowMap.filterMode = BaseTexture.FILTERMODE_POINT;
				this.cameras[i].renderTarget = shadowMap;
			}
		}
	}

	/**
	 * @internal
	 */
	private _calcLightViewProject(sceneCamera: BaseCamera): void {
		var boundSphere: BoundSphere = this._boundingSphere[this._currentPSSM];
		var cameraMatViewInv: Matrix4x4 = sceneCamera.transform.worldMatrix;
		var radius: number = boundSphere.radius;
		boundSphere.center.cloneTo(this._tempLookAt3);
		Vector3.transformV3ToV4(this._tempLookAt3, cameraMatViewInv, this._tempLookAt4);
		var lookAt3Element: Vector3 = this._tempLookAt3;
		var lookAt4Element: Vector4 = this._tempLookAt4;
		lookAt3Element.x = lookAt4Element.x;
		lookAt3Element.y = lookAt4Element.y;
		lookAt3Element.z = lookAt4Element.z;
		var lightUpElement: Vector3 = this._tempLightUp;
		sceneCamera.transform.worldMatrix.getForward(ParallelSplitShadowMap._tempVector30);
		var sceneCameraDir: Vector3 = ParallelSplitShadowMap._tempVector30;
		lightUpElement.x = sceneCameraDir.x;
		lightUpElement.y = 1.0;
		lightUpElement.z = sceneCameraDir.z;
		Vector3.normalize(this._tempLightUp, this._tempLightUp);
		Vector3.scale(this._globalParallelLightDir, boundSphere.radius * 4, this._tempPos);
		Vector3.subtract(this._tempLookAt3, this._tempPos, this._tempPos);
		var curLightCamera: Camera = this.cameras[this._currentPSSM];
		curLightCamera.transform.position = this._tempPos;
		curLightCamera.transform.lookAt(this._tempLookAt3, this._tempLightUp, false);
		var tempMax: Vector4 = this._tempMax;
		var tempMin: Vector4 = this._tempMin;
		tempMax.x = tempMax.y = tempMax.z = -100000.0;
		tempMax.w = 1.0;
		tempMin.x = tempMin.y = tempMin.z = 100000.0;
		tempMin.w = 1.0;
		/*
		   var offSet:int; var offSet1:int; var offSet2:int;
		   if (_currentPSSM == 0) {
		   offSet1 = 0;
		   offSet2 = _numberOfPSSM * 3;
		   }
		   else {
		   offSet1 = (_currentPSSM - 1) * 4;
		   offSet2 = offSet1;
		   }
		   //Convert  matrix : from view space->world space->light view space
		   Matrix4x4.multiply(_lightCamera.viewMatrix, cameraMatViewInv, _tempMatrix44);
		   var tempValueElement:Float32Array = _tempValue.elements;
		   for (var i:int= 0; i < 8 ; i++ ) {
		   offSet = (i < 4) ? offSet1 : offSet2;
		   var frustumPosElements:Float32Array = _frustumPos[offSet + i].elements;
		   tempValueElement[0] = frustumPosElements[0];
		   tempValueElement[1] = frustumPosElements[1];
		   tempValueElement[2] = frustumPosElements[2];
		   tempValueElement[3] = 1.0;
		   Vector4.transformByM4x4(_tempValue, _tempMatrix44, _tempValue);
		   tempMinElements[0] = (tempValueElement[0] < tempMinElements[0]) ? tempValueElement[0] : tempMinElements[0];
		   tempMinElements[1] = (tempValueElement[1] < tempMinElements[1]) ? tempValueElement[1] : tempMinElements[1];
		   tempMinElements[2] = (tempValueElement[2] < tempMinElements[2]) ? tempValueElement[2] : tempMinElements[2];
		   tempMaxElements[0] = (tempValueElement[0] > tempMaxElements[0]) ? tempValueElement[0] : tempMaxElements[0];
		   tempMaxElements[1] = (tempValueElement[1] > tempMaxElements[1]) ? tempValueElement[1] : tempMaxElements[1];
		   tempMaxElements[2] = (tempValueElement[2] > tempMaxElements[2]) ? tempValueElement[2] : tempMaxElements[2];
		   }
		 */
		Matrix4x4.multiply(curLightCamera.viewMatrix, cameraMatViewInv, this._tempMatrix44);
		var tempValueElement: Vector4 = this._tempValue;
		var corners: Vector3[] = [];
		corners.length = 8;
		this._boundingBox[this._currentPSSM].getCorners(corners);
		for (var i: number = 0; i < 8; i++) {
			var frustumPosElements: Vector3 = corners[i];
			tempValueElement.x = frustumPosElements.x;
			tempValueElement.y = frustumPosElements.y;
			tempValueElement.z = frustumPosElements.z;
			tempValueElement.w = 1.0;
			Vector4.transformByM4x4(this._tempValue, this._tempMatrix44, this._tempValue);
			tempMin.x = (tempValueElement.x < tempMin.x) ? tempValueElement.x : tempMin.x;
			tempMin.y = (tempValueElement.y < tempMin.y) ? tempValueElement.y : tempMin.y;
			tempMin.z = (tempValueElement.z < tempMin.z) ? tempValueElement.z : tempMin.z;
			tempMax.x = (tempValueElement.x > tempMax.x) ? tempValueElement.x : tempMax.x;
			tempMax.y = (tempValueElement.y > tempMax.y) ? tempValueElement.y : tempMax.y;
			tempMax.z = (tempValueElement.z > tempMax.z) ? tempValueElement.z : tempMax.z;
		}
		//现在tempValueElement变成了center
		Vector4.add(this._tempMax, this._tempMin, this._tempValue);
		tempValueElement.x *= 0.5;
		tempValueElement.y *= 0.5;
		tempValueElement.z *= 0.5;
		tempValueElement.w = 1;
		Vector4.transformByM4x4(this._tempValue, curLightCamera.transform.worldMatrix, this._tempValue);
		var distance: number = Math.abs(-this._tempMax.z);
		var farPlane: number = distance > this._maxDistance ? distance : this._maxDistance;
		//build light's view and project matrix
		Vector3.scale(this._globalParallelLightDir, farPlane, this._tempPos);
		var tempPosElement: Vector3 = this._tempPos;
		tempPosElement.x = tempValueElement.x - tempPosElement.x;
		tempPosElement.y = tempValueElement.y - tempPosElement.y;
		tempPosElement.z = tempValueElement.z - tempPosElement.z;
		curLightCamera.transform.position = this._tempPos;
		curLightCamera.transform.lookAt(this._tempLookAt3, this._tempLightUp, false);
		Matrix4x4.createOrthoOffCenter(tempMin.x, tempMax.x, tempMin.y, tempMax.y, 1.0, farPlane + 0.5 * (tempMax.z - tempMin.z), curLightCamera.projectionMatrix);

		//calc frustum
		var projectView: Matrix4x4 = curLightCamera.projectionViewMatrix;
		ParallelSplitShadowMap.multiplyMatrixOutFloat32Array(this._tempScaleMatrix44, projectView, this._shaderValueVPs[this._currentPSSM]);
		this._scene._shaderValues.setBuffer(ILaya3D.Scene3D.SHADOWLIGHTVIEWPROJECT, this._shaderValueLightVP);
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
			this._statesDirty = true;
		}
	}

	disposeAllRenderTarget(): void {
		for (var i: number = 0, n: number = this._shadowMapCount + 1; i < n; i++) {
			if (this.cameras[i].renderTarget) {
				this.cameras[i].renderTarget.destroy();
				this.cameras[i].renderTarget = null;
			}
		}
	}
}

