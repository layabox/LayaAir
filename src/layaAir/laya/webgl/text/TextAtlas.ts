import { AtlasGrid } from "./AtlasGrid";
import { TextTexture } from "./TextTexture";
import { Point } from "../../maths/Point"
import { CharRenderInfo } from "./CharRenderInfo"
import { TextRenderConfig } from "./TextRenderConfig";

/**
 *  文字贴图的大图集。
 */
export class TextAtlas {
    texWidth: number = 1024;
    texHeight: number = 1024;
    private atlasgrid: AtlasGrid;
    //private protectDist: number = 1;
    texture: TextTexture | null = null;
    charMaps: { [key: string]: CharRenderInfo } = {}; // 保存文字信息的字典

    constructor() {
        this.texHeight = this.texWidth = TextRenderConfig.atlasWidth;
        this.texture = TextTexture.getTextTexture(this.texWidth, this.texHeight);
        if (this.texWidth / TextRenderConfig.atlasGridW > 256) {
            TextRenderConfig.atlasGridW = Math.ceil(this.texWidth / 256);
        }
        this.atlasgrid = new AtlasGrid(this.texWidth / TextRenderConfig.atlasGridW, this.texHeight / TextRenderConfig.atlasGridW, this.texture.id);
    }

    setProtecteDist(d: number): void {
        //this.protectDist = d;
    }

    /**
     * 如果返回null，则表示无法加入了
     * 分配的时候优先选择最接近自己高度的节点
     * @param w
     * @param h
     * @return
     */
    getAEmpty(w: number, h: number, pt: Point): boolean {
        var find: boolean = this.atlasgrid.addRect(1, Math.ceil(w / TextRenderConfig.atlasGridW), Math.ceil(h / TextRenderConfig.atlasGridW), pt);
        if (find) {
            pt.x *= TextRenderConfig.atlasGridW;
            pt.y *= TextRenderConfig.atlasGridW;
        }
        return find;
    }

    /**
     * 大图集格子单元的占用率，老的也算上了。只是表示这个大图集还能插入多少东西。
     */
    get usedRate(): number {
        return this.atlasgrid._used;
    }
    //data 也可能是canvas
    /*
    public function pushData(data:ImageData, node:TextAtlasNode):void {
        texture.addChar(data, node.x, node.y);
    }
    */

    destroy(): void {
        for (var k in this.charMaps) {
            var ri: CharRenderInfo = this.charMaps[k];
            ri.deleted = true;
        }
        this.texture.discard();
    }

    printDebugInfo(): void {

    }
}

