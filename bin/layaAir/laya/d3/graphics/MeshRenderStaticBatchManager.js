import { BatchMark } from "../core/render/BatchMark";
import { SubMeshRenderElement } from "../core/render/SubMeshRenderElement";
import { StaticBatchManager } from "././StaticBatchManager";
import { SubMeshStaticBatch } from "././SubMeshStaticBatch";
import { VertexMesh } from "./Vertex/VertexMesh";
/**
 * @private
 * <code>MeshSprite3DStaticBatchManager</code> 类用于网格精灵静态批处理管理。
 */
export class MeshRenderStaticBatchManager extends StaticBatchManager {
    /**
     * 创建一个 <code>MeshSprite3DStaticBatchManager</code> 实例。
     */
    constructor() {
        /*[DISABLE-ADD-VARIABLE-DEFAULT-VALUE]*/
        super();
        /**@private */
        this._opaqueBatchMarks = [];
        this._updateCountMark = 0;
    }
    /**
     * @inheritDoc
     */
    /*override*/ _compare(left, right) {
        //按照合并条件排序，增加初始状态合并几率
        var lRender = left._render, rRender = right._render;
        var leftGeo = left.meshFilter.sharedMesh, rightGeo = right.meshFilter.sharedMesh;
        var lightOffset = lRender.lightmapIndex - rRender.lightmapIndex;
        if (lightOffset === 0) {
            var receiveShadowOffset = (lRender.receiveShadow ? 1 : 0) - (rRender.receiveShadow ? 1 : 0);
            if (receiveShadowOffset === 0) {
                var materialOffset = lRender.sharedMaterial.id - rRender.sharedMaterial.id; //多维子材质以第一个材质排序
                if (materialOffset === 0) {
                    var verDec = leftGeo._vertexBuffers[0].vertexDeclaration.id - rightGeo._vertexBuffers[0].vertexDeclaration.id; //TODO:以第一个Buffer为主,后期是否修改VB机制
                    if (verDec === 0) {
                        return rightGeo._indexBuffer.indexCount - leftGeo._indexBuffer.indexCount; //根据三角面排序
                    }
                    else {
                        return verDec;
                    }
                }
                else {
                    return materialOffset;
                }
            }
            else {
                return receiveShadowOffset;
            }
        }
        else {
            return lightOffset;
        }
    }
    /**
     * @inheritDoc
     */
    /*override*/ _getBatchRenderElementFromPool() {
        var renderElement = this._batchRenderElementPool[this._batchRenderElementPoolIndex++];
        if (!renderElement) {
            renderElement = new SubMeshRenderElement();
            this._batchRenderElementPool[this._batchRenderElementPoolIndex - 1] = renderElement;
            renderElement.staticBatchElementList = [];
        }
        return renderElement;
    }
    /**
     * @private
     */
    _getStaticBatch(rootOwner, number) {
        var key = rootOwner ? rootOwner.id : 0;
        var batchOwner = this._staticBatches[key];
        (batchOwner) || (batchOwner = this._staticBatches[key] = []);
        return (batchOwner[number]) || (batchOwner[number] = new SubMeshStaticBatch(rootOwner, number, MeshRenderStaticBatchManager._verDec));
    }
    /**
     * @inheritDoc
     */
    /*override*/ _initStaticBatchs(rootOwner) {
        this._quickSort(this._initBatchSprites, 0, this._initBatchSprites.length - 1);
        var lastCanMerage = false;
        var curStaticBatch;
        var batchNumber = 0;
        for (var i = 0, n = this._initBatchSprites.length; i < n; i++) {
            var sprite = this._initBatchSprites[i];
            if (lastCanMerage) {
                if (curStaticBatch.addTest(sprite)) {
                    curStaticBatch.add(sprite);
                }
                else {
                    lastCanMerage = false;
                    batchNumber++; //修改编号，区分批处理
                }
            }
            else {
                var lastIndex = n - 1;
                if (i !== lastIndex) {
                    curStaticBatch = this._getStaticBatch(rootOwner, batchNumber);
                    curStaticBatch.add(sprite);
                    lastCanMerage = true;
                }
            }
        }
        for (var key in this._staticBatches) {
            var batches = this._staticBatches[key];
            for (i = 0, n = batches.length; i < n; i++)
                batches[i].finishInit();
        }
        this._initBatchSprites.length = 0;
    }
    /**
     * @private
     */
    _destroyRenderSprite(sprite) {
        var staticBatch = sprite._render._staticBatch;
        staticBatch.remove(sprite);
        if (staticBatch._batchElements.length === 0) {
            var owner = staticBatch.batchOwner;
            var ownerID = owner ? owner.id : 0;
            var batches = this._staticBatches[ownerID];
            batches[staticBatch.number] = null;
            staticBatch.dispose();
            var empty = true;
            for (var i = 0; i < batches.length; i++) {
                if (batches[i])
                    empty = false;
            }
            if (empty) {
                delete this._staticBatches[ownerID];
            }
        }
    }
    /**
     * @inheritDoc
     */
    /*override*/ _clear() {
        super._clear();
        this._updateCountMark++;
    }
    /**
     * @inheritDoc
     */
    /*override*/ _garbageCollection() {
        for (var key in this._staticBatches) {
            var batches = this._staticBatches[key];
            for (var i = 0, n = batches.length; i < n; i++) {
                var staticBatch = batches[i];
                if (staticBatch._batchElements.length === 0) {
                    staticBatch.dispose();
                    batches.splice(i, 1);
                    i--, n--;
                    if (n === 0)
                        delete this._staticBatches[key];
                }
            }
        }
    }
    /**
     * @private
     */
    getBatchOpaquaMark(lightMapIndex, receiveShadow, materialID, staticBatchID) {
        var receiveShadowIndex = receiveShadow ? 1 : 0;
        var staLightMapMarks = (this._opaqueBatchMarks[lightMapIndex]) || (this._opaqueBatchMarks[lightMapIndex] = []);
        var staReceiveShadowMarks = (staLightMapMarks[receiveShadowIndex]) || (staLightMapMarks[receiveShadowIndex] = []);
        var staMaterialMarks = (staReceiveShadowMarks[materialID]) || (staReceiveShadowMarks[materialID] = []);
        return (staMaterialMarks[staticBatchID]) || (staMaterialMarks[staticBatchID] = new BatchMark);
    }
}
/** @private */
MeshRenderStaticBatchManager._verDec = VertexMesh.getVertexDeclaration("POSITION,NORMAL,COLOR,UV,UV1,TANGENT");
/** @private */
MeshRenderStaticBatchManager.instance = new MeshRenderStaticBatchManager();
