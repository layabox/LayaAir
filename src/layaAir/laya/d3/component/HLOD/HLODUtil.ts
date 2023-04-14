import { Laya } from "../../../../Laya";
import { Vector2 } from "../../../maths/Vector2";
import { Handler } from "../../../utils/Handler";
import { Material } from "../../core/material/Material";
import { Lightmap } from "../../core/scene/Lightmap";
import { Bounds } from "../../math/Bounds";
import { HLODBatchMesh } from "./HLODBatchMesh";
/**
 * HLOD的设置
 */
export class HLODConfig{
    releaseCallTime:number;//CG调用时间
    releaseTime:number;//资源闲置时间
}


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
    private _material: Material;
    public get material(): Material {
        return this._material;
    }
    public set material(value: Material) {
        if(this._material!=value){
            this._material&&this._material._removeReference();
            this._material = value;
            this._material._addReference();
        }
        
    }

    /**lightmap */
    private _lightmap: Lightmap;
    public get lightmap(): Lightmap {
        return this._lightmap;
    }
    public set lightmap(value: Lightmap) {
        if(this._lightmap!=value){
            if(this._lightmap){
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
     * 释放资源
     * lightmap direct destroy
     */
    release() {
        this.HLODMesh.destroy();
        this.material.destroy();
        if(this.lightmap){
            this._lightmap.lightmapColor.destroy();
            this._lightmap.lightmapDirection.destroy();
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

    /**
     * loaded
     * @param callFun 
     * @param hlod 
     */
    load(callFun:Function,hlod:any) {
        if(!this.loaded){
            Laya.loader.load(this.url,Handler.create(
                this,(res:any)=>{
                    callFun.apply(hlod,[this]);
                    this.loaded = true;
                },[this]
            ));
        }
    }

    /**
     * 释放HLODGourp资源
     */
    release() {
        this.resources.forEach(element => {
            element.release();
        });
        this.loaded = false;
    }
}