import { RenderableSprite3D } from "./RenderableSprite3D";
import { MeshFilter } from "./MeshFilter";
import { MeshRenderer } from "./MeshRenderer";
import { Mesh } from "../resource/models/Mesh"
import { Node } from "../../display/Node"
import { Sprite3D } from "./Sprite3D";

/**
 * @deprecated
 * <code>MeshSprite3D</code> 类用于创建网格。
 */
export class MeshSprite3D extends RenderableSprite3D {
    private _meshFilter: MeshFilter;

    /**
     * 网格过滤器。
     */
    get meshFilter(): MeshFilter {
        return (<MeshFilter>this._meshFilter);
    }

    /**
     * 网格渲染器。
     */
    get meshRenderer(): MeshRenderer {
        return (<MeshRenderer>this._render);
    }

    /**
     * 创建一个 <code>MeshSprite3D</code> 实例。
     * @param mesh 网格,同时会加载网格所用默认材质。
     * @param name 名字。
     */
    constructor(mesh: Mesh = null, name: string = null) {
        super(name);
        this._meshFilter = this.addComponent(MeshFilter);
        this._render = this.addComponent(MeshRenderer);
        (mesh) && (this._meshFilter.sharedMesh = mesh);
    }
}

