import { Resource } from "../resource/Resource";
import { SketonOptimise } from "./optimize/SketonOptimise";
import { Material } from "../resource/Material";
import { SpineShaderInit } from "./material/SpineShaderInit";
import { Texture2D } from "../resource/Texture2D";
import { ShaderDefines2D } from "../webgl/shader/d2/ShaderDefines2D";


/**
 * @en Base class for Spine animation template
 * @zh Spine动画模板基类
 */
export class SpineTemplet extends Resource {
    /**
     * @en Runtime version of Spine
     * @zh Spine运行时版本
     */
    public static RuntimeVersion: string = "3.8";

    /**
     * @en Skeleton data for the Spine animation
     * @zh Spine动画的骨骼数据
     */
    public skeletonData: spine.SkeletonData;

    /**
     * @en Map of materials used in the Spine animation
     * @zh Spine动画中使用的材质映射
     */
    materialMap: Map<string, Material> = new Map();

    private _textures: Record<string, Texture2D>;
    private _basePath: string;

    width:number;

    height:number;

    /**
     * @en Indicates if slot is needed
     * @zh 是否需要插槽
     */
    public needSlot: boolean;

    /**
     * @en Skeleton optimization object
     * @zh 骨骼优化对象
     */
    sketonOptimise: SketonOptimise;

    /** @ignore */
    constructor() {
        super();
        this._textures = {};
        this.sketonOptimise = new SketonOptimise();
    }
    /** @internal */
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

    /**
     * @en The main texture of the Spine animation
     * @zh Spine动画的主纹理
     */
    mainTexture: Texture2D;

    /**
     * @en The main blend mode of the Spine animation
     * @zh Spine动画的主混合模式
     */
    mainBlendMode: number = 0;

    /**
     * @en The base path of the Spine animation resources
     * @zh Spine动画资源的基础路径
     */
    get basePath(): string {
        return this._basePath;
    }

    /**
     * @en Get or create a material for the given texture and blend mode
     * @param texture The texture to use
     * @param blendMode The blend mode to use
     * @zh 获取或创建给定纹理和混合模式的材质
     * @param texture 要使用的纹理
     * @param blendMode 要使用的混合模式
     */
    getMaterial(texture: Texture2D, blendMode: number): Material {
        if (!texture) {
            console.error("SpineError:cant Find Main Texture");
            texture = Texture2D.whiteTexture;
        }

        let key = texture.id + "_" + blendMode;
        let mat = this.materialMap.get(key);
        if (!mat) {
            mat = new Material();
            mat.setShaderName("SpineStandard");
            SpineShaderInit.initSpineMaterial(mat);
            mat.setTextureByIndex(SpineShaderInit.SpineTexture, texture);
            if (texture.gammaCorrection != 1) {
                mat.addDefine(ShaderDefines2D.GAMMATEXTURE);
            } else {
                mat.removeDefine(ShaderDefines2D.GAMMATEXTURE);
            }
            SpineShaderInit.SetSpineBlendMode(blendMode, mat);
            //mat.color = this.owner.spineColor;
            //mat.setVector2("u_size",new Vector2(Laya.stage.width,Laya.stage.height));
            mat._addReference();
            this.materialMap.set(key, mat);
        }
        return mat;
    }

    /**
     * @en Get a texture by its name
     * @param name The name of the texture
     * @zh 通过名称获取纹理
     * @param name 纹理的名称
     */
    getTexture(name: string): Texture2D {
        return this._textures[name];
    }

    /** @internal */
    _parse(desc: string | ArrayBuffer, atlas: spine.TextureAtlas, textures: Record<string, Texture2D>): void {

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
        this.width = this.skeletonData.width;
        this.height = this.skeletonData.height;
        this.sketonOptimise.checkMainAttach(this.skeletonData);
    }

    /**
     * @en Get the animation name by its index
     * @param index The index of the animation
     * @zh 通过索引获取动画名称
     * @param index 动画的索引
     */
    getAniNameByIndex(index: number): string {
        //@ts-ignore
        let tAni = this.skeletonData.getAnimationByIndex(index);
        if (tAni) return tAni.name;
        return null;
    }

    /**
     * @en Get the skin index by its name
     * @param skinName The name of the skin
     * @zh 通过皮肤名称获取皮肤索引
     * @param skinName 皮肤名称
     */
    getSkinIndexByName(skinName: string): number {
        //@ts-ignore
        return this.skeletonData.getSkinIndexByName(skinName);
    }

    /**
     * @en Release textures and materials
     * @zh 释放纹理和材质
     */
    protected _disposeResource(): void {
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
    }
}
