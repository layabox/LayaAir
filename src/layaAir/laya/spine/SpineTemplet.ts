import { Resource } from "../resource/Resource";
import { SketonOptimise } from "./optimize/SketonOptimise";
import { Material } from "../resource/Material";
import { SpineShaderInit } from "./material/SpineShaderInit";
import { Texture2D } from "../resource/Texture2D";
import { ShaderDefines2D } from "../webgl/shader/d2/ShaderDefines2D";
import { SpineTexture } from "./SpineTexture";
import { Laya } from "../../Laya";


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
     * @en Version first of Spine
     * @zh Spine版本号
     */
    public static VersionFirst: number = 3;
    /**
     * @en Version second of Spine
     * @zh Spine版本号小数位
     */
    public static VersionSecond: number = 8;

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
    private _atlas: spine.TextureAtlas;
    private _basePath: string;
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
    /**
     * 4.2版本以上支持物理
     * @en Indicates if physics is needed
     * @zh 是否需要物理
     */
    hasPhysics: boolean = false;

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
    getMaterial(texture: Texture2D, blendMode: number , premultipliedAlpha: boolean): Material {
        if (!texture) {
            console.warn("SpineError:cant Find Main Texture");
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

            SpineShaderInit.SetSpineBlendMode(blendMode, mat, premultipliedAlpha);

            if (premultipliedAlpha) {
                mat.addDefine(SpineShaderInit.SPINE_PREMULTIPLYALPHA);
            } else {
                mat.removeDefine(SpineShaderInit.SPINE_PREMULTIPLYALPHA);
            }
            mat._addReference();
            this.materialMap.set(key, mat);
        }
        else if (blendMode == 0) {// Normal
            SpineShaderInit.SetSpineBlendMode(blendMode, mat, premultipliedAlpha);
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
    registerTexture(texture: any) :spine.TextureAtlasRegion {
        if (!texture) return null;

        let tex2d = texture.bitmap as Texture2D;
        if (!tex2d) return null;

        let bitmapUrl = tex2d.url;
        let spineTexture = new SpineTexture(tex2d);

        let page = this._registTextures[bitmapUrl];
        if (!page) {
            let urlFileName = bitmapUrl ? bitmapUrl.split('/').pop().split('\\').pop() : null;
            // 如果没找到，创建一个新的 page
            if (!page) {
                page = new spine.TextureAtlasPage(urlFileName || bitmapUrl || "texture");
            }
            page.name = urlFileName;
            
            //@ts-ignore
            page.texture = spineTexture;
            page.width = tex2d.width;
            page.height = tex2d.height;
            
            this._registTextures[bitmapUrl] = page;
            
            let pageName = page.name;
            if (pageName) {
                this.setTexture(pageName, tex2d);
            }
        }

        let textureName = texture.name;
        if (!textureName){
            let textureURL = texture.url;
            textureName = textureURL.split('/').pop().split('\\').pop();
        }

        let region: spine.TextureAtlasRegion = null;
        
        if (!region) {
            region = new spine.TextureAtlasRegion(page, textureName);
            region.page = page;
            region.name = textureName;
        }
        
        region.width = texture.width;
        region.height = texture.height;
        region.originalWidth = texture.sourceWidth ;
        region.originalHeight = texture.sourceHeight ;
        region.offsetX = texture.offsetX;
        region.offsetY = texture.offsetY;
        
        if (texture.uv && texture.uv.length >= 8) {
            region.u = texture.uv[0];
            region.v = texture.uv[1];
            region.u2 = texture.uv[4];
            region.v2 = texture.uv[5];
        } else {
            // 默认使用完整纹理
            region.u = 0;
            region.v = 0;
            region.u2 = 1.0;
            region.v2 = 1.0;
        }
        
        region.texture = spineTexture;

        return region;
    }

    /**
     * @en Check if Templet needs transparent premultiplied
     * @zh 检查Templet是否需要透明预乘
     */
    checkPremultipliedAlpha() {
        let premultipliedAlpha = true;

        let pages = this._atlas.pages;
        for (let i = 0, len = pages.length; i < len; i++) {
            let page = pages[i];
            if (page) {
                let tex = (page.texture as unknown as SpineTexture).realTexture as Texture2D;
                premultipliedAlpha = page.pma || (tex._premultiplyAlpha && premultipliedAlpha);
            }
        }
        
        return premultipliedAlpha;
    }

    /** @internal */
    _parse(desc: string | ArrayBuffer, atlas: spine.TextureAtlas, textures: Record<string, Texture2D>, premultipliedAlpha = true): void {

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
        this._atlas = atlas;
        this.mainBlendMode = this.skeletonData.slots[0]?.blendMode || 0;
        this.mainTexture = this._mainTexture;
        
        this._premultipliedAlpha = premultipliedAlpha;
        this.hasPhysics = this.skeletonData.physicsConstraints && this.skeletonData.physicsConstraints.length > 0;
        //需要无物理环境
        this.sketonOptimise.canCache = this.sketonOptimise.canCache && !this.hasPhysics;

        this.sketonOptimise.checkMainAttach(this.skeletonData);

        let skeleton = this.sketonOptimise.sketon;
        // 有效值
        if (
            this.skeletonData.x == undefined 
            || this.skeletonData.y == undefined
            || this.skeletonData.width == undefined
            || this.skeletonData.height == undefined
        ) {
            let offset = new spine.Vector2;
            let size = new spine.Vector2;
            skeleton.setToSetupPose();
            skeleton.updateWorldTransform(0);
            skeleton.getBounds(offset, size);

            this.width = size.x;
            this.height = size.y;
            this.offsetX = offset.x + size.x;
            this.offsetY = -(offset.y + size.y);
        }else{
            this.width = this.skeletonData.width || 0;
            this.height = this.skeletonData.height || 0;
            this.offsetX = (this.skeletonData.x || 0) + this.width;
            this.offsetY = -((this.skeletonData.y || 0) + this.height);
        }
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
     * @en Find the animation by its name
     * @param name The name of the animation to find
     * @returns The found animation index, or -1 if not found
     * @zh 通过动画名称查找动画
     * @param name 要查找的动画名称
     * @returns 找到的动画索引，如果未找到则返回-1
     */
    findAnimation(name: string) {
        return this.skeletonData.findAnimation(name);
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

Laya.addAfterInitCallback(() => {
    let versionString = SpineTemplet.RuntimeVersion.split('.');
    let versionNumber = Math.floor(Number(versionString[0]));
    let versionNumber2 = Math.floor(Number(versionString[1]));

    SpineTemplet.VersionFirst = versionNumber;
    SpineTemplet.VersionSecond = versionNumber2;
});