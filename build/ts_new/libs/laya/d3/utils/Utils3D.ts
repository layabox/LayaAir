import { Node } from "../../display/Node";
import { LayaGL } from "../../layagl/LayaGL";
import { FilterMode } from "../../resource/FilterMode";
import { Texture2D } from "../../resource/Texture2D";
import { TextureFormat } from "../../resource/TextureFormat";
import { WarpMode } from "../../resource/WrapMode";
import { PixelLineSprite3D } from "../core/pixelLine/PixelLineSprite3D";
import { BoundBox } from "../math/BoundBox";
import { Color } from "../math/Color";
import { Matrix4x4 } from "../math/Matrix4x4";
import { Quaternion } from "../math/Quaternion";
import { Vector3 } from "../math/Vector3";
import { Vector4 } from "../math/Vector4";
import { TextureGenerator } from "../resource/TextureGenerator";
import { ILaya3D } from "../../../ILaya3D";
import { RenderTexture } from "../resource/RenderTexture";
import { RenderTextureFormat } from "../../resource/RenderTextureFormat";
import { Render } from "../../renders/Render";
import { HTMLCanvas } from "../../resource/HTMLCanvas";

/**
 * <code>Utils3D</code> 类用于创建3D工具。
 */
export class Utils3D {
	private static _tempVector3_0: Vector3 = new Vector3();
	private static _tempVector3_1: Vector3 = new Vector3();

	private static _tempArray16_0: Float32Array = new Float32Array(16);
	private static _tempArray16_1: Float32Array = new Float32Array(16);
	private static _tempArray16_2: Float32Array = new Float32Array(16);
	private static _tempArray16_3: Float32Array = new Float32Array(16);

	/**
	 * @internal
	 */
	static _createFloatTextureBuffer(width: number, height: number): Texture2D {
		var floatTex: Texture2D = new Texture2D(width, height, TextureFormat.R32G32B32A32, false, false);
		floatTex.filterMode = FilterMode.Point;
		floatTex.wrapModeU = WarpMode.Clamp;
		floatTex.wrapModeV = WarpMode.Clamp;
		floatTex.anisoLevel = 0;
		return floatTex;
	}

	/**
	 * @internal
	 */
	static _convertToLayaVec3(bVector: number, out: Vector3, inverseX: boolean): void {
		var bullet: any = ILaya3D.Physics3D._bullet;
		out.x = inverseX ? - bullet.btVector3_x(bVector) : bullet.btVector3_x(bVector);
		out.y = bullet.btVector3_y(bVector);
		out.z = bullet.btVector3_z(bVector);
	}

	/**
	 * @internal
	 */
	static _convertToBulletVec3(lVector: Vector3, out: number, inverseX: boolean): void {
		ILaya3D.Physics3D._bullet.btVector3_setValue(out, inverseX ? -lVector.x : lVector.x, lVector.y, lVector.z);
	}

	/**
	 *通过数平移、旋转、缩放值计算到结果矩阵数组,骨骼动画专用。
	 * @param tx left矩阵数组。
	 * @param ty left矩阵数组的偏移。
	 * @param tz right矩阵数组。
	 * @param qx right矩阵数组的偏移。
	 * @param qy 输出矩阵数组。
	 * @param qz 输出矩阵数组的偏移。
	 * @param qw 输出矩阵数组的偏移。
	 * @param sx 输出矩阵数组的偏移。
	 * @param sy 输出矩阵数组的偏移。
	 * @param sz 输出矩阵数组的偏移。
	 * @param outArray 结果矩阵数组。
	 * @param outOffset 结果矩阵数组的偏移。
	 */
	private static _rotationTransformScaleSkinAnimation(tx: number, ty: number, tz: number, qx: number, qy: number, qz: number, qw: number, sx: number, sy: number, sz: number, outArray: Float32Array, outOffset: number): void {

		var re: Float32Array = Utils3D._tempArray16_0;
		var se: Float32Array = Utils3D._tempArray16_1;
		var tse: Float32Array = Utils3D._tempArray16_2;

		//平移

		//旋转
		var x2: number = qx + qx;
		var y2: number = qy + qy;
		var z2: number = qz + qz;

		var xx: number = qx * x2;
		var yx: number = qy * x2;
		var yy: number = qy * y2;
		var zx: number = qz * x2;
		var zy: number = qz * y2;
		var zz: number = qz * z2;
		var wx: number = qw * x2;
		var wy: number = qw * y2;
		var wz: number = qw * z2;

		//re[3] = re[7] = re[11] = re[12] = re[13] = re[14] = 0;
		re[15] = 1;
		re[0] = 1 - yy - zz;
		re[1] = yx + wz;
		re[2] = zx - wy;

		re[4] = yx - wz;
		re[5] = 1 - xx - zz;
		re[6] = zy + wx;

		re[8] = zx + wy;
		re[9] = zy - wx;
		re[10] = 1 - xx - yy;

		//缩放
		//se[4] = se[8] = se[12] = se[1] = se[9] = se[13] = se[2] = se[6] = se[14] = se[3] = se[7] = se[11] = 0;
		se[15] = 1;
		se[0] = sx;
		se[5] = sy;
		se[10] = sz;

		var i: number, ai0: number, ai1: number, ai2: number, ai3: number;
		//mul(rMat, tMat, tsMat)......................................
		for (i = 0; i < 4; i++) {
			ai0 = re[i];
			ai1 = re[i + 4];
			ai2 = re[i + 8];
			ai3 = re[i + 12];
			tse[i] = ai0;
			tse[i + 4] = ai1;
			tse[i + 8] = ai2;
			tse[i + 12] = ai0 * tx + ai1 * ty + ai2 * tz + ai3;
		}

		//mul(tsMat, sMat, out)..............................................
		for (i = 0; i < 4; i++) {
			ai0 = tse[i];
			ai1 = tse[i + 4];
			ai2 = tse[i + 8];
			ai3 = tse[i + 12];
			outArray[i + outOffset] = ai0 * se[0] + ai1 * se[1] + ai2 * se[2] + ai3 * se[3];
			outArray[i + outOffset + 4] = ai0 * se[4] + ai1 * se[5] + ai2 * se[6] + ai3 * se[7];
			outArray[i + outOffset + 8] = ai0 * se[8] + ai1 * se[9] + ai2 * se[10] + ai3 * se[11];
			outArray[i + outOffset + 12] = ai0 * se[12] + ai1 * se[13] + ai2 * se[14] + ai3 * se[15];
		}
	}

	/**
	 * @internal
	 */
	static _compIdToNode: any = new Object();







	/** @internal */
	static _computeBoneAndAnimationDatasByBindPoseMatrxix(bones: any, curData: Float32Array, inverGlobalBindPose: Matrix4x4[], outBonesDatas: Float32Array, outAnimationDatas: Float32Array, boneIndexToMesh: number[]): void {

		var offset: number = 0;
		var matOffset: number = 0;

		var i: number;
		var parentOffset: number;
		var boneLength: number = bones.length;
		for (i = 0; i < boneLength; offset += bones[i].keyframeWidth, matOffset += 16, i++) {
			//将旋转平移缩放合成矩阵...........................................
			Utils3D._rotationTransformScaleSkinAnimation(curData[offset + 0], curData[offset + 1], curData[offset + 2], curData[offset + 3], curData[offset + 4], curData[offset + 5], curData[offset + 6], curData[offset + 7], curData[offset + 8], curData[offset + 9], outBonesDatas, matOffset);

			if (i != 0) {
				parentOffset = bones[i].parentIndex * 16;
				Utils3D.mulMatrixByArray(outBonesDatas, parentOffset, outBonesDatas, matOffset, outBonesDatas, matOffset);
			}
		}

		var n: number = inverGlobalBindPose.length;
		for (i = 0; i < n; i++)//将绝对矩阵乘以反置矩阵................................................
		{
			Utils3D.mulMatrixByArrayAndMatrixFast(outBonesDatas, boneIndexToMesh[i] * 16, inverGlobalBindPose[i], outAnimationDatas, i * 16);//TODO:-1处理
		}
	}

	/** @internal */
	static _computeAnimationDatasByArrayAndMatrixFast(inverGlobalBindPose: Matrix4x4[], bonesDatas: Float32Array, outAnimationDatas: Float32Array, boneIndexToMesh: number[]): void {
		for (var i: number = 0, n: number = inverGlobalBindPose.length; i < n; i++)//将绝对矩阵乘以反置矩阵
			Utils3D.mulMatrixByArrayAndMatrixFast(bonesDatas, boneIndexToMesh[i] * 16, inverGlobalBindPose[i], outAnimationDatas, i * 16);//TODO:-1处理
	}

	/** @internal */
	static _computeBoneAndAnimationDatasByBindPoseMatrxixOld(bones: any, curData: Float32Array, inverGlobalBindPose: Matrix4x4[], outBonesDatas: Float32Array, outAnimationDatas: Float32Array): void {

		var offset: number = 0;
		var matOffset: number = 0;

		var i: number;
		var parentOffset: number;
		var boneLength: number = bones.length;
		for (i = 0; i < boneLength; offset += bones[i].keyframeWidth, matOffset += 16, i++) {
			//将旋转平移缩放合成矩阵...........................................
			Utils3D._rotationTransformScaleSkinAnimation(curData[offset + 7], curData[offset + 8], curData[offset + 9], curData[offset + 3], curData[offset + 4], curData[offset + 5], curData[offset + 6], curData[offset + 0], curData[offset + 1], curData[offset + 2], outBonesDatas, matOffset);

			if (i != 0) {
				parentOffset = bones[i].parentIndex * 16;
				Utils3D.mulMatrixByArray(outBonesDatas, parentOffset, outBonesDatas, matOffset, outBonesDatas, matOffset);
			}
		}

		var n: number = inverGlobalBindPose.length;
		for (i = 0; i < n; i++)//将绝对矩阵乘以反置矩阵................................................
		{
			var arrayOffset: number = i * 16;
			Utils3D.mulMatrixByArrayAndMatrixFast(outBonesDatas, arrayOffset, inverGlobalBindPose[i], outAnimationDatas, arrayOffset);
		}
	}

	/** @internal */
	static _computeAnimationDatasByArrayAndMatrixFastOld(inverGlobalBindPose: Matrix4x4[], bonesDatas: Float32Array, outAnimationDatas: Float32Array): void {
		var n: number = inverGlobalBindPose.length;
		for (var i: number = 0; i < n; i++)//将绝对矩阵乘以反置矩阵................................................
		{
			var arrayOffset: number = i * 16;
			Utils3D.mulMatrixByArrayAndMatrixFast(bonesDatas, arrayOffset, inverGlobalBindPose[i], outAnimationDatas, arrayOffset);
		}
	}

	/** @internal */
	static _computeRootAnimationData(bones: any, curData: Float32Array, animationDatas: Float32Array): void {

		for (var i: number = 0, offset: number = 0, matOffset: number = 0, boneLength: number = bones.length; i < boneLength; offset += bones[i].keyframeWidth, matOffset += 16, i++)
			Utils3D.createAffineTransformationArray(curData[offset + 0], curData[offset + 1], curData[offset + 2], curData[offset + 3], curData[offset + 4], curData[offset + 5], curData[offset + 6], curData[offset + 7], curData[offset + 8], curData[offset + 9], animationDatas, matOffset);
	}

	/**
	 * 根据四元数旋转三维向量。
	 * @param	source 源三维向量。
	 * @param	rotation 旋转四元数。
	 * @param	out 输出三维向量。
	 */
	static transformVector3ArrayByQuat(sourceArray: Float32Array, sourceOffset: number, rotation: Quaternion, outArray: Float32Array, outOffset: number): void {
		var x: number = sourceArray[sourceOffset], y: number = sourceArray[sourceOffset + 1], z: number = sourceArray[sourceOffset + 2], qx: number = rotation.x, qy: number = rotation.y, qz: number = rotation.z, qw: number = rotation.w, ix: number = qw * x + qy * z - qz * y, iy: number = qw * y + qz * x - qx * z, iz: number = qw * z + qx * y - qy * x, iw: number = -qx * x - qy * y - qz * z;
		outArray[outOffset] = ix * qw + iw * -qx + iy * -qz - iz * -qy;
		outArray[outOffset + 1] = iy * qw + iw * -qy + iz * -qx - ix * -qz;
		outArray[outOffset + 2] = iz * qw + iw * -qz + ix * -qy - iy * -qx;
	}

	/**
	 *通过数组数据计算矩阵乘法。
	 * @param leftArray left矩阵数组。
	 * @param leftOffset left矩阵数组的偏移。
	 * @param rightArray right矩阵数组。
	 * @param rightOffset right矩阵数组的偏移。
	 * @param outArray 输出矩阵数组。
	 * @param outOffset 输出矩阵数组的偏移。
	 */
	static mulMatrixByArray(leftArray: Float32Array, leftOffset: number, rightArray: Float32Array, rightOffset: number, outArray: Float32Array, outOffset: number): void {

		var i: number, ai0: number, ai1: number, ai2: number, ai3: number;

		if (outArray === rightArray) {
			rightArray = Utils3D._tempArray16_3;
			for (i = 0; i < 16; ++i) {
				rightArray[i] = outArray[outOffset + i];
			}
			rightOffset = 0;
		}

		for (i = 0; i < 4; i++) {
			ai0 = leftArray[leftOffset + i];
			ai1 = leftArray[leftOffset + i + 4];
			ai2 = leftArray[leftOffset + i + 8];
			ai3 = leftArray[leftOffset + i + 12];
			outArray[outOffset + i] = ai0 * rightArray[rightOffset + 0] + ai1 * rightArray[rightOffset + 1] + ai2 * rightArray[rightOffset + 2] + ai3 * rightArray[rightOffset + 3];
			outArray[outOffset + i + 4] = ai0 * rightArray[rightOffset + 4] + ai1 * rightArray[rightOffset + 5] + ai2 * rightArray[rightOffset + 6] + ai3 * rightArray[rightOffset + 7];
			outArray[outOffset + i + 8] = ai0 * rightArray[rightOffset + 8] + ai1 * rightArray[rightOffset + 9] + ai2 * rightArray[rightOffset + 10] + ai3 * rightArray[rightOffset + 11];
			outArray[outOffset + i + 12] = ai0 * rightArray[rightOffset + 12] + ai1 * rightArray[rightOffset + 13] + ai2 * rightArray[rightOffset + 14] + ai3 * rightArray[rightOffset + 15];
		}
	}

	/**
	 *通过数组数据计算矩阵乘法,rightArray和outArray不能为同一数组引用。
	 * @param leftArray left矩阵数组。
	 * @param leftOffset left矩阵数组的偏移。
	 * @param rightArray right矩阵数组。
	 * @param rightOffset right矩阵数组的偏移。
	 * @param outArray 结果矩阵数组。
	 * @param outOffset 结果矩阵数组的偏移。
	 */
	static mulMatrixByArrayFast(leftArray: Float32Array, leftOffset: number, rightArray: Float32Array, rightOffset: number, outArray: Float32Array, outOffset: number): void {

		var i: number, ai0: number, ai1: number, ai2: number, ai3: number;
		for (i = 0; i < 4; i++) {
			ai0 = leftArray[leftOffset + i];
			ai1 = leftArray[leftOffset + i + 4];
			ai2 = leftArray[leftOffset + i + 8];
			ai3 = leftArray[leftOffset + i + 12];
			outArray[outOffset + i] = ai0 * rightArray[rightOffset + 0] + ai1 * rightArray[rightOffset + 1] + ai2 * rightArray[rightOffset + 2] + ai3 * rightArray[rightOffset + 3];
			outArray[outOffset + i + 4] = ai0 * rightArray[rightOffset + 4] + ai1 * rightArray[rightOffset + 5] + ai2 * rightArray[rightOffset + 6] + ai3 * rightArray[rightOffset + 7];
			outArray[outOffset + i + 8] = ai0 * rightArray[rightOffset + 8] + ai1 * rightArray[rightOffset + 9] + ai2 * rightArray[rightOffset + 10] + ai3 * rightArray[rightOffset + 11];
			outArray[outOffset + i + 12] = ai0 * rightArray[rightOffset + 12] + ai1 * rightArray[rightOffset + 13] + ai2 * rightArray[rightOffset + 14] + ai3 * rightArray[rightOffset + 15];
		}
	}

	/**
	 *通过数组数据计算矩阵乘法,rightArray和outArray不能为同一数组引用。
	 * @param leftArray left矩阵数组。
	 * @param leftOffset left矩阵数组的偏移。
	 * @param rightMatrix right矩阵。
	 * @param outArray 结果矩阵数组。
	 * @param outOffset 结果矩阵数组的偏移。
	 */
	static mulMatrixByArrayAndMatrixFast(leftArray: Float32Array, leftOffset: number, rightMatrix: Matrix4x4, outArray: Float32Array, outOffset: number): void {

		var i: number, ai0: number, ai1: number, ai2: number, ai3: number;
		var rightMatrixE: Float32Array = rightMatrix.elements;
		var m11: number = rightMatrixE[0], m12: number = rightMatrixE[1], m13: number = rightMatrixE[2], m14: number = rightMatrixE[3];
		var m21: number = rightMatrixE[4], m22: number = rightMatrixE[5], m23: number = rightMatrixE[6], m24: number = rightMatrixE[7];
		var m31: number = rightMatrixE[8], m32: number = rightMatrixE[9], m33: number = rightMatrixE[10], m34: number = rightMatrixE[11];
		var m41: number = rightMatrixE[12], m42: number = rightMatrixE[13], m43: number = rightMatrixE[14], m44: number = rightMatrixE[15];
		var ai0LeftOffset: number = leftOffset;
		var ai1LeftOffset: number = leftOffset + 4;
		var ai2LeftOffset: number = leftOffset + 8;
		var ai3LeftOffset: number = leftOffset + 12;
		var ai0OutOffset: number = outOffset;
		var ai1OutOffset: number = outOffset + 4;
		var ai2OutOffset: number = outOffset + 8;
		var ai3OutOffset: number = outOffset + 12;

		for (i = 0; i < 4; i++) {
			ai0 = leftArray[ai0LeftOffset + i];
			ai1 = leftArray[ai1LeftOffset + i];
			ai2 = leftArray[ai2LeftOffset + i];
			ai3 = leftArray[ai3LeftOffset + i];
			outArray[ai0OutOffset + i] = ai0 * m11 + ai1 * m12 + ai2 * m13 + ai3 * m14;
			outArray[ai1OutOffset + i] = ai0 * m21 + ai1 * m22 + ai2 * m23 + ai3 * m24;
			outArray[ai2OutOffset + i] = ai0 * m31 + ai1 * m32 + ai2 * m33 + ai3 * m34;
			outArray[ai3OutOffset + i] = ai0 * m41 + ai1 * m42 + ai2 * m43 + ai3 * m44;
		}
	}

	/**
	 *通过数平移、旋转、缩放值计算到结果矩阵数组。
	 * @param tX left矩阵数组。
	 * @param tY left矩阵数组的偏移。
	 * @param tZ right矩阵数组。
	 * @param qX right矩阵数组的偏移。
	 * @param qY 输出矩阵数组。
	 * @param qZ 输出矩阵数组的偏移。
	 * @param qW 输出矩阵数组的偏移。
	 * @param sX 输出矩阵数组的偏移。
	 * @param sY 输出矩阵数组的偏移。
	 * @param sZ 输出矩阵数组的偏移。
	 * @param outArray 结果矩阵数组。
	 * @param outOffset 结果矩阵数组的偏移。
	 */
	static createAffineTransformationArray(tX: number, tY: number, tZ: number, rX: number, rY: number, rZ: number, rW: number, sX: number, sY: number, sZ: number, outArray: Float32Array, outOffset: number): void {

		var x2: number = rX + rX, y2: number = rY + rY, z2: number = rZ + rZ;
		var xx: number = rX * x2, xy: number = rX * y2, xz: number = rX * z2, yy: number = rY * y2, yz: number = rY * z2, zz: number = rZ * z2;
		var wx: number = rW * x2, wy: number = rW * y2, wz: number = rW * z2;

		outArray[outOffset + 0] = (1 - (yy + zz)) * sX;
		outArray[outOffset + 1] = (xy + wz) * sX;
		outArray[outOffset + 2] = (xz - wy) * sX;
		outArray[outOffset + 3] = 0;
		outArray[outOffset + 4] = (xy - wz) * sY;
		outArray[outOffset + 5] = (1 - (xx + zz)) * sY;
		outArray[outOffset + 6] = (yz + wx) * sY;
		outArray[outOffset + 7] = 0;
		outArray[outOffset + 8] = (xz + wy) * sZ;
		outArray[outOffset + 9] = (yz - wx) * sZ;
		outArray[outOffset + 10] = (1 - (xx + yy)) * sZ;
		outArray[outOffset + 11] = 0;
		outArray[outOffset + 12] = tX;
		outArray[outOffset + 13] = tY;
		outArray[outOffset + 14] = tZ;
		outArray[outOffset + 15] = 1;
	}

	/**
	 * 通过矩阵转换一个三维向量数组到另外一个三维向量数组。
	 * @param	source 源三维向量所在数组。
	 * @param	sourceOffset 源三维向量数组偏移。
	 * @param	transform  变换矩阵。
	 * @param	result 输出三维向量所在数组。
	 * @param	resultOffset 输出三维向量数组偏移。
	 */
	static transformVector3ArrayToVector3ArrayCoordinate(source: Float32Array, sourceOffset: number, transform: Matrix4x4, result: Float32Array, resultOffset: number): void {
		var coordinateX: number = source[sourceOffset + 0];
		var coordinateY: number = source[sourceOffset + 1];
		var coordinateZ: number = source[sourceOffset + 2];

		var transformElem: Float32Array = transform.elements;
		var w: number = ((coordinateX * transformElem[3]) + (coordinateY * transformElem[7]) + (coordinateZ * transformElem[11]) + transformElem[15]);
		result[resultOffset] = (coordinateX * transformElem[0]) + (coordinateY * transformElem[4]) + (coordinateZ * transformElem[8]) + transformElem[12] / w;
		result[resultOffset + 1] = (coordinateX * transformElem[1]) + (coordinateY * transformElem[5]) + (coordinateZ * transformElem[9]) + transformElem[13] / w;
		result[resultOffset + 2] = (coordinateX * transformElem[2]) + (coordinateY * transformElem[6]) + (coordinateZ * transformElem[10]) + transformElem[14] / w;
	}

	/**
	 * 通过矩阵转换一个三维向量数组到另外一个归一化的三维向量数组。
	 * @param source 源三维向量所在数组。
	 * @param sourceOffset 源三维向量数组偏移。
	 * @param transform 变换矩阵。
	 * @param result 输出三维向量所在数组。
	 * @param resultOffset 输出三维向量数组偏移。
	 */
	static transformVector3ArrayToVector3ArrayNormal(source: Float32Array, sourceOffset: number, transform: Matrix4x4, result: Float32Array, resultOffset: number): void {
		var coordinateX: number = source[sourceOffset + 0];
		var coordinateY: number = source[sourceOffset + 1];
		var coordinateZ: number = source[sourceOffset + 2];

		var transformElem: Float32Array = transform.elements;
		result[resultOffset] = coordinateX * transformElem[0] + coordinateY * transformElem[4] + coordinateZ * transformElem[8];
		result[resultOffset + 1] = coordinateX * transformElem[1] + coordinateY * transformElem[5] + coordinateZ * transformElem[9];
		result[resultOffset + 2] = coordinateX * transformElem[2] + coordinateY * transformElem[6] + coordinateZ * transformElem[10];
	}

	/**
	 * @internal
	 */
	static transformLightingMapTexcoordArray(source: Float32Array, sourceOffset: number, lightingMapScaleOffset: Vector4, result: Float32Array, resultOffset: number): void {
		result[resultOffset + 0] = source[sourceOffset + 0] * lightingMapScaleOffset.x + lightingMapScaleOffset.z;
		result[resultOffset + 1] = 1.0 - ((1.0 - source[sourceOffset + 1]) * lightingMapScaleOffset.y + lightingMapScaleOffset.w);
	}

	/**
	 * 获取URL版本字符。
	 * @param	url
	 * @return
	 */
	static getURLVerion(url: string): string {
		var index: number = url.indexOf("?");
		return index >= 0 ? url.substr(index) : null;
	}

	/**
	 * @internal
	 */
	static _createAffineTransformationArray(trans: Vector3, rot: Quaternion, scale: Vector3, outE: Float32Array): void {

		var x: number = rot.x, y: number = rot.y, z: number = rot.z, w: number = rot.w, x2: number = x + x, y2: number = y + y, z2: number = z + z;
		var xx: number = x * x2, xy: number = x * y2, xz: number = x * z2, yy: number = y * y2, yz: number = y * z2, zz: number = z * z2;
		var wx: number = w * x2, wy: number = w * y2, wz: number = w * z2, sx: number = scale.x, sy: number = scale.y, sz: number = scale.z;

		outE[0] = (1 - (yy + zz)) * sx;
		outE[1] = (xy + wz) * sx;
		outE[2] = (xz - wy) * sx;
		outE[3] = 0;
		outE[4] = (xy - wz) * sy;
		outE[5] = (1 - (xx + zz)) * sy;
		outE[6] = (yz + wx) * sy;
		outE[7] = 0;
		outE[8] = (xz + wy) * sz;
		outE[9] = (yz - wx) * sz;
		outE[10] = (1 - (xx + yy)) * sz;
		outE[11] = 0;
		outE[12] = trans.x;
		outE[13] = trans.y;
		outE[14] = trans.z;
		outE[15] = 1;
	}

	/**
	 * @internal
	 */
	static _mulMatrixArray(left: Float32Array, right: Float32Array, rightOffset: number, outArray: Float32Array, outOffset: number): void {
		var l: Float32Array = right;
		var r: Float32Array = left;
		var e: Float32Array = outArray;

		var l11: number = l[rightOffset], l12: number = l[rightOffset + 1], l13: number = l[rightOffset + 2], l14: number = l[rightOffset + 3];
		var l21: number = l[rightOffset + 4], l22: number = l[rightOffset + 5], l23: number = l[rightOffset + 6], l24: number = l[rightOffset + 7];
		var l31: number = l[rightOffset + 8], l32: number = l[rightOffset + 9], l33: number = l[rightOffset + 10], l34: number = l[rightOffset + 11];
		var l41: number = l[rightOffset + 12], l42: number = l[rightOffset + 13], l43: number = l[rightOffset + 14], l44: number = l[rightOffset + 15];

		var r11: number = r[0], r12: number = r[1], r13: number = r[2], r14: number = r[3];
		var r21: number = r[4], r22: number = r[5], r23: number = r[6], r24: number = r[7];
		var r31: number = r[8], r32: number = r[9], r33: number = r[10], r34: number = r[11];
		var r41: number = r[12], r42: number = r[13], r43: number = r[14], r44: number = r[15];

		e[outOffset] = (l11 * r11) + (l12 * r21) + (l13 * r31) + (l14 * r41);
		e[outOffset + 1] = (l11 * r12) + (l12 * r22) + (l13 * r32) + (l14 * r42);
		e[outOffset + 2] = (l11 * r13) + (l12 * r23) + (l13 * r33) + (l14 * r43);
		e[outOffset + 3] = (l11 * r14) + (l12 * r24) + (l13 * r34) + (l14 * r44);
		e[outOffset + 4] = (l21 * r11) + (l22 * r21) + (l23 * r31) + (l24 * r41);
		e[outOffset + 5] = (l21 * r12) + (l22 * r22) + (l23 * r32) + (l24 * r42);
		e[outOffset + 6] = (l21 * r13) + (l22 * r23) + (l23 * r33) + (l24 * r43);
		e[outOffset + 7] = (l21 * r14) + (l22 * r24) + (l23 * r34) + (l24 * r44);
		e[outOffset + 8] = (l31 * r11) + (l32 * r21) + (l33 * r31) + (l34 * r41);
		e[outOffset + 9] = (l31 * r12) + (l32 * r22) + (l33 * r32) + (l34 * r42);
		e[outOffset + 10] = (l31 * r13) + (l32 * r23) + (l33 * r33) + (l34 * r43);
		e[outOffset + 11] = (l31 * r14) + (l32 * r24) + (l33 * r34) + (l34 * r44);
		e[outOffset + 12] = (l41 * r11) + (l42 * r21) + (l43 * r31) + (l44 * r41);
		e[outOffset + 13] = (l41 * r12) + (l42 * r22) + (l43 * r32) + (l44 * r42);
		e[outOffset + 14] = (l41 * r13) + (l42 * r23) + (l43 * r33) + (l44 * r43);
		e[outOffset + 15] = (l41 * r14) + (l42 * r24) + (l43 * r34) + (l44 * r44);
	}

	/**@internal */
	private static arcTanAngle(x: number, y: number): number {

		if (x == 0) {
			if (y == 1)
				return Math.PI / 2;
			return -Math.PI / 2;
		}
		if (x > 0)
			return Math.atan(y / x);
		if (x < 0) {
			if (y > 0)
				return Math.atan(y / x) + Math.PI;
			return Math.atan(y / x) - Math.PI;
		}
		return 0;
	}

	/**@internal */
	static angleTo(from: Vector3, location: Vector3, angle: Vector3): void {

		Vector3.subtract(location, from, Quaternion.TEMPVector30);
		Vector3.normalize(Quaternion.TEMPVector30, Quaternion.TEMPVector30);

		angle.x = Math.asin(Quaternion.TEMPVector30.y);
		angle.y = Utils3D.arcTanAngle(-Quaternion.TEMPVector30.z, -Quaternion.TEMPVector30.x);
	}

	/**
	 * 四元数旋转矩阵
	 * @param source 源数据
	 * @param rotation 旋转四元数Array
	 * @param out 输出数据
	 */
	static transformQuat(source: Vector3, rotation: Float32Array, out: Vector3): void {
		var re: Float32Array = rotation;

		var x: number = source.x, y: number = source.y, z: number = source.z, qx: number = re[0], qy: number = re[1], qz: number = re[2], qw: number = re[3],

			ix: number = qw * x + qy * z - qz * y, iy: number = qw * y + qz * x - qx * z, iz: number = qw * z + qx * y - qy * x, iw: number = -qx * x - qy * y - qz * z;

		out.x = ix * qw + iw * -qx + iy * -qz - iz * -qy;
		out.y = iy * qw + iw * -qy + iz * -qx - ix * -qz;
		out.z = iz * qw + iw * -qz + ix * -qy - iy * -qx;
	}

	/**
	 * 修改四元数权重
	 * @param f 元数据
	 * @param weight 权重
	 * @param e 目标数据
	 */
	static quaternionWeight(f: Quaternion, weight: number, e: Quaternion): void {
		e.x = f.x * weight;
		e.y = f.y * weight;
		e.z = f.z * weight;
		e.w = f.w;
	}

	/**
	 * @internal
	 */
	static quaternionConjugate(value: Quaternion, result: Quaternion): void {
		result.x = -value.x;
		result.y = -value.y;
		result.z = -value.z;
		result.w = value.w;
	}

	/**
	 * @internal
	 */
	static scaleWeight(s: Vector3, w: number, out: Vector3): void {
		var sX: number = s.x, sY: number = s.y, sZ: number = s.z;
		out.x = sX > 0 ? Math.pow(Math.abs(sX), w) : -Math.pow(Math.abs(sX), w);
		out.y = sY > 0 ? Math.pow(Math.abs(sY), w) : -Math.pow(Math.abs(sY), w);
		out.z = sZ > 0 ? Math.pow(Math.abs(sZ), w) : -Math.pow(Math.abs(sZ), w);
	}

	/**
	 * @internal
	 */
	static scaleBlend(sa: Vector3, sb: Vector3, w: number, out: Vector3): void {
		var saw: Vector3 = Utils3D._tempVector3_0;
		var sbw: Vector3 = Utils3D._tempVector3_1;
		Utils3D.scaleWeight(sa, 1.0 - w, saw);
		Utils3D.scaleWeight(sb, w, sbw);
		var sng: Vector3 = w > 0.5 ? sb : sa;
		out.x = sng.x > 0 ? Math.abs(saw.x * sbw.x) : -Math.abs(saw.x * sbw.x);
		out.y = sng.y > 0 ? Math.abs(saw.y * sbw.y) : -Math.abs(saw.y * sbw.y);
		out.z = sng.z > 0 ? Math.abs(saw.z * sbw.z) : -Math.abs(saw.z * sbw.z);
	}


	/**@internal */
	static matrix4x4MultiplyFFF(a: Float32Array, b: Float32Array, e: Float32Array): void {

		var i: number, ai0: number, ai1: number, ai2: number, ai3: number;
		if (e === b) {
			b = new Float32Array(16);
			for (i = 0; i < 16; ++i) {
				b[i] = e[i];
			}
		}

		var b0: number = b[0], b1: number = b[1], b2: number = b[2], b3: number = b[3];
		var b4: number = b[4], b5: number = b[5], b6: number = b[6], b7: number = b[7];
		var b8: number = b[8], b9: number = b[9], b10: number = b[10], b11: number = b[11];
		var b12: number = b[12], b13: number = b[13], b14: number = b[14], b15: number = b[15];

		for (i = 0; i < 4; i++) {
			ai0 = a[i];
			ai1 = a[i + 4];
			ai2 = a[i + 8];
			ai3 = a[i + 12];
			e[i] = ai0 * b0 + ai1 * b1 + ai2 * b2 + ai3 * b3;
			e[i + 4] = ai0 * b4 + ai1 * b5 + ai2 * b6 + ai3 * b7;
			e[i + 8] = ai0 * b8 + ai1 * b9 + ai2 * b10 + ai3 * b11;
			e[i + 12] = ai0 * b12 + ai1 * b13 + ai2 * b14 + ai3 * b15;
		}
	}

	/**@internal */
	static matrix4x4MultiplyFFFForNative(a: Float32Array, b: Float32Array, e: Float32Array): void {
		(<any>LayaGL.instance).matrix4x4Multiply(a, b, e);
	}

	/**@internal */
	static matrix4x4MultiplyMFM(left: Matrix4x4, right: Float32Array, out: Matrix4x4): void {
		Utils3D.matrix4x4MultiplyFFF(left.elements, right, out.elements);
	}

	/**
	 * @internal
	 */
	static _buildTexture2D(width: number, height: number, format: number, colorFunc: Function, mipmaps: boolean = false): Texture2D {
		var texture: Texture2D = new Texture2D(width, height, format, mipmaps, true);
		texture.anisoLevel = 1;
		texture.filterMode = FilterMode.Point;
		TextureGenerator._generateTexture2D(texture, width, height, colorFunc);
		return texture;
	}

	/**
	 * @internal
	 */
	static _drawBound(debugLine: PixelLineSprite3D, boundBox: BoundBox, color: Color): void {
		if (debugLine.lineCount + 12 > debugLine.maxLineCount)
			debugLine.maxLineCount += 12;

		var start: Vector3 = Utils3D._tempVector3_0;
		var end: Vector3 = Utils3D._tempVector3_1;
		var min: Vector3 = boundBox.min;
		var max: Vector3 = boundBox.max;

		start.setValue(min.x, min.y, min.z);
		end.setValue(max.x, min.y, min.z);
		debugLine.addLine(start, end, color, color);

		start.setValue(min.x, min.y, min.z);
		end.setValue(min.x, min.y, max.z);
		debugLine.addLine(start, end, color, color);

		start.setValue(max.x, min.y, min.z);
		end.setValue(max.x, min.y, max.z);
		debugLine.addLine(start, end, color, color);

		start.setValue(min.x, min.y, max.z);
		end.setValue(max.x, min.y, max.z);
		debugLine.addLine(start, end, color, color);

		start.setValue(min.x, min.y, min.z);
		end.setValue(min.x, max.y, min.z);
		debugLine.addLine(start, end, color, color);

		start.setValue(min.x, min.y, max.z);
		end.setValue(min.x, max.y, max.z);
		debugLine.addLine(start, end, color, color);

		start.setValue(max.x, min.y, min.z);
		end.setValue(max.x, max.y, min.z);
		debugLine.addLine(start, end, color, color);

		start.setValue(max.x, min.y, max.z);
		end.setValue(max.x, max.y, max.z);
		debugLine.addLine(start, end, color, color);

		start.setValue(min.x, max.y, min.z);
		end.setValue(max.x, max.y, min.z);
		debugLine.addLine(start, end, color, color);

		start.setValue(min.x, max.y, min.z);
		end.setValue(min.x, max.y, max.z);
		debugLine.addLine(start, end, color, color);

		start.setValue(max.x, max.y, min.z);
		end.setValue(max.x, max.y, max.z);
		debugLine.addLine(start, end, color, color);

		start.setValue(min.x, max.y, max.z);
		end.setValue(max.x, max.y, max.z);
		debugLine.addLine(start, end, color, color);
	}

	///**@internal */
	//private static var _tempHierarchyID:int = 0;
	//
	///**
	//* @internal
	//*/
	//public static function _getSpritesHierarchyID(sprite:Sprite3D, checkSprites:Array, outIDs:Array):void {
	//var index:int = checkSprites.indexOf(sprite);
	//if (index !== -1)
	//outIDs[index] = _tempHierarchyID;
	//_tempHierarchyID++;
	//var children:Array = sprite._children;
	//for (var i:int = 0, n:int = children.length; i < n; i++)
	//_getSpritesHierarchyID(children[i], checkSprites, outIDs);
	//}

	/**
	 * @internal
	 */
	static _getHierarchyPath(rootSprite: Node, checkSprite: Node, path: any[]): any[] {
		path.length = 0;
		var sprite: Node = checkSprite;
		while (sprite !== rootSprite) {
			var parent: Node = sprite._parent;
			if (parent)
				path.push(parent.getChildIndex(sprite));
			else
				return null;
			sprite = parent;
		}
		return path;
	}

	/**
	 * @internal
	 */
	static _getNodeByHierarchyPath(rootSprite: Node, invPath: any[]): Node {
		var sprite: Node = rootSprite;
		for (var i: number = invPath.length - 1; i >= 0; i--) {
			sprite = sprite.getChildAt(invPath[i]);
		}
		return sprite;
	}


	
	static uint8ArrayToArrayBuffer(rendertexture: RenderTexture)
	{
		
		let pixelArray:Uint8Array|Float32Array;
		let width = rendertexture.width;
		let height = rendertexture.height;
		switch(rendertexture.format){
			case RenderTextureFormat.R8G8B8:
				pixelArray = new Uint8Array(width*height*4);
				break;
			case RenderTextureFormat.R8G8B8A8:
				pixelArray = new Uint8Array(width*height*4);
				break;
			case RenderTextureFormat.R16G16B16A16:
				pixelArray = new Float32Array(width*height*4);
				break;
			default:
				throw "this function is not surpprt "+rendertexture.format.toString()+"format Material";
		}
		rendertexture.getData(0,0,rendertexture.width,rendertexture.height,pixelArray);
		//tranceTo
		switch(rendertexture.format){
			case RenderTextureFormat.R16G16B16A16:
				let ori = pixelArray;
				let trans = new Uint8Array(width*height*4);
				for(let i = 0,n = ori.length;i<n;i++){
					trans[i] =Math.min(Math.floor(ori[i]*255),255);
				}
				pixelArray = trans;
				break;
		}
		
		let pixels = pixelArray;
		var bs:String;
		if (Render.isConchApp)
		{
			//TODO:
			//var base64img=__JS__("conchToBase64('image/png',1,pixels,canvasWidth,canvasHeight)");
			//var l = base64img.split(",");
			//if (isBase64)
			//	return base64img;
			//return base.utils.DBUtils.decodeArrayBuffer(l[1]);
		}
		else
		{
				var canv:HTMLCanvas = new HTMLCanvas(true);
				canv.lock = true;
				canv.size(width, height);
				var ctx2d = canv.getContext('2d');
				//@ts-ignore
				var imgdata:ImageData =ctx2d.createImageData(width, height);
				//@ts-ignore
				imgdata.data.set(new Uint8ClampedArray(pixels));
				//@ts-ignore
				ctx2d.putImageData(imgdata, 0, 0);;
				bs = canv.source.toDataURL();
				canv.destroy();
		}
		return bs;
	}



}


