import { AtlasGrid } from "./AtlasGrid";
import { TextTexture } from "./TextTexture";
import { ILaya } from "../../../ILaya";
/**
 *  文字贴图的大图集。
 */
export class TextAtlas {
    constructor() {
        this.texWidth = 1024;
        this.texHeight = 1024;
        this.protectDist = 1;
        this.texture = null;
        this.charMaps = {}; // 保存文字信息的字典
        this.texHeight = this.texWidth = ILaya.TextRender.atlasWidth;
        this.texture = TextTexture.getTextTexture(this.texWidth, this.texHeight);
        if (this.texWidth / TextAtlas.atlasGridW > 256) {
            TextAtlas.atlasGridW = Math.ceil(this.texWidth / 256);
        }
        this.atlasgrid = new AtlasGrid(this.texWidth / TextAtlas.atlasGridW, this.texHeight / TextAtlas.atlasGridW, this.texture.id);
    }
    setProtecteDist(d) {
        this.protectDist = d;
    }
    /**
     * 如果返回null，则表示无法加入了
     * 分配的时候优先选择最接近自己高度的节点
     * @param	w
     * @param	h
     * @return
     */
    getAEmpty(w, h, pt) {
        var find = this.atlasgrid.addRect(1, Math.ceil(w / TextAtlas.atlasGridW), Math.ceil(h / TextAtlas.atlasGridW), pt);
        if (find) {
            pt.x *= TextAtlas.atlasGridW;
            pt.y *= TextAtlas.atlasGridW;
        }
        return find;
    }
    /**
     * 大图集格子单元的占用率，老的也算上了。只是表示这个大图集还能插入多少东西。
     */
    get usedRate() {
        return this.atlasgrid._used;
    }
    //data 也可能是canvas
    /*
    public function pushData(data:ImageData, node:TextAtlasNode):void {
        texture.addChar(data, node.x, node.y);
    }
    */
    destroy() {
        for (var k in this.charMaps) {
            var ri = this.charMaps[k];
            ri.deleted = true;
        }
        this.texture.discard();
    }
    printDebugInfo() {
    }
}
TextAtlas.atlasGridW = 16;
