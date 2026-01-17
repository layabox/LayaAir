import { Resource } from "../resource/Resource";
import { Material } from "../resource/Material";
import { SpineShaderInit } from "./shader/SpineShaderInit";
import { Texture2D } from "../resource/Texture2D";
import { ShaderDefines2D } from "../webgl/shader/d2/ShaderDefines2D";
import { ISkeletonOptimise, ISpineTempletParser } from "./interface/ISpineParse";

/**
 * @en Base class for Spine animation template
 * @zh Spine动画模板基类
 */
export class SpineTemplet extends Resource {
    /**
     * @en Map of materials used in the Spine animation
     * @zh Spine动画中使用的材质映射
     */
    materialMap: Map<string, Material> = new Map();

    /** @internal */
    _textures: Record<string, Texture2D>;
    /**
     * @en X of spine data
     * @zh spine 数据 x 
     */
    x: number = 0;
    /**
     * @en Y of spine animation
     * @zh spine 数据 y 
     */
    y: number = 0;

    /**
     * @en Base width of spine animation
     * @zh spine 动画基础宽度
     */
    width: number;
    /**
     * @en Base height of spine animation
     * @zh spine 动画基础高度
     */
    height: number;
    /**
     * @en X-axis offset of spine animation
     * @zh spine 动画X轴偏移
     */
    offsetX: number = 0;
    /**
     * @en Y-axis offset of spine animation
     * @zh spine 动画Y轴偏移
     */
    offsetY: number = 0;
    /** @internal */
    _parser: ISpineTempletParser;

    public optimize: ISkeletonOptimise;

    /** @ignore */
    constructor() {
        super();
    }

    /** @internal */
    _premultipliedAlpha = true;

    /**
     * @en Switch for premultipliedAlpha.
     * @zh 透明预乘的开关。
     */
    public get premultipliedAlpha() {
        return this._premultipliedAlpha;
    }

    /**
     * @en Get or create a material for the given texture and blend mode
     * @param texture The texture to use
     * @param blendMode The blend mode to use
     * @param premultipliedAlpha Whether to enable transparent premultiplied
     * @param is3D Whether this is for 3D rendering (default: false for 2D)
     * @zh 获取或创建给定纹理和混合模式的材质
     * @param texture 要使用的纹理
     * @param blendMode 要使用的混合模式
     * @param premultipliedAlpha 是否启用透明预乘
     * @param is3D 是否用于3D渲染 (默认: false 表示2D)
     */
    getMaterial(texture: Texture2D, blendMode: number , premultipliedAlpha: boolean, is3D: boolean = false): Material {
        if (!texture) {
            console.warn("SpineError:cant Find Main Texture");
            texture = Texture2D.whiteTexture;
        }

        let key = texture.id + "_" + blendMode + "_" + premultipliedAlpha + "_"+ (is3D ? "3D" : "2D");
        let mat = this.materialMap.get(key);
        if (!mat) {
            mat = new Material();
            mat.setShaderName(is3D ? "Spine3D" : "SpineStandard");
            mat.renderQueue = is3D ? 3000 : 2000;
            SpineShaderInit.initSpineMaterial(mat);
            mat.setTextureByIndex(SpineShaderInit.SpineTexture, texture);

            if (texture.gammaCorrection != 1) {
                mat.addDefine(ShaderDefines2D.GAMMATEXTURE);
            } else {
                mat.removeDefine(ShaderDefines2D.GAMMATEXTURE);
            }

            SpineShaderInit.SetSpineBlendMode(blendMode, mat, premultipliedAlpha);

            if (premultipliedAlpha) {
                mat.addDefine(SpineShaderInit.SPINE_PREMULTIPLYALPHA);
            } else {
                mat.removeDefine(SpineShaderInit.SPINE_PREMULTIPLYALPHA);
            }
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

    setTexture(name: string, tex: Texture2D) {
        this._textures[name] = tex;
    }

    private _registTextures: Record<string, spine.TextureAtlasPage> = {};

    /**
     * @zh 注册纹理，将 Texture 对象与 Spine 的 TextureRegion 和 AtlasPage 建立对应关系
     * @param texture Texture 对象，对应 TextureRegion
     * @en Register texture, establish correspondence between Texture object and Spine's TextureRegion and AtlasPage
     * @param texture Texture object, corresponding to TextureRegion
     */
    // registerTexture(texture: any) :spine.TextureAtlasRegion {
    //     if (!texture) return null;

    //     let tex2d = texture.bitmap as Texture2D;
    //     if (!tex2d) return null;

    //     let bitmapUrl = tex2d.url;
    //     let spineTexture = new SpineTexture(tex2d);

    //     let page = this._registTextures[bitmapUrl];
    //     if (!page) {
    //         let urlFileName = bitmapUrl ? bitmapUrl.split('/').pop().split('\\').pop() : null;
    //         // 如果没找到，创建一个新的 page
    //         if (!page) {
    //             page = new spine.TextureAtlasPage(urlFileName || bitmapUrl || "texture");
    //         }
    //         page.name = urlFileName;
            
    //         //@ts-ignore
    //         page.texture = spineTexture;
    //         page.width = tex2d.width;
    //         page.height = tex2d.height;
            
    //         this._registTextures[bitmapUrl] = page;
            
    //         let pageName = page.name;
    //         if (pageName) {
    //             this.setTexture(pageName, tex2d);
    //         }
    //     }

    //     let textureName = texture.name;
    //     if (!textureName){
    //         let textureURL = texture.url;
    //         textureName = textureURL.split('/').pop().split('\\').pop();
    //     }

    //     let region: spine.TextureAtlasRegion = null;
        
    //     if (!region) {
    //         region = new spine.TextureAtlasRegion(page, textureName);
    //         region.page = page;
    //         region.name = textureName;
    //     }
        
    //     region.width = texture.width;
    //     region.height = texture.height;
    //     region.originalWidth = texture.sourceWidth ;
    //     region.originalHeight = texture.sourceHeight ;
    //     region.offsetX = texture.offsetX;
    //     region.offsetY = texture.offsetY;
        
    //     if (texture.uv && texture.uv.length >= 8) {
    //         region.u = texture.uv[0];
    //         region.v = texture.uv[1];
    //         region.u2 = texture.uv[4];
    //         region.v2 = texture.uv[5];
    //     } else {
    //         // 默认使用完整纹理
    //         region.u = 0;
    //         region.v = 0;
    //         region.u2 = 1.0;
    //         region.v2 = 1.0;
    //     }
        
    //     region.texture = spineTexture;

    //     return region;
    // }

    /**
     * @en Get the animation name by its index
     * @param index The index of the animation
     * @zh 通过索引获取动画名称
     * @param index 动画的索引
     */
    getAniNameByIndex(index: number): string {
        return this.optimize.getAniNameByIndex(index);
    }

    getAnimationCount(): number {
        return this.optimize.getAnimationCount();
    }

    /**
     * @deprecated only web
     * @en Find the animation by its name
     * @param name The name of the animation to find
     * @returns The found animation index, or -1 if not found
     * @zh 通过动画名称查找动画
     * @param name 要查找的动画名称
     * @returns 找到的动画索引，如果未找到则返回-1
     */
    findAnimation(name: string) {
        return this.optimize.findAnimation(name);
    }

    /**
     * @en Check if the animation exists
     * @param name The name of the animation to check
     * @returns boolean
     * @zh 检查动画是否存在
     * @param name 要检查的动画名称
     * @returns boolean
     */
    hasAnimation(name: string) :boolean{
        return this.optimize.hasAnimation(name);
    }

    /**
     * @en Get the skin index by its name
     * @param skinName The name of the skin
     * @zh 通过皮肤名称获取皮肤索引
     * @param skinName 皮肤名称
     */
    getSkinIndexByName(skinName: string): number {
        return this.optimize.getSkinIndexByName(skinName);
    }

    /**
     * @en Release textures and materials
     * @zh 释放纹理和材质
     */
    protected _disposeResource(): void {

        this._parser.destroy();

        this.optimize.destroy();

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

        this._parser = null;
    }
}
