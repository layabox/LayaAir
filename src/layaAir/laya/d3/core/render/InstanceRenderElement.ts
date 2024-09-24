
import { IRenderContext3D } from "../../../RenderDriver/DriverDesign/3DRenderPass/I3DRenderPass";
import { ShaderPass } from "../../../RenderEngine/RenderShader/ShaderPass";
import { FastSinglelist } from "../../../utils/SingletonList";
import { MeshInstanceGeometry } from "../../graphics/MeshInstanceGeometry";

import { Mesh } from "../../resource/models/Mesh";
import { RenderContext3D } from "./RenderContext3D";
import { RenderElement } from "./RenderElement";

/**
 * @en The `InstanceRenderElement` is used for instanced rendering.
 * @zh `InstanceRenderElement` 类用于实例化渲染。
 */
export class InstanceRenderElement extends RenderElement {
    /** @internal */
    static maxInstanceCount: number = 1024;
    /**@internal */
    private static _pool: InstanceRenderElement[] = [];

    /**
     * @en Creates an instance of `InstanceRenderElement`, reusing from the pool if available.
     * @zh 创建 `InstanceRenderElement` 的实例，如果池中有可用的实例则重用。
     */
    static create(): InstanceRenderElement {
        let elemet = InstanceRenderElement._pool.length > 0 ? InstanceRenderElement._pool.pop() : new InstanceRenderElement();
        elemet._isInPool = false;
        elemet.clear();
        return elemet;
    }
    /**@internal */
    _instanceBatchElementList: FastSinglelist<RenderElement>
    /**@internal */
    _isInPool: boolean;
    /**
     * @internal
     * 判断是否需要更新数据 
     * */
    _isUpdataData: boolean;
    /** @internal */
    _invertFrontFace: boolean;
    /**@internal recover renderData*/
    private oriRendertype: number;
    /**@internal */
    private _InvertFront: boolean = false;

    constructor() {
        super();
        this.setGeometry(new MeshInstanceGeometry(null));
        this._instanceBatchElementList = new FastSinglelist();
        this._isUpdataData = true;
        this._invertFrontFace = false;
    }

    /**
     * @internal
     */
    getInvertFront(): boolean {
        return this._invertFrontFace;
    }

    set InvertFront(value: boolean) {
        this._InvertFront = value;

    }

    protected _createRenderElementOBJ() {
    }
    /** @ignore */
    compileShader(context: IRenderContext3D) {
        var passes: ShaderPass[] = this._subShader._passes;
    }
    /**@ignore */
    _renderUpdatePre(context: RenderContext3D) {
    }
    /**@ignore */
    updateInstanceData(mesh: Mesh) {
    }

    /**
     * @en Clears the instance render element.
     * @zh 清除实例渲染元素。
     */
    clear() {
        this._instanceBatchElementList.length = 0;
    }
    /**
     * @en Recovers the render element to its original state.
     * @zh 恢复渲染元素到原始状态。
     */
    recover(): void {
    }
}