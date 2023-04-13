import { Vector2 } from "../../../maths/Vector2";
import { Texture2D } from "../../../resource/Texture2D";
import { Material } from "../../core/material/Material";
import { Lightmap } from "../../core/scene/Lightmap";
import { Bounds } from "../../math/Bounds";
import { HLODBatchMesh } from "./HLODBatchMesh";

/**
 * HLODBatch resource
 */
export class HLODBatchSubMesh{
    bounds:Bounds;
    drawPramas:Vector2;
}

/**
 * HLODElement 一组HLODRenderElement资源
 */
export class HLODElement {
    /**batch mesh */
    HLODMesh: HLODBatchMesh;
    /**material */
    material: Material;
    /**lightmap */
    lightmap: Lightmap;

    /**
     * 释放资源
     * lightmap direct destroy
     */
    release() {
        this.HLODMesh.destroy();
        this.material.destroy();
        if(this.lightmap){
            this.lightmap.lightmapColor.destroy();
            this.lightmap.lightmapDirection.destroy();
        }
    }
}

/**
 * HLOD Resource
 * Load/release
 */
export class HLODResourceGroup {
    url: string;
    updateMark: number;
    resources: HLODElement[];
    loaded: boolean;

    load(call:Function) {

    }

    release() {
        this.resources.forEach(element => {
            element.release();
        });
    }
}