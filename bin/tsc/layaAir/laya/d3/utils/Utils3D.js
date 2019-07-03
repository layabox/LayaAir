import { LayaGL } from "../../layagl/LayaGL";
import { BaseTexture } from "../../resource/BaseTexture";
import { Texture2D } from "../../resource/Texture2D";
import { Color } from "../math/Color";
import { Quaternion } from "../math/Quaternion";
import { Vector3 } from "../math/Vector3";
import { TextureGenerator } from "../resource/TextureGenerator";
/**
 * <code>Utils3D</code> 类用于创建3D工具。
 */
export class Utils3D {
    /**
     * @internal
     */
    static _convertToLayaVec3(bVector, out, inverseX) {
        out.x = inverseX ? -bVector.x() : bVector.x();
        out.y = bVector.y();
        out.z = bVector.z();
    }
    /**
     * @internal
     */
    static _convertToBulletVec3(lVector, out, inverseX) {
        out.setValue(inverseX ? -lVector.x : lVector.x, lVector.y, lVector.z);
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
    static _rotationTransformScaleSkinAnimation(tx, ty, tz, qx, qy, qz, qw, sx, sy, sz, outArray, outOffset) {
        var re = Utils3D._tempArray16_0;
        var se = Utils3D._tempArray16_1;
        var tse = Utils3D._tempArray16_2;
        //平移
        //旋转
        var x2 = qx + qx;
        var y2 = qy + qy;
        var z2 = qz + qz;
        var xx = qx * x2;
        var yx = qy * x2;
        var yy = qy * y2;
        var zx = qz * x2;
        var zy = qz * y2;
        var zz = qz * z2;
        var wx = qw * x2;
        var wy = qw * y2;
        var wz = qw * z2;
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
        var i, a, b, e, ai0, ai1, ai2, ai3;
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
    /** @internal */
    static _computeBoneAndAnimationDatasByBindPoseMatrxix(bones, curData, inverGlobalBindPose, outBonesDatas, outAnimationDatas, boneIndexToMesh) {
        var offset = 0;
        var matOffset = 0;
        var i;
        var parentOffset;
        var boneLength = bones.length;
        for (i = 0; i < boneLength; offset += bones[i].keyframeWidth, matOffset += 16, i++) {
            //将旋转平移缩放合成矩阵...........................................
            Utils3D._rotationTransformScaleSkinAnimation(curData[offset + 0], curData[offset + 1], curData[offset + 2], curData[offset + 3], curData[offset + 4], curData[offset + 5], curData[offset + 6], curData[offset + 7], curData[offset + 8], curData[offset + 9], outBonesDatas, matOffset);
            if (i != 0) {
                parentOffset = bones[i].parentIndex * 16;
                Utils3D.mulMatrixByArray(outBonesDatas, parentOffset, outBonesDatas, matOffset, outBonesDatas, matOffset);
            }
        }
        var n = inverGlobalBindPose.length;
        for (i = 0; i < n; i++) //将绝对矩阵乘以反置矩阵................................................
         {
            Utils3D.mulMatrixByArrayAndMatrixFast(outBonesDatas, boneIndexToMesh[i] * 16, inverGlobalBindPose[i], outAnimationDatas, i * 16); //TODO:-1处理
        }
    }
    /** @internal */
    static _computeAnimationDatasByArrayAndMatrixFast(inverGlobalBindPose, bonesDatas, outAnimationDatas, boneIndexToMesh) {
        for (var i = 0, n = inverGlobalBindPose.length; i < n; i++) //将绝对矩阵乘以反置矩阵
            Utils3D.mulMatrixByArrayAndMatrixFast(bonesDatas, boneIndexToMesh[i] * 16, inverGlobalBindPose[i], outAnimationDatas, i * 16); //TODO:-1处理
    }
    /** @internal */
    static _computeBoneAndAnimationDatasByBindPoseMatrxixOld(bones, curData, inverGlobalBindPose, outBonesDatas, outAnimationDatas) {
        var offset = 0;
        var matOffset = 0;
        var i;
        var parentOffset;
        var boneLength = bones.length;
        for (i = 0; i < boneLength; offset += bones[i].keyframeWidth, matOffset += 16, i++) {
            //将旋转平移缩放合成矩阵...........................................
            Utils3D._rotationTransformScaleSkinAnimation(curData[offset + 7], curData[offset + 8], curData[offset + 9], curData[offset + 3], curData[offset + 4], curData[offset + 5], curData[offset + 6], curData[offset + 0], curData[offset + 1], curData[offset + 2], outBonesDatas, matOffset);
            if (i != 0) {
                parentOffset = bones[i].parentIndex * 16;
                Utils3D.mulMatrixByArray(outBonesDatas, parentOffset, outBonesDatas, matOffset, outBonesDatas, matOffset);
            }
        }
        var n = inverGlobalBindPose.length;
        for (i = 0; i < n; i++) //将绝对矩阵乘以反置矩阵................................................
         {
            var arrayOffset = i * 16;
            Utils3D.mulMatrixByArrayAndMatrixFast(outBonesDatas, arrayOffset, inverGlobalBindPose[i], outAnimationDatas, arrayOffset);
        }
    }
    /** @internal */
    static _computeAnimationDatasByArrayAndMatrixFastOld(inverGlobalBindPose, bonesDatas, outAnimationDatas) {
        var n = inverGlobalBindPose.length;
        for (var i = 0; i < n; i++) //将绝对矩阵乘以反置矩阵................................................
         {
            var arrayOffset = i * 16;
            Utils3D.mulMatrixByArrayAndMatrixFast(bonesDatas, arrayOffset, inverGlobalBindPose[i], outAnimationDatas, arrayOffset);
        }
    }
    /** @internal */
    static _computeRootAnimationData(bones, curData, animationDatas) {
        for (var i = 0, offset = 0, matOffset = 0, boneLength = bones.length; i < boneLength; offset += bones[i].keyframeWidth, matOffset += 16, i++)
            Utils3D.createAffineTransformationArray(curData[offset + 0], curData[offset + 1], curData[offset + 2], curData[offset + 3], curData[offset + 4], curData[offset + 5], curData[offset + 6], curData[offset + 7], curData[offset + 8], curData[offset + 9], animationDatas, matOffset);
    }
    /**
     * 根据四元数旋转三维向量。
     * @param	source 源三维向量。
     * @param	rotation 旋转四元数。
     * @param	out 输出三维向量。
     */
    static transformVector3ArrayByQuat(sourceArray, sourceOffset, rotation, outArray, outOffset) {
        var x = sourceArray[sourceOffset], y = sourceArray[sourceOffset + 1], z = sourceArray[sourceOffset + 2], qx = rotation.x, qy = rotation.y, qz = rotation.z, qw = rotation.w, ix = qw * x + qy * z - qz * y, iy = qw * y + qz * x - qx * z, iz = qw * z + qx * y - qy * x, iw = -qx * x - qy * y - qz * z;
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
    static mulMatrixByArray(leftArray, leftOffset, rightArray, rightOffset, outArray, outOffset) {
        var i, ai0, ai1, ai2, ai3;
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
    static mulMatrixByArrayFast(leftArray, leftOffset, rightArray, rightOffset, outArray, outOffset) {
        var i, ai0, ai1, ai2, ai3;
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
    static mulMatrixByArrayAndMatrixFast(leftArray, leftOffset, rightMatrix, outArray, outOffset) {
        var i, ai0, ai1, ai2, ai3;
        var rightMatrixE = rightMatrix.elements;
        var m11 = rightMatrixE[0], m12 = rightMatrixE[1], m13 = rightMatrixE[2], m14 = rightMatrixE[3];
        var m21 = rightMatrixE[4], m22 = rightMatrixE[5], m23 = rightMatrixE[6], m24 = rightMatrixE[7];
        var m31 = rightMatrixE[8], m32 = rightMatrixE[9], m33 = rightMatrixE[10], m34 = rightMatrixE[11];
        var m41 = rightMatrixE[12], m42 = rightMatrixE[13], m43 = rightMatrixE[14], m44 = rightMatrixE[15];
        var ai0LeftOffset = leftOffset;
        var ai1LeftOffset = leftOffset + 4;
        var ai2LeftOffset = leftOffset + 8;
        var ai3LeftOffset = leftOffset + 12;
        var ai0OutOffset = outOffset;
        var ai1OutOffset = outOffset + 4;
        var ai2OutOffset = outOffset + 8;
        var ai3OutOffset = outOffset + 12;
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
    static createAffineTransformationArray(tX, tY, tZ, rX, rY, rZ, rW, sX, sY, sZ, outArray, outOffset) {
        var x2 = rX + rX, y2 = rY + rY, z2 = rZ + rZ;
        var xx = rX * x2, xy = rX * y2, xz = rX * z2, yy = rY * y2, yz = rY * z2, zz = rZ * z2;
        var wx = rW * x2, wy = rW * y2, wz = rW * z2;
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
     * 通过矩阵转换一个三维向量数组到另外一个归一化的三维向量数组。
     * @param	source 源三维向量所在数组。
     * @param	sourceOffset 源三维向量数组偏移。
     * @param	transform  变换矩阵。
     * @param	result 输出三维向量所在数组。
     * @param	resultOffset 输出三维向量数组偏移。
     */
    static transformVector3ArrayToVector3ArrayCoordinate(source, sourceOffset, transform, result, resultOffset) {
        var coordinateX = source[sourceOffset + 0];
        var coordinateY = source[sourceOffset + 1];
        var coordinateZ = source[sourceOffset + 2];
        var transformElem = transform.elements;
        var w = ((coordinateX * transformElem[3]) + (coordinateY * transformElem[7]) + (coordinateZ * transformElem[11]) + transformElem[15]);
        result[resultOffset] = (coordinateX * transformElem[0]) + (coordinateY * transformElem[4]) + (coordinateZ * transformElem[8]) + transformElem[12] / w;
        result[resultOffset + 1] = (coordinateX * transformElem[1]) + (coordinateY * transformElem[5]) + (coordinateZ * transformElem[9]) + transformElem[13] / w;
        result[resultOffset + 2] = (coordinateX * transformElem[2]) + (coordinateY * transformElem[6]) + (coordinateZ * transformElem[10]) + transformElem[14] / w;
    }
    /**
     * @internal
     */
    static transformLightingMapTexcoordArray(source, sourceOffset, lightingMapScaleOffset, result, resultOffset) {
        result[resultOffset + 0] = source[sourceOffset + 0] * lightingMapScaleOffset.x + lightingMapScaleOffset.z;
        result[resultOffset + 1] = 1.0 - ((1.0 - source[sourceOffset + 1]) * lightingMapScaleOffset.y + lightingMapScaleOffset.w);
    }
    /**
     * 获取URL版本字符。
     * @param	url
     * @return
     */
    static getURLVerion(url) {
        var index = url.indexOf("?");
        return index >= 0 ? url.substr(index) : null;
    }
    /**
     * @internal
     */
    static _createAffineTransformationArray(trans, rot, scale, outE) {
        var x = rot.x, y = rot.y, z = rot.z, w = rot.w, x2 = x + x, y2 = y + y, z2 = z + z;
        var xx = x * x2, xy = x * y2, xz = x * z2, yy = y * y2, yz = y * z2, zz = z * z2;
        var wx = w * x2, wy = w * y2, wz = w * z2, sx = scale.x, sy = scale.y, sz = scale.z;
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
    static _mulMatrixArray(leftMatrixE, rightMatrix, outArray, outOffset) {
        var i, ai0, ai1, ai2, ai3;
        var rightMatrixE = rightMatrix.elements;
        var m11 = rightMatrixE[0], m12 = rightMatrixE[1], m13 = rightMatrixE[2], m14 = rightMatrixE[3];
        var m21 = rightMatrixE[4], m22 = rightMatrixE[5], m23 = rightMatrixE[6], m24 = rightMatrixE[7];
        var m31 = rightMatrixE[8], m32 = rightMatrixE[9], m33 = rightMatrixE[10], m34 = rightMatrixE[11];
        var m41 = rightMatrixE[12], m42 = rightMatrixE[13], m43 = rightMatrixE[14], m44 = rightMatrixE[15];
        var ai0OutOffset = outOffset;
        var ai1OutOffset = outOffset + 4;
        var ai2OutOffset = outOffset + 8;
        var ai3OutOffset = outOffset + 12;
        for (i = 0; i < 4; i++) {
            ai0 = leftMatrixE[i];
            ai1 = leftMatrixE[i + 4];
            ai2 = leftMatrixE[i + 8];
            ai3 = leftMatrixE[i + 12];
            outArray[ai0OutOffset + i] = ai0 * m11 + ai1 * m12 + ai2 * m13 + ai3 * m14;
            outArray[ai1OutOffset + i] = ai0 * m21 + ai1 * m22 + ai2 * m23 + ai3 * m24;
            outArray[ai2OutOffset + i] = ai0 * m31 + ai1 * m32 + ai2 * m33 + ai3 * m34;
            outArray[ai3OutOffset + i] = ai0 * m41 + ai1 * m42 + ai2 * m43 + ai3 * m44;
        }
    }
    static arcTanAngle(x, y) {
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
    static angleTo(from, location, angle) {
        Vector3.subtract(location, from, Quaternion.TEMPVector30);
        Vector3.normalize(Quaternion.TEMPVector30, Quaternion.TEMPVector30);
        angle.x = Math.asin(Quaternion.TEMPVector30.y);
        angle.y = Utils3D.arcTanAngle(-Quaternion.TEMPVector30.z, -Quaternion.TEMPVector30.x);
    }
    static transformQuat(source, rotation, out) {
        var re = rotation;
        var x = source.x, y = source.y, z = source.z, qx = re[0], qy = re[1], qz = re[2], qw = re[3], ix = qw * x + qy * z - qz * y, iy = qw * y + qz * x - qx * z, iz = qw * z + qx * y - qy * x, iw = -qx * x - qy * y - qz * z;
        out.x = ix * qw + iw * -qx + iy * -qz - iz * -qy;
        out.y = iy * qw + iw * -qy + iz * -qx - ix * -qz;
        out.z = iz * qw + iw * -qz + ix * -qy - iy * -qx;
    }
    static quaternionWeight(f, weight, e) {
        e.x = f.x * weight;
        e.y = f.y * weight;
        e.z = f.z * weight;
        e.w = f.w;
    }
    /**
     * @internal
     */
    static quaternionConjugate(value, result) {
        result.x = -value.x;
        result.y = -value.y;
        result.z = -value.z;
        result.w = value.w;
    }
    /**
     * @internal
     */
    static scaleWeight(s, w, out) {
        var sX = s.x, sY = s.y, sZ = s.z;
        out.x = sX > 0 ? Math.pow(Math.abs(sX), w) : -Math.pow(Math.abs(sX), w);
        out.y = sY > 0 ? Math.pow(Math.abs(sY), w) : -Math.pow(Math.abs(sY), w);
        out.z = sZ > 0 ? Math.pow(Math.abs(sZ), w) : -Math.pow(Math.abs(sZ), w);
    }
    /**
     * @internal
     */
    static scaleBlend(sa, sb, w, out) {
        var saw = Utils3D._tempVector3_0;
        var sbw = Utils3D._tempVector3_1;
        Utils3D.scaleWeight(sa, 1.0 - w, saw);
        Utils3D.scaleWeight(sb, w, sbw);
        var sng = w > 0.5 ? sb : sa;
        out.x = sng.x > 0 ? Math.abs(saw.x * sbw.x) : -Math.abs(saw.x * sbw.x);
        out.y = sng.y > 0 ? Math.abs(saw.y * sbw.y) : -Math.abs(saw.y * sbw.y);
        out.z = sng.z > 0 ? Math.abs(saw.z * sbw.z) : -Math.abs(saw.z * sbw.z);
    }
    static matrix4x4MultiplyFFF(a, b, e) {
        var i, ai0, ai1, ai2, ai3;
        if (e === b) {
            b = new Float32Array(16);
            for (i = 0; i < 16; ++i) {
                b[i] = e[i];
            }
        }
        var b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
        var b4 = b[4], b5 = b[5], b6 = b[6], b7 = b[7];
        var b8 = b[8], b9 = b[9], b10 = b[10], b11 = b[11];
        var b12 = b[12], b13 = b[13], b14 = b[14], b15 = b[15];
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
    static matrix4x4MultiplyFFFForNative(a, b, e) {
        LayaGL.instance.matrix4x4Multiply(a, b, e);
    }
    static matrix4x4MultiplyMFM(left, right, out) {
        Utils3D.matrix4x4MultiplyFFF(left.elements, right, out.elements);
    }
    /**
     * @internal
     */
    static _buildTexture2D(width, height, format, colorFunc, mipmaps = false) {
        var texture = new Texture2D(width, height, format, mipmaps, true);
        texture.anisoLevel = 1;
        texture.filterMode = BaseTexture.FILTERMODE_POINT;
        TextureGenerator._generateTexture2D(texture, width, height, colorFunc);
        return texture;
    }
    /**
     * @internal
     */
    static _drawBound(debugLine, boundBox, color) {
        if (debugLine.lineCount + 12 > debugLine.maxLineCount)
            debugLine.maxLineCount += 12;
        var start = Utils3D._tempVector3_0;
        var end = Utils3D._tempVector3_1;
        var min = boundBox.min;
        var max = boundBox.max;
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
    static _getHierarchyPath(rootSprite, checkSprite, path) {
        path.length = 0;
        var sprite = checkSprite;
        while (sprite !== rootSprite) {
            var parent = sprite._parent;
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
    static _getNodeByHierarchyPath(rootSprite, invPath) {
        var sprite = rootSprite;
        for (var i = invPath.length - 1; i >= 0; i--) {
            sprite = sprite.getChildAt(invPath[i]);
        }
        return sprite;
    }
}
Utils3D._tempVector3_0 = new Vector3();
Utils3D._tempVector3_1 = new Vector3();
Utils3D._tempVector3_2 = new Vector3();
Utils3D._tempColor0 = new Color();
Utils3D._tempArray16_0 = new Float32Array(16);
Utils3D._tempArray16_1 = new Float32Array(16);
Utils3D._tempArray16_2 = new Float32Array(16);
Utils3D._tempArray16_3 = new Float32Array(16);
/**
 * @internal
 */
Utils3D._compIdToNode = new Object();
