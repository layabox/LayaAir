import { ISpineRender, IBoneInfo, ISlotInfo, ITrackEntry } from "../interface/ISpineRender";
import { SpineTemplet } from "../SpineTemplet";
import { ESpineRenderMode, ESpineRenderState, TSpineBakeData } from "../SpineConst";
import { Vector2 } from "../../maths/Vector2";
import { Color } from "../../maths/Color";
import { Texture } from "../../resource/Texture";
import { NativeSkeletonOptimise } from "./NativeSkeletonOptimise";

/**
 * @en Base class for Native Spine Optimize Render implementations.
 * @zh Native Spine 优化渲染基类。
 */
export abstract class NativeSpineOptimizeRenderBase implements ISpineRender {
    protected _nativeRender: any;
    protected _owner: any;
    protected _templet: SpineTemplet;
    protected _listeners: any;

    protected _sharedBoneBuffer: Float32Array | null = null;
    protected _sharedTrackEntryBuffer: Float32Array = new Float32Array(7);
    protected _boneNames: string[] = [];
    protected _skeletonVec2: Vector2 = new Vector2();

    protected _premultipliedAlpha: boolean = true;
    protected _mode: ESpineRenderMode = ESpineRenderMode.Optimize;

    state: ESpineRenderState = ESpineRenderState.Stopped;
    currentTime: number = 0;
    trackEntry: ITrackEntry = {
        animation: {
            duration: 0
        },
        animationEnd: 0,
        animationStart: 0,
        loop: false,
        trackIndex: 0
    };

    protected bones: IBoneInfo[] = [];

    constructor(owner: any, nativeRender: any) {
        this._owner = owner;
        this._nativeRender = nativeRender;
    }

    setSlotTexture(slotName: string, texture: Texture, createAttachment: boolean): void {
        if (!this._templet || !texture) {
            return;
        }

        this._templet.registerTexture(texture);
        let optimize = this._templet.optimize as NativeSkeletonOptimise;

        let textureName = optimize.registerTexture(texture);
        if (!textureName) {
            return;
        }
        let tex2d = texture.bitmap as any;
        this._nativeRender.setSlotTexture(slotName, tex2d._id, textureName, createAttachment);
    }

    setTempletAttachment(templet: SpineTemplet, targetSlotName: string, skinName: string, attachmentName: string): void {
        if (!this._templet || !templet || !targetSlotName || !skinName || !attachmentName) {
            return;
        }

        let sourceOptimize = templet.optimize as NativeSkeletonOptimise;
        if (templet._textures) {
            for (let textureName in templet._textures) {
                let texture2d = templet._textures[textureName];
                if (texture2d && !this._templet._textures[textureName]) {
                    this._templet.setTexture(textureName, texture2d);
                }
            }
        }

        this._nativeRender.setTempletAttachment(sourceOptimize._getNativeOptimise(), targetSlotName, skinName, attachmentName);
    }

    getSkeleton(): spine.Skeleton {
        return null as any;
    }

    init(templet: SpineTemplet): void {
        this._templet = templet;

        const optimize = templet.optimize as NativeSkeletonOptimise;
        if (!optimize) {
            throw new Error("SpineTemplet.optimize is required for native rendering");
        }

        const nativeOptimize = optimize._getNativeOptimise ? optimize._getNativeOptimise() : optimize;

        this._nativeRender.init(nativeOptimize);

        this._initializeBoneData();

        if (this._nativeRender.bindTrackEntryBuffer) {
            this._nativeRender.bindTrackEntryBuffer(this._sharedTrackEntryBuffer);
        }

        this.premultipliedAlpha = templet.premultipliedAlpha;

        this._onInit();
    }

    /**
     * @en Initialize bone data and shared buffers
     * @zh 初始化骨骼数据和共享缓冲区
     */
    protected _initializeBoneData(): void {
        if (this._nativeRender.getBoneNames) {
            this._boneNames = this._nativeRender.getBoneNames();
            const length = this._boneNames.length;
            if (length > 0) {
                //(2 floats for skeleton position + 8 floats per bone)
                this._sharedBoneBuffer = new Float32Array(2 + length * 8);
                this._nativeRender.bindBoneDataBuffer(this._sharedBoneBuffer);

                this.bones = [];
                for (let i = 0; i < length; i++) {
                    this.bones.push({
                        worldX: 0,
                        worldY: 0,
                        a: 1,
                        b: 0,
                        c: 0,
                        d: 1,
                        data: {
                            name: this._boneNames[i],
                            length: 0
                        }
                    });
                }
            }
        }
    }

    /**
     * @en Subclass-specific initialization hook
     * @zh 子类特定的初始化钩子
     */
    protected _onInit(): void {
        // Override in subclasses if needed
    }

    play(animationName: string, loop: boolean = true, trackIndex: number = 0, start: number = 0, end: number = 0): void {
        if (!this._nativeRender) {
            return;
        }

        // start and end are in seconds in web version, pass directly to native
        // C++ will automatically update shared track entry buffer
        this._nativeRender.play(animationName, loop, trackIndex, start, end);
        this._updateTrackEntry();
    }

    addAnimation(animationName: string, loop: boolean = false, delay: number = 0, trackIndex: number = 0): void {
        if (!this._nativeRender) {
            return;
        }

        // Native layer handles animation addition
        this._nativeRender.addAnimation(animationName, loop, delay, trackIndex);
    }

    setMix(fromAnimation: string, toAnimation: string, duration: number): void {
        if (!this._nativeRender) {
            return;
        }

        // Native layer handles mix setup
        this._nativeRender.setMix(fromAnimation, toAnimation, duration);
    }

    update(delta: number): void {
        if (!this._nativeRender) {
            return;
        }

        this._nativeRender.update(delta);
        this._updateTrackEntry();
    }

    /**
     * @zh 更新骨骼的世界变换。Native 层会在更新后同步骨骼数据。
     * @param physicsUpdate Spine 物理更新模式。
     * @en Update the world transforms of the skeleton bones. The Native layer synchronizes the bone data after the update.
     * @param physicsUpdate The Spine physics update mode.
     */
    updateWorldTransform(physicsUpdate: number): void {
        if (!this._nativeRender) {
            return;
        }

        this._nativeRender.updateWorldTransform(physicsUpdate);
    }

    private _updateTrackEntry(): void {
        this.trackEntry.animationStart = this._sharedTrackEntryBuffer[0];
        this.trackEntry.animationEnd = this._sharedTrackEntryBuffer[1];
        this.trackEntry.trackIndex = this._sharedTrackEntryBuffer[2];
        this.trackEntry.loop = !!this._sharedTrackEntryBuffer[3];
        this.trackEntry.animation.duration = this._sharedTrackEntryBuffer[4];
        this.currentTime = this._sharedTrackEntryBuffer[5];
        this.state = this._sharedTrackEntryBuffer[6] as ESpineRenderState;
    }

    render(time: number, physicsUpdate: number = 2): void {
        if (!this._nativeRender) {
            return;
        }

        this._nativeRender.render(time, physicsUpdate);
    }

    showSkinByIndex(skinIndex: number): void {
        if (!this._nativeRender) {
            return;
        }
        this._nativeRender.showSkinByIndex(skinIndex);
    }

    setAttachment(slotName: string, attachmentName: string): void {
        if (!this._nativeRender) {
            return;
        }

        // Native layer handles attachment setting
        this._nativeRender.setAttachment(slotName, attachmentName);
    }

    findBone(boneName: string): IBoneInfo | null {
        if (!this._sharedBoneBuffer || !this._boneNames.length) {
            return null;
        }

        // Find bone index by name
        const boneIndex = this._boneNames.indexOf(boneName);
        if (boneIndex === -1) {
            return null;
        }

        // Read from shared buffer (C++ has already updated it)
        // Format: [skeletonX, skeletonY, bone0Data..., bone1Data..., ...]
        // Each bone data: [worldX, worldY, a, b, c, d, 0, length]
        const offset = 2 + boneIndex * 8; // offset by 2 for skeleton position
        return {
            worldX: this._sharedBoneBuffer[offset + 0],
            worldY: this._sharedBoneBuffer[offset + 1],
            a: this._sharedBoneBuffer[offset + 2],
            b: this._sharedBoneBuffer[offset + 3],
            c: this._sharedBoneBuffer[offset + 4],
            d: this._sharedBoneBuffer[offset + 5],
            data: {
                name: boneName,
                length: this._sharedBoneBuffer[offset + 7]
            }
        };
    }

    findSlot(slotName: string): ISlotInfo | null {
        return null
    }

    setSkeletonPosition(x: number, y: number): void {
        if (!this._nativeRender) {
            return;
        }

        this._nativeRender.setSkeletonPosition(x, y);
    }

    physicsTranslate(x: number, y: number): void {
        if (!this._nativeRender) {
            return;
        }

        this._nativeRender.physicsTranslate(x, y);
    }

    getBones(): IBoneInfo[] {
        if (!this._sharedBoneBuffer || !this._boneNames.length) {
            return [];
        }

        // Read from shared buffer (C++ has already updated it)
        // Format: [skeletonX, skeletonY, bone0Data..., bone1Data..., ...]
        const bones: IBoneInfo[] = [];
        for (let i = 0; i < this._boneNames.length; i++) {
            const offset = 2 + i * 8; // offset by 2 for skeleton position
            bones.push({
                worldX: this._sharedBoneBuffer[offset + 0],
                worldY: this._sharedBoneBuffer[offset + 1],
                a: this._sharedBoneBuffer[offset + 2],
                b: this._sharedBoneBuffer[offset + 3],
                c: this._sharedBoneBuffer[offset + 4],
                d: this._sharedBoneBuffer[offset + 5],
                data: {
                    name: this._boneNames[i],
                    length: this._sharedBoneBuffer[offset + 7]
                }
            });
        }

        return bones;
    }

    getSkeletonTransform(): Vector2 {
        // Read directly from shared buffer (first 2 floats are skeleton x, y)
        if (this._sharedBoneBuffer && this._sharedBoneBuffer.length >= 2) {
            return this._skeletonVec2.setValue(this._sharedBoneBuffer[0], this._sharedBoneBuffer[1]);
        }

        return this._skeletonVec2;
    }

    resetExternalSkin(): void {
        if (!this._nativeRender) {
            return;
        }

        // Call native resetExternalSkin method
        if (this._nativeRender.resetExternalSkin) {
            this._nativeRender.resetExternalSkin();
        }
    }

    reset(): void {
        if (!this._nativeRender) {
            return;
        }

        if (this._nativeRender.reset) {
            this._nativeRender.reset();
        }

        this._updateTrackEntry();
    }

    getSpineColor(): Color {
        if (!this._nativeRender) {
            return new Color(1, 1, 1, 1);
        }

        // Get color from native layer
        if (this._nativeRender.getSpineColor) {
            const color = this._nativeRender.getSpineColor();
            if (color) {
                return new Color(color.r, color.g, color.b, color.a);
            }
        }

        return new Color(1, 1, 1, 1);
    }

    get premultipliedAlpha(): boolean {
        return this._premultipliedAlpha;
    }

    set premultipliedAlpha(value: boolean) {
        if (this._premultipliedAlpha === value) return;

        this._premultipliedAlpha = value;

        if (this._nativeRender) {
            this._nativeRender.setPremultipliedAlpha(value);
        }
    }

    get mode(): ESpineRenderMode {
        return this._mode;
    }

    set mode(value: ESpineRenderMode) {
        // Update native layer
        if (this._nativeRender && this._nativeRender.setMode) {
            this._nativeRender.setMode(value);
            this._mode = this._nativeRender.getMode ? this._nativeRender.getMode() : value;
        } else {
            this._mode = value;
        }
    }

    complete(): void {
        if (!this._nativeRender) {
            return;
        }

        // Native layer handles animation completion
        this._nativeRender.complete();
    }

    initBake(obj: TSpineBakeData | null): void {
        if (!this._nativeRender) {
            return;
        }

        this._nativeRender.resetBakeData();

        if (!obj) {
            if (this._nativeRender.setMode) {
                this._nativeRender.setMode(ESpineRenderMode.Optimize);
                this._mode = this._nativeRender.getMode ? this._nativeRender.getMode() : ESpineRenderMode.Optimize;
            } else {
                this._mode = ESpineRenderMode.Optimize;
            }
            return;
        }

        this._nativeRender.setBakeBonesNums(obj.bonesNums);
        let animationMap = obj.aniOffsetMap;
        for (const key in animationMap) {
            const offset = animationMap[key];
            if (key === "textureWidth" || typeof offset !== "number" || !isFinite(offset)) {
                continue;
            }
            this._nativeRender.setBakeAniOffset(key, offset);
        }

        if (this._nativeRender.initBake) {
            this._nativeRender.initBake();
        }
        this._mode = this._nativeRender.getMode ? this._nativeRender.getMode() : ESpineRenderMode.Bake;
    }

    setEventListener(listeners: {
        start?: (entry: any) => void;
        interrupt?: (entry: any) => void;
        end?: (entry: any) => void;
        dispose?: (entry: any) => void;
        complete?: (entry: any) => void;
        event?: (entry: any, event: any) => void;
    }): void {
        if (!this._nativeRender) {
            return;
        }

        // Store listeners for cleanup
        this._listeners = listeners;

        // Wrap listeners to convert native data to JS layer format
        if (listeners.start && this._nativeRender.setOnStart) {
            this._nativeRender.setOnStart((nativeEntry: any) => {
                this._updateTrackEntry();
                listeners.start!(this.trackEntry);
            });
        }
        if (listeners.interrupt && this._nativeRender.setOnInterrupt) {
            this._nativeRender.setOnInterrupt((nativeEntry: any) => {
                this._updateTrackEntry();
                listeners.interrupt!(this.trackEntry);
            });
        }
        if (listeners.end && this._nativeRender.setOnEnd) {
            this._nativeRender.setOnEnd((nativeEntry: any) => {
                this._updateTrackEntry();
                listeners.end!(this.trackEntry);
            });
        }
        if (listeners.dispose && this._nativeRender.setOnDispose) {
            this._nativeRender.setOnDispose((nativeEntry: any) => {
                this._updateTrackEntry();
                listeners.dispose!(this.trackEntry);
            });
        }
        if (listeners.complete && this._nativeRender.setOnComplete) {
            this._nativeRender.setOnComplete((nativeEntry: any) => {
                this._updateTrackEntry();
                listeners.complete!(this.trackEntry);
            });
        }
        if (listeners.event && this._nativeRender.setOnEvent) {
            this._nativeRender.setOnEvent((nativeEntry: any, nativeEvent: any) => {
                this._updateTrackEntry();
                listeners.event!(this.trackEntry, this._normalizeNativeEvent(nativeEvent || nativeEntry));
            });
        }
    }

    private _normalizeNativeEvent(nativeEvent: any): any {
        if (!nativeEvent) {
            nativeEvent = {};
        }

        let name = nativeEvent.name || "";
        let audioPath = nativeEvent.audioPath || "";
        return {
            data: {
                name: name,
                audioPath: audioPath
            },
            intValue: nativeEvent.intValue || 0,
            floatValue: nativeEvent.floatValue || 0,
            stringValue: nativeEvent.stringValue || "",
            time: nativeEvent.time || 0,
            balance: nativeEvent.balance || 0,
            volume: nativeEvent.volume || 0
        };
    }
 
    destroy(): void {
        if (this._nativeRender) {
            // Remove event listeners if needed
            if (this._listeners && this._nativeRender.removeEventListener) {
                this._nativeRender.removeEventListener();
            }

            this._nativeRender.destroy();
            this._nativeRender = null;
        }

        this._listeners = null;
        this._templet = null;
        this._owner = null;
        this._sharedBoneBuffer = null;
        this.bones = [];
    }

    stop(): void {
        if (this._nativeRender && this._nativeRender.stop) {
            this._nativeRender.stop();
            this._updateTrackEntry();
        }
    }

    pause(): void {
        if (this._nativeRender && this._nativeRender.pause) {
            this._nativeRender.pause();
            this._updateTrackEntry();
        }
    }

    resume(): void {
        if (this._nativeRender && this._nativeRender.resume) {
            this._nativeRender.resume();
            this._updateTrackEntry();
        }
    }

    setPlaybackRate(rate: number): void {
        if (this._nativeRender && this._nativeRender.setPlaybackRate) {
            this._nativeRender.setPlaybackRate(rate);
        }
    }

    getPlaybackRate(): number {
        if (this._nativeRender && this._nativeRender.getPlaybackRate) {
            return this._nativeRender.getPlaybackRate();
        }
        return 1.0;
    }

    /**
     * @zh 启用缓存。启用后，Spine动画的渲染数据会自动缓存，提高重复播放的性能。
     * @en Enable cache. When enabled, the Spine animation's render data will be automatically cached, improving performance for repeated playback.
     */
    enableCache(): void {
        if (this._nativeRender) {
            this._nativeRender.enableCache();
        }
    }

    /**
     * @zh 禁用缓存。
     * @en Disable cache.
     */
    disableCache(): void {
        if (this._nativeRender) {
            this._nativeRender.disableCache();
        }
    }

    clearCacheMaterials(): void {
        if (this._nativeRender && this._nativeRender.clearCacheMaterials) {
            this._nativeRender.clearCacheMaterials();
        }
    }
}
