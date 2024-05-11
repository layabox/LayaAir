import { Sprite3D } from "../../../../d3/core/Sprite3D";
import { Transform3D } from "../../../../d3/core/Transform3D";
import { Mesh, skinnedMatrixCache } from "../../../../d3/resource/models/Mesh";
import { Utils3D } from "../../../../d3/utils/Utils3D";
import { Matrix4x4 } from "../../../../maths/Matrix4x4";
import { Stat } from "../../../../utils/Stat";
import { IRenderContext3D } from "../../../DriverDesign/3DRenderPass/I3DRenderPass";
import { ISkinRenderNode } from "../../Design/3D/I3DRenderModuleData";
import { WebBaseRenderNode } from "./WebBaseRenderNode";

export class WebSkinRenderNode extends WebBaseRenderNode implements ISkinRenderNode {
    constructor() {
        super();
        this.set_renderUpdatePreCall(this, this._renderUpdate);
    }
    /** @internal */
    private _cacheRootBone: Transform3D;
    /** @internal */
    private _owner: Transform3D;
    /** @internal */
    private _cacheMesh: Mesh;
    /** @internal */
    private _skinnedData: any[];
    /** @internal */
    private _skinnedDataLoopMarks: Uint32Array;

    /**@internal */
    private _bones: Sprite3D[] = [];
    setRootBoneTransfom(value: Sprite3D) {
        this._cacheRootBone = value.transform;
    }

    setOwnerTransform(value: Sprite3D) {
        this._owner = value.transform;
    }

    setCacheMesh(cacheMesh: Mesh) {
        this._cacheMesh = cacheMesh;
        this._skinnedDataLoopMarks = new Uint32Array(cacheMesh._inverseBindPoses.length);
    }

    setBones(value: Sprite3D[]) {
        this._bones = value;
    }

    setSkinnedData(value: any[]) {
        this._skinnedData = value;
    }

    /**
     * 计算动画数据
     */
    computeSkinnedData(): void {
        //TODO
        var bindPoses: Matrix4x4[] = this._cacheMesh._inverseBindPoses;
        var pathMarks: skinnedMatrixCache[] = this._cacheMesh._skinnedMatrixCaches;
        for (var i: number = 0, n: number = this._cacheMesh.subMeshCount; i < n; i++) {
            var subMeshBoneIndices: Uint16Array[] = ((this._cacheMesh.getSubMesh(i)))._boneIndicesList;
            var subData: Float32Array[] = this._skinnedData[i];
            for (var j: number = 0, m: number = subMeshBoneIndices.length; j < m; j++) {
                var boneIndices: Uint16Array = subMeshBoneIndices[j];
                this._computeSubSkinnedData(bindPoses, boneIndices, subData[j], pathMarks);
            }
        }
    }

    /**
     * @internal
     */
    private _computeSubSkinnedData(bindPoses: Matrix4x4[], boneIndices: Uint16Array, data: Float32Array, matrixCaches: skinnedMatrixCache[]): void {
        for (let k: number = 0, q: number = boneIndices.length; k < q; k++) {
            let index: number = boneIndices[k];
            if (this._skinnedDataLoopMarks[index] === Stat.loopCount) {
                let c: skinnedMatrixCache = matrixCaches[index];
                let preData: Float32Array = this._skinnedData[c.subMeshIndex][c.batchIndex];
                let srcIndex: number = c.batchBoneIndex * 16;
                let dstIndex: number = k * 16;
                for (let d: number = 0; d < 16; d++)
                    data[dstIndex + d] = preData[srcIndex + d];
            } else {
                let bone = this._bones[index];
                if (bone)
                    Utils3D._mulMatrixArray(bone.transform.worldMatrix.elements, bindPoses[index].elements, 0, data, k * 16);
                this._skinnedDataLoopMarks[index] = Stat.loopCount;
            }
        }
    }

    _renderUpdate(context3D: IRenderContext3D): void {
        let mat = this._owner.worldMatrix;
        let worldParams = this._worldParams;
        worldParams.x = this._owner.getFrontFaceValue();
        if (this._cacheRootBone) {
            mat = Matrix4x4.DEFAULT;
            worldParams.x = 1;
        }
        this._applyLightProb();
        this._applyReflection();
        this.shaderData.setMatrix4x4(Sprite3D.WORLDMATRIX, mat);
        this.shaderData.setVector(Sprite3D.WORLDINVERTFRONT, worldParams);
    }

}