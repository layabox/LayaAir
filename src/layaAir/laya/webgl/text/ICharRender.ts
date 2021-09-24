import { ILaya } from "../../../ILaya";
import { CharRenderInfo } from "./CharRenderInfo";
export class ICharRender {
    fontsz = 16;
    getWidth(font: string, str: string): number { return 0; }

    scale(sx: number, sy: number): void {
    }

    get canvasWidth(): number {
        return 0;
    }

    set canvasWidth(w: number) {

    }
    /**
     *TODO stroke 
     * @param	char
     * @param	font
     * @param	size  返回宽高
     * @return
     */
    getCharBmp(char: string, font: string, lineWidth: number, colStr: string, strokeColStr: string, size: CharRenderInfo, margin_left: number, margin_top: number, margin_right: number, margin_bottom: number, rect: any[] | null = null): ImageData | null {
        return null;
    }

    /** 是否泰文 */
    isThai(char: string, font: string): { font: string, size: number } {
        var _words = font.split(' ');
        var l = _words.length;
        let size = 30;
        var szpos = -1;
        let dw = "px";
        if (l < 2) {
            if (l == 1) {
                if (_words[0].indexOf('px') > 0 || _words[i].indexOf('pt') > 0) {
                    if (_words[i].indexOf('pt') > 0) {
                        dw = "pt"
                    }
                    size = parseInt(_words[0]);
                    szpos = 0;
                }
            }
        } else {
            for (var i = 0; i < l; i++) {
                if (_words[i].indexOf('px') > 0 || _words[i].indexOf('pt') > 0) {
                    if (_words[i].indexOf('pt') > 0) {
                        dw = "pt"
                    }
                    szpos = i;
                    size = parseInt(_words[i]);
                    if (size <= 0) {
                        console.error('font parse error:' + font);
                        size = 14;
                    }
                    break;
                }
            }
        }

        if (new RegExp(/[\u0E00-\u0E7F]+/).test(char)) {
            if (ILaya.Render.isConchApp) {
                size *= 1.5;
                this.fontsz = size;
            }
        }
        _words[szpos] = Math.floor(size) + dw;
        return { font: _words.join(" "), size: Math.floor(size) };
    }
}

