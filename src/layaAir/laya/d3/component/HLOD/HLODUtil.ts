import { Laya } from "../../../../Laya";
import { Vector2 } from "../../../maths/Vector2";
import { Handler } from "../../../utils/Handler";
import { Material } from "../../../resource/Material";
import { Lightmap } from "../../core/scene/Lightmap";
import { Bounds } from "../../math/Bounds";
import { HLODBatchMesh } from "./HLODBatchMesh";
/**
 * @en Configuration for Hierarchical Level of Detail (HLOD) settings.
 * @zh 分层细节层次(HLOD)的配置设置。
 */
export class HLODConfig {
    releaseCallTime: number;//CG调用时间
    releaseTime: number;//资源闲置时间
}


/**
 * @en Represents a sub-mesh within an HLOD batch resource, describing geometric bounds and render parameters.
 * @zh 在 HLOD 批处理资源中表示一个子网格，包括几何边界和渲染参数。
 */
export class HLODBatchSubMesh {
    bounds: Bounds;
    drawPramas: Vector2;
}

/**
 * @en An element representing a set of HLOD renderable resources.
 * @zh 表示一组 HLOD 可渲染资源的元素。
 */
export class HLODElement {
    /**
     * @en The batch mesh for this HLOD element.
     * @zh 此 HLOD 元素的批处理网格。
     */
    HLODMesh: HLODBatchMesh;

    /**material */
    private _material: Material;
    /**
     * @en The material for this HLOD element.
     * @zh 此 HLOD 元素的材质。
     */
    public get material(): Material {
        return this._material;
    }
    public set material(value: Material) {
        if (this._material != value) {
            this._material && this._material._removeReference();
            this._material = value;
            this._material._addReference();
        }

    }

    /**lightmap */
    private _lightmap: Lightmap;
    /**
     * @en The lightmap for this HLOD element.
     * @zh 此 HLOD 元素的光照贴图。
     */
    public get lightmap(): Lightmap {
        return this._lightmap;
    }
    public set lightmap(value: Lightmap) {
        if (this._lightmap != value) {
            if (this._lightmap) {
                this._lightmap.lightmapColor._removeReference();
                this._lightmap.lightmapDirection._removeReference();
            }
            this._lightmap = value;
            this._lightmap.lightmapColor._addReference();
            this._lightmap.lightmapDirection._addReference();

        }
        this._lightmap = value;
    }

    /**
     * @en Release resources associated with this HLOD element.
     * Lightmap is directly destroyed.
     * @zh 释放与此 HLOD 元素关联的资源。
     * 光照贴图会被直接销毁。
     */
    release() {
        this.HLODMesh.destroy();
        this.material.destroy();
        if (this.lightmap) {
            this._lightmap.lightmapColor.destroy();
            this._lightmap.lightmapDirection.destroy();
        }
    }
}

/**
 * @en A resource group for managing the lifecycle of HLOD resources, handling their load and release state.
 * @zh 用于管理 HLOD 资源生命周期的资源组，处理其加载和释放状态。
 */
export class HLODResourceGroup {
    /**
     * @en The URL of the HLOD resource.
     * @zh HLOD 资源的 URL。
     */
    url: string;
    /**
     * @en Update marker for the resource group.
     * @zh 资源组的更新标记。
     */
    updateMark: number;
    /**
     * @en Array of HLOD elements in this resource group.
     * @zh 此资源组中的 HLOD 元素数组。
     */
    resources: HLODElement[];
    /**
     * @en Indicates whether the resource group is loaded.
     * @zh 资源组是否已加载。
     */
    loaded: boolean;

    /**
     * @en Load the HLOD resource group.
     * @param callFun The callback function to be called after loading.
     * @param hlod The HLOD instance.
     * @zh 加载 HLOD 资源组。
     * @param callFun 加载完成后要调用的回调函数。
     * @param hlod HLOD 实例。
     */
    load(callFun: Function, hlod: any) {
        if (!this.loaded) {
            Laya.loader.load(this.url, Handler.create(
                this, (res: any) => {
                    callFun.apply(hlod, [this]);
                    this.loaded = true;
                }, [this]
            ));
        }
    }

    /**
     * @en Releases all the resources of the HLOD group, marking the group as unloaded.
     * @zh 释放 HLOD 组的所有资源，并标记组为未加载。
     */
    release() {
        this.resources.forEach(element => {
            element.release();
        });
        this.loaded = false;
    }
}