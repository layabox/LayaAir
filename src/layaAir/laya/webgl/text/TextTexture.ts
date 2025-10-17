import { CharRenderInfo } from "./CharRenderInfo"
import { Texture2D } from "../../resource/Texture2D";
import { TextureFormat } from "../../RenderEngine/RenderEnum/TextureFormat";
import { FilterMode } from "../../RenderEngine/RenderEnum/FilterMode";
import { WrapMode } from "../../RenderEngine/RenderEnum/WrapMode";
import { LayaEnv } from "../../../LayaEnv";
import { LayaGL } from "../../layagl/LayaGL";
import { Render } from "../../renders/Render";
import { TextRenderConfig } from "./TextRenderConfig";
import { Stat } from "../../utils/Stat";
import { TextureArrayRegistry2D } from "../utils/TextureArrayRegistry2D";
import { Config } from "../../../Config";

/**
 * 保存文字的贴图
 * @blueprintIgnore
 */
export class TextTexture extends Texture2D {
    private static pool: TextTexture[] = new Array(10); // 回收用
    private static poolLen = 0;
    private static cleanTm = 0;

    //static EVENT_REUSE = 'texture_recycling';

    genID = 0;  // 这个对象会重新利用，为了能让引用他的人知道自己引用的是否有效，加个id
    curUsedCovRate = 0;  // 当前使用到的使用率。根据面积算的
    curUsedCovRateAtlas = 0;  // 大图集中的占用率。由于大图集分辨率低，所以会浪费一些空间
    lastTouchTm = 0;
    ri: CharRenderInfo = null; // 如果是独立文字贴图的话带有这个信息

    private _discardTm = 0; //释放的时间。超过一定时间会被真正删除

    //public var isIso:Boolean = false;
    constructor(textureW: number, textureH: number) {
        super(textureW, textureH, TextureFormat.R8G8B8A8, false, false, true, true);
        this.setPixelsData(null, true, false);
        this.lock = true;//防止被资源管理清除
        //    this._render2DContext = LayaGL.render2DContext;
        this.filterMode = FilterMode.Bilinear;
        this.wrapModeU = WrapMode.Clamp;
        this.wrapModeV = WrapMode.Clamp;

        //TODO 预乘alpha
        if (TextRenderConfig.debugUV) {
            this.fillWhite();
        }

        if(Config.useTextureArray && TextRenderConfig.useTextureArray){
            // 尝试从数组纹理池分配一层并注册映射，使本 TextTexture 被绘制时自动替换为 Texture2DArray+layer
            //const alloc = TextureArrayRegistry2D.allocateLayerAsTexture(textureW, textureH, TextureFormat.R8G8B8A8, 64, /*sRGB*/ true);
            const alloc = TextureArrayRegistry2D.allocateLayerAsTexture(textureW, textureH, TextureFormat.R8G8B8A8, 16, /*sRGB*/ true);
            if (alloc) {
                // 以当前 TextTexture 为 key 进行注册（基于 id），这样由它派生的子纹理也会命中映射
                TextureArrayRegistry2D.register(this, alloc.array, alloc.layer);
                // 同步滤波/包裹到数组纹理
                //alloc.array.filterMode = this.filterMode;
                //alloc.array.wrapModeU = this.wrapModeU;
                //alloc.array.wrapModeV = this.wrapModeV;
            }
        }
    }

    /**
     * 添加一个文字位图
     * @param data
     * @param x 拷贝位置。
     * @param y
     * @param  uv  
     * @return uv数组  如果uv不为空就返回传入的uv，否则new一个数组
     */
    addChar(data: ImageData | HTMLCanvasElement, x: number, y: number, uv?: number[]): number[] {
        const reg = TextureArrayRegistry2D.resolve(this);
        if (reg) {
            // 写入数组纹理的指定层
            if (TextRenderConfig.useImageData) {
                var dt: any = (<ImageData>data).data;
                if ((<ImageData>data).data instanceof Uint8ClampedArray){
                    dt = new Uint8Array(dt.buffer);
                }
                reg.array.setSubPixelsData(x, y, reg.layer, data.width, data.height, 1, dt, 0, false, false, false);
            } else {
                // Canvas 路径：先读回像素
                throw 'texturearray怎么上传canvas对象'
            }
        } else {
            // 旧路径：写到自身 Texture2D（非数组纹理）
            if (TextRenderConfig.useImageData) {
                var dt: any = (<ImageData>data).data;
                if ((<ImageData>data).data instanceof Uint8ClampedArray)
                    dt = new Uint8Array(dt.buffer);
                LayaGL.textureContext.setTextureSubPixelsData(this._texture, dt, 0, false, x, y, data.width, data.height, true, false);
            }
            else {
                LayaGL.textureContext.setTextureSubImageData(this._texture, <HTMLCanvasElement>data, x, y, true, false);
            }
        }

        let u0: number;
        let v0: number;
        let u1: number;
        let v1: number;
        if (LayaEnv.isConch || dt != null) {
            u0 = x / this.width; // +1 表示内缩一下，反正文字总是有留白。否则会受到旁边的一个像素的影响
            v0 = y / this.height;
            u1 = (x + data.width) / this.width;
            v1 = (y + data.height) / this.height;
        } else {
            u0 = (x + 1) / this.width; // +1 表示内缩一下，反正文字总是有留白。否则会受到旁边的一个像素的影响
            v0 = (y + 1) / this.height;
            u1 = (x + data.width - 1) / this.width;
            v1 = (y + data.height - 1) / this.height;
        }
        uv = uv || new Array(8);
        uv[0] = u0, uv[1] = v0;
        uv[2] = u1, uv[3] = v0;
        uv[4] = u1, uv[5] = v1;
        uv[6] = u0, uv[7] = v1;
        return uv;
    }

    /**
     * 填充白色。调试用。
     */
    fillWhite(): void {
        const reg = TextureArrayRegistry2D.resolve(this);
        if (reg) {
            var dt = new Uint8Array(this.width * this.height * 4);
            dt.fill(0xff);
            reg.array.setSubPixelsData(0, 0, reg.layer, this.width, this.height, 1, dt, 0, false, true, false);
        } else {
            var dt = new Uint8Array(this.width * this.height * 4);
            dt.fill(0xff);
            LayaGL.textureContext.setTextureImageData(this._getSource(), dt as any, true, false);
        }
    }

    discard(): void {
        // 文字贴图的释放要触发全局cacheas normal无效
        Render.setGlobalRepaint();
        // 不再使用问题贴图的重用，否则会有内容清理问题
        this.destroy();
        return;
    }

    static getTextTexture(w: number, h: number): TextTexture {
        // 默认走数组纹理路径（构造函数里会分配层并注册），回退则使用单纹理
        return new TextTexture(w, h);
    }

    /**
     * 定期清理
     * 为了简单，只有发生 getAPage 或者 discardPage的时候才检测是否需要清理
     * 
     * 暂时先不用这个了。
     */
    static clean(): void {
        var curtm = performance.now();
        if (TextTexture.cleanTm === 0) TextTexture.cleanTm = curtm;
        //每隔checkCleanTextureDt看看pool中的贴图有没有很老的可以删除的
        if (curtm - TextTexture.cleanTm >= TextRenderConfig.checkCleanTextureDt) {
            for (let i = 0; i < TextTexture.poolLen; i++) {
                var p = TextTexture.pool[i];
                if (curtm - p._discardTm >= TextRenderConfig.destroyUnusedTextureDt) {//超过20秒没用的删掉
                    p.destroy();					//真正删除贴图
                    // 如果回收的话要正确通知使用这个贴图的
                    //p.event(TextTexture.EVENT_REUSE)
                    TextTexture.pool[i] = TextTexture.pool[TextTexture.poolLen - 1];
                    TextTexture.poolLen--;
                    i--;	//这个还要处理，用来抵消i++
                }
            }
            TextTexture.cleanTm = curtm;
        }
    }

    /**
     * 这个贴图被当前帧使用了。
     * 这个是基于贴图的，更简单，效率更高
     */
    touchTexture() {
        let frame = Stat.loopCount;
        if (this.lastTouchTm != frame) {
            //每帧都重新统计覆盖率
            this.curUsedCovRate = 0;
            this.curUsedCovRateAtlas = 0;
            this.lastTouchTm = frame;
        }
    }

    touchRect(ri: CharRenderInfo): void {
        var texw2 = TextRenderConfig.atlasWidth * TextRenderConfig.atlasWidth;
        var gridw2 = TextRenderConfig.atlasGridW * TextRenderConfig.atlasGridW;
        this.curUsedCovRate += (ri.bmpWidth * ri.bmpHeight) / texw2;
        this.curUsedCovRateAtlas += (Math.ceil(ri.bmpWidth / TextRenderConfig.atlasGridW) * Math.ceil(ri.bmpHeight / TextRenderConfig.atlasGridW)) / (texw2 / gridw2);
    }
}
