import { Material } from "../../resource/Material";
import { Texture } from "../../resource/Texture";
import { Texture2D } from "../../resource/Texture2D";
import { ShaderDefines2D } from "../../webgl/shader/d2/ShaderDefines2D";
import { ISkeletonOptimise } from "../interface/ISpineParse";
import { SpineShaderInit } from "../shader/SpineShaderInit";
import { SpineTemplet } from "../SpineTemplet";

/**
 * @en Native SkeletonOptimise wrapper class for accessing lightweight properties.
 * @zh Native SkeletonOptimise 封装类，用于访问轻量级属性。
 */
export class NativeSkeletonOptimise implements ISkeletonOptimise {
    private _nativeOptimise: any;

    private _registTextures: Map<string, Set<string>> = new Map();

    static __init__() {
        let dec = SpineShaderInit.getAllVertexDeclarations();
        for (const vertexFlag in dec) {
            const vertexDeclaration = dec[vertexFlag];
            if (vertexDeclaration && vertexDeclaration._shaderValues) {
                for (const shaderLocation of Object.keys(vertexDeclaration._shaderValues)) {
                    let location = parseInt(shaderLocation);
                    const vertexStateContext = vertexDeclaration._shaderValues[location];
                    if (vertexStateContext) {
                        // Use static method instead of instance method
                        NativeSkeletonOptimise.SetVertexDeclaration(vertexFlag, location, vertexStateContext);
                    }
                }
            }
        }
    }

    data: any = null;

    private _animationNames: string[] = [];

    private _skinNames: string[] = [];

    private _materials: Material[] = [];

    _templet: SpineTemplet;

    /**
     * @en Set vertex declaration for a vertex flag (static method).
     * @param vertexFlag Vertex flag string (e.g., "UV,COLOR,POSITION,BONE").
     * @param shaderLocation Shader location for the vertex attribute.
     * @param context Vertex state context to add.
     * @zh 为顶点标志设置顶点声明（静态方法）。
     * @param vertexFlag 顶点标志字符串（例如 "UV,COLOR,POSITION,BONE"）。
     * @param shaderLocation 顶点属性的着色器位置。
     * @param context 要添加的顶点状态上下文。
     */
    static SetVertexDeclaration(vertexFlag: string, shaderLocation: number, context: any): void {
        //@ts-ignore
        conchSkeletonOptimise.SetVertexDeclaration(vertexFlag, shaderLocation, context);
    }

    constructor() {
        //@ts-ignore
        this._nativeOptimise = new conchSkeletonOptimise();
        this._nativeOptimise.setMaterialTemplateInitializer(this.nativeCreateMaterialTemplet.bind(this));
    }

    init() {
        this._animationNames = this._nativeOptimise.getAllAnimationNames() || [];
        this._skinNames = this._nativeOptimise.getAllSkinNames() || [];
    }
    /**
     * @en Get animation count.
     * @returns Animation count.
     * @zh 获取动画数量。
     * @returns 动画数量。
     */
    getAnimationCount(): number {
        return this._animationNames.length;
    }

    /**
     * @en Get animation name by index.
     * @param index Animation index.
     * @returns Animation name or null.
     * @zh 根据索引获取动画名称。
     * @param index 动画索引。
     * @returns 动画名称或 null。
     */
    getAniNameByIndex(index: number): string | null {
        if (index >= 0 && index < this._animationNames.length) {
            return this._animationNames[index];
        }
        return null;
    }

    /**
     * @en Get all animation names.
     * @returns Array of animation names.
     * @zh 获取所有动画名称。
     * @returns 动画名称数组。
     */
    getAllAnimationNames(): string[] {
        return this._animationNames;
    }

    /** 
     * @deprecated
     */
    findAnimation(name: string): any | null {
        return null;
    }

    hasAnimation(name: string): boolean {
        return this._animationNames.indexOf(name) !== -1;
    }

    /**
     * @en Get skin index by name.
     * @param skinName Skin name.
     * @returns Skin index or -1 if not found.
     * @zh 根据名称获取皮肤索引。
     * @param skinName 皮肤名称。
     * @returns 皮肤索引，如果未找到则返回 -1。
     */
    getSkinIndexByName(skinName: string): number {
        if (!skinName) {
            return -1;
        }
        return this._skinNames.indexOf(skinName);
    }

    /**
     * @en Get skin count.
     * @returns Skin count.
     * @zh 获取皮肤数量。
     * @returns 皮肤数量。
     */
    getSkinCount(): number {
        return this._skinNames.length;
    }

    /**
     * @en Get skin name by index.
     * @param index Skin index.
     * @returns Skin name or null.
     * @zh 根据索引获取皮肤名称。
     * @param index 皮肤索引。
     * @returns 皮肤名称或 null。
     */
    getSkinNameByIndex(index: number): string | null {
        if (index >= 0 && index < this._skinNames.length) {
            return this._skinNames[index];
        }
        return null;
    }

    /**
     * @en Get all skin names.
     * @returns Array of skin names.
     * @zh 获取所有皮肤名称。
     * @returns 皮肤名称数组。
     */
    getAllSkinNames(): string[] {
        return this._skinNames;
    }

    /**
     * @en Check and initialize the main attachment.
     * @param skeleton The skeleton object.
     * @param skeletonData The skeleton data.
     * @zh 检查并初始化主附件。
     * @param skeleton 骨骼对象。
     * @param skeletonData 骨骼数据。
     * @note This method is typically called internally by the parser.
     */
    checkMainAttach(skeleton: spine.Skeleton, skeletonData: spine.SkeletonData): void {
        // Native side handles this internally during parsing
        // This method is kept for interface compatibility
    }

    registerTexture(texture: Texture | Texture2D): string {
        let isTexture = false;
        let texture2d: Texture2D;
        if (texture instanceof Texture) {
            texture2d = texture.bitmap as Texture2D;
            isTexture = true;
        }else
            texture2d = texture;
        
        if (!texture2d) return null;

        let bitmapUrl = texture2d.url;

        let page = this._registTextures.get(bitmapUrl);
        if (!page) {
            page = new Set<string>();
            this._registTextures.set(bitmapUrl, page);
        }

        let textureName = this._getTextureName(texture);

        if (!page.has(textureName)) {
            page.add(textureName);

            let width = texture.width;
            let height = texture.height;
            let originalWidth = texture.width;
            let originalHeight = texture.height;
            let offsetX = 0;
            let offsetY = 0;
            let u = 0;
            let v = 0;
            let u2 = 1.0;
            let v2 = 1.0;
            if (isTexture) {
                originalWidth = (texture as Texture).sourceWidth ;
                originalHeight = (texture as Texture).sourceHeight ;
                offsetX = (texture as Texture).offsetX;
                offsetY = (texture as Texture).offsetY;
                if ((texture as Texture).uv && (texture as Texture).uv.length >= 8) {
                    u = (texture as Texture).uv[0];
                    v = (texture as Texture).uv[1];
                    u2 = (texture as Texture).uv[4];
                    v2 = (texture as Texture).uv[5];
                }
            }

            this._nativeOptimise.registerTexture( texture2d.id , bitmapUrl, textureName, width, height, originalWidth, originalHeight, offsetX, offsetY, u, v, u2, v2);
        }
        return textureName;
    }

    private _getTextureName(texture: Texture | Texture2D): string {
        let textureName = texture.name;
        if (!textureName && texture.url) {
            textureName = texture.url.split("/").pop().split("\\").pop();
        }
        return textureName || "texture";
    }
    /**
     * @en Initialize materials for textures and cache them for cleanup.
     * @param textureUrls Array of texture URLs.
     * @param textures Array of Texture2D objects.
     * @zh 为纹理初始化材质并缓存以便清理。
     * @param textureUrls 纹理 URL 数组。
     * @param textures Texture2D 对象数组。
     */
    initMaterials(textureUrls: string[], textures: Texture2D[]): void {
        if (textureUrls.length === 0 || textures.length === 0) {
            return;
        }

        this._createMaterial(false, "", null);
        this._createMaterial(true, "", null);

        for (let i = 0 , n = textureUrls.length; i < n; i++) {
            const textureUrl = textureUrls[i];
            const texture = textures[i];
            this._createMaterial(false, textureUrl, texture);
            this._createMaterial(true, textureUrl, texture);
        }
    }

    private nativeCreateMaterialTemplet(textureUrl: string, is3D: boolean) {
        let texture = this._templet.getTexture(textureUrl);
        this._createMaterial(is3D, textureUrl, texture);
    }

    private _createMaterial(is3D: boolean, textureUrl: string, texture: Texture2D | null): Material {
        const material = new Material();
        material.setShaderName(is3D ? "Spine3D" : "SpineStandard");
        SpineShaderInit.initSpineMaterial(material);

        if (texture) {
            const shaderData = material.shaderData;
            shaderData.setTexture(SpineShaderInit.SpineTexture, texture);

            if (texture.gammaCorrection !== 1) {
                shaderData.addDefine(ShaderDefines2D.GAMMATEXTURE);
            }
        }

        material.lock = true;
        this._materials.push(material);

        this._nativeOptimise.setMaterialTemplate(
            is3D,
            textureUrl,
            texture? texture._id : -1,
            (material.shaderData as any)._nativeObj,
            (material.shader.getSubShaderAt(0) as any).moduleData._nativeObj
        );

        return material;
    }

    /**
     * @en Destroy the optimize instance and clean up all cached materials.
     * @zh 销毁优化实例并清理所有缓存的材质。
     */
    destroy(): void {
        for (let i = 0; i < this._materials.length; i++) {
            const material = this._materials[i];
            if (material) {
                material.destroy();
            }
        }
        this._materials.length = 0;

        if (this._nativeOptimise) {
            this._nativeOptimise.destroy();
            this._nativeOptimise = null;
        }

        this.data = null;
        this._animationNames = [];
        this._skinNames = [];
    }

    /**
     * @en Get the native optimize instance (for internal use).
     * @returns Native optimize instance.
     * @zh 获取 native optimize 实例（内部使用）。
     * @returns native optimize 实例。
     */
    _getNativeOptimise(): any {
        return this._nativeOptimise;
    }
}

