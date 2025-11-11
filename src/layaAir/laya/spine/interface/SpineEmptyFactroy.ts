import { Color } from "../../maths/Color";
import { Vector4 } from "../../maths/Vector4";
import { ILoadTask, ILoadURL } from "../../net/Loader";
import { Texture2D } from "../../resource/Texture2D";
import { Spine2DRenderNode } from "../Spine2DRenderNode";
import { ESpineRenderMode, ESpineRenderState, TSpineBakeData } from "../SpineConst";
import { SpineTemplet } from "../SpineTemplet";
import { ISpineFactory } from "./ISpineFactory";
import { ISpineTempletParser } from "./ISpineParse";
import { ISpineRender, IBoneInfo, ISlotInfo, ITrackEntry } from "./ISpineRender";

export class EmptyFactory implements ISpineFactory {
    createSpineTempletParser(): ISpineTempletParser{
        return SpineEmptyTempletParser.instance;
    }
    createSpineRender(owner: Spine2DRenderNode): ISpineRender {
        return SpineEmptyRender.instance;
    }
}


export class SpineEmptyTempletParser implements ISpineTempletParser {
    private static _instance: SpineEmptyTempletParser;
    public static get instance(): SpineEmptyTempletParser {
        if (!SpineEmptyTempletParser._instance) {
            SpineEmptyTempletParser._instance = new SpineEmptyTempletParser();
        }
        return SpineEmptyTempletParser._instance;
    }

    collectTextures(atlasText: string, task: ILoadTask): ILoadURL[] {
        return [];
    }
    create(desc: string | ArrayBuffer, textures: Texture2D[]): SpineTemplet {
        return null;
    }
    destroy(): void {
    }
}

/**
 * @en Empty implementation of the renderer for optimizing Spine animations.
 * @zh 空实现的渲染器，用于优化 Spine 动画的渲染。
 */
export class SpineEmptyRender implements ISpineRender {
    getSkeleton(): spine.Skeleton {
        return null;
    }
    trackEntry: ITrackEntry = null;
    mode: ESpineRenderMode = ESpineRenderMode.Normal;
    state: ESpineRenderState = ESpineRenderState.Stopped;
    currentTime: number = 0;
    private _transform: Vector4 = new Vector4();

    /**
     * @en Singleton instance of SpineEmptyRender.
     * @zh SpineEmptyRender 的单例实例。
     */
    private static _instance: SpineEmptyRender;

    public static get instance(): SpineEmptyRender {
        if (!SpineEmptyRender._instance) {
            SpineEmptyRender._instance = new SpineEmptyRender();
        }
        return SpineEmptyRender._instance;
    }

    init(): void {
    }

    play(animationName: string, loop?: boolean, trackIndex?: number, start?: number, end?: number): ITrackEntry | null {
        return null;
    }

    addAnimation(animationName: string, loop?: boolean, delay?: number, trackIndex?: number): void {
    }

    setMix(fromAnimation: string, toAnimation: string, duration: number): void {
    }

    update(delta: number): void {
    }

    render(time: number, offsetX?: number, offsetY?: number): void {
    }

    setSkinIndex(index: number): void {
    }

    showSkinByIndex(skinIndex: number): void {
    }

    setAttachment(slotName: string, attachmentName: string): void {
    }

    findBone(boneName: string): IBoneInfo | null {
        return null;
    }

    findSlot(slotName: string): ISlotInfo | null {
        return null;
    }

    setSkeletonPosition(x: number, y: number): void {
    }

    physicsTranslate(x: number, y: number): void {
    }

    getBones(): IBoneInfo[] {
        return [];
    }

    getSkeletonTransform(): Vector4 {
        return this._transform;
    }

    resetExternalSkin(): void {
    }

    reset(): void {
    }

    complete(): void {
    }

    initBake(obj: TSpineBakeData): void {
    }

    setEventListener(listeners: {
        start?: (entry: any) => void;
        interrupt?: (entry: any) => void;
        end?: (entry: any) => void;
        dispose?: (entry: any) => void;
        complete?: (entry: any) => void;
        event?: (entry: any, event: any) => void;
    }): void {
    }

    destroy(): void {
    }

    getSpineColor(): Color {
        return Color.WHITE;
    }
}

