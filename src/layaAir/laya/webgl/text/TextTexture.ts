import { RenderInfo } from "../../renders/RenderInfo"
import { CharRenderInfo } from "./CharRenderInfo"
import { ILaya } from "../../../ILaya";
import { Texture2D } from "../../resource/Texture2D";
import { TextureFormat } from "../../RenderEngine/RenderEnum/TextureFormat";
import { FilterMode } from "../../RenderEngine/RenderEnum/FilterMode";
import { WrapMode } from "../../RenderEngine/RenderEnum/WrapMode";
import { TextAtlas } from "./TextAtlas";
import { LayaEnv } from "../../../LayaEnv";
import { TextRender } from "./TextRender";
import { LayaGL } from "../../layagl/LayaGL";

/**
 * 保存文字的贴图
 */
export class TextTexture extends Texture2D {
    private static pool: TextTexture[] = new Array(10); // 回收用
    private static poolLen = 0;
    private static cleanTm = 0;
    static EVENT_REUSE='texture_recycling'

    /**@internal */
    _discardTm = 0;			//释放的时间。超过一定时间会被真正删除
    genID = 0; 				// 这个对象会重新利用，为了能让引用他的人知道自己引用的是否有效，加个id
    curUsedCovRate = 0; 	// 当前使用到的使用率。根据面积算的
    curUsedCovRateAtlas = 0; 	// 大图集中的占用率。由于大图集分辨率低，所以会浪费一些空间
    lastTouchTm = 0;
    ri: CharRenderInfo = null; 		// 如果是独立文字贴图的话带有这个信息
    //public var isIso:Boolean = false;
    constructor(textureW=TextRender.atlasWidth, textureH=TextRender.atlasWidth) {
        super(textureW,textureH,TextureFormat.R8G8B8A8,false,false,true,true);
        this.setPixelsData(null, true, false);
        this.lock = true;//防止被资源管理清除
        //    this._render2DContext = LayaGL.render2DContext;
        this.filterMode = FilterMode.Bilinear;
        this.wrapModeU = WrapMode.Clamp;
        this.wrapModeV = WrapMode.Clamp;

        //TODO 预乘alpha
        if (TextRender.debugUV) {
            this.fillWhite();
        }
    }

    /**
     * 添加一个文字位图
     * @param	data
     * @param	x			拷贝位置。
     * @param	y
     * @param  uv  
     * @return uv数组  如果uv不为空就返回传入的uv，否则new一个数组
     */
    addChar(data: ImageData, x: number, y: number, uv: any[] = null): any[] {
        //if (!LayaEnv.isConch &&  !__JS__('(data instanceof ImageData)')) {
        if (TextRender.isWan1Wan) {
            return this.addCharCanvas(data, x, y, uv);
        }
        var dt: any = data.data;
        if (data.data instanceof Uint8ClampedArray)
            dt = new Uint8Array(dt.buffer);

        LayaGL.textureContext.setTextureSubPixelsData(this._texture, dt, 0, false, x, y, data.width, data.height, true, false);
        var u0: number;
        var v0: number;
        var u1: number;
        var v1: number;
        u0 = x / this.width;
        v0 = y / this.height;
        u1 = (x + data.width) / this.width;
        v1 = (y + data.height) / this.height;
        uv = uv || new Array(8);
        uv[0] = u0, uv[1] = v0;
        uv[2] = u1, uv[3] = v0;
        uv[4] = u1, uv[5] = v1;
        uv[6] = u0, uv[7] = v1;
        return uv;
    }

    /**
     * 添加一个文字
     * 玩一玩不支持 getImageData，只能用canvas的方式
     * @param	canv
     * @param	x
     * @param	y
     */
    addCharCanvas(canv: any, x: number, y: number, uv: any[] = null): any[] {

        LayaGL.textureContext.setTextureSubImageData(this._texture, canv, x, y, true, false);
        var u0: number;
        var v0: number;
        var u1: number;
        var v1: number;
        if (LayaEnv.isConch) {
            u0 = x / this.width;		// +1 表示内缩一下，反正文字总是有留白。否则会受到旁边的一个像素的影响
            v0 = y / this.height;
            u1 = (x + canv.width) / this.width;
            v1 = (y + canv.height) / this.height;
        } else {
            u0 = (x + 1) / this.width;		// +1 表示内缩一下，反正文字总是有留白。否则会受到旁边的一个像素的影响
            v0 = (y + 1) / this.height;
            u1 = (x + canv.width - 1) / this.width;
            v1 = (y + canv.height - 1) / this.height;
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
        var dt = new Uint8Array(this.width * this.height * 4);
        dt.fill(0xff);
        LayaGL.textureContext.setTextureImageData(this._getSource(), dt as any, true, false);
    }

    discard(): void {
        // 文字贴图的释放要触发全局cacheas normal无效
        ILaya.stage.setGlobalRepaint();
        // 不再使用问题贴图的重用，否则会有内容清理问题
        this.destroy();
        return;
    }

    static getTextTexture(w: number, h: number): TextTexture {
        // 不再回收
        return new TextTexture(w, h);
    }

    /**
     * 定期清理
     * 为了简单，只有发生 getAPage 或者 discardPage的时候才检测是否需要清理
     * 
     * 暂时先不用这个了。
     */
    static clean(): void {
        var curtm = RenderInfo.loopStTm;// Laya.stage.getFrameTm();
        if (TextTexture.cleanTm === 0) TextTexture.cleanTm = curtm;
        //每隔checkCleanTextureDt看看pool中的贴图有没有很老的可以删除的
        if (curtm - TextTexture.cleanTm >= TextRender.checkCleanTextureDt) {	
            for (let i = 0; i < TextTexture.poolLen; i++) {
                var p = TextTexture.pool[i];
                if (curtm - p._discardTm >= TextRender.destroyUnusedTextureDt) {//超过20秒没用的删掉
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
    touchTexture(){
        let frame = RenderInfo.loopCount;
        if (this.lastTouchTm != frame) {
            //每帧都重新统计覆盖率
            this.curUsedCovRate = 0;
            this.curUsedCovRateAtlas = 0;
            this.lastTouchTm = frame;
        }
    }

    touchRect(ri: CharRenderInfo, frame: number): void {
        if (this.lastTouchTm != frame) {
            //每帧都重新统计覆盖率
            this.curUsedCovRate = 0;
            this.curUsedCovRateAtlas = 0;
            this.lastTouchTm = frame;
        }
        var texw2 = TextRender.atlasWidth * TextRender.atlasWidth;
        var gridw2 = TextAtlas.atlasGridW * TextAtlas.atlasGridW;
        this.curUsedCovRate += (ri.bmpWidth * ri.bmpHeight) / texw2;
        this.curUsedCovRateAtlas += (Math.ceil(ri.bmpWidth / TextAtlas.atlasGridW) * Math.ceil(ri.bmpHeight / TextAtlas.atlasGridW)) / (texw2 / gridw2);
    }
}
