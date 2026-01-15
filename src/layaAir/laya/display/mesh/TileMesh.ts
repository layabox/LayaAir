import { Rectangle } from "../../maths/Rectangle";
import { WrapMode } from "../../RenderEngine/RenderEnum/WrapMode";
import { ClassUtils } from "../../utils/ClassUtils";
import { VertexStream } from "../../utils/VertexStream";
import { genTileMesh, IMeshFactory } from "./MeshFactory";

export class TileMesh implements IMeshFactory {
    /**
     * @en Whether to repeat in the X direction.
     * @zh 是否在X方向重复。
     */
    repeatX: boolean = true;

    /**
     * @en Whether to repeat in the Y direction.
     * @zh 是否在Y方向重复。
     */
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
            genTileMesh(vb, vb.contentRect, vb.uvRect,
                tex ? tex.sourceWidth : vb.contentRect.width, tex ? tex.sourceHeight : vb.contentRect.height,
                this.repeatX, this.repeatY);
        }
    }
}

ClassUtils.regClass("TileMesh", TileMesh);