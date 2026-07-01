import { Config } from "../../Config";
import { Laya } from "../../Laya";
import { Render2DProcessor } from "../display/Render2DProcessor";
import { Blit2DCMD } from "../display/Scene2DSpecial/RenderCMD2D/Blit2DCMD";
import { CommandBuffer2D } from "../display/Scene2DSpecial/RenderCMD2D/CommandBuffer2D";
import { Vector4 } from "../maths/Vector4";
import { FilterMode } from "../RenderEngine/RenderEnum/FilterMode";
import { RenderTargetFormat } from "../RenderEngine/RenderEnum/RenderTargetFormat";
import { TextureFormat } from "../RenderEngine/RenderEnum/TextureFormat";
import { Shader3D } from "../RenderEngine/RenderShader/Shader3D";
import { RenderTexture } from "../resource/RenderTexture";
import { Texture2D } from "../resource/Texture2D";
import { TextureArrayLayerAllocation, TextureArrayRegistry2D } from "../webgl/utils/TextureArrayRegistry2D";
import { TextureMergeShaderInit } from "./shader/TextureMergeShaderInit";

export class LargeTex extends RenderTexture {
    cmdBuffer: CommandBuffer2D;
    private _arrayAlloc: TextureArrayLayerAllocation;
    private _limitMipmap: number = -1;
    private _willDestroyTex: Texture2D[] = [];
    private _shader: Shader3D;

    /**
     * @en Whether to immediately execute the merge
     * @zh 是否立即执行合并
     */
    immediately: boolean = false;
    /**
     * @en Commands
     * @zh 命令
     */
    commands: Set<Blit2DCMD> = new Set();
    /**
     * @en Wait merge ids
     * @zh 等待合并的纹理ID
     */
    private _waitMergeIds: Set<number> = new Set();

    constructor(width: number, height: number, format: RenderTargetFormat = RenderTargetFormat.R8G8B8A8,
        depthStencilFormat: RenderTargetFormat = null, mipmap: boolean = false, limitMipmap: number = -1,
        sRGB: boolean = true, gammaCorrection: number = 1.0) {
        super(width, height, format, depthStencilFormat, mipmap, 1, false, sRGB);
        this._limitMipmap = limitMipmap;
        this.anisoLevel = 1;
        if (this._limitMipmap >= 0) {
            if (this.mipmapCount > this._limitMipmap)
                this._setMaxMipmapLevel(this._limitMipmap);
        }
        this._shader = Shader3D.find("TexMerge");
        this._texture.gammaCorrection = gammaCorrection;
    }

    _createRenderTarget(): void {
        if (Config.useTextureArray) {
            const alloc = TextureArrayRegistry2D.allocateLayerAsTexture(this.width, this.height, <RenderTargetFormat><any>this._format,
                64, this._gammaSpace, this._depthStencilFormat, this._generateMipmap);
            if (alloc) {
                this._arrayAlloc = alloc;
                this._dimension = alloc.sharedRT.dimension;
                this._renderTarget = alloc.sharedRT._renderTarget;
                this._generateMipmap = alloc.sharedRT.generateMipmap;
                this._texture = alloc.sharedRT._texture;
                TextureArrayRegistry2D.register(this, alloc);
                this._bindTextureArrayLayer();
                return;
            }
        }
        super._createRenderTarget();
    }

    /**
     * 分帧调用的Update函数
     * @param force 是否强制更新
     * @returns 完成绘制的纹理ID列表
     */
    onUpdate(force: boolean = false) {
        if (!this.cmdBuffer || !this.commands.size) return null;

        let values = this.commands.values();
        let cmd = values.next().value;
        let ids = [];
        let cacheInvertY = Render2DProcessor.rendercontext2D.invertY;
        while (cmd && (force || Laya.stage.getTimeFromFrameStart() < 30)) {
            this.cmdBuffer.addCacheCommand(cmd);
            this._bindTextureArrayLayer();
            this.cmdBuffer.applyOne(true);
            this.commands.delete(cmd);

            this._waitMergeIds.delete(cmd.source.id);
            ids.push(cmd.source.id);

            cmd = values.next().value;
        }
        Render2DProcessor.rendercontext2D.invertY = cacheInvertY;
        this.commands.size || this._doDestoryTex();
        return ids;
    }

    /**
     * 是否等待合并
     * @param id 纹理ID
     * @returns 是否等待合并
     */
    hasWaitMerge(id: number): boolean {
        return this._waitMergeIds.has(id);
    }

    /**
     * 设置Mipmap最大层次
     * @param count 
     */
    private _setMaxMipmapLevel(count: number) {
        this.baseMipmapLevel = 0;
        this.maxMipmapLevel = count;
    }

    /**
     * 绘制小贴图到大贴图上，带扩边功能
     * @param x 绘制到大贴图的位置x
     * @param y 绘制到大贴图的位置y
     * @param w 绘制到大贴图的宽度
     * @param h 绘制到大贴图的高度
     * @param expand 扩边像素数
     * @param smallTex 小贴图
     */
    addTexture(x: number, y: number, w: number, h: number, expand: number, smallTex: Texture2D, needRemove: boolean) {
        let cmd = null;
        if (expand > 0)
            cmd = this._drawTex(x, y, w, h, expand, smallTex);
        cmd = this._drawTex(x, y, w, h, 0, smallTex);
        if (needRemove)
            this._willDestroyTex.push(smallTex);
        return cmd;
    }

    /**
     * 向大贴图指定的位置和尺寸填充颜色
     * @param x 填充的位置x
     * @param y 填充的位置y
     * @param w 填充的宽度
     * @param h 填充的高度 
     * @param color 填充的颜色
     * @param format 贴图格式
     */
    addColor(x: number, y: number, w: number, h: number, color: Vector4, format: number) {
        let cf: Uint8Array;
        let smallTex: Texture2D;
        if (format == TextureFormat.R8G8B8) {
            const r = color.x * 255;
            const g = color.y * 255;
            const b = color.z * 255;
            cf = new Uint8Array(w * h * 3);
            for (let i = 0; i < h; i++) {
                for (let j = 0; j < w; j++) {
                    let index = i * w * 3 + j * 3;
                    cf[index] = r;
                    cf[index + 1] = g;
                    cf[index + 2] = b;
                }
            }
        }
        else if (format == TextureFormat.R8G8B8A8) {
            const r = color.x * 255;
            const g = color.y * 255;
            const b = color.z * 255;
            const a = color.w * 255;
            cf = new Uint8Array(w * h * 4);
            for (let i = 0; i < h; i++) {
                for (let j = 0; j < w; j++) {
                    let index = i * w * 4 + j * 4;
                    cf[index] = r;
                    cf[index + 1] = g;
                    cf[index + 2] = b;
                    cf[index + 3] = a;
                }
            }
        }
        smallTex = this._createSmallTex(w, h, cf);
        let cmd = this._drawTex(x, y, w, h, 0, smallTex);
        this._willDestroyTex.push(smallTex);
        return cmd;
    }

    /**
     * 向大贴图填充颜色
     * @param color 填充的颜色
     * @param format 贴图格式
     */
    fillColor(color: Vector4, format: number) {
        const x = 0, y = 0, w = 4, h = 4;
        let cf: Uint8Array;
        let smallTex: Texture2D;
        if (format == TextureFormat.R8G8B8) {
            const r = color.x * 255;
            const g = color.y * 255;
            const b = color.z * 255;
            cf = new Uint8Array(w * h * 3);
            for (let i = 0; i < h; i++) {
                for (let j = 0; j < w; j++) {
                    let index = i * w * 3 + j * 3;
                    cf[index] = r;
                    cf[index + 1] = g;
                    cf[index + 2] = b;
                }
            }
        }
        else if (format == TextureFormat.R8G8B8A8) {
            const r = color.x * 255;
            const g = color.y * 255;
            const b = color.z * 255;
            const a = color.w * 255;
            cf = new Uint8Array(w * h * 4);
            for (let i = 0; i < h; i++) {
                for (let j = 0; j < w; j++) {
                    const index = i * w * 4 + j * 4;
                    cf[index] = r;
                    cf[index + 1] = g;
                    cf[index + 2] = b;
                    cf[index + 3] = a;
                }
            }
        }
        smallTex = this._createSmallTex(w, h, cf);
        this._drawTex(x, y, this.width, this.height, 0, smallTex);
        this._willDestroyTex.push(smallTex);
    }

    /**
     * 销毁对象，清理内存
     */
    destroy() {
        super.destroy();
        this.cmdBuffer && this.cmdBuffer.clear();
        this.cmdBuffer = null;
        this._doDestoryTex();
        this._willDestroyTex = null;
    }

    protected _disposeResource(): void {
        if (this._arrayAlloc) {
            TextureArrayRegistry2D.unregister(this as any);
            this._arrayAlloc = null;
            this._renderTarget = null;
            this._texture = null;
            return;
        }
        super._disposeResource();
    }

    private _createSmallTex(w: number, h: number, pixelArray: Uint8Array): Texture2D {
        const smallTex = new Texture2D(w, h, this.format, false, false, false);
        smallTex.setPixelsData(pixelArray, false, false);
        smallTex.filterMode = FilterMode.Point;
        return smallTex;
    }

    private _doDestoryTex() {
        if (this._willDestroyTex)
            while (this._willDestroyTex.length)
                this._willDestroyTex.pop().destroy();
    }

    private _bindTextureArrayLayer(): void {
        if (this._arrayAlloc)
            this._arrayAlloc.sharedRT.bindLayer(this._arrayAlloc.layer);
    }

    private _drawTex(x: number, y: number, w: number, h: number, expand: number, smallTex: Texture2D) {
        const width = this.width; //大贴图宽度
        const height = this.height; //大贴图高度
        const offsetScale = new Vector4(); //偏移和放缩系数
        offsetScale.x = Math.max(0, x - expand) / width;

        offsetScale.y = Math.max(0, height - y - h - expand) / height;
        offsetScale.z = (w + expand * 2) / width;
        offsetScale.w = (h + expand * 2) / height;

        let sd = TextureMergeShaderInit._sdNotChange;
        if (this.gammaSpace) {
            if (smallTex.gammaSpace) {
                sd = TextureMergeShaderInit._sdNotChange;
            } else {
                sd = TextureMergeShaderInit._sdLinearToGamma;
            }
        } else {
            if (smallTex.gammaSpace) {
                sd = TextureMergeShaderInit._sdGammaToLinear;
            } else {
                sd = TextureMergeShaderInit._sdNotChange;
            }
        }
        //采用实时渲染方式将小贴图绘制到大贴图上
        let cmd = Blit2DCMD.create(smallTex, this, offsetScale, this._shader, sd , false);
        this.commands.add(cmd);
        
        //立即执行绘制
        if (this.immediately) {
            this.onUpdate(true);
        } else {
            this._waitMergeIds.add(smallTex.id);
        }

        return cmd;
    }
}
