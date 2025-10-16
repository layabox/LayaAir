
import { Laya } from "../../Laya";
import { Blit2DCMD } from "../display/Scene2DSpecial/RenderCMD2D/Blit2DCMD";
import { Command2D } from "../display/Scene2DSpecial/RenderCMD2D/Command2D";
import { CommandBuffer2D } from "../display/Scene2DSpecial/RenderCMD2D/CommandBuffer2D";
import { LayaGL } from "../layagl/LayaGL";
import { Vector4 } from "../maths/Vector4";
import { FilterMode } from "../RenderEngine/RenderEnum/FilterMode";
import { RenderTargetFormat } from "../RenderEngine/RenderEnum/RenderTargetFormat";
import { TextureFormat } from "../RenderEngine/RenderEnum/TextureFormat";
import { Shader3D } from "../RenderEngine/RenderShader/Shader3D";
import { RenderTexture } from "../resource/RenderTexture";
import { Texture2D } from "../resource/Texture2D";
import { TextureArrayRegistry2D } from "../webgl/utils/TextureArrayRegistry2D";
import { TextureMergeShaderInit } from "./shader/TextureMergeShaderInit";


export class LargeTex extends RenderTexture {
    cmdBuffer: CommandBuffer2D;
    private _limitMipmap: number = -1; //是否限制mipmap层数
    private _willDestroyTex : Texture2D[] = []; //待删除小贴图队列
    private _shader: Shader3D; //合图的着色器
    /**
     * @en Whether to immediately execute the merge
     * @zh 是否立即执行合并
     */
    immediately: boolean = false; 
    /**
     * @en Commands
     * @zh 命令
     */
    commands: Set<Command2D> = new Set();

    constructor(width: number, height: number, format: RenderTargetFormat = RenderTargetFormat.R8G8B8A8,
        depthStencilFormat: RenderTargetFormat = null, mipmap: boolean = false, limitMipmap: number = -1, sRGB: boolean = true) {
        super(width, height, format, depthStencilFormat, mipmap, 1, false, sRGB);
        this._limitMipmap = limitMipmap;
        this.anisoLevel = 1;
        if (this._limitMipmap >= 0) {
            if (this.mipmapCount > this._limitMipmap)
                this._setMaxMipmapLevel(this._limitMipmap);
        }
        this._shader = Shader3D.find("TexMerge");

        // WebGPU：将渲染目标直接指向 Texture2DArray 的单层
        const isWebGPU = !!((LayaGL.renderEngine as any).objectName as string).includes('GPU');
        if (isWebGPU) {
            const alloc = TextureArrayRegistry2D.allocateLayerAsTexture(width, height, <any>TextureFormat.R8G8B8A8, 64, sRGB);
            const tc: any = LayaGL.textureContext;
            if (alloc && tc ) {
                // 用数组层重建 RT
                this._disposeResource();
                // 内部纹理对象
                const internalArrayTex = alloc.array._texture;
                this._renderTarget = tc.createRenderTargetFromArrayLayer(internalArrayTex, alloc.layer, format, 
                    depthStencilFormat, sRGB);
                // RenderTexture 的采样源沿用 color attachment
                // @ts-ignore
                this._texture = (this._renderTarget as any)._textures[0];
                // 注册映射：采样 LargeTex 时自动切换为数组纹理指定层
                TextureArrayRegistry2D.register(this as any, alloc.array, alloc.layer);
            }
        }
    }

    /**
     * 分帧调用的Update函数
     */
    onUpdate(force: boolean = false) {

        if (!this.cmdBuffer || !this.commands.size) return;

        let values = this.commands.values();
        let cmd = values.next().value;
        while (cmd && (force || Laya.stage.getTimeFromFrameStart() < 30)) {
            this.cmdBuffer.addCacheCommand(cmd);
            this.cmdBuffer.applyOne(true);
            this.commands.delete(cmd);
            cmd = values.next().value;
        }
        
        this.commands.size || this._doDestoryTex();
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

    /**
     * 创建小贴图
     * @param w 宽度
     * @param h 高度
     * @param pixelArray 像素数据 
     * @returns 贴图对象
     */
    private _createSmallTex(w: number, h: number, pixelArray: Uint8Array): Texture2D {
        const smallTex = new Texture2D(w, h, this.format, false, false, false);
        smallTex.setPixelsData(pixelArray, false, false);
        smallTex.filterMode = FilterMode.Point;
        return smallTex;
    }

    /**
     * 删除小贴图
     */
    private _doDestoryTex() {
        if (this._willDestroyTex)
            while (this._willDestroyTex.length)
                this._willDestroyTex.pop().destroy();
    }

    /**
     * 绘制小贴图到大贴图上，包含扩边功能
     * @param x 绘制到大贴图的位置x
     * @param y 绘制到大贴图的位置y
     * @param w 绘制到大贴图的宽度
     * @param h 绘制到大贴图的高度
     * @param expand 扩边像素数
     * @param smallTex 小贴图
     */
    private _drawTex(x: number, y: number, w: number, h: number, expand: number, smallTex: Texture2D) {
        const width = this.width; //大贴图宽度
        const height = this.height; //大贴图高度
        const offsetScale = new Vector4(); //偏移和放缩系数
        offsetScale.x = Math.max(0, x - expand) / width;
        offsetScale.y = Math.max(0, height - y - h - expand) / height;
        offsetScale.z = (w + expand * 2) / width;
        offsetScale.w = (h + expand * 2) / height;

        let sd = TextureMergeShaderInit._sdNotChange;
        if (this.gammaSpace && !smallTex.gammaSpace) {
            sd = TextureMergeShaderInit._sdGammaToLinear;
            console.log("gamma to linear url =", smallTex.url);
        }
        else if (!this.gammaSpace && smallTex.gammaSpace) {
            sd = TextureMergeShaderInit._sdLinearToGamma;
            console.log("linear to gamma url =", smallTex.url);
        }
        //采用实时渲染方式将小贴图绘制到大贴图上
        let cmd = Blit2DCMD.create(smallTex, this, offsetScale, this._shader, sd);
        this.commands.add(cmd);
        //立即执行绘制
        if (this.immediately) { 
            this.onUpdate(true);
        }

        return cmd;
    }
}