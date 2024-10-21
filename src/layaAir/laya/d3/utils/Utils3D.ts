import { Node } from "../../display/Node";
import { Texture2D } from "../../resource/Texture2D";
import { PixelLineSprite3D } from "../core/pixelLine/PixelLineSprite3D";
import { BoundBox } from "../math/BoundBox";
import { TextureGenerator } from "../resource/TextureGenerator";
import { ILaya3D } from "../../../ILaya3D";
import { HTMLCanvas } from "../../resource/HTMLCanvas";
import { TextureFormat } from "../../RenderEngine/RenderEnum/TextureFormat";
import { FilterMode } from "../../RenderEngine/RenderEnum/FilterMode";
import { WrapMode } from "../../RenderEngine/RenderEnum/WrapMode";
import { RenderTargetFormat } from "../../RenderEngine/RenderEnum/RenderTargetFormat";
import { LayaEnv } from "../../../LayaEnv";
import { Bounds } from "../math/Bounds";
import { Color } from "../../maths/Color";
import { Matrix4x4 } from "../../maths/Matrix4x4";
import { Quaternion } from "../../maths/Quaternion";
import { Vector3 } from "../../maths/Vector3";
import { Vector4 } from "../../maths/Vector4";
import { RenderTexture } from "../../resource/RenderTexture";
import { Utils } from "../../utils/Utils";

/**
 * @en Utils3D is a class used to create 3D tools.
 * @zh Utils3D 类用于创建3D工具。
 */
export class Utils3D {
    private static _tempVector3_0: Vector3 = new Vector3();
    private static _tempVector3_1: Vector3 = new Vector3();
    private static _tempVector3_2: Vector3 = new Vector3();

    private static _tempArray16_0: Float32Array = new Float32Array(16);
    private static _tempArray16_1: Float32Array = new Float32Array(16);
    private static _tempArray16_2: Float32Array = new Float32Array(16);
    private static _tempArray16_3: Float32Array = new Float32Array(16);

    /**
     * @internal
     */
    static _createFloatTextureBuffer(width: number, height: number): Texture2D {
        var floatTex: Texture2D = new Texture2D(width, height, TextureFormat.R32G32B32A32, false, false);
        floatTex.setPixelsData(null, false, false);
        floatTex.filterMode = FilterMode.Point;
        floatTex.wrapModeU = WrapMode.Clamp;
        floatTex.wrapModeV = WrapMode.Clamp;
        floatTex.anisoLevel = 1;
        return floatTex;
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
    static _tempV0: Vector3 = new Vector3();
    static _tempV1: Vector3 = new Vector3();

    /**
     * @en Convert vertices to a billboard
     * @zh 将顶点进行广告牌转换
     */
    static billboardTrans(v0: Vector3, cameraDir: Vector3, cameraUp: Vector3, out: Vector3) {
        //vec3 positionOS = vertex.positionOS.x * normalize(cross(u_CameraDirection, u_CameraUp));
        //positionOS += vertex.positionOS.y * normalize(u_CameraUp);
        Vector3.normalize(cameraUp, Utils3D._tempV1);
        Vector3.cross(cameraDir, cameraUp, Utils3D._tempV0);
        Vector3.normalize(Utils3D._tempV0, Utils3D._tempV0);
        Vector3.scale(Utils3D._tempV0, v0.x, out);
        Vector3.scale(cameraUp, v0.y, Utils3D._tempV1);
        Vector3.add(out, Utils3D._tempV1, out);
    }

    /**
     * @en Determines if point P is within the triangle formed by points A, B, and C. https://mathworld.wolfram.com/BarycentricCoordinates.html
     * @param A The first vertex of the triangle.
     * @param B The second vertex of the triangle.
     * @param C The third vertex of the triangle.
     * @param P The point to check.
     * @returns True if P is inside the triangle, false otherwise.
     * @zh 判断点P是否在由点A、B、C组成的三角形内。https://mathworld.wolfram.com/BarycentricCoordinates.html
     * @param A 三角形的第一个顶点。
     * @param B 三角形的第二个顶点。
     * @param C 三角形的第三个顶点。
     * @param P 需要判断的点。
     * @returns 若P在三角形内，返回true，否则返回false。
     */
    static PointinTriangle(A: Vector3, B: Vector3, C: Vector3, P: Vector3): boolean {
        let v0 = C.vsub(A, Utils3D._tempVector3_0);
        let v1 = B.vsub(A, Utils3D._tempVector3_1);
        let v2 = P.vsub(A, Utils3D._tempVector3_2);

        let dot00 = v0.dot(v0);
        let dot01 = v0.dot(v1);
        let dot02 = v0.dot(v2);
        let dot11 = v1.dot(v1);
        let dot12 = v1.dot(v2);

        let inverDeno = 1 / (dot00 * dot11 - dot01 * dot01);

        let u = (dot11 * dot02 - dot01 * dot12) * inverDeno;
        if (u < 0 || u > 1) // if u out of range, return directly
        {
            return false;
        }


        let v = (dot00 * dot12 - dot01 * dot02) * inverDeno;
        if (v < 0 || v > 1) // if v out of range, return directly
        {
            return false;
        }
        return u + v <= 1;
    }


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
     * @en Rotates a 3D vector using a quaternion.
     * @param sourceArray The source vector components in a Float32Array.
     * @param sourceOffset The offset in the source array where the source vector starts.
     * @param rotation The quaternion representing the rotation.
     * @param outArray The array to store the result of the rotation.
     * @param outOffset The offset in the output array where the result will be stored.
     * @zh 使用四元数旋转三维向量。
     * @param sourceArray 源三维向量的数组。
     * @param sourceOffset 源三维向量的偏移。
     * @param rotation 四元数。
     * @param outArray 输出数组。
     * @param outOffset 输出数组的偏移。
     */
    static transformVector3ArrayByQuat(sourceArray: Float32Array, sourceOffset: number, rotation: Quaternion, outArray: Float32Array, outOffset: number): void {
        var x: number = sourceArray[sourceOffset], y: number = sourceArray[sourceOffset + 1], z: number = sourceArray[sourceOffset + 2], qx: number = rotation.x, qy: number = rotation.y, qz: number = rotation.z, qw: number = rotation.w, ix: number = qw * x + qy * z - qz * y, iy: number = qw * y + qz * x - qx * z, iz: number = qw * z + qx * y - qy * x, iw: number = -qx * x - qy * y - qz * z;
        outArray[outOffset] = ix * qw + iw * -qx + iy * -qz - iz * -qy;
        outArray[outOffset + 1] = iy * qw + iw * -qy + iz * -qx - ix * -qz;
        outArray[outOffset + 2] = iz * qw + iw * -qz + ix * -qy - iy * -qx;
    }

    /**
     * @en Multiplies two matrices using array data.
     * @param leftArray The left-hand side matrix array.
     * @param leftOffset The offset in the left-hand side array.
     * @param rightArray The right-hand side matrix array.
     * @param rightOffset The offset in the right-hand side array.
     * @param outArray The output matrix array where the result will be stored.
     * @param outOffset The offset in the output array.
     * @zh 通过数组数据计算矩阵乘法。
     * @param leftArray 左矩阵数组。
     * @param leftOffset 左矩阵数组的偏移。
     * @param rightArray 右矩阵数组。
     * @param rightOffset 右矩阵数组的偏移。
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
     * @en Multiplies two matrices using array data, with the restriction that rightArray and outArray cannot be the same array reference.
     * @param leftArray The left-hand side matrix array.
     * @param leftOffset The offset in the left-hand side array.
     * @param rightArray The right-hand side matrix array.
     * @param rightOffset The offset in the right-hand side array.
     * @param outArray The output matrix array where the result will be stored.
     * @param outOffset The offset in the output array.
     * @zh 通过数组数据计算矩阵乘法，注意 rightArray 和 outArray 不能是同一个数组引用。
     * @param leftArray 左矩阵数组。
     * @param leftOffset 左矩阵数组的偏移。
     * @param rightArray 右矩阵数组。
     * @param rightOffset 右矩阵数组的偏移。
     * @param outArray 输出矩阵数组。
     * @param outOffset 输出矩阵数组的偏移。
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
     * @en Multiplies a matrix by an array and another matrix, with the restriction that rightArray and outArray cannot be the same array reference.
     * @param leftArray The left-hand side matrix array.
     * @param leftOffset The offset in the left-hand side array.
     * @param rightMatrix The right-hand side matrix.
     * @param outArray The output matrix array where the result will be stored.
     * @param outOffset The offset in the output array.
     * @zh 通过数组数据和一个矩阵计算矩阵乘法，注意 rightArray 和 outArray 不能是同一个数组引用。
     * @param leftArray 左矩阵数组。
     * @param leftOffset 左矩阵数组的偏移。
     * @param rightMatrix 右矩阵。
     * @param outArray 输出矩阵数组。
     * @param outOffset 输出矩阵数组的偏移。
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
     * @en Calculates the result matrix array by the given translation, rotation, and scale values.
     * @param tX X axis translation.
     * @param tY Y axis translation.
     * @param tZ Z axis translation.
     * @param rX X axis rotation.
     * @param rY Y axis rotation.
     * @param rZ Z axis rotation.
     * @param rW W component of the rotation quaternion.
     * @param sX X axis scale.
     * @param sY Y axis scale.
     * @param sZ Z axis scale.
     * @param outArray Output matrix array.
     * @param outOffset Output matrix array offset.
     * @zh 通过数平移、旋转、缩放值计算到结果矩阵数组。
     * @param tX X轴的平移量。
     * @param tY Y轴的平移量。
     * @param tZ Z轴的平移量。
     * @param rX 旋转四元数的X分量。
     * @param rY 旋转四元数的Y分量。
     * @param rZ 旋转四元数的Z分量。
     * @param rW 旋转四元数的实部（W分量）。
     * @param sX X轴的缩放因子。
     * @param sY Y轴的缩放因子。
     * @param sZ Z轴的缩放因子。
     * @param outArray 输出矩阵数组。
     * @param outOffset 输出矩阵数组的偏移。
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
     * @en Transforms a 3D vector from one array to another using a transformation matrix.
     * @param source The source vector array.
     * @param sourceOffset The offset in the source array.
     * @param transform The transformation matrix.
     * @param result The resulting vector array.
     * @param resultOffset The offset in the resulting array.
     * @zh 使用变换矩阵将一个三维向量从一个数组转换到另一个数组。
     * @param source 源三维向量所在数组。
     * @param sourceOffset 源三维向量数组偏移。
     * @param transform  变换矩阵。
     * @param result 输出三维向量所在数组。
     * @param resultOffset 输出三维向量数组偏移。
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
     * @en Transforms a 3D vector array from one array to another using a transformation matrix, and normalizes the resulting vector array.
     * @param source The source normal vector array.
     * @param sourceOffset The offset in the source array.
     * @param transform The transformation matrix.
     * @param result The resulting normal vector array.
     * @param resultOffset The offset in the resulting array.
     * @zh 通过矩阵转换一个三维向量数组到另外一个归一化的三维向量数组。
     * @param source 源三维向量法线所在数组。
     * @param sourceOffset 源三维向量法线数组偏移。
     * @param transform 变换矩阵。
     * @param result 输出三维向量法线所在数组。
     * @param resultOffset 输出三维向量法线数组偏移。
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
     * @en Retrieves the version string from a URL.
     * @param url The URL to extract the version from.
     * @returns The version string or null if not found.
     * @zh 从URL中获取版本字符串。
     * @param url 要提取版本的URL。
     * @returns 版本字符串或null。
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

        Vector3.subtract(location, from, TEMPVector30);
        Vector3.normalize(TEMPVector30, TEMPVector30);

        angle.x = Math.asin(TEMPVector30.y);
        angle.y = Utils3D.arcTanAngle(-TEMPVector30.z, -TEMPVector30.x);
    }

    /**
     * @en Applies a rotation to a 3D vector using a quaternion.
     * @param source The original 3D vector.
     * @param rotation The quaternion array representing the rotation.
     * @param out The resulting rotated vector.
     * @zh 使用四元数对三维向量应用旋转。
     * @param source 原始三维向量。
     * @param rotation 旋转四元数数组。
     * @param out 结果旋转后的向量。
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
     * @en Modifies the weight of a quaternion.
     * @param f The original quaternion.
     * @param weight The weight to apply to the quaternion.
     * @param e The target data.
     * @zh 修改四元数的权重。
     * @param f 元数据
     * @param weight 要应用于四元数的权重。
     * @param e 目标数据。
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
    static _drawBound(debugLine: PixelLineSprite3D, boundBox: BoundBox | Bounds, color: Color): void {
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
     * @param rootSprite parent Sprite
     * @param checkSprite check Sprite
     * @param path pathArray
     * @returns 
     */
    static _getHierarchyPath(rootSprite: Node, checkSprite: Node, path: number[]): any[] {
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
     * @interanl
     * @param rootSprite parentNode
     * @param invPath PathArray
     * @returns 
     */
    static _getNodeByHierarchyPath(rootSprite: Node, invPath: number[]): Node {
        var sprite: Node = rootSprite;
        for (var i: number = invPath.length - 1; i >= 0; i--) {
            sprite = sprite.getChildAt(invPath[i]);
        }
        return sprite;
    }

    static _getParentNodeByHierarchyPath(rootSprite: Node, path: number[]): Node {
        let pathlength = path.length;
        let node: Node = rootSprite;
        for (let i = 0; i < pathlength; i++) {
            if (node)
                node = node.parent;
            else
                return null;
        }
        return node;
    }


    /**
     * @deprecated 请使用uint8ArrayToArrayBufferAsync函数代替
     * 将RenderTexture转换为Base64
     * @param rendertexture 渲染Buffer
     * @returns 
     */
    static uint8ArrayToArrayBuffer(rendertexture: RenderTexture) {
        return Utils.uint8ArrayToArrayBuffer(rendertexture);
    }

    /**
     * @en Converts a RenderTexture to a Base64 encoded string.
     * @param rendertexture The RenderTexture to convert.
     * @returns A promise that resolves to a Base64 string representing the RenderTexture.
     * @zh 将 RenderTexture 转换为 Base64 编码的字符串。
     * @param rendertexture 要转换的 RenderTexture。
     * @returns 一个 Promise，该 Promise 将解析为表示 RenderTexture 的 Base64 字符串。
     */
    static uint8ArrayToArrayBufferAsync(rendertexture: RenderTexture): Promise<String> {
        return Utils.uint8ArrayToArrayBufferAsync(rendertexture);
    }
}

(window as any).getRTBase64 = Utils3D.uint8ArrayToArrayBuffer;
const TEMPVector30 = new Vector3();