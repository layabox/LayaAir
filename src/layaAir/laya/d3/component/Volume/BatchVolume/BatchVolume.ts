import { SingletonList } from "../../../../utils/SingletonList";
import { BaseRender } from "../../../core/render/BaseRender";
import { StaticFlag } from "../../../core/Sprite3D";
import { Volume } from "../Volume";
import { BatchRender } from "./BatchRender";
import { StaticInstanceBatchRender } from "./StaticInstanceBatchRender";
import { StatiVertexMergeBatchRender } from "./StatiVertexMergeBatchRender";

/**
 * 类用来描述一个可合并渲染节点的体积
 */
export class StaticBatchVolume extends Volume {

    /**缓存可以合并的*/
    private _cacheRender: SingletonList<BaseRender>;
    /**已经合并了的BaseRender */
    private _batchRender: SingletonList<BaseRender>;

    /**是否根据LOD属性优化 */
    private _checkLOD: boolean;//是否考虑LOD

    //Internal Batch Component
    /**@internal 是否开启静态物体Instance的合批 */
    private _enableInstanceBatch: boolean;

    /**@internal 内置静态物体Instance合批 */
    private _instanceBatchRender: StaticInstanceBatchRender;

    //Instance Batch config
    //多少个实例  适合组成Instance合批
    //TODO

    /**@internal 是否开启顶点静态合批 */
    private _enableStaticMergeBatch: boolean;

    /**@internal 顶点静态合批*/
    private _vertexMergeBatchRender: StatiVertexMergeBatchRender;

    //CustomBatch自定义的batch流程
    private _enableCustomBatch: boolean;
    private _customBatch: BatchRender;

    /**
     * 合批是否考虑LOD
     */
    get checkLOD(): boolean {
        return this._checkLOD;
    }

    set checkLOD(value: boolean) {
        this._checkLOD = value;
    }

    /**
     * 是否开启Instance实例合批
     */
    get enableInstanceBatchRender() {
        return this._enableInstanceBatch;
    }

    set enableInstanceBatchRender(value: boolean) {
        this._enableInstanceBatch = value
        //禁用 打开 _instanceBatchRender
    }

    /**
     * 是否开启顶点合并合批
     */
    get enableMergeBatchRender() {
        return this._enableStaticMergeBatch;
    }

    set enableMergeBatchRender(value: boolean) {
        this._enableStaticMergeBatch = value;
        //禁用 打开 _mergeBatchRender TODO
    }

    /**
     * 创建一个<code>BatchVolume</code>实例
     */
    constructor() {
        super();
        this.checkLOD = true;
        this.enableInstanceBatchRender = true;
        this.enableMergeBatchRender = true;

    }

    /**
     * @inheritDoc
     * @override
     */
    protected _onEnable(): void {
        super._onEnable();
    }

    /**
     * @inheritDoc
     * @override
     */
    protected _onDisable(): void {
        super._onDisable();
    }

    /**
     * Restoring the Batch Render State
     */
    private _restorRenderNode() {
        //恢复所有渲染节点状态
        if (this._enableCustomBatch) {
            this._customBatch._restorRenderNode();
        } else {
            if (this._enableInstanceBatch) {
                this._instanceBatchRender._restorRenderNode();
            }
            if (this._enableStaticMergeBatch) {
                this._vertexMergeBatchRender._restorRenderNode();
            }
        }
    }

    /**
     * 当一个渲染节点进入体积
     * @param renderNode 
     */
    _addRenderNode?(renderNode: BaseRender): void {
        if (renderNode.renderNode.staticMask == StaticFlag.StaticBatch) {
            this._cacheRender.add(renderNode);
            if (this._batchRender.length > 0) {//if batch exited
                this.__addRenderNodeFromBatch(renderNode);
            }
        }
    }

    /**
     * 当一个渲染节点移除体积
     * @param renderNode    
     */
    _removeRenderNode(renderNode: BaseRender): void {
        if (renderNode.renderNode.staticMask == StaticFlag.StaticBatch) {
            if (this._batchRender.indexof(renderNode) != -1) {
                this.__removeRenderNodeFromBatch(renderNode);
            }
        }
    }

    __addRenderNodeFromBatch(renderNode: BaseRender) {
        //动态增加合并批次
    }

    __removeRenderNodeFromBatch(renderNode: BaseRender) {
        //动态删除合并批次
    }

    /**必要时需要手动调用,根据Volume里面的值,进行合批*/
    reBatch() {
        if (this._customBatch) {
            this._customBatch._clear();
            //this._customBatch._add
        } else {
            //get isntanceBatch list TODO
            //get VertexMergeBatch list TODO
            let instanceList: BaseRender[] = [];
            let vertexMergeList: BaseRender[] = [];
            this._getBatchList(instanceList, vertexMergeList);
            if (this._enableInstanceBatch) {
                this._instanceBatchRender._clear();
                this._instanceBatchRender.addList(instanceList);
                this._instanceBatchRender.reBatch();
            }
            if (this._enableStaticMergeBatch) {
                this._vertexMergeBatchRender._clear();
                this._vertexMergeBatchRender._addList(instanceList);
                this._vertexMergeBatchRender.reBatch();
            }
        }
    }

    //规则函数
    private _getBatchList(instanceBatchList: BaseRender[], vertexBatchList: BaseRender[]) {
        //TODO  根据规则  分析_cacheRender里面的值
    }
}