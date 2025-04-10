import { Rectangle } from "../../maths/Rectangle";
import { WrapMode } from "../../RenderEngine/RenderEnum/WrapMode";
import { VertexStream } from "../../utils/VertexStream";
import { genTileMesh, IMeshFactory } from "./MeshFactory";

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
            let tmpRect = Rectangle.create();
            tmpRect.copyFrom(vb.uvRect);
            if (this.repeatX)
                tmpRect.width *= vb.contentRect.width / tex.width;
            if (this.repeatY)
                tmpRect.height *= vb.contentRect.height / tex.height;

            vb.addQuad(vb.contentRect, null, tmpRect);
            vb.triangulateQuad(0);

            tmpRect.recover();
        }
        else {
            genTileMesh(vb, vb.contentRect, vb.uvRect, tex.sourceWidth, tex.sourceHeight, this.repeatX, this.repeatY);
        }
    }
}