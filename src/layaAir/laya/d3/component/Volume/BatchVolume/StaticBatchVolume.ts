import { SingletonList } from "../../../../utils/SingletonList";
import { BaseRender } from "../../../core/render/BaseRender";
import { Sprite3D, StaticFlag } from "../../../core/Sprite3D";
import { Volume } from "../Volume";
import { BatchRender } from "./BatchRender";
import { StaticInstanceBatchRender } from "./StaticInstanceBatchRender";
import { StatiVertexMergeBatchRender } from "./StatiVertexMergeBatchRender";

/**
 * 类用来描述一个可合并渲染节点的体积
 */
export class StaticBatchVolume extends Volume {

    /**@internal 缓存可以合并的*/
    private _cacheRender: SingletonList<BaseRender>;

    /**@internal 已经合并了的BaseRender */
    private _batchRender: SingletonList<BaseRender>;

    /**@internal 是否根据LOD属性优化 */
    private _checkLOD: boolean;//是否考虑LOD

    /** StaticInstanceBatch */
    /**@internal 是否开启静态物体Instance的合批 */
    private _enableStaticInstanceBatch: boolean;

    /**@internal 内置静态物体Instance合批 */
    private _instanceBatchRender: StaticInstanceBatchRender;

    /**StaticVertexMergeBatch */
    /**@internal 是否开启顶点静态合批 TODO */
    private _enableStaticVertexMergeBatch: boolean;

    /**@internal 顶点静态合批  TODO*/
    private _vertexMergeBatchRender: StatiVertexMergeBatchRender;

    /**@internal CustomBatch自定义的batch流程*/
    private _enableCustomBatch: boolean;
    /**@internal */
    private _customBatchs: BatchRender[] = [];


    private _getStaticInstanceBatchRender():StaticInstanceBatchRender{
        let render =(this.owner as Sprite3D).getComponent(StaticInstanceBatchRender);
        if(!render){
            render = (this.owner as Sprite3D).addComponent(StaticInstanceBatchRender) as StaticInstanceBatchRender;
        }
        return render;
        
    }

    private _getStatiVertexMergeBatchRender():StatiVertexMergeBatchRender{
        let render =(this.owner as Sprite3D).getComponent(StatiVertexMergeBatchRender);
        if(!render){
            render = (this.owner as Sprite3D).addComponent(StatiVertexMergeBatchRender) as StatiVertexMergeBatchRender;
        }
        return render;
    }

    /**
     * 合批是否考虑LOD
     */
    get checkLOD(): boolean {
        return this._checkLOD;
    }

    set checkLOD(value: boolean) {
        this._checkLOD = value;
        if (this._enableStaticInstanceBatch) {
            this._instanceBatchRender.checkLOD = value;
        }
        if (this._enableStaticVertexMergeBatch) {
            this._vertexMergeBatchRender.checkLOD = value;
        }
        if (this._enableCustomBatch) {
            this._customBatchs.forEach(element => {
                element.checkLOD = value;
            });
        }
    }

    /**
     * 开启静态Instance实例合批
     */
    get enableStaticInstanceBatchRender(): boolean {
        return this._enableStaticInstanceBatch;
    }

    set enableStaticInstanceBatchRender(value: boolean) {
        if (!this._instanceBatchRender && value) {
            this._instanceBatchRender =this._getStaticInstanceBatchRender();
        }
        if (value == this._enableStaticInstanceBatch)
            return;
        if (value) {
            this._instanceBatchRender.enabled = true;
        } else {
            this._instanceBatchRender.enabled = false;
        }
        this._enableStaticInstanceBatch = value;
    }

    /**
     * 开启静态顶点合批
     */
    get enableMergeBatchRender() {
        return this._enableStaticVertexMergeBatch;
    }

    set enableMergeBatchRender(value: boolean) {
        if (!this._vertexMergeBatchRender && value) {
            this._vertexMergeBatchRender = this._getStatiVertexMergeBatchRender();
        }
        if (value == this._enableStaticVertexMergeBatch)
            return;
        if (value) {
            this._vertexMergeBatchRender.enabled = true;
        } else {
            this._vertexMergeBatchRender.enabled = false;
        }
        this._enableStaticVertexMergeBatch = value;
    }

    /**
     * 开启自定义合批
     */
    get enableCustomBatchRender() {
        return this._enableCustomBatch;
    }

    set enableCustomBatchRender(value: boolean) {
        this._enableCustomBatch = value;
        this._customBatchs.forEach(element => {
            element.enabled = value;
        });
    }

    /**
     * 设置自定义的合批方案BatchRender
     */
    set customBatchRenders(value: BatchRender[]) {
        if (this._customBatchs) {
            this._customBatchs.forEach(element => {
                (this.owner as Sprite3D)._destroyComponent(element);
            });
        }
        this._customBatchs = value;
        this._customBatchs.forEach(element => {
            (this.owner as Sprite3D).addComponentInstance(element);
        });
        this.enableCustomBatchRender = this._enableCustomBatch;
    }

    get customBatchRenders() {
        return this._customBatchs;
    }

    /**
     * 创建一个<code>BatchVolume</code>实例
     */
    constructor() {
        super();
        this.checkLOD = false;
        this._enableStaticInstanceBatch = false;
        this._enableStaticVertexMergeBatch = false;
        this._cacheRender = new SingletonList<BaseRender>();
        this._batchRender = new SingletonList<BaseRender>();
        this._enableCustomBatch = false;
    }

    /**     
     * Restoring the Batch Render State
     */
    private _restorRenderNode() {
        if (this.enableCustomBatchRender) {
            this._customBatchs.forEach(element => {
                element._clear();
            });
        }
        if (this._enableStaticInstanceBatch) {
            this._instanceBatchRender._clear();
        }
        if (this.enableCustomBatchRender) {
            this._vertexMergeBatchRender._clear();
        }
    }

    /**
     * add one RenderNode
     * @param renderNode 
     * @returns 
     */
    private __addRenderNodeToBatch(renderNode: BaseRender) {
        //动态增加合并批次
        if (this.enableCustomBatchRender) {
            this._customBatchs.forEach(element => {
                if (element._batchOneRender(renderNode)) return;
            });
        }
        if (this._enableStaticInstanceBatch) {
            if (this._instanceBatchRender._batchOneRender(renderNode)) return;
        }
        if (this.enableCustomBatchRender) {
            if (this._vertexMergeBatchRender._batchOneRender(renderNode)) return;
        }
    }

    /**
     * remove one RenderNode
     * @param renderNode 
     */
    private __removeRenderNodeFromBatch(renderNode: BaseRender) {
        //动态删除合并批次
        renderNode._batchRender._removeOneRender(renderNode);
    }

    /**
     * @inheritDoc
     * @override
     */
    protected _onEnable(): void {
        super._onEnable();
        if (this._enableStaticInstanceBatch)
            this._instanceBatchRender && (this._instanceBatchRender.enabled = true);
        if (this._enableStaticVertexMergeBatch)
            this._vertexMergeBatchRender && (this._vertexMergeBatchRender.enabled = true);
        if (this.enableCustomBatchRender) {
            this._customBatchs.forEach(element => {
                element.enabled = true;
            });
        }
    }

    /**
     * @inheritDoc
     * @override
     */
    protected _onDisable(): void {
        super._onDisable();
        if (this._enableStaticInstanceBatch)
            this._instanceBatchRender && (this._instanceBatchRender.enabled = false);
        if (this._enableStaticVertexMergeBatch)
            this._vertexMergeBatchRender && (this._vertexMergeBatchRender.enabled = false);
        if (this.enableCustomBatchRender) {
            this._customBatchs.forEach(element => {
                element.enabled = false;
            });
        }
    }

    /**
     * 当一个渲染节点进入体积
     * @internal
     * @override
     * @param renderNode 
     */
    _addRenderNode?(renderNode: BaseRender): void {
        if (renderNode.renderNode.staticMask == StaticFlag.StaticBatch) {
            if (this._cacheRender.indexof(renderNode) != -1) {
                return;
            }
            this._cacheRender.add(renderNode);
            if (this._batchRender.length > 0) {//if batch exited
                this.__addRenderNodeToBatch(renderNode);
            }
        }
    }

    /**
     * 当一个渲染节点移除体积
     * @internal
     * @override
     * @param renderNode    
     */
    _removeRenderNode(renderNode: BaseRender): void {
        if (renderNode.renderNode.staticMask == StaticFlag.StaticBatch) {
            if (this._batchRender.indexof(renderNode) != -1) {
                this.__removeRenderNodeFromBatch(renderNode);
                this._batchRender.remove(renderNode);
            }
        }
    }

    onStart(){
        this.reBatch();
    }

    /**
     * 重新合批,将清理前面状态
     * 必要时需要手动调用,根据Volume里面的值,进行合批
     */
    reBatch() {
        this._cacheRender.elements.length = this._cacheRender.length;
        this._batchRender.clear();
        this._restorRenderNode();
        if (this.enableCustomBatchRender) {
            this._customBatchs.forEach(element => {
                element.addList(this._cacheRender.elements);
                element.reBatch();
            });
        }
        if (this._enableStaticInstanceBatch) {
            this._instanceBatchRender.addList(this._cacheRender.elements);
            this._instanceBatchRender.reBatch();
        }
        if (this.enableCustomBatchRender) {
            this._vertexMergeBatchRender.addList(this._cacheRender.elements);
            this._vertexMergeBatchRender.reBatch();
        }
        //UpdateBatch Render
        for (var i = 0, n = this._cacheRender.length; i < n; i++) {
            (this._cacheRender.elements[i]._batchRender) && this._batchRender.add(this._cacheRender.elements[i]);
        }
    }
}