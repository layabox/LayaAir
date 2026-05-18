import { Sprite3D } from "../../../d3/core/Sprite3D";
import { Mesh, skinnedMatrixCache } from "../../../d3/resource/models/Mesh";
import { Stat } from "../../../utils/Stat";
import { ISkinRenderNode } from "../../RenderModuleData/Design/3D/I3DRenderModuleData";
import { LayaXBaseRenderNode } from "./LayaXBaseRenderNode";
import { LayaXTransform3D } from "./LayaXTransform3D";

/**
 * LayaX SkinRenderNode bridge.
 *
 * Provides skinned mesh rendering data to the Rust side via `conchLayaXSkinRenderNode`.
 * Bone transforms and inverse bind poses are pushed to native for GPU skinning.
 */
export class LayaXSkinRenderNode extends LayaXBaseRenderNode implements ISkinRenderNode {

    private boneNums: number = 0;

    /** @internal */
    protected _getNativeObj(): void {
        this._nativeObj = new (window as any).conchLayaXSkinRenderNode();
    }

    constructor() {
        super();
    }

    computeSkinnedData(): void {
        if (this.boneNums !== 0) {
            this._nativeObj.computeSkinnedData(Stat.loopCount);
        }
    }

    setRootBoneTransfom(value: Sprite3D): void {
        this._nativeObj.setRootBoneTransfom((value.transform as LayaXTransform3D)._nativeObj);
    }

    setOwnerTransform(value: Sprite3D): void {
        this._nativeObj.setOwnerTransform((value.transform as LayaXTransform3D)._nativeObj);
    }

    setCacheMesh(cacheMesh: Mesh): void {
        // Inverse bind poses
        this._nativeObj.resizeCacheMeshInverseBindPoes(cacheMesh._inverseBindPoses.length);
        for (let i = 0, n = cacheMesh._inverseBindPoses.length; i < n; i++) {
            this._nativeObj.setinverseBindPoseDataByIndex(i, cacheMesh._inverseBindPoses[i]);
        }

        // Skinned matrix caches
        this._nativeObj.resizeMatrixCache(cacheMesh._skinnedMatrixCaches.length);
        for (let i = 0, n = cacheMesh._skinnedMatrixCaches.length; i < n; i++) {
            let cache: skinnedMatrixCache = cacheMesh._skinnedMatrixCaches[i];
            if (!cache) continue;
            this._nativeObj.setMatrixCacheByIndex(i, cache.batchBoneIndex, cache.batchIndex, cache.subMeshIndex);
        }

        // Sub-mesh count
        this._nativeObj.setSubMeshCount(cacheMesh.subMeshCount);

        // Bone indices per sub-mesh
        this._nativeObj.resizeBoneIndicesList(cacheMesh.subMeshCount);
        for (let i = 0, n = cacheMesh.subMeshCount; i < n; i++) {
            this._nativeObj.setBoneIndicesList(i, cacheMesh.getSubMesh(i)._boneIndicesList);
        }
    }

    setBones(value: Sprite3D[]): void {
        this._nativeObj.clearBoneTransform();
        for (let i = 0, n = value.length; i < n; i++) {
            if (value[i]) {
                this._nativeObj.addBoneTransform((value[i].transform as LayaXTransform3D)._nativeObj);
                this.boneNums++;
            }
        }
    }

    setSkinnedData(value: Array<Float32Array[]>): void {
        this._nativeObj.resizeSkinnedData(value.length);
        for (let i = 0, n = value.length; i < n; i++) {
            this._nativeObj.setSkinnedDataByIndex(i, value[i]);
        }
    }
}
