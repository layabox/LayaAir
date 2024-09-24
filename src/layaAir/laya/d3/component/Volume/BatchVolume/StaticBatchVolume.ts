import { SingletonList } from "../../../../utils/SingletonList";
import { BaseRender } from "../../../core/render/BaseRender";
import { Sprite3D, StaticFlag } from "../../../core/Sprite3D";
import { Volume } from "../Volume";
import { BatchRender } from "./BatchRender";
import { StaticInstanceBatchRender } from "./StaticInstanceBatchRender";
import { StatiVertexMergeBatchRender } from "./StatiVertexMergeBatchRender";

/**
 * @en Class used to describe the volume of a mergeable render node.
 * @zh 用来描述一个可合并渲染节点的体积。
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

    /**
     * @internal
     * @returns 
     */
    private _getStaticInstanceBatchRender(): StaticInstanceBatchRender {
        let render = (this.owner as Sprite3D).getComponent(StaticInstanceBatchRender);
        if (!render) {
            render = (this.owner as Sprite3D).addComponent(StaticInstanceBatchRender) as StaticInstanceBatchRender;
        }
        return render;
    }

    /**
     * @internal
     * @returns 
     */
    private _getStatiVertexMergeBatchRender(): StatiVertexMergeBatchRender {
        let render = (this.owner as Sprite3D).getComponent(StatiVertexMergeBatchRender);
        if (!render) {
            render = (this.owner as Sprite3D).addComponent(StatiVertexMergeBatchRender) as StatiVertexMergeBatchRender;
        }
        return render;
    }

    /**
     * @en Whether LOD (Level of Detail) is considered in batching.
     * @zh 合批是否考虑 LOD（细节层次）。
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
     * @en Whether static instance batching is enabled.
     * @zh 是否启用静态实例合批渲染。
     */
    get enableStaticInstanceBatchRender(): boolean {
        return this._enableStaticInstanceBatch;
    }

    set enableStaticInstanceBatchRender(value: boolean) {
        if (!this._instanceBatchRender && value) {
            this._instanceBatchRender = this._getStaticInstanceBatchRender();
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
     * @en Whether static vertex merge batching is enabled.
     * @zh 是否启用静态顶点合并合批。
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
     * @en Whether custom batching is enabled.
     * @zh 是否启用自定义合批。
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
     * @en The custom batch renderers.
     * @zh 自定义的合批渲染器。
     */
    get customBatchRenders() {
        return this._customBatchs;
    }
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

    /**
     * @en Constructor method，initialize rendering related settings.
     * @zh 构造方法，初始化渲染相关的设置。
     */
    constructor() {
        super();
        this.checkLOD = true;
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
     * @internal
     * @protected
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
     * @internal
     * @protected
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
     * @internal
     * @override
     * @en Adds a render node to the volume when it enters.
     * This method handles the addition of static batch render nodes.
     * @param renderNode The render node to be added.
     * @zh 当一个渲染节点进入体积时添加该节点。
     * 此方法处理静态批次渲染节点的添加。
     * @param renderNode 要添加的渲染节点。
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
     * @internal
     * @override
     * @en Removes a render node from the volume when it exits.
     * This method handles the removal of static batch render nodes.
     * @param renderNode The render node to be removed.
     * @zh 当一个渲染节点移出体积时移除该节点。
     * 此方法处理静态批次渲染节点的移除。
     * @param renderNode 要移除的渲染节点。
     */
    _removeRenderNode(renderNode: BaseRender): void {
        if (renderNode.renderNode.staticMask == StaticFlag.StaticBatch) {
            if (this._batchRender.indexof(renderNode) != -1) {
                this.__removeRenderNodeFromBatch(renderNode);
                this._batchRender.remove(renderNode);
            }
        }
    }

    /**
     * @internal
     * @en Volume change
     * @zh 体积变化
     */
    _VolumeChange() {
        super._VolumeChange();
        this._cacheRender.clear();
    }

    /**
     * @internal
     * @en Called when the component starts.
     * Initiates the rebatching process.
     * @zh 当组件启动时调用。
     * 启动重新合批过程。
     */
    onStart() {
        this.reBatch();
    }

    /**
     * @en Rebatches the render nodes, clearing previous states.
     * This method should be called manually when necessary. Performs batching based on the values in the Volume.
     * @zh 重新合批渲染节点，清理先前的状态。
     * 必要时需要手动调用此方法。根据 Volume 中的值执行合批。
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