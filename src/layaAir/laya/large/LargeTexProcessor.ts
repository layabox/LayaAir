import { Laya } from "../../Laya";
import { Render2DProcessor } from "../display/Render2DProcessor";
import { LargeTexManager } from "./LargeTexManager";
import { ITextureProcessor } from "./ITextureProcessor";
import { TextureMergeShaderInit } from "./shader/TextureMergeShaderInit";
import { Texture } from "../resource/Texture";
import { Texture2D } from "../resource/Texture2D";
import { AutoTextureConfig } from "./AutoTextureConfig";
import { DynamicAtlasManager } from "./DynamicAtlasManager";


/**
 * @en Texture processor adapter that implements ITextureProcessor
 * @zh 实现 ITextureProcessor 的纹理处理器适配器
 */
export class TextureProcessorAdapter implements ITextureProcessor {
    private _dynamicAtlas: DynamicAtlasManager | null = null;

    constructor() {
        if (AutoTextureConfig.enableAutoDynamicAtlas && !this._dynamicAtlas) {
            this._dynamicAtlas = new DynamicAtlasManager();
        }
    }

    addTexture(texture: Texture): void {
        if (this.shouldAddToDynamicAtlas(texture)) {
            this._dynamicAtlas?.addTexture(texture);
        }
    }

    shouldAddToDynamicAtlas(texture: Texture): boolean {
        if (!AutoTextureConfig.enableAutoDynamicAtlas) {
            return false;
        }

        const bitmap = texture.bitmap;
        if (!(bitmap instanceof Texture2D)) {
            return false;
        }

        return bitmap.width < AutoTextureConfig.limitDynamicAtlasSize && 
               bitmap.height < AutoTextureConfig.limitDynamicAtlasSize;
    }
}


/**
 * @internal
 */
export class LargeTexProcessor {
    static _instance: LargeTexProcessor;
    mgrs: LargeTexManager[] = [];

    private _textureProcessor: ITextureProcessor;

    constructor(textureProcessor?: ITextureProcessor) {
        this._textureProcessor = textureProcessor || new TextureProcessorAdapter();
    }

    static addMgr(mgr: LargeTexManager) { 
        this._instance.addManager(mgr);
    }

    static removeMgr(mgr: LargeTexManager) {
        this._instance.removeManager(mgr);
    }

    /**
     * @en Get texture processor instance
     * @zh 获取纹理处理器实例
     */
    get textureProcessor(): ITextureProcessor {
        return this._textureProcessor;
    }

    /**
     * @en Set texture processor instance
     * @zh 设置纹理处理器实例
     * @param processor Texture processor instance
     */
    setTextureProcessor(processor: ITextureProcessor): void {
        this._textureProcessor = processor;
    }

    addManager(mgr: LargeTexManager) {
        this.mgrs.push(mgr);
        if (this.mgrs.length === 1) {
            Laya.stage.timer.loop(200, this, this.update);
        }
    }

    removeManager(mgr: LargeTexManager) {
        this.mgrs.splice(this.mgrs.indexOf(mgr), 1);
        if (this.mgrs.length === 0) {
            Laya.stage.timer.clear(this, this.update);
        }
    }

    /**
     * 分帧更新大图
     * @param force 强制更新
     */
    update(force: boolean = false) {
        if (!force && Laya.stage.getTimeFromFrameStart() > 100) return;

        const ary = this.mgrs;
        let n = ary.length;
        for (let i = 0; i < n; i++) {
            const o = ary[i];
            if (!o) continue;
            o.onUpdate();
            if (!force && Laya.stage.getTimeFromFrameStart() > 30) break;
        }
        if (ary.length != n)
            ary.length = n;
    }
}

Laya.addAfterInitCallback(() => {
    TextureMergeShaderInit.init();
    LargeTexProcessor._instance = new LargeTexProcessor();
    Render2DProcessor.runner._textureProcessor = LargeTexProcessor._instance.textureProcessor;
});