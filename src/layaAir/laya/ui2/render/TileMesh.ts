import { Rectangle } from "../../maths/Rectangle";
import { WrapMode } from "../../RenderEngine/RenderEnum/WrapMode";
import { VertexStream } from "../../utils/VertexStream";
import { IMeshFactory } from "./MeshFactory";

export class TileMesh implements IMeshFactory {
    repeatX: boolean = true;
    repeatY: boolean = true;

    onPopulateMesh(vb: VertexStream) {
        let tex = vb.mainTex;
        if (tex != null
            && vb.uvRect.x == 0 && vb.uvRect.y == 0 && vb.uvRect.width == 1 && vb.uvRect.height == 1
            && tex.bitmap.wrapModeU == WrapMode.Repeat
            && tex.bitmap.wrapModeV == WrapMode.Repeat) {
            //如果贴图自身就是重复模式，那利用重复模式的特性即可
            tmpRect.copyFrom(vb.uvRect);
            if (this.repeatX)
                tmpRect.width *= vb.contentRect.width / tex.width;
            if (this.repeatY)
                tmpRect.height *= vb.contentRect.height / tex.height;

            vb.addQuad(vb.contentRect, null, tmpRect);
            vb.addTriangles(0);
        }
        else {
            let contentRect = vb.contentRect;
            let uv = tex.uvrect;
            let sourceW = tex.sourceWidth;
            let sourceH = tex.sourceHeight;
            let texW = tex.width;
            let texH = tex.height;
            let offsetX = tex.offsetX;
            let offsetY = tex.offsetY;
            let repeatX = this.repeatX;
            let repeatY = this.repeatY;
            let sx = repeatX ? 1 : contentRect.width / tex.sourceWidth;
            let sy = repeatY ? 1 : contentRect.height / tex.sourceHeight;
            let hc = repeatX ? (Math.ceil(contentRect.width / sourceW) - 1) : 0;
            let vc = repeatY ? (Math.ceil(contentRect.height / sourceH) - 1) : 0;
            let tailWidth = contentRect.width - hc * sourceW;
            let tailHeight = contentRect.height - vc * sourceH;

            for (let i = 0; i <= hc; i++) {
                for (let j = 0; j <= vc; j++) {
                    tmpRect.setTo(contentRect.x + i * sourceW + offsetX * sx,
                        contentRect.y + j * sourceH + offsetY * sy,
                        (i < hc || !repeatX) ? texW * sx : Math.min(texW, tailWidth - offsetX),
                        (j < vc || !repeatY) ? texH * sy : Math.min(texH, tailHeight - offsetY));

                    if (tmpRect.width <= 0 || tmpRect.height <= 0)
                        continue;

                    //不使用vb.uvRect，因为vb.uvRect已经被外扩
                    tmpUV.setTo(uv[0],
                        uv[1],
                        (i < hc || !repeatX) ? uv[2] : (uv[2] * tmpRect.width / texW),
                        (j < vc || !repeatY) ? uv[3] : (uv[3] * tmpRect.height / texH));

                    vb.addQuad(tmpRect, null, tmpUV);
                }
            }
            vb.addTriangles(0);
        }
    }
}

const tmpUV = new Rectangle();
const tmpRect = new Rectangle();