
import { IRenderContext3D } from "../../../RenderDriver/DriverDesign/3DRenderPass/I3DRenderPass";
import { ShaderPass } from "../../../RenderEngine/RenderShader/ShaderPass";
import { FastSinglelist } from "../../../utils/SingletonList";
import { MeshInstanceGeometry } from "../../graphics/MeshInstanceGeometry";

import { Mesh } from "../../resource/models/Mesh";
import { RenderContext3D } from "./RenderContext3D";
import { RenderElement } from "./RenderElement";

export class InstanceRenderElement extends RenderElement {
    /** @internal */
    static maxInstanceCount: number = 1024;
    /**@internal */
    private static _pool: InstanceRenderElement[] = [];

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

    compileShader(context: IRenderContext3D) {
        var passes: ShaderPass[] = this._subShader._passes;

    }


    _renderUpdatePre(context: RenderContext3D) {
    }

    updateInstanceData(mesh: Mesh) {
    }

    clear() {
        this._instanceBatchElementList.length = 0;
    }
    recover(): void {
    }
}