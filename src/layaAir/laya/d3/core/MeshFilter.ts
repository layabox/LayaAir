import { Component } from "../../components/Component";
import { ShaderDefine } from "../../RenderEngine/RenderShader/ShaderDefine";
import { Mesh } from "../resource/models/Mesh";
import { MeshRenderer } from "./MeshRenderer";

/**
 * <code>MeshFilter</code> 类用于创建网格过滤器。
 */
export class MeshFilter extends Component {
    /** @internal */
    static _meshVerticeDefine: Array<ShaderDefine> = [];

    /** @internal */
    private _sharedMesh: Mesh;

    constructor() {
        super();

        this.runInEditor = true;
    }

    /**
     * @internal
     */
    protected _onEnable(): void {
        const render = this.owner.getComponent(MeshRenderer) as MeshRenderer;
        render && render._enabled && render._onMeshChange(this._sharedMesh);
    }

    /**
     * @internal
     */
    protected _onDisable(): void {
        const render = this.owner.getComponent(MeshRenderer) as MeshRenderer;
       // render && render._enabled && render._onMeshChange(null);
    }

    /**
     * 共享网格。
     */
    get sharedMesh(): Mesh {
        return this._sharedMesh;
    }

    set sharedMesh(value: Mesh) {
        if (this._sharedMesh !== value) {
            //meshReference
            var lastValue: Mesh = this._sharedMesh;
            if (lastValue) {
                lastValue._removeReference();
            }
            if (value) {
                value._addReference();
            }
            this._sharedMesh = value;

            const render = this.owner.getComponent(MeshRenderer);
            if (!render) {
                return;
            }
            render._onMeshChange(value);
            this._sharedMesh = value;
        }
    }

    /**
     * @internal
     * @protected
     */
    protected _onDestroy() {
        (this._sharedMesh) && (this._sharedMesh._removeReference(), this._sharedMesh = null);
    }

    /**
     * @internal
     * @param dest 
     */
    _cloneTo(dest: Component): void {
        let meshfilter = dest as MeshFilter;
        meshfilter.sharedMesh = this.sharedMesh;
        super._cloneTo(dest);
    }

}


