import { ILaya } from "../../../ILaya";
import { Sprite } from "../../display/Sprite";
import { RenderInfo } from "../../renders/RenderInfo";
import { Texture } from "../../resource/Texture";
import { CharRenderInfo } from "./CharRenderInfo";
import { TextAtlas } from "./TextAtlas";
import { TextRender } from "./TextRender";
import { TextTexture } from "./TextTexture";

export class TextDebug {
    // 在屏幕上显示某个大图集
    static showTextAtlas(texttex: TextTexture, n: number, bgcolor: string, x: number, y: number, w: number, h: number): Sprite {
        var sp = new Sprite();
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
        sp.graphics.drawRect(0, 0, 1, 1, bgcolor, null, null, true);
        sp.graphics.fillTexture(<Texture>texture, 0, 0, 1, 1, "no-repeat", null, null, true);
        sp.pos(x, y);
        ILaya.stage.addChild(sp);
        return sp;
    }

    static printRenderInfo(render: TextRender): void {
        console.log('图集个数:' + render.textAtlases.length + ',每个图集大小:' + TextRender.atlasWidth + 'x' + TextRender.atlasWidth, ' 用canvas:', TextRender.isWan1Wan);
        console.log('图集占用空间:' + (TextRender.atlasWidth * TextRender.atlasWidth * 4 / 1024 / 1024 * render.textAtlases.length) + 'M');
        console.log('缓存用到的字体:');
        for (var f in render.mapFont) {
            var fontsz = render.getFontSizeInfo(f);
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
        render.textAtlases.forEach(function (a: TextAtlas): void {
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
        console.log('独立贴图文字(' + render.isoTextures.length + '个):');
        render.isoTextures.forEach(function (tex: TextTexture): void {
            console.log('    size:', tex.width, tex.height, 'touch间隔:', (RenderInfo.loopCount - tex.lastTouchTm), 'char:', tex.ri.char);
        });
        console.log('总缓存:', num, '总使用率:', totalUsedRate, '总当前图集使用率:', totalUsedRateAtlas);

    }
}