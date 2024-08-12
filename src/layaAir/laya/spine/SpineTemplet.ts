import { ILaya } from "../../ILaya";
import { Resource } from "../resource/Resource";
import { Texture } from "../resource/Texture";
import { URL } from "../net/URL";
import { ILoadURL } from "../net/Loader";
// import { SpineTexture } from "./SpineTexture";
import { IBatchProgress } from "../net/BatchProgress";
import { SketonOptimise } from "./optimize/SketonOptimise";
import { Spine2DRenderNode } from "./Spine2DRenderNode";
import { Material } from "../resource/Material";
import { SpineShaderInit } from "./material/SpineShaderInit";
import { Texture2D } from "../resource/Texture2D";


/**
 * Spine动画模板基类
 */
export class SpineTemplet extends Resource {
    public static RuntimeVersion: string = "3.8";

    public skeletonData: spine.SkeletonData;

    materialMap: Map<string, Material> = new Map();

    private _textures: Record<string, Texture2D>;
    private _basePath: string;
    
    public needSlot: boolean;

    sketonOptimise: SketonOptimise;


    constructor() {
        super();
        this._textures = {};
        this.sketonOptimise = new SketonOptimise();
    }

    get _mainTexture(): Texture2D {
        let i = 0;
        let tex: Texture2D;
        for (let k in this._textures) {
            tex = this._textures[k];
            if (tex) {
                i++;
                if (i > 1) {
                    return null;
                }
            }
        }
        return tex;
    }

    mainTexture: Texture2D;

    mainBlendMode: number = 0;

    get basePath(): string {
        return this._basePath;
    }

    getMaterial(texture: Texture2D, blendMode: number): Material {
        let key = texture.id + "_" + blendMode;
        let mat = this.materialMap.get(key);
        if (!mat) {
            mat = new Material();
            mat.setShaderName("SpineStandard");
            SpineShaderInit.initSpineMaterial(mat);
            mat.setTextureByIndex(SpineShaderInit.SpineTexture, texture);

            SpineShaderInit.SetSpineBlendMode(blendMode, mat);
            //mat.color = this.owner.spineColor;
            //mat.setVector2("u_size",new Vector2(Laya.stage.width,Laya.stage.height));
            mat._addReference();
            this.materialMap.set(key, mat);
        }
        return mat;
    }

    getTexture(name: string): Texture2D {
        return this._textures[name];
    }

    _parse(desc: string | ArrayBuffer, atlas: spine.TextureAtlas , textures:Record<string , Texture2D>): void {
        
        let atlasLoader = new spine.AtlasAttachmentLoader(atlas);
        if (desc instanceof ArrayBuffer) {
            //@ts-ignore
            let skeletonBinary = new spine.SkeletonBinary(atlasLoader, false);
            this.skeletonData = skeletonBinary.readSkeletonData(new Uint8Array(desc));
        } else {
            //@ts-ignore
            let skeletonJson = new spine.SkeletonJson(atlasLoader, false);
            this.skeletonData = skeletonJson.readSkeletonData(desc);
        }

        this._textures = textures;
        this.mainBlendMode = this.skeletonData.slots[0]?.blendMode || 0;
        this.mainTexture = this._mainTexture;
        this.sketonOptimise.checkMainAttach(this.skeletonData);
    }

    /**
     * 通过索引得动画名称
     * @param	index
     * @return
     */
    getAniNameByIndex(index: number): string {
        //@ts-ignore
        let tAni = this.skeletonData.getAnimationByIndex(index);
        if (tAni) return tAni.name;
        return null;
    }

    /**
     * 通过皮肤名字得到皮肤索引
     * @param	skinName 皮肤名称
     * @return
     */
    getSkinIndexByName(skinName: string): number {
        //@ts-ignore
        return this.skeletonData.getSkinIndexByName(skinName);
    }

    /**
     * 释放纹理
     * @override
     */
    protected _disposeResource(): void {
        
        this.sketonOptimise.destroy();
        
        for (let k in this._textures) {
            let tex = this._textures[k];
            if (tex) {
                tex._removeReference();
            }
        }
        if (this._referenceCount <= 0) {
            this.materialMap.forEach(value => {
                value._removeReference();
            })
            this.materialMap.clear();
        }
        else {
            console.error("SpineTemplet is using");
        }

        this.skeletonData = null;
        this.sketonOptimise = null;
    }
}
