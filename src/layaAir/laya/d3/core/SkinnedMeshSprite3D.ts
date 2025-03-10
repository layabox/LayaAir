import { Mesh } from "../resource/models/Mesh";
import { MeshFilter } from "./MeshFilter";
import { RenderableSprite3D } from "./RenderableSprite3D";
import { SkinnedMeshRenderer } from "./SkinnedMeshRenderer";

/**
 * @en The `SkinnedMeshSprite3D` class is used for sprite with skinned mesh and bone nodes.
 * @zh `SkinnedMeshSprite3D` 类用于绑点骨骼节点精灵。
 */
export class SkinnedMeshSprite3D extends RenderableSprite3D {
    /**@internal */
    static _tempArray0: any[] = [];

  

    private _meshFilter: MeshFilter;

    /**
     * @en Mesh filter component.
     * @zh 网格过滤器。
     */
    get meshFilter(): MeshFilter {
        return this._meshFilter;
    }

    /**
     * @en Skinned mesh renderer component.
     * @zh 网格渲染器。
     */
    get skinnedMeshRenderer(): SkinnedMeshRenderer {
        return (<SkinnedMeshRenderer>this._render);
    }

    /**
     * @ignore
     * @en Creates an instance of SkinnedMeshSprite3D.
     * @param mesh The mesh to be used. The default material for the mesh will also be loaded.
     * @param name The name of the sprite.
     * @zh 创建一个 SkinnedMeshSprite3D 的实例。
     * @param mesh 网格,同时会加载网格所用默认材质。
     * @param name 名字。
     */
    constructor(mesh: Mesh = null, name: string = null) {
        super(name);
        this._meshFilter = this.addComponent(MeshFilter);
        this._render = this.addComponent(SkinnedMeshRenderer);
        (mesh) && (this._meshFilter.sharedMesh = mesh);
    }

    /**
     * @en Destroy the SkinnedMeshSprite3D instance.
     * @param destroyChild Whether to destroy child nodes.
     * @zh 销毁 SkinnedMeshSprite3D 实例。
     * @param destroyChild 是否销毁子节点。
     */
    destroy(destroyChild: boolean = true): void {
        if (this._destroyed)
            return;
        super.destroy(destroyChild);
        this._meshFilter.destroy();
    }
}

