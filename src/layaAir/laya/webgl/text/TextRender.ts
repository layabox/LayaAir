import { TextAtlas } from "./TextAtlas";
import { TextTexture } from "./TextTexture";
import { Sprite } from "../../display/Sprite"
import { Point } from "../../maths/Point"
import { RenderInfo } from "../../renders/RenderInfo"
import { Context } from "../../renders/Context"
import { Texture } from "../../resource/Texture"
import { FontInfo } from "../../utils/FontInfo"
import { WordText } from "../../utils/WordText"
import { CharRenderInfo } from "./CharRenderInfo"
import { CharRender_Canvas } from "./CharRender_Canvas"
import { ICharRender } from "./ICharRender"
import { ILaya } from "../../../ILaya";
import { Const } from "../../Const";
import { IFontMeasure } from "./MeasureFont";
import { EventDispatcher } from "../../events/EventDispatcher";

export class TextRender extends EventDispatcher {
    //config
    static useOldCharBook = false;
    static atlasWidth = 1024;
    static noAtlas = false;				// 一串文字用独立贴图
    static forceSplitRender = false;	    // 强制把一句话拆开渲染
    static forceWholeRender = false; 	// 强制整句话渲染
    static scaleFontWithCtx = true;		// 如果有缩放，则修改字体，以保证清晰度
    static maxFontScale = 4;            //当scaleFontWithCtx为true时，最大允许放大的倍数
    static standardFontSize = 32;			// 测量的时候使用的字体大小
    static destroyAtlasDt = 10;					// 回收图集贴图的时间
    static checkCleanTextureDt = 2000;		// 检查是否要真正删除纹理的时间。单位是ms
    static destroyUnusedTextureDt = 3000; 	// 长时间不用的纹理删除的时间。单位是ms
    static cleanMem = 100 * 1024 * 1024;		// 多大内存触发清理图集。这时候占用率低的图集会被清理
    static isWan1Wan = false;
    static showLog = false;
    static debugUV = false;				// 文字纹理需要保护边。当像素没有对齐的时候，可能会采样到旁边的贴图。true则填充texture为白色，模拟干扰
    //config

    /**
     * fontSizeInfo
     * 记录每种字体的像素的大小。标准是32px的字体。由4个byte组成，分别表示[xdist,ydist,w,h]。 
     * xdist,ydist 是像素起点到排版原点的距离，都是正的，表示实际数据往左和上偏多少，如果实际往右和下偏，则算作0，毕竟这个只是一个大概
     * 例如 [Arial]=0x00002020, 表示宽高都是32
     */
    private fontSizeInfo: { [key: string]: number } = {};
    charRender: ICharRender;
    private mapFont: any = {};		// 把font名称映射到数字
    private fontID = 0;

    private fontScaleX = 1.0;						//临时缩放。
    private fontScaleY = 1.0;

    //private var charMaps:Object = {};	// 所有的都放到一起

    private _curStrPos = 0;		//解开一个字符串的时候用的。表示当前解到什么位置了
    static textRenderInst: TextRender;	//debug

    textAtlases: TextAtlas[] = [];		// 所有的大图集
    private isoTextures: TextTexture[] = [];	// 所有的独立贴图

    private static imgdtRect = [0, 0, 0, 0];

    // 当前字体的测量信息。
    private lastFont: FontInfo | null = null;
    private fontSizeW = 0;
    private fontSizeH = 0;
    private fontSizeOffX = 0;
    private fontSizeOffY = 0;

    private renderPerChar = true;	// 是否是单个字符渲染。这个是结果，上面的是配置
    private fontStr: string;				// 因为要去掉italic，所以自己保存一份
    static simClean = false;				// 测试用。强制清理占用低的图集

    private _fontMeasure: IFontMeasure = null;

    constructor() {
        super();
        var bugIOS = false;//是否是有bug的ios版本
        //在微信下有时候不显示文字，所以采用canvas模式，现在测试微信好像都好了，所以去掉了。
        var miniadp: any = ILaya.Laya['MiniAdpter']; //头条也继承了这个bug
        if (miniadp && miniadp.systemInfo && miniadp.systemInfo.system) {
            bugIOS = miniadp.systemInfo.system.toLowerCase() === 'ios 10.1.1';
            //12.3
        }
        if ((ILaya.Browser.onMiniGame ||
            ILaya.Browser.onTTMiniGame ||
            ILaya.Browser.onBLMiniGame ||
            ILaya.Browser.onAlipayMiniGame ||
            ILaya.Browser.onTBMiniGame) &&
            !bugIOS) TextRender.isWan1Wan = true; //android 微信下 字边缘发黑，所以不用getImageData了
        //TextRender.isWan1Wan = true;
        this.charRender = new CharRender_Canvas(2048, 2048, TextRender.scaleFontWithCtx, !TextRender.isWan1Wan, false);
        TextRender.textRenderInst = this;
        ILaya.Laya['textRender'] = this;
    }

    set fontMeasure(m: IFontMeasure) {
        this._fontMeasure = m;
    }

    get fontMeasure() {
        return this._fontMeasure;
    }

    private _wan1wansz(font: string, size: number) {
        let fontstr = 'bold ' + size + 'px ' + font;
        // 这时候无法获得imagedata，只能采取保险测量
        let fontSizeW = this.charRender.getWidth(fontstr, '有') * 1.5;
        let fontSizeH = size * 1.5;
        var szinfo = fontSizeW << 8 | fontSizeH;
        this.fontSizeInfo[font] = szinfo;
        return szinfo;
    }

    private getFontSizeInfo(font: string) {
        var finfo = this.fontSizeInfo[font];
        if (!finfo) {
            if (TextRender.isWan1Wan) {
                finfo = this._wan1wansz(font, TextRender.standardFontSize)
            } else {
                finfo = this._fontMeasure.getFontSizeInfo(font, TextRender.standardFontSize);
            }
            this.fontSizeInfo[font] = finfo;
        }
        return finfo;
    }

    /**
     * 设置当前字体，获得字体的大小信息。
     * @param	font
     */
    setFont(font: FontInfo): void {
        if (this.lastFont == font) return;
        this.lastFont = font;
        var fontsz = this.getFontSizeInfo(font._family);
        var offx = fontsz >> 24
        var offy = (fontsz >> 16) & 0xff;
        var fw = (fontsz >> 8) & 0xff;
        var fh = fontsz & 0xff;
        var k = font._size / TextRender.standardFontSize;
        this.fontSizeOffX = Math.ceil(offx * k);
        this.fontSizeOffY = Math.ceil(offy * k);
        this.fontSizeW = Math.ceil(fw * k);
        this.fontSizeH = Math.ceil(fh * k);
        if (font._font.indexOf('italic') >= 0) {// 先判断一下效率会高一些
            this.fontStr = font._font.replace('italic', '');
        } else {
            this.fontStr = font._font;
        }
    }

    /**
     * 从string中取出一个完整的char，例如emoji的话要多个
     * 会修改 _curStrPos
     * TODO 由于各种文字中的组合写法，这个需要能扩展，以便支持泰文等
     * @param	str
     * @param	start	开始位置
     */
    getNextChar(str: string): string | null {
        var len = str.length;
        var start = this._curStrPos;
        if (!str.substring) return null;	// 保护一下，避免下面 substring 报错
        if (start >= len)
            return null;

        //var link: boolean = false;	//如果是连接的话要再加一个完整字符
        var i = start;
        var state = 0; //0 初始化 1  正常 2 连续中
        for (; i < len; i++) {
            var c = str.charCodeAt(i);
            if ((c >>> 11) == 0x1b) { //可能是0b110110xx或者0b110111xx。 这都表示2个u16组成一个emoji
                if (state == 1) break;//新的字符了，要截断
                state = 1;	// 其他状态都转成正常读取字符状态，只是一次读两个
                i++;	//跨过一个。
            }
            else if (c === 0xfe0e || c === 0xfe0f) {	//样式控制字符
                // 继续。不改变状态
            }
            else if (c == 0x200d) {		//zero width joiner
                state = 2; 	// 继续
            } else {
                if (state == 0) state = 1;
                else if (state == 1) break;
                else if (state == 2) {
                    // 继续
                }
            }
        }
        this._curStrPos = i;
        return str.substring(start, i);
    }

    filltext(ctx: Context, data: string | WordText, x: number, y: number, fontStr: string, color: string, strokeColor: string, lineWidth: number, textAlign: string): void {
        if (data.length <= 0)
            return;
        //以后保存到wordtext中
        var font = FontInfo.parse(fontStr);

        var nTextAlign = 0;
        switch (textAlign) {
            case 'center':
                nTextAlign = Const.ENUM_TEXTALIGN_CENTER;
                break;
            case 'right':
                nTextAlign = Const.ENUM_TEXTALIGN_RIGHT;
                break;
        }
        this._fast_filltext(ctx, data, x, y, font, color, strokeColor, lineWidth, nTextAlign);
    }

    _fast_filltext(ctx: Context, data: string | WordText | null, x: number, y: number, font: FontInfo, color: string, strokeColor: string | null, lineWidth: number, textAlign: number): void {
        if (data && !(data.length >= 1)) return;	// length有可能是 undefined
        if (lineWidth < 0) lineWidth = 0;
        this.setFont(font);
        this.fontScaleX = this.fontScaleY = 1.0;
        if (TextRender.scaleFontWithCtx) {
            let sx = ctx.getMatScaleX();
            let sy = ctx.getMatScaleY();

            if (sx < 1e-4 || sy < 1e-1)
                return;

            if (sx > 1) this.fontScaleX = Math.min(TextRender.maxFontScale, sx);
            if (sy > 1) this.fontScaleY = Math.min(TextRender.maxFontScale, sy);
        }

        font._italic && (ctx._italicDeg = 13);
        //准备bmp
        //拷贝到texture上,得到一个gltexture和uv
        let wt = <WordText>data;
        let isWT = data instanceof WordText;
        let str = data && data.toString();//(<string>data);guo 某种情况下，str还是WordText（没找到为啥），这里保护一下

        /**
         * sameTexData 
         * WordText 中保存了一个数组，这个数组是根据贴图排序的，目的是为了能相同的贴图合并。
         * 类型是 {ri:CharRenderInfo,stx:int,sty:int,...}[文字个数][贴图分组]
         */
        let sameTexData: any[] = isWT ? wt.pageChars : [];

        let strWidth = 0;
        if (isWT) {
            str = wt.text;
            strWidth = wt.width;
            if (strWidth < 0) {
                strWidth = wt.width = this.charRender.getWidth(this.fontStr, str);	// 字符串长度是原始的。
            }
        } else {
            strWidth = str ? this.charRender.getWidth(this.fontStr, str) : 0;
        }

        //水平对齐方式
        switch (textAlign) {
            case Const.ENUM_TEXTALIGN_CENTER:
                x -= strWidth / 2;
                break;
            case Const.ENUM_TEXTALIGN_RIGHT:
                x -= strWidth;
                break;
        }

        //检查保存的数据是否有的已经被释放了
        if (isWT) {	// TODO 能利用lastGCCnt么
            //wt.lastGCCnt = _curPage.gcCnt;
            if (this.hasFreedText(sameTexData) || wt.pagecharsCtx != ctx) {
                sameTexData = wt.pageChars = [];
            }
            // if(isWT && (this.fontScaleX!=wt.scalex || this.fontScaleY!=wt.scaley)) {
            // 	// 文字缩放要清理缓存
            // 	sameTexData = wt.pageChars = [];
            // }
        }
        //var oneTex: boolean = isWT || TextRender.forceWholeRender;	// 如果能缓存的话，就用一张贴图
        let splitTex = this.renderPerChar = (!isWT) || TextRender.forceSplitRender || (isWT && wt.splitRender); 	// 拆分字符串渲染，这个优先级高
        if (!sameTexData || sameTexData.length < 1) {
            if (isWT) {
                wt.scalex = this.fontScaleX;
                wt.scaley = this.fontScaleY;
            }
            // 重新构建缓存的贴图信息
            // TODO 还是要ctx.scale么
            if (splitTex) {
                // 如果要拆分字符渲染
                let stx = 0;
                let sty = 0;

                this._curStrPos = 0;
                let curstr: string | null;
                while (true) {
                    curstr = this.getNextChar(str);
                    if (!curstr)
                        break;
                    let ri = this.getCharRenderInfo(curstr, font, color, strokeColor, lineWidth, false);
                    if (!ri) {
                        // 没有分配到。。。
                        break;
                    }
                    if (ri.isSpace) {	// 空格什么都不做
                    } else {
                        //分组保存
                        var add = sameTexData[ri.texture.id];
                        if (!add) {
                            var o1 = { texgen: ri.texture.genID, tex: ri.texture, words: new Array() };	// 根据genid来减少是否释放的判断量
                            sameTexData[ri.texture.id] = o1;
                            add = o1.words;
                        } else {
                            add = add.words;
                        }
                        //不能直接修改ri.bmpWidth, 否则会累积缩放，所以把缩放保存到独立的变量中
                        add.push({ ri: ri, x: stx, y: sty, w: ri.bmpWidth / this.fontScaleX, h: ri.bmpHeight / this.fontScaleY });
                        stx += ri.width;	// TODO 缩放
                    }
                }

            } else {
                // 如果要整句话渲染
                let margin = (font._size / 3 | 0);  // margin保持与charrender_canvas的一致
                let isotex = TextRender.noAtlas || (strWidth + margin + margin) * this.fontScaleX > TextRender.atlasWidth;	// 独立贴图还是大图集。需要考虑margin
                let ri = this.getCharRenderInfo(str, font, color, strokeColor, lineWidth, isotex);
                // 整句渲染，则只有一个贴图
                sameTexData[0] = { texgen: ri.texture.genID, tex: ri.texture, words: [{ ri: ri, x: 0, y: 0, w: ri.bmpWidth / this.fontScaleX, h: ri.bmpHeight / this.fontScaleY }] };
            }
            isWT && (wt.pagecharsCtx = ctx);
            //TODO getbmp 考虑margin 字体与标准字体的关系
        }

        this._drawResortedWords(ctx, x, y, sameTexData);
        ctx._italicDeg = 0;
    }

    /**
     * 画出重新按照贴图顺序分组的文字。
     * @param	samePagesData
     * @param  startx 保存的数据是相对位置，所以需要加上这个偏移。用相对位置更灵活一些。
     * @param y {int} 因为这个只能画在一行上所以没有必要保存y。所以这里再把y传进来
     */
    protected _drawResortedWords(ctx: Context, startx: number, starty: number, samePagesData: { [key: number]: any }): void {
        var isLastRender = ctx._charSubmitCache ? ctx._charSubmitCache._enable : false;
        var mat = ctx._curMat;
        //samePagesData可能是个不连续的数组，比如只有一个samePagesData[29999] = dt; 所以不要用普通for循环
        for (var id in samePagesData) {
            var dt = samePagesData[id];
            if (!dt) continue;
            var pri: any[] = dt.words;
            var count = pri.length; if (count <= 0) continue;
            var tex = <TextTexture>samePagesData[id].tex;
            for (var j = 0; j < count; j++) {
                var riSaved: any = pri[j];
                var ri: CharRenderInfo = riSaved.ri;
                if (ri.isSpace) continue;
                ctx.touchRes(ri);
                ctx.drawTexAlign = true;

                ctx._inner_drawTexture(tex, tex.id,
                    startx + riSaved.x - ri.orix, starty + riSaved.y - ri.oriy, riSaved.w, riSaved.h,
                    mat, ri.uv, 1.0, isLastRender, 0xffffffff);
            }
        }
    }

    /**
     * 检查 txts数组中有没有被释放的资源
     * @param	txts {{ri:CharRenderInfo,...}[][]}
     * @param	startid
     * @return
     */
    hasFreedText(txts: any[]): boolean {
        for (let i in txts) {
            var pri = txts[i];
            if (!pri) continue;
            var tex = <TextTexture>pri.tex;
            if (tex.destroyed || tex.genID != pri.texgen) {
                return true;
            }
        }
        return false;
    }

    getCharRenderInfo(str: string, font: FontInfo, color: string, strokeColor: string | null, lineWidth: number, isoTexture: boolean = false): CharRenderInfo {
        var fid = this.mapFont[font._family];
        if (fid == undefined) {
            this.mapFont[font._family] = fid = this.fontID++;
        }
        var key = str + '_' + fid + '_' + font._size + '_' + color;
        if (lineWidth > 0)
            key += '_' + strokeColor! + lineWidth;
        if (font._bold)
            key += 'P';
        if (this.fontScaleX != 1 || this.fontScaleY != 1) {
            key += (this.fontScaleX * 20 | 0) + '_' + (this.fontScaleY * 20 | 0);	// 这个精度可以控制占用资源的大小，精度越高越能细分缩放。
        }

        var i = 0;
        // 遍历所有的大图集看是否存在
        var sz = this.textAtlases.length;
        var ri: CharRenderInfo;
        var atlas: TextAtlas;
        if (!isoTexture) {
            for (i = 0; i < sz; i++) {
                atlas = this.textAtlases[i];
                ri = atlas.charMaps[key]
                if (ri) {
                    ri.touch();
                    return ri;
                }
            }
        }
        // 没有找到，要创建一个
        ri = new CharRenderInfo();
        this.charRender.scale(this.fontScaleX, this.fontScaleY);
        ri.char = str;
        ri.height = font._size;
        var margin = (font._size / 3 | 0);	// 凑的。 注意这里不能乘以缩放，因为ctx会自动处理
        // 如果不存在，就要插入已有的，或者创建新的
        var imgdt: ImageData | null = null;
        // 先大约测量文字宽度 

        if (!lineWidth) {
            lineWidth = 0;
        }
        var w1 = Math.ceil((this.charRender.getWidth(this.fontStr, str) + 2 * lineWidth) * this.fontScaleX);
        let needCanvW = Math.min(2048, w1 + margin * 2 * this.fontScaleX);//注意margin要*缩放，否则可能文字放不下
        if (needCanvW > this.charRender.canvasWidth) {
            this.charRender.canvasWidth = needCanvW;
        }
        if (isoTexture) {
            // 独立贴图
            this.charRender.fontsz = font._size;
            imgdt = this.charRender.getCharBmp(str, this.fontStr, lineWidth, color, strokeColor, ri, margin, margin, margin, margin, null);
            // 这里可以直接
            if (imgdt) {
                var tex = TextTexture.getTextTexture(imgdt.width, imgdt.height);
                tex.addChar(imgdt, 0, 0, ri.uv);
                ri.texture = tex;
                ri.orix = margin; // 这里是原始的，不需要乘scale,因为scale的会创建一个scale之前的rect
                ri.oriy = margin;
                tex.ri = ri;
                this.isoTextures.push(tex);
            }
        } else {
            // 大图集
            var len = str.length;
            if (len > 1) {
                // emoji或者组合的
            }
            var lineExt = lineWidth * 1;	// 这里，包括下面的*2 都尽量用整数。否则在取整以后可能有有偏移。
            var fw = Math.ceil((this.fontSizeW + lineExt * 2) * this.fontScaleX); 	//本来只要 lineWidth就行，但是这样安全一些
            var fh = Math.ceil((this.fontSizeH + lineExt * 2) * this.fontScaleY);
            TextRender.imgdtRect[0] = ((margin - this.fontSizeOffX - lineExt) * this.fontScaleX) | 0;	// 本来要 lineWidth/2 但是这样一些尖角会有问题，所以大一点
            TextRender.imgdtRect[1] = ((margin - this.fontSizeOffY - lineExt) * this.fontScaleY) | 0;
            if (this.renderPerChar || len == 1) {
                // 单个字符的处理
                TextRender.imgdtRect[2] = Math.max(w1, fw);
                TextRender.imgdtRect[3] = Math.max(w1, fh);	// 高度也要取大的。 例如emoji
            } else {
                // 多个字符的处理
                //TextRender.imgdtRect[2] = -1;	// -1 表示宽度要测量
                TextRender.imgdtRect[2] = -(this.fontSizeOffX * this.fontScaleX);//<0表示要测量宽度，但是提供了原点偏移
                TextRender.imgdtRect[3] = fh; 	// TODO 如果被裁剪了，可以考虑把这个加大一点点
            }
            this.charRender.fontsz = font._size;
            imgdt = this.charRender.getCharBmp(str, this.fontStr, lineWidth, color, strokeColor, ri,
                margin, margin, margin, margin, TextRender.imgdtRect);
            if (imgdt) {
                atlas = this.addBmpData(imgdt, ri);
                if (TextRender.isWan1Wan) {
                    // 这时候 imgdtRect 是不好使的，要自己设置
                    ri.orix = margin;	// 不要乘缩放。要不后面也要除。
                    ri.oriy = margin;
                } else {
                    // 取下来的imagedata的原点在哪
                    ri.orix = (this.fontSizeOffX + lineExt);	// 由于是相对于imagedata的，上面会根据包边调整左上角，所以原点也要相应反向调整
                    ri.oriy = (this.fontSizeOffY + lineExt);
                }
                atlas.charMaps[key] = ri;
            }
        }
        return ri;
    }

    /**
     * 添加数据到大图集
     * @param	w
     * @param	h
     * @return
     */
    addBmpData(data: ImageData, ri: CharRenderInfo): TextAtlas {
        var w = data.width;
        var h = data.height;
        var sz = this.textAtlases.length;
        var atlas: TextAtlas;
        var find = false;
        for (var i = 0; i < sz; i++) {
            atlas = this.textAtlases[i];
            find = atlas.getAEmpty(w, h, tmpAtlasPos);
            if (find) {
                break;
            }
        }
        if (!find) {
            // 创建一个新的
            atlas = new TextAtlas()
            this.textAtlases.push(atlas);
            find = atlas.getAEmpty(w, h, tmpAtlasPos);
            if (!find) {
                throw 'err1'; //TODO
            }
            // 清理旧的
            this.cleanAtlases();
        }
        if (find) {
            atlas.texture.addChar(data, tmpAtlasPos.x, tmpAtlasPos.y, ri.uv);
            ri.texture = atlas.texture;
        }
        return atlas;
    }

    /**
     * 清理利用率低的大图集
     */
    GC(): void {
        var i = 0;
        var sz = this.textAtlases.length;
        var dt = 0;
        var destroyDt = TextRender.destroyAtlasDt;
        var totalUsedRateAtlas = 0;
        var curloop = RenderInfo.loopCount;

        //var minUsedRateID:int = -1;
        //var minUsedRate:Number = 1;
        var maxWasteRateID = -1;
        var maxWasteRate = 0;
        var tex: TextTexture = null;
        var curatlas: TextAtlas = null;
        // 图集的清理
        for (; i < sz; i++) {
            curatlas = this.textAtlases[i];
            tex = curatlas.texture;
            if (tex) {
                totalUsedRateAtlas += tex.curUsedCovRateAtlas;
                // 浪费掉的图集
                // (已经占用的图集和当前使用的图集的差。图集不可局部重用，所以有占用的和使用的的区别)
                var waste = curatlas.usedRate - tex.curUsedCovRateAtlas;
                // 记录哪个图集浪费的最多
                if (maxWasteRate < waste) {
                    maxWasteRate = waste;
                    maxWasteRateID = i;
                }
                /*
                if (minUsedRate > tex.curUsedCovRate) {
                    minUsedRate = tex.curUsedCovRate;
                    minUsedRateID = i;
                }
                */
            }
            // 如果当前贴图的touch时间超出了指定的间隔（单位是帧，例如），则设置回收
            // 可能同时会有多个图集被回收
            dt = curloop - curatlas.texture.lastTouchTm;
            if (dt > destroyDt) {
                TextRender.showLog && console.log('TextRender GC delete atlas ' + tex ? curatlas.texture.id : 'unk');
                curatlas.destroy();
                this.textAtlases[i] = this.textAtlases[sz - 1];	// 把最后的拿过来冲掉
                sz--;
                i--;
                maxWasteRateID = -1;
            }
        }
        // 缩减图集数组的长度
        this.textAtlases.length = sz;

        // 独立贴图的清理 TODO 如果多的话，要不要分开处理
        sz = this.isoTextures.length;
        for (i = 0; i < sz; i++) {
            tex = this.isoTextures[i];
            dt = curloop - tex.lastTouchTm;
            if (dt > TextRender.destroyUnusedTextureDt) {
                tex.ri.deleted = true;
                tex.ri.texture = null;
                // 直接删除，不回收
                tex.destroy();
                this.isoTextures[i] = this.isoTextures[sz - 1];
                sz--;
                i--;
            }
        }
        this.isoTextures.length = sz;

        // 如果超出内存需要清理不常用
        var needGC = this.textAtlases.length > 1 && this.textAtlases.length - totalUsedRateAtlas >= 2;	// 总量浪费了超过2张
        if (TextRender.atlasWidth * TextRender.atlasWidth * 4 * this.textAtlases.length > TextRender.cleanMem || needGC || TextRender.simClean) {
            TextRender.simClean = false;
            TextRender.showLog && console.log('清理使用率低的贴图。总使用率:', totalUsedRateAtlas, ':', this.textAtlases.length, '最差贴图:' + maxWasteRateID);
            if (maxWasteRateID >= 0) {
                curatlas = this.textAtlases[maxWasteRateID];
                curatlas.destroy();
                this.textAtlases[maxWasteRateID] = this.textAtlases[this.textAtlases.length - 1];
                this.textAtlases.length = this.textAtlases.length - 1;
                this.event('GC');
            }
        }

        //TextTexture.clean();
    }

    /**
     * 尝试清理大图集
     */
    cleanAtlases(): void {
        // TODO 根据覆盖率决定是否清理
    }


    printDbgInfo(): void {
        console.log('图集个数:' + this.textAtlases.length + ',每个图集大小:' + TextRender.atlasWidth + 'x' + TextRender.atlasWidth, ' 用canvas:', TextRender.isWan1Wan);
        console.log('图集占用空间:' + (TextRender.atlasWidth * TextRender.atlasWidth * 4 / 1024 / 1024 * this.textAtlases.length) + 'M');
        console.log('缓存用到的字体:');
        for (var f in this.mapFont) {
            var fontsz = this.getFontSizeInfo(f);
            var offx = fontsz >> 24
            var offy = (fontsz >> 16) & 0xff;
            var fw = (fontsz >> 8) & 0xff;
            var fh = fontsz & 0xff;
            console.log('    ' + f, ' off:', offx, offy, ' size:', fw, fh);
        }
        var num = 0;
        console.log('缓存数据:');
        var totalUsedRate = 0;	// 总使用率
        var totalUsedRateAtlas = 0;
        this.textAtlases.forEach(function (a: TextAtlas): void {
            var id = a.texture.id;
            var dt = RenderInfo.loopCount - a.texture.lastTouchTm
            var dtstr = dt > 0 ? ('' + dt + '帧以前') : '当前帧';
            totalUsedRate += a.texture.curUsedCovRate;
            totalUsedRateAtlas += a.texture.curUsedCovRateAtlas;
            console.log('--图集(id:' + id + ',当前使用率:' + (a.texture.curUsedCovRate * 1000 | 0) + '‰', '当前图集使用率:', (a.texture.curUsedCovRateAtlas * 100 | 0) + '%', '图集使用率:', (a.usedRate * 100 | 0), '%, 使用于:' + dtstr + ')--:');
            for (var k in a.charMaps) {
                var ri: CharRenderInfo = a.charMaps[k];
                console.log('     off:', ri.orix, ri.oriy, ' bmp宽高:', ri.bmpWidth, ri.bmpHeight, '无效:', ri.deleted, 'touchdt:', (RenderInfo.loopCount - ri.touchTick), '位置:', ri.uv[0] * TextRender.atlasWidth | 0, ri.uv[1] * TextRender.atlasWidth | 0,
                    '字符:', ri.char, 'key:', k);
                num++;
            }
        });
        console.log('独立贴图文字(' + this.isoTextures.length + '个):');
        this.isoTextures.forEach(function (tex: TextTexture): void {
            console.log('    size:', tex.width, tex.height, 'touch间隔:', (RenderInfo.loopCount - tex.lastTouchTm), 'char:', tex.ri.char);
        });
        console.log('总缓存:', num, '总使用率:', totalUsedRate, '总当前图集使用率:', totalUsedRateAtlas);

    }

    // 在屏幕上显示某个大图集
    showAtlas(n: number, bgcolor: string, x: number, y: number, w: number, h: number): Sprite {
        if (!this.textAtlases[n]) {
            console.log('没有这个图集');
            return null;
        }
        var sp = new Sprite();
        var texttex = this.textAtlases[n].texture;
        var texture: any = {
            width: TextRender.atlasWidth,
            height: TextRender.atlasWidth,
            sourceWidth: TextRender.atlasWidth,
            sourceHeight: TextRender.atlasWidth,
            offsetX: 0,
            offsetY: 0,
            getIsReady: function (): boolean { return true; },
            _addReference: function (): void { },
            _removeReference: function (): void { },
            _getSource: function (): any { return texttex._getSource(); },
            bitmap: { id: texttex.id },
            _uv: Texture.DEF_UV
        };
        (<any>sp).size = function (w: number, h: number): Sprite {
            this.width = w;
            this.height = h;
            sp.graphics.clear();
            sp.graphics.drawRect(0, 0, sp.width, sp.height, bgcolor);
            sp.graphics.drawTexture(<Texture>texture, 0, 0, sp.width, sp.height);
            return <Sprite>this;
        }
        sp.graphics.drawRect(0, 0, w, h, bgcolor);
        sp.graphics.drawTexture(<Texture>texture, 0, 0, w, h);
        sp.pos(x, y);
        ILaya.stage.addChild(sp);
        return sp;
    }
}

const tmpAtlasPos = new Point();