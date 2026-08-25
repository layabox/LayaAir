import { Sprite } from "../display/Sprite";
import { ExternalSkin } from "./ExternalSkin";
import { Spine2DRenderNode } from "./Spine2DRenderNode";
import { SpineTemplet } from "./SpineTemplet";

/**
 * @deprecated 请使用Sprite+Spine2DRenderNode组件
 * spine动画由<code>SpineTemplet</code>，<code>SpineSkeletonRender</code>，<code>SpineSkeleton</code>三部分组成。
 */
export class SpineSkeleton extends Sprite {
    private _spineComponent: Spine2DRenderNode;

    constructor() {
        super();
        this._spineComponent = this.addComponent(Spine2DRenderNode);
    }

    /**
     * 外部皮肤
     */
    get externalSkins() {
        return this._spineComponent.externalSkins;
    }
    set externalSkins(value: ExternalSkin[]) {
        this._spineComponent.externalSkins = value;
    }

    /**
     * 重置外部加载的皮肤的样式
     */
    resetExternalSkin() {
        this._spineComponent.resetExternalSkin();
    }

    /**
     * 动画源
     */
    get source(): string {
        return this._spineComponent.source;
    }

    set source(value: string) {
        this._spineComponent.source = value;
    }

    /**
     * 皮肤名
     */
    get skinName(): string {
        return this._spineComponent.skinName;
    }

    set skinName(value: string) {
        this._spineComponent.skinName = value;
    }

    /**
     * 动画名
     */
    get animationName(): string {
        return this._spineComponent.animationName;
    }

    set animationName(value: string) {
        this._spineComponent.animationName = value;
    }

    /**
     * 是否循环
     */
    get loop(): boolean {
        return this._spineComponent.loop;
    }

    set loop(value: boolean) {
        this._spineComponent.loop = value;
    }

    /**
     * 得到动画模板的引用
     * @return templet
     */
    get templet(): SpineTemplet {
        return this._spineComponent.templet;
    }

    /**
     * 设置动画模板的引用
     */
    set templet(value: SpineTemplet) {
        this._spineComponent.templet = value;
    }

    /**
     * 设置当前播放位置
     * @param value 当前时间
     */
    set currentTime(value: number) {
        this._spineComponent.currentTime = value;
    }

    /**
     * 获取当前播放状态
     * @return	当前播放状态
     */
    get playState(): number {
        return this._spineComponent.playState;
    }

    /**
     * 播放动画
     *
     * @param nameOrIndex	动画名字或者索引
     * @param loop		是否循环播放
     * @param force		false,如果要播的动画跟上一个相同就不生效,true,强制生效
     * @param start		起始时间
     * @param end			结束时间
     * @param freshSkin	是否刷新皮肤数据
     * @param playAudio	是否播放音频
     */
    play(nameOrIndex: any, loop: boolean, force: boolean = true, start: number = 0, end: number = 0, freshSkin: boolean = true, playAudio: boolean = true) {
        this._spineComponent.play(nameOrIndex, loop, force, start, end, freshSkin, playAudio);
    }


    /**
     * 得到当前动画的数量
     * @return 当前动画的数量
     */
    getAnimNum(): number {
        // return this._templet.skeletonData.animations.length;
        //@ts-ignore
        return this._spineComponent.getAnimNum();
    }

    /**
     * 得到指定动画的名字
     * @param index	动画的索引
     */
    getAniNameByIndex(index: number): string {
        return this._spineComponent.getAniNameByIndex(index);
    }

    /**
     * 通过名字得到插槽的引用
     * @param slotName 
     */
    getSlotByName(slotName: string) {
        return this._spineComponent.getSlotByName(slotName)
    }

    /**
     * 设置动画播放速率
     * @param value	1为标准速率
     */
    playbackRate(value: number): void {
        this._spineComponent.playbackRate(value);
    }

    /**
     * 通过名字显示一套皮肤
     * @param name	皮肤的名字
     */
    showSkinByName(name: string): void {
        this._spineComponent.showSkinByName(name);
    }

    /**
     * 通过索引显示一套皮肤
     * @param skinIndex	皮肤索引
     */
    showSkinByIndex(skinIndex: number): void {
        this._spineComponent.showSkinByIndex(skinIndex);
    }

    /**
     * 停止动画，停留在当前帧
     */
    stop(): void {
        this._spineComponent.stop();
    }

    /**
     * 暂停动画的播放
     */
    paused(): void {
        this._spineComponent.paused();
    }

    /**
     * 恢复动画的播放
     */
    resume(): void {
        this._spineComponent.resume();
    }



    /**
     * 销毁当前动画
     * @override
     */
    destroy(destroyChild: boolean = true): void {
        if (this._spineComponent.templet) {
            this._spineComponent.clear();
        }
        super.destroy(destroyChild);
    }

    // ------------------------------------新增加的接口----------------------------------------------------
    /**
     * 添加一个动画
     * @param nameOrIndex   动画名字或者索引
     * @param loop          是否循环播放
     * @param delay         延迟调用，可以为负数
     */
    addAnimation(nameOrIndex: any, loop: boolean = false, delay: number = 0) {
        this._spineComponent.addAnimation(nameOrIndex, loop, delay);
    }

    /**
     * 设置当动画被改变时，存储混合(交叉淡出)的持续时间
     * @param fromNameOrIndex 
     * @param toNameOrIndex 
     * @param duration
     */
    setMix(fromNameOrIndex: any, toNameOrIndex: any, duration: number) {
        this._spineComponent.setMix(fromNameOrIndex, toNameOrIndex, duration);
    }

    /**
     * 获取骨骼信息(spine.Bone)
     * 注意: 获取到的是spine运行时的骨骼信息(spine.Bone)，不适用引擎的方法
     * @param boneName 
     */
    getBoneByName(boneName: string) {
        return this._spineComponent.getBoneByName(boneName);
    }

    /**
     * @zh 获取Skeleton(spine.Skeleton)
     * @deprecated 不再直接暴露原生spine对象，只有 Web 运行时有准确对象
     * @en Get Skeleton(spine.Skeleton)
     * @deprecated Do not directly expose the native spine object, only accurate objects in Web
     */
    getSkeleton(): null | spine.Skeleton {
        return this._spineComponent.getSkeleton();
    }

    /**
     * @zh 更新骨骼的世界变换。
     * @param physicsUpdate Spine 物理更新模式，默认使用组件当前的 `physicsUpdate`。
     * @en Update the world transforms of the skeleton bones.
     * @param physicsUpdate The Spine physics update mode. By default, the component's current `physicsUpdate` is used.
     */
    updateWorldTransform(physicsUpdate: number = this._spineComponent.physicsUpdate): void {
        this._spineComponent.updateWorldTransform(physicsUpdate);
    }

    /**
     * 替换插槽皮肤
     * @param slotName 
     * @param attachmentName Attachment name, or null to clear the slot attachment.
     */
    setSlotAttachment(slotName: string, attachmentName: string | null) {
        this._spineComponent.setSlotAttachment(slotName, attachmentName);
    }
}

export enum ESpineRenderType {
    boneGPU = 0,
    normal = 1,
    rigidBody = 2,
}
