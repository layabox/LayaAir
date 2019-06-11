import { Config3D } from "Config3D";
import { Handler } from "laya/utils/Handler";
import { PhysicsSettings } from "./laya/d3/physics/PhysicsSettings";
/**
 * <code>Laya3D</code> 类用于初始化3D设置。
 */
export declare class Laya3D {
    /**Hierarchy资源。*/
    static HIERARCHY: string;
    /**Mesh资源。*/
    static MESH: string;
    /**Material资源。*/
    static MATERIAL: string;
    /**Texture2D资源。*/
    static TEXTURE2D: string;
    /**TextureCube资源。*/
    static TEXTURECUBE: string;
    /**AnimationClip资源。*/
    static ANIMATIONCLIP: string;
    /**Avatar资源。*/
    static AVATAR: string;
    /**Terrain资源。*/
    static TERRAINHEIGHTDATA: string;
    /**Terrain资源。*/
    static TERRAINRES: string;
    /**@private */
    private static _innerFirstLevelLoaderManager;
    /**@private */
    private static _innerSecondLevelLoaderManager;
    /**@private */
    private static _innerThirdLevelLoaderManager;
    /**@private */
    private static _innerFourthLevelLoaderManager;
    /**@private */
    private static _isInit;
    /**@private */
    static _enbalePhysics: boolean;
    /**@private */
    static _editerEnvironment: boolean;
    /**@private */
    static _config: Config3D;
    /**@private */
    static physicsSettings: PhysicsSettings;
    /**
     * 获取是否可以启用物理。
     * @param 是否启用物理。
     */
    static readonly enbalePhysics: any;
    /**
     *@private
     */
    static _cancelLoadByUrl(url: string): void;
    /**
     *@private
     */
    private static _changeWebGLSize;
    /**
     *@private
     */
    private static __init__;
    private static enableNative3D;
    /**
     *@private
     */
    private static formatRelativePath;
    /**
     * @private
     */
    private static _endLoad;
    /**
     *@private
     */
    private static _eventLoadManagerError;
    /**
     *@private
     */
    private static _addHierarchyInnerUrls;
    /**
     *@private
     */
    private static _getSprite3DHierarchyInnerUrls;
    /**
     *@private
     */
    private static _loadHierarchy;
    /**
     *@private
     */
    private static _onHierarchylhLoaded;
    /**
     *@private
     */
    private static _onHierarchyInnerForthLevResouLoaded;
    /**
     *@private
     */
    private static _onHierarchyInnerThirdLevResouLoaded;
    /**
     *@private
     */
    private static _onHierarchyInnerSecondLevResouLoaded;
    /**
     *@private
     */
    private static _onHierarchyInnerFirstLevResouLoaded;
    /**
     *@private
     */
    private static _loadMesh;
    /**
     *@private
     */
    private static _onMeshLmLoaded;
    /**
     *@private
     */
    private static _loadMaterial;
    /**
     *@private
     */
    private static _onMaterilLmatLoaded;
    /**
     *@private
     */
    private static _onMateialTexturesLoaded;
    /**
     *@private
     */
    private static _loadAvatar;
    /**
     *@private
     */
    private static _loadAnimationClip;
    /**
     *@private
     */
    private static _loadTexture2D;
    /**
     *@private
     */
    private static _loadTextureCube;
    /**
     *@private
     */
    private static _onTextureCubeLtcLoaded;
    /**
     *@private
     */
    private static _onTextureCubeImagesLoaded;
    /**
     *@private
     */
    private static _onProcessChange;
    /**
     * 初始化Laya3D相关设置。
     * @param	width  3D画布宽度。
     * @param	height 3D画布高度。
     */
    static init(width: number, height: number, config?: Config3D, compolete?: Handler): void;
    /**
     * 创建一个 <code>Laya3D</code> 实例。
     */
    constructor();
}
