import { Material } from "../../resource/Material";
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

    data: any = null;

    private _animationNames: string[] = [];
 
    private _skinNames: string[] = [];

    private _materials: Material[] = [];

    _templet: SpineTemplet;

    
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
     * @en Find animation by name.
     * @param name Animation name.
     * @returns Animation object or null.
     * @zh 根据名称查找动画。
     * @param name 动画名称。
     * @returns 动画对象或 null。
     */
    findAnimation(name: string): any | null {
        if (!this._nativeOptimise || !name) {
            return null;
        }
        return this._nativeOptimise.findAnimation(name) || null;
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
     * @en Get skin by index.
     * @param index Skin index.
     * @returns Skin object or null.
     * @zh 根据索引获取皮肤。
     * @param index 皮肤索引。
     * @returns 皮肤对象或 null。
     */
    getSkin(index: number): any | null {
        if (!this._nativeOptimise || index < 0) {
            return null;
        }
        return this._nativeOptimise.getSkin(index) || null;
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

