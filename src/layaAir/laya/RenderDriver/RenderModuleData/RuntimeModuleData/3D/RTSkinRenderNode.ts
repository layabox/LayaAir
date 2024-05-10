import { Sprite3D } from "../../../../d3/core/Sprite3D";
import { Mesh, skinnedMatrixCache } from "../../../../d3/resource/models/Mesh";
import { Stat } from "../../../../utils/Stat";
import { ISkinRenderNode } from "../../Design/3D/I3DRenderModuleData";
import { NativeTransform3D } from "./NativeTransform3D";
import { RTBaseRenderNode } from "./RTBaseRenderNode";

/**
 * 骨骼动画渲染节点，包含骨骼数据计算
 */
export class RTSkinRenderNode extends RTBaseRenderNode implements ISkinRenderNode {

    //create runtime Node
    protected _getNativeObj() {
        this._nativeObj = new (window as any).conchRTSkinRenderNode();
    }

    constructor() {
        super();
    }

    computeSkinnedData(): void {
        this._nativeObj.computeSkinnedData(Stat.loopCount);
    }

    setRootBoneTransfom(value: Sprite3D): void {
        this._nativeObj.setRootBoneTransfom((value.transform as NativeTransform3D)._nativeObj)
    }

    setOwnerTransform(value: Sprite3D): void {
        this._nativeObj.setOwnerTransform((value.transform as NativeTransform3D)._nativeObj);
    }

    setCacheMesh(cacheMesh: Mesh): void {
        // this._cacheMesh._inverseBindPoses
        this._nativeObj.resizeCacheMeshInverseBindPoes(cacheMesh._inverseBindPoses.length);
        for (var i = 0, n = cacheMesh._inverseBindPoses.length; i < n; i++) {
            this._nativeObj.setinverseBindPoseDataByIndex(i, cacheMesh._inverseBindPoses[i]);
        }

        //this._cacheMesh._skinnedMatrixCaches
        this._nativeObj.resizeMatrixCache(cacheMesh._skinnedMatrixCaches.length);
        for (var i = 0, n = cacheMesh._skinnedMatrixCaches.length; i < n; i++) {
            let cache: skinnedMatrixCache = cacheMesh._skinnedMatrixCaches[i]
            this._nativeObj.setMatrixCacheByIndex(i, cache.batchBoneIndex, cache.batchIndex, cache.subMeshIndex);
        }

        //this._cacheMesh.subMeshCount
        this._nativeObj.setSubMeshCount(cacheMesh.subMeshCount);

        //Array<Array<Uint16Array>> _boneIndicesList
        this._nativeObj.resizeBoneIndicesList(cacheMesh.subMeshCount);
        for (var i = 0, n = cacheMesh.subMeshCount; i < n; i++) {
            this._nativeObj.setBoneIndicesList(i, cacheMesh.getSubMesh(i)._boneIndicesList);
        }
    }
    setBones(value: Sprite3D[]): void {
        this._nativeObj.clearBoneTransform();
        for (var i = 0, n = value.length; i < n; i++) {
            this._nativeObj.addBoneTransform((value[i].transform as NativeTransform3D)._nativeObj);
        }

    }

    setSkinnedData(value: Array<Float32Array[]>): void {
        this._nativeObj.resizeSkinnedData(value.length);
        for (var i = 0, n = value.length; i < n; i++) {
            this._nativeObj.setSkinnedDataByIndex(i, value[i]);
        }
    }
}