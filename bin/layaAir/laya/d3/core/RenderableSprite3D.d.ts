import { Node } from "laya/display/Node";
import { Animator } from "../component/Animator";
import { Vector4 } from "../math/Vector4";
import { ShaderDefines } from "../shader/ShaderDefines";
import { Sprite3D } from "././Sprite3D";
import { BaseRender } from "./render/BaseRender";
/**
 * <code>RenderableSprite3D</code> 类用于可渲染3D精灵的父类，抽象类不允许实例。
 */
export declare class RenderableSprite3D extends Sprite3D {
    /**精灵级着色器宏定义,接收阴影。*/
    static SHADERDEFINE_RECEIVE_SHADOW: number;
    /**精灵级着色器宏定义,光照贴图便宜和缩放。*/
    static SHADERDEFINE_SCALEOFFSETLIGHTINGMAPUV: number;
    /**精灵级着色器宏定义,光照贴图。*/
    static SAHDERDEFINE_LIGHTMAP: number;
    /**着色器变量名，光照贴图缩放和偏移。*/
    static LIGHTMAPSCALEOFFSET: number;
    /**着色器变量名，光照贴图。*/
    static LIGHTMAP: number;
    /**拾取颜色。*/
    static PICKCOLOR: number;
    pickColor: Vector4;
    /**@private */
    static shaderDefines: ShaderDefines;
    /**
     * @private
     */
    static __init__(): void;
    /** @private */
    _render: BaseRender;
    /**
     * 创建一个 <code>RenderableSprite3D</code> 实例。
     */
    constructor(name: string);
    /**
     * @inheritDoc
     */
    protected _onInActive(): void;
    /**
     * @inheritDoc
     */
    protected _onActive(): void;
    /**
     * @inheritDoc
     */
    protected _onActiveInScene(): void;
    /**
     * @private
     */
    _addToInitStaticBatchManager(): void;
    /**
     * @inheritDoc
     */
    _setBelongScene(scene: Node): void;
    /**
     * @inheritDoc
     */
    _setUnBelongScene(): void;
    /**
     * @inheritDoc
     */
    protected _changeHierarchyAnimator(animator: Animator): void;
    /**
     * @inheritDoc
     */
    destroy(destroyChild?: boolean): void;
    /**
     * @private
     */
    protected _create(): Node;
}
