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
        genTileMesh(vb, vb.contentRect, vb.uvRect,
            tex ? tex.sourceWidth : vb.contentRect.width, tex ? tex.sourceHeight : vb.contentRect.height,
            this.repeatX, this.repeatY);
    }
}

ClassUtils.regClass("TileMesh", TileMesh);
