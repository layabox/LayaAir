import { RenderableSprite3D } from "./RenderableSprite3D";
import { MeshFilter } from "./MeshFilter";
import { MeshRenderer } from "./MeshRenderer";
import { Material } from "./material/Material";
import { Mesh } from "../resource/models/Mesh"
import { Node } from "../../display/Node"
import { Loader } from "../../net/Loader";
import { Sprite3D } from "./Sprite3D";
import { Vector4 } from "../../maths/Vector4";

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

    /**
     * @inheritDoc
     * @override
     * @internal
     */
    _parse(data: any, spriteMap: any): void {
        super._parse(data, spriteMap);
        var render: MeshRenderer = this.meshRenderer;
        var lightmapIndex: any = data.lightmapIndex;
        (lightmapIndex != null) && (render.lightmapIndex = lightmapIndex);
        var lightmapScaleOffsetArray: any[] = data.lightmapScaleOffset;
        (lightmapScaleOffsetArray) && (render.lightmapScaleOffset = new Vector4(lightmapScaleOffsetArray[0], lightmapScaleOffsetArray[1], lightmapScaleOffsetArray[2], lightmapScaleOffsetArray[3]));
        (data.meshPath != undefined) && (this.meshFilter.sharedMesh = Loader.getRes(data.meshPath));
        (data.enableRender != undefined) && (render._enabled = data.enableRender);
        (data.receiveShadows != undefined) && (render.receiveShadow = data.receiveShadows);
        (data.castShadow != undefined) && (render.castShadow = data.castShadow);
        var materials: any[] = data.materials;
        if (materials) {
            var sharedMaterials: Material[] = render.sharedMaterials;
            var materialCount: number = materials.length;
            sharedMaterials.length = materialCount;
            for (var i: number = 0; i < materialCount; i++) {
                sharedMaterials[i] = Loader.getRes(materials[i].path);
            }

            render.sharedMaterials = sharedMaterials;
        }
    }

    /**
     * @inheritDoc
     * @override
     * @internal
     */
    _cloneTo(destObject: any, rootSprite: Node, dstSprite: Node): void {
        super._cloneTo(destObject, rootSprite, dstSprite);//父类函数在最后,组件应该最后赋值，否则获取材质默认值等相关函数会有问题
    }


    /**
     * @internal
     */
    protected _create(): Node {
        return new Sprite3D();
    }

}

