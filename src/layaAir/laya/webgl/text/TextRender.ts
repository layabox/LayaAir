import { TextAtlas } from "./TextAtlas";
import { TextTexture } from "./TextTexture";
import { Sprite } from "../../display/Sprite"
import { Point } from "../../maths/Point"
import { RenderInfo } from "../../renders/RenderInfo"
import { Context } from "../../resource/Context"
import { Texture } from "../../resource/Texture"
import { FontInfo } from "../../utils/FontInfo"
import { HTMLChar } from "../../utils/HTMLChar"
import { WordText } from "../../utils/WordText"
import { CharRenderInfo } from "./CharRenderInfo"
import { CharRender_Canvas } from "./CharRender_Canvas"
import { CharRender_Native } from "./CharRender_Native"
import { ICharRender } from "./ICharRender"
import { ILaya } from "../../../ILaya";

export class TextRender {
    //config
    static useOldCharBook = false;
    static atlasWidth = 1024;
    static noAtlas = false;				// 一串文字用独立贴图
    static forceSplitRender = false;	    // 强制把一句话拆开渲染
    static forceWholeRender = false; 	// 强制整句话渲染
    static scaleFontWithCtx = true;		// 如果有缩放，则修改字体，以保证清晰度
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
    private fontSizeInfo: any = {};
    static atlasWidth2: number;
    private charRender: ICharRender;
    private static tmpRI: CharRenderInfo = new CharRenderInfo();
    private static pixelBBX:number[] = [0, 0, 0, 0];
    private mapFont: any = {};		// 把font名称映射到数字
    private fontID: number = 0;

    private fontScaleX: number = 1.0;						//临时缩放。
    private fontScaleY: number = 1.0;

    //private var charMaps:Object = {};	// 所有的都放到一起

    private _curStrPos: number = 0;		//解开一个字符串的时候用的。表示当前解到什么位置了
    static textRenderInst: TextRender;	//debug

    textAtlases: TextAtlas[] = [];		// 所有的大图集
    private isoTextures: TextTexture[] = [];	// 所有的独立贴图

    private bmpData32: Uint32Array;
    private static imgdtRect: any[] = [0, 0, 0, 0];

    // 当前字体的测量信息。
    private lastFont: FontInfo|null = null;
    private fontSizeW: number = 0;
    private fontSizeH: number = 0;
    private fontSizeOffX: number = 0;
    private fontSizeOffY: number = 0;

    private renderPerChar: boolean = true;	// 是否是单个字符渲染。这个是结果，上面的是配置
    private tmpAtlasPos: Point = new Point();
    private textureMem: number = 0; 			// 当前贴图所占用的内存
    private fontStr: string;					// 因为要去掉italic，所以自己保存一份
    static simClean: boolean = false;				// 测试用。强制清理占用低的图集

    constructor() {
        ILaya.TextAtlas = TextAtlas;

        var bugIOS = false;//是否是有bug的ios版本
        //在微信下有时候不显示文字，所以采用canvas模式，现在测试微信好像都好了，所以去掉了。
        var miniadp: any = ILaya.Laya['MiniAdpter']; //头条也继承了这个bug
        if (miniadp && miniadp.systemInfo && miniadp.systemInfo.system) {
			bugIOS = miniadp.systemInfo.system.toLowerCase() === 'ios 10.1.1';
			//12.3
        }
        if ((ILaya.Browser.onMiniGame||ILaya.Browser.onTTMiniGame||ILaya.Browser.onBLMiniGame||ILaya.Browser.onAlipayMiniGame || ILaya.Browser.onTBMiniGame) /*&& !Browser.onAndroid*/ && !bugIOS) TextRender.isWan1Wan = true; //android 微信下 字边缘发黑，所以不用getImageData了
        //TextRender.isWan1Wan = true;
        this.charRender = ILaya.Render.isConchApp ? (new CharRender_Native()) : (new CharRender_Canvas(2048, 2048, TextRender.scaleFontWithCtx, !TextRender.isWan1Wan, false));
        TextRender.textRenderInst = this;
        ILaya.Laya['textRender'] = this;
        TextRender.atlasWidth2 = TextRender.atlasWidth * TextRender.atlasWidth;
        //TEST
        //forceSplitRender = true;
        //noAtlas = true;
        //forceWholeRender = true;
        //TEST
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
    getNextChar(str: string): string |null{
        var len = str.length;
		var start = this._curStrPos;
		if(!str.substring) return null;	// 保护一下，避免下面 substring 报错
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
	
    filltext(ctx: Context, data: string | WordText, x: number, y: number, fontStr: string, color: string, strokeColor: string, lineWidth: number, textAlign: string, underLine: number = 0): void {
        if (data.length <= 0)
            return;
        //以后保存到wordtext中
        var font = FontInfo.Parse(fontStr);

        var nTextAlign = 0;
        switch (textAlign) {
            case 'center':
                nTextAlign = ILaya.Context.ENUM_TEXTALIGN_CENTER;
                break;
            case 'right':
                nTextAlign = ILaya.Context.ENUM_TEXTALIGN_RIGHT;
                break;
        }
        this._fast_filltext(ctx, (<WordText>data), null, x, y, font, color, strokeColor, lineWidth, nTextAlign, underLine);
    }

    fillWords(ctx: Context, data: HTMLChar[], x: number, y: number, fontStr: string | FontInfo, color: string, strokeColor: string|null, lineWidth: number): void {
        if (!data) return;
        if (data.length <= 0) return;
        var font = typeof (fontStr) === 'string' ? FontInfo.Parse(fontStr) : fontStr;
        this._fast_filltext(ctx, null, data, x, y, font, color, strokeColor, lineWidth, 0, 0);
    }

    _fast_filltext(ctx: Context, data: string | WordText|null, htmlchars: HTMLChar[]|null, x: number, y: number, font: FontInfo, color: string, strokeColor: string|null, lineWidth: number, textAlign: number, underLine: number = 0): void {
        if (data && !(data.length >= 1)) return;	// length有可能是 undefined
        if (htmlchars && htmlchars.length < 1) return;
        if (lineWidth < 0) lineWidth = 0;
        this.setFont(font);
        this.fontScaleX = this.fontScaleY = 1.0;
        if (TextRender.scaleFontWithCtx) {
            var sx = 1;
            var sy = 1;
    
            if (!ILaya.Render.isConchApp || ((window as any).conchTextCanvas.scale)) {
                sx = ctx.getMatScaleX();
                sy = ctx.getMatScaleY();
            }
            
            if (sx < 1e-4 || sy < 1e-1)
                return;
            if(sx>1) this.fontScaleX = sx;
            if(sy>1) this.fontScaleY = sy;
        }

        font._italic && (ctx._italicDeg = 13);
        //准备bmp
        //拷贝到texture上,得到一个gltexture和uv
        var wt = <WordText>data;
        var isWT = !htmlchars && (data instanceof WordText);
        var str = data&&data.toString();//(<string>data);guo 某种情况下，str还是WordText（没找到为啥），这里保护一下
        var isHtmlChar= !!htmlchars;
        /**
         * sameTexData 
         * WordText 中保存了一个数组，这个数组是根据贴图排序的，目的是为了能相同的贴图合并。
         * 类型是 {ri:CharRenderInfo,stx:int,sty:int,...}[文字个数][贴图分组]
         */
        var sameTexData: any[] = isWT ? wt.pageChars : [];

        //总宽度，下面的对齐需要
        var strWidth = 0;
        if (isWT) {
            str = wt._text;
            strWidth = wt.width;
            if (strWidth < 0) {
                strWidth = wt.width = this.charRender.getWidth(this.fontStr, str);	// 字符串长度是原始的。
            }
        } else {
            strWidth = str ? this.charRender.getWidth(this.fontStr, str) : 0;
        }

        //水平对齐方式
        switch (textAlign) {
            case ILaya.Context.ENUM_TEXTALIGN_CENTER:
                x -= strWidth / 2;
                break;
            case ILaya.Context.ENUM_TEXTALIGN_RIGHT:
                x -= strWidth;
                break;
        }

        //检查保存的数据是否有的已经被释放了
        if (wt && sameTexData) {	// TODO 能利用lastGCCnt么
            //wt.lastGCCnt = _curPage.gcCnt;
            if (this.hasFreedText(sameTexData)) {
                sameTexData = wt.pageChars = [];
			}
			// if(isWT && (this.fontScaleX!=wt.scalex || this.fontScaleY!=wt.scaley)) {
			// 	// 文字缩放要清理缓存
			// 	sameTexData = wt.pageChars = [];
			// }
        }
        var ri: CharRenderInfo = null;
        //var oneTex: boolean = isWT || TextRender.forceWholeRender;	// 如果能缓存的话，就用一张贴图
        var splitTex = this.renderPerChar = (!isWT) || TextRender.forceSplitRender || isHtmlChar || (isWT && wt.splitRender); 	// 拆分字符串渲染，这个优先级高
        if (!sameTexData || sameTexData.length < 1) {
			if (isWT) {
                wt.scalex = this.fontScaleX;
                wt.scaley = this.fontScaleY;
            }
            // 重新构建缓存的贴图信息
            // TODO 还是要ctx.scale么
            if (splitTex) {
                // 如果要拆分字符渲染
                var stx = 0;
                var sty = 0;

                this._curStrPos = 0;
                var curstr: string|null;
                while (true) {
                    if (htmlchars) {
                        var chc = htmlchars[this._curStrPos++];
                        if (chc) {
                            curstr = chc.char;
                            stx = chc.x;
                            sty = chc.y;
                        } else {
                            curstr = null;
                        }
                    } else {
                        curstr = this.getNextChar(str);
                    }
                    if (!curstr)
                        break;
                    ri = this.getCharRenderInfo(curstr, font, color, strokeColor, lineWidth, false);
                    if (!ri) {
                        // 没有分配到。。。
                        break;
                    }
                    if (ri.isSpace) {	// 空格什么都不做
                    } else {
                        //分组保存
                        var add = sameTexData[ri.tex.id];
                        if (!add) {
                            var o1 = { texgen: ((<TextTexture>ri.tex)).genID, tex: ri.tex, words: new Array() };	// 根据genid来减少是否释放的判断量
                            sameTexData[ri.tex.id] = o1;
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
				var margin = ILaya.Render.isConchApp ? 0 : (font._size / 3 | 0);  // margin保持与charrender_canvas的一致
				var isotex = TextRender.noAtlas || (strWidth+margin+margin) * this.fontScaleX > TextRender.atlasWidth;	// 独立贴图还是大图集。需要考虑margin
                ri = this.getCharRenderInfo(str, font, color, strokeColor, lineWidth, isotex);
                // 整句渲染，则只有一个贴图
                sameTexData[0] = { texgen: ((<TextTexture>ri.tex)).genID, tex: ri.tex, words: [{ ri: ri, x: 0, y: 0, w: ri.bmpWidth / this.fontScaleX, h: ri.bmpHeight / this.fontScaleY }] };
            }

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
    protected _drawResortedWords(ctx: Context, startx: number, starty: number, samePagesData: any[]): void {
        var isLastRender = ctx._charSubmitCache?ctx._charSubmitCache._enable:false;
        var mat = ctx._curMat;
        //var slen = samePagesData.length;
        //for (var id = 0; id < slen; id++) {
		for(var id in samePagesData) {// TODO samePagesData可能是个不连续的数组，比如只有一个samePagesData[29999] = dt;
										// TODO 想个更好的方法
            var dt = samePagesData[id];
            if (!dt) continue;
            var pri: any[] = dt.words;
            var pisz = pri.length; if (pisz <= 0) continue;
            var tex = ((<TextTexture>samePagesData[id].tex));
            for (var j = 0; j < pisz; j++) {
                var riSaved: any = pri[j];
                var ri: CharRenderInfo = riSaved.ri;
                if (ri.isSpace) continue;
                ri.touch();
                ctx.drawTexAlign = true;
                //ctx._drawTextureM(ri.tex.texture as Texture, startx +riSaved.x -ri.orix / fontScaleX , starty + riSaved.y -ri.oriy / fontScaleY , riSaved.w, riSaved.h, null, 1.0, ri.uv);
                if (ILaya.Render.isConchApp) {
                    ctx._drawTextureM((<Texture>tex.texture), startx + riSaved.x - ri.orix, starty + riSaved.y - ri.oriy, riSaved.w, riSaved.h, null, 1.0, ri.uv);
                } else {
                    let t = tex as TextTexture;
                    ctx._inner_drawTexture(t.texture, t.id,
                        startx + riSaved.x - ri.orix, starty + riSaved.y - ri.oriy, riSaved.w, riSaved.h,
                        mat, ri.uv, 1.0, isLastRender);
                }

                if ((<any>ctx).touches) {
                    (<any>ctx).touches.push(ri);
                }
            }
        }
        //不要影响别人
        //ctx._curSubmit._key.other = -1;
    }

    /**
     * 检查 txts数组中有没有被释放的资源
     * @param	txts {{ri:CharRenderInfo,...}[][]}
     * @param	startid
     * @return
     */
    hasFreedText(txts: any[]): boolean {
        for(let i in txts){
            var pri = txts[i];
            if (!pri) continue;
            var tex = (<TextTexture>pri.tex);
            if (tex.__destroyed || tex.genID != pri.texgen) {
                return true;
            }
        }
        return false;
    }

    getCharRenderInfo(str: string, font: FontInfo, color: string, strokeColor: string|null, lineWidth: number, isoTexture: boolean = false): CharRenderInfo {
        var fid = this.mapFont[font._family];
        if (fid == undefined) {
            this.mapFont[font._family] = fid = this.fontID++;
        }
        /*
        var cid:int = mapColor[color];
        if (cid == undefined) {
            mapColor[color] = cid = colorID++;
        }
        var scid:int = mapColor[strokeColor];
        */
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
        var margin = ILaya.Render.isConchApp ? 0 : (font._size / 3 | 0);	// 凑的。 注意这里不能乘以缩放，因为ctx会自动处理
        // 如果不存在，就要插入已有的，或者创建新的
        var imgdt: ImageData|null=null;
        // 先大约测量文字宽度 

        if (!lineWidth) {
            lineWidth = 0;
        }
        var w1 = Math.ceil((this.charRender.getWidth(this.fontStr, str) + 2 * lineWidth) * this.fontScaleX);
        if (w1 > this.charRender.canvasWidth) {
            this.charRender.canvasWidth = Math.min(2048, w1 + margin * 2);
        }
        if (isoTexture) {
            // 独立贴图
            this.charRender.fontsz = font._size;
            imgdt = this.charRender.getCharBmp(str, this.fontStr, lineWidth, color, strokeColor, ri, margin, margin, margin, margin, null);
			// 这里可以直接
			if(imgdt){
				var tex = TextTexture.getTextTexture(imgdt.width, imgdt.height);
				tex.addChar(imgdt, 0, 0, ri.uv);
				ri.tex = tex;
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
                TextRender.imgdtRect[2] = -1;	// -1 表示宽度要测量
                TextRender.imgdtRect[3] = fh; 	// TODO 如果被裁剪了，可以考虑把这个加大一点点
            }
            this.charRender.fontsz = font._size;
            imgdt = this.charRender.getCharBmp(str, this.fontStr, lineWidth, color, strokeColor, ri,
				margin, margin, margin, margin, TextRender.imgdtRect);
			if(imgdt){
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
            find = atlas.getAEmpty(w, h, this.tmpAtlasPos);
            if (find) {
                break;
            }
        }
        if (!find) {
            // 创建一个新的
            atlas = new TextAtlas()
            this.textAtlases.push(atlas);
            find = atlas.getAEmpty(w, h, this.tmpAtlasPos);
            if (!find) {
                throw 'err1'; //TODO
            }
            // 清理旧的
            this.cleanAtlases();
        }
        if (find) {
            atlas.texture.addChar(data, this.tmpAtlasPos.x, this.tmpAtlasPos.y, ri.uv);
            ri.tex = atlas.texture;
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
        var totalUsedRate = 0;	// 总使用率
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
                totalUsedRate += tex.curUsedCovRate;
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
                tex.ri.tex = null;
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
            }
        }

        TextTexture.clean();
    }

    /**
     * 尝试清理大图集
     */
    cleanAtlases(): void {
        // TODO 根据覆盖率决定是否清理
    }

    getCharBmp(c: string): any {

    }

    /**
     * 检查当前线是否存在数据
     * @param	data
     * @param	l
     * @param	sx
     * @param	ex
     * @return
     */
    private checkBmpLine(data: ImageData, l: number, sx: number, ex: number): boolean {
        if (this.bmpData32.buffer != data.data.buffer) {
            this.bmpData32 = new Uint32Array(data.data.buffer);
        }
        var stpos = data.width * l + sx;
        for (var x = sx; x < ex; x++) {
            if (this.bmpData32[stpos++] != 0) return true;
        }
        return false;
    }

    /**
     * 根据bmp数据和当前的包围盒，更新包围盒
     * 由于选择的文字是连续的，所以可以用二分法
     * @param	data
     * @param	curbbx 	[l,t,r,b]
     * @param   onlyH 不检查左右
     */
    private updateBbx(data: ImageData, curbbx: number[], onlyH: boolean = false): void {
        var w = data.width;
        var h = data.height;
        var x = 0;
        // top
        var sy = curbbx[1];	//从t到0 sy表示有数据的行
        var ey = 0;
        var y = sy;
        if (this.checkBmpLine(data, sy, 0, w)) {
            // 如果当前行有数据，就要往上找
            while (true) {
                y = (sy + ey) / 2 | 0;	// 必须是int
                if (y + 1 >= sy) {// 
                    // 找到了。严格来说还不知道这个是否有像素，不过这里要求不严格，可以认为有
                    curbbx[1] = y;
                    break;
                }
                if (this.checkBmpLine(data, y, 0, w)) {
                    //中间线有数据，搜索上半部分
                    sy = y;
                } else {
                    //中间线没有有数据，搜索下半部分
                    ey = y;
                }
            }
        }
        // 下半部分
        if (curbbx[3] > h) curbbx[3] = h;
        else {
            y = sy = curbbx[3];
            ey = h;
            if (this.checkBmpLine(data, sy, 0, w)) {
                while (true) {
                    y = (sy + ey) / 2 | 0;
                    if (y - 1 <= sy) {
                        curbbx[3] = y;
                        break;
                    }
                    if (this.checkBmpLine(data, y, 0, w)) {
                        sy = y;
                    } else {
                        ey = y;
                    }
                }
            }
        }

        if (onlyH)
            return;

        // 左半部分
        var minx = curbbx[0];
        var stpos = w * curbbx[1]; //w*cy+0
        for (y = curbbx[1]; y < curbbx[3]; y++) {
            for (x = 0; x < minx; x++) {
                if (this.bmpData32[stpos + x] != 0) {
                    minx = x;
                    break;
                }
            }
            stpos += w;
        }
        curbbx[0] = minx;
        // 右半部分
        var maxx = curbbx[2];
        stpos = w * curbbx[1]; //w*cy
        for (y = curbbx[1]; y < curbbx[3]; y++) {
            for (x = maxx; x < w; x++) {
                if (this.bmpData32[stpos + x] != 0) {
                    maxx = x;
                    break;
                }
            }
            stpos += w;
        }
        curbbx[2] = maxx;
    }

    getFontSizeInfo(font: string): number {
        var finfo: any = this.fontSizeInfo[font];
        if (finfo != undefined)
            return finfo;

        var fontstr: string = 'bold ' + TextRender.standardFontSize + 'px ' + font;
        if (TextRender.isWan1Wan) {
            // 这时候无法获得imagedata，只能采取保险测量
            this.fontSizeW = this.charRender.getWidth(fontstr, '有') * 1.5;
            this.fontSizeH = TextRender.standardFontSize * 1.5;
            var szinfo: number = this.fontSizeW << 8 | this.fontSizeH;
            this.fontSizeInfo[font] = szinfo;
            return szinfo;
        }
        // bbx初始大小
        TextRender.pixelBBX[0] = TextRender.standardFontSize / 2;// 16;
        TextRender.pixelBBX[1] = TextRender.standardFontSize / 2;// 16;
        TextRender.pixelBBX[2] = TextRender.standardFontSize;// 32;
        TextRender.pixelBBX[3] = TextRender.standardFontSize;// 32;

        var orix: number = 16;		// 左边留白，也就是x原点的位置
        var oriy: number = 16;
        var marginr: number = 16;
        var marginb: number = 16;
        this.charRender.scale(1, 1);
        TextRender.tmpRI.height = TextRender.standardFontSize;
        this.charRender.fontsz = TextRender.standardFontSize;
        var bmpdt = this.charRender.getCharBmp('g', fontstr, 0, 'red', null, TextRender.tmpRI, orix, oriy, marginr, marginb);
        // native 返回的是 textBitmap。 data直接是ArrayBuffer 
        if (ILaya.Render.isConchApp) {
            //bmpdt.data.buffer = bmpdt.data;
            (bmpdt as any).data = new Uint8ClampedArray(bmpdt.data);
        }
        this.bmpData32 = new Uint32Array(bmpdt.data.buffer);
        //测量宽度是 tmpRI.width
        this.updateBbx(bmpdt, TextRender.pixelBBX, false);
        bmpdt = this.charRender.getCharBmp('有', fontstr, 0, 'red', null, TextRender.tmpRI, oriy, oriy, marginr, marginb);// '有'比'国'大
        if (ILaya.Render.isConchApp) {
            //bmpdt.data.buffer = bmpdt.data;
            (bmpdt as any).data = new Uint8ClampedArray(bmpdt.data);
        }
        this.bmpData32 = new Uint32Array(bmpdt.data.buffer);
        // 国字的宽度就用系统测量的，不再用像素检测
        if (TextRender.pixelBBX[2] < orix + TextRender.tmpRI.width)
            TextRender.pixelBBX[2] = orix + TextRender.tmpRI.width;
        this.updateBbx(bmpdt, TextRender.pixelBBX, false);//TODO 改成 true
        // 原点在 16,16
        if (ILaya.Render.isConchApp) {
            //runtime 的接口好像有问题，不认orix，oriy
            orix = 0;
            oriy = 0;
        }
        var xoff = Math.max(orix - TextRender.pixelBBX[0], 0);
        var yoff = Math.max(oriy - TextRender.pixelBBX[1], 0);
        var bbxw = TextRender.pixelBBX[2] - TextRender.pixelBBX[0];
        var bbxh = TextRender.pixelBBX[3] - TextRender.pixelBBX[1];
        var sizeinfo = xoff << 24 | yoff << 16 | bbxw << 8 | bbxh;
        this.fontSizeInfo[font] = sizeinfo;
        return sizeinfo;
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
            console.log('    size:', tex._texW, tex._texH, 'touch间隔:', (RenderInfo.loopCount - tex.lastTouchTm), 'char:', tex.ri.char);
        });
        console.log('总缓存:', num, '总使用率:', totalUsedRate, '总当前图集使用率:', totalUsedRateAtlas);

    }

    // 在屏幕上显示某个大图集
    showAtlas(n: number, bgcolor: string, x: number, y: number, w: number, h: number): Sprite {
        if (!this.textAtlases[n]) {
            console.log('没有这个图集');
            return null;
        }
        var sp = new ILaya.Sprite();
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
        ((<any>sp)).size = function (w: number, h: number): Sprite {
            this.width = w;
            this.height = h;
            sp.graphics.clear();
            sp.graphics.drawRect(0, 0, sp.width, sp.height, bgcolor);
            sp.graphics.drawTexture((<Texture>texture), 0, 0, sp.width, sp.height);
            return (<Sprite>this);
        }
        sp.graphics.drawRect(0, 0, w, h, bgcolor);
        sp.graphics.drawTexture((<Texture>texture), 0, 0, w, h);
        sp.pos(x, y);
        ILaya.stage.addChild(sp);
        return sp;
    }

    /////// native ///////
    filltext_native(ctx: Context, data: string | WordText, htmlchars: HTMLChar[], x: number, y: number, fontStr: string, color: string, strokeColor: string, lineWidth: number, textAlign: string, underLine: number = 0): void {
        if (data && data.length <= 0) return;
        if (htmlchars && htmlchars.length < 1) return;

        var font = FontInfo.Parse(fontStr);

        var nTextAlign = 0;
        switch (textAlign) {
            case 'center':
                nTextAlign = ILaya.Context.ENUM_TEXTALIGN_CENTER;
                break;
            case 'right':
                nTextAlign = ILaya.Context.ENUM_TEXTALIGN_RIGHT;
                break;
        }
        return this._fast_filltext(ctx, (<WordText>data), htmlchars, x, y, font, color, strokeColor, lineWidth, nTextAlign, underLine);
    }
}

TextTexture.gTextRender = TextRender;