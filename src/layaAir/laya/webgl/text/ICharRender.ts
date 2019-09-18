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
    getCharBmp(char: string, font: string, lineWidth: number, colStr: string, strokeColStr: string, size: CharRenderInfo, margin_left: number, margin_top: number, margin_right: number, margin_bottom: number, rect: any[]|null = null): ImageData|null {
        return null;
    }
}

