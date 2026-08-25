import { Color } from "../../maths/Color";
import { Vector2 } from "../../maths/Vector2";
import { Vector4 } from "../../maths/Vector4";
import { Texture } from "../../resource/Texture";
import { Spine2DRenderNode } from "../Spine2DRenderNode";
import { ESpineRenderMode, ESpineRenderState, TSpineBakeData } from "../SpineConst";
import { SpineTemplet } from "../SpineTemplet";

/**
 * @zh 骨骼信息接口，用于封装骨骼数据，不直接暴露原生spine对象
 * @en Bone information interface, used to encapsulate bone data without exposing native spine objects
 */
export interface IBoneInfo {
    worldX: number;
    worldY: number;
    /** 变换矩阵参数 */
    a: number;
    b: number;
    c: number;
    d: number;
    data: {
        name: string;
        length: number;
    };
}

/**
 * @zh 插槽信息接口
 * @en Slot information interface
 */
export interface ISlotInfo {
    name: string;
}

/**
 * @zh 动画轨道信息接口
 * @en Animation track information interface
 */
export interface ITrackEntry {
    animationStart: number;
    animationEnd: number;
    animation: {
        duration: number;
    };
    trackIndex: number;
    loop: boolean;
}

export interface ISpineRender {
    /** 是否启用透明预乘 */
    premultipliedAlpha: boolean;
    /** 当前渲染模式 */
    mode: ESpineRenderMode;
    /** 当前渲染状态 */
    state: ESpineRenderState;
    /** 当前播放时间（秒） */
    currentTime: number;
    
    trackEntry: ITrackEntry;

    getSkeleton(): spine.Skeleton;
    
    /**
     * @zh 初始化渲染器
     * @param templet Spine模板，可选参数，如果实现类在构造函数中已经获取了templet，可以不传
     * @en Initialize the renderer
     * @param templet Spine template, optional parameter. If the implementation class already gets templet in constructor, it can be omitted
     */
    init(templet: SpineTemplet): void;
    
    /**
     * @zh 播放动画
     * @param animationName 动画名称
     * @param loop 是否循环
     * @param trackIndex 轨道索引
     * @param start 起始时间（秒）
     * @param end 结束时间（秒），0表示到结尾
     * @returns 轨道信息
     */
    play(animationName: string, loop?: boolean, trackIndex?: number, start?: number, end?: number): void;
    
    /**
     * @zh 添加动画到队列
     * @param animationName 动画名称
     * @param loop 是否循环
     * @param delay 延迟时间（秒）
     * @param trackIndex 轨道索引
     */
    addAnimation(animationName: string, loop?: boolean, delay?: number, trackIndex?: number): void;
    
    /**
     * @zh 设置动画混合
     * @param fromAnimation 源动画名称
     * @param toAnimation 目标动画名称
     * @param duration 混合持续时间（秒）
     */
    setMix(fromAnimation: string, toAnimation: string, duration: number): void;
    
    /**
     * @zh 更新动画
     * @param delta 时间增量（秒）
     */
    update(delta: number): void;

    /**
     * @zh 更新骨骼的世界变换。
     * @param physicsUpdate Spine 物理更新模式。
     * @en Update the world transforms of the skeleton bones.
     * @param physicsUpdate The Spine physics update mode.
     */
    updateWorldTransform(physicsUpdate: number): void;
    
    /**
     * @en Render the animation.
     * @param time The time to render the animation at.
     * @zh 渲染动画。
     * @param time 渲染动画的时间。
     */
    render(time: number , physicsUpdate: number): void;

    /**
     * @zh 通过索引显示皮肤
     * @param skinIndex 皮肤索引
     */
    showSkinByIndex(skinIndex: number): void;
    
    /**
     * @zh 设置插槽附件
     * @param slotName 插槽名称
     * @param attachmentName 附件名称，null 表示清空插槽附件
     */
    setAttachment(slotName: string, attachmentName: string | null): void;
    
    /**
     * @zh 通过名称查找骨骼
     * @param boneName 骨骼名称
     * @returns 骨骼信息，如果不存在返回null
     */
    findBone(boneName: string): IBoneInfo | null;
    
    /**
     * @deprecated only WEB
     * @zh 通过名称查找插槽
     * @param slotName 插槽名称
     * @returns 插槽信息，如果不存在返回null
     */
    findSlot(slotName: string): ISlotInfo | null;
    
    /**
     * @zh 设置骨骼位置（用于transform更新）
     * @param x X坐标
     * @param y Y坐标
     */
    setSkeletonPosition(x: number, y: number): void;
    
    /**
     * @zh 物理移动（支持Spine物理时有效）
     * @param x X轴偏移
     * @param y Y轴偏移
     */
    physicsTranslate(x: number, y: number): void;
    
    /**
     * @zh 获取骨骼列表（用于创建骨骼可视化）
     * @returns 骨骼信息数组
     */
    getBones(): IBoneInfo[];
    
    /**
     * @zh 获取骨骼位置
     * @returns 包含x, y的向量
     */
    getSkeletonTransform(): Vector2;
    
    /**
     * @zh 重置外部皮肤
     */
    resetExternalSkin(): void;
    
    /**
     * @zh 重置渲染器
     */
    reset(): void;
    
    /**
     * @zh 完成动画
     */
    complete(): void;
    
    /**
     * @zh 初始化烘焙数据
     * @param obj 烘焙数据
     */
    initBake(obj: TSpineBakeData | null): void;
    
    /**
     * @zh 设置动画事件监听器
     * @param listeners 事件监听器对象
     */
    setEventListener(listeners: {
        start?: (entry: any) => void;
        interrupt?: (entry: any) => void;
        end?: (entry: any) => void;
        dispose?: (entry: any) => void;
        complete?: (entry: any) => void;
        event?: (entry: any, event: any) => void;
    }): void;
    
    /**
     * @zh 销毁渲染器
     */
    destroy(): void;

    /**
     * @zh 启用缓存。启用后，Spine动画的渲染数据会自动缓存，提高重复播放的性能。
     * @en Enable cache. When enabled, the Spine animation's render data will be automatically cached, improving performance for repeated playback.
     */
    enableCache(): void;

    /**
     * @zh 禁用缓存。
     * @en Disable cache.
     */
    disableCache(): void;

    /**
     * @zh 清理渲染器内部缓存的材质列表。
     * @en Clear the renderer's cached material lists.
     */
    clearCacheMaterials(): void;

    /**
     * @zh 设置插槽纹理
     * @param slotName 插槽名称
     * @param texture 纹理对象
     * @param createAttachment 是否创建新的附件副本
     * @param updateAttachmentSize 是否将附件宽高更新为新纹理区域的宽高
     * @en Set slot texture.
     * @param slotName Slot name.
     * @param texture Texture object.
     * @param createAttachment Whether to create a new attachment copy.
     * @param updateAttachmentSize Whether to update the attachment width and height to match the new texture region.
     */
    setSlotTexture(slotName: string, texture: Texture, createAttachment: boolean, updateAttachmentSize?: boolean): void;

    /**
     * @zh 恢复当前皮肤中插槽的设置姿势附件。
     * @param slotName 插槽名称。
     * @returns 是否成功恢复附件。
     * @en Restore the slot's setup-pose attachment from the current skin.
     * @param slotName Slot name.
     * @returns Whether the attachment was restored successfully.
     */
    restoreSlotTexture(slotName: string): boolean;

    /**
     * @zh 设置插槽附件
     * @param templet Spine模板
     * @param targetSlotName 目标插槽名称
     * @param skinName 皮肤名称
     * @param attachmentName 附件名称
     */
    setTempletAttachment(templet: SpineTemplet, targetSlotName: string, skinName: string,  attachmentName: string): void;
}
