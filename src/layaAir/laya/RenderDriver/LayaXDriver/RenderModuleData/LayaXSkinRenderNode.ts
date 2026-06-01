import { Sprite3D } from "../../../d3/core/Sprite3D";
import { Mesh, skinnedMatrixCache } from "../../../d3/resource/models/Mesh";
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

    /** 方案 B：骨骼 entity id 是否已注册给 native（一次性）。setBones 重新绑定时置 false。 */
    private _bonesRegistered: boolean = false;

    /** @internal */
    protected _getNativeObj(): void {
        this._nativeObj = new (window as any).conchLayaXSkinRenderNode();
    }

    constructor() {
        super();
    }

    computeSkinnedData(): void {
        // 方案 B：骨骼矩阵计算已下沉 Rust（在 cull 之后对可见节点计算），此处不再触发计算。
        // 仅做一次性的骨骼 entity id 注册——骨骼节点入场景后其 native handle 才有效，
        // 故延迟到首帧 renderUpdate 重试，成功后不再触发（boneNums===0 时直接视为完成）。
        if (this._bonesRegistered) return;
        if (this.boneNums === 0) { this._bonesRegistered = true; return; }
        if (this._nativeObj.tryCommitBoneEntities()) {
            this._bonesRegistered = true;
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

        // 方案 B：上面把原料交给 native 后，一次性注册给 Rust（submesh 数 / invBindPose / 逐 batch index）。
        this._nativeObj.commitCacheMeshSkinData();
    }

    setBones(value: Sprite3D[]): void {
        this._nativeObj.clearBoneTransform();
        this.boneNums = 0;
        for (let i = 0, n = value.length; i < n; i++) {
            if (value[i]) {
                this._nativeObj.addBoneTransform((value[i].transform as LayaXTransform3D)._nativeObj);
                this.boneNums++;
            }
        }
        // 骨骼重新绑定：entity id 需重新注册（延迟到下次 computeSkinnedData 重试）。
        this._bonesRegistered = false;
    }

    setSkinnedData(value: Array<Float32Array[]>): void {
        this._nativeObj.resizeSkinnedData(value.length);
        for (let i = 0, n = value.length; i < n; i++) {
            this._nativeObj.setSkinnedDataByIndex(i, value[i]);
        }
    }
}
