import { Rectangle } from "../../maths/Rectangle";
import { VertexStream } from "../../utils/VertexStream";
import { IMeshFactory } from "./MeshFactory";

export class FlipMesh implements IMeshFactory {
    flipX: boolean = true;
    flipY: boolean = false;

    onPopulateMesh(vb: VertexStream) {
        let uvRect = tmpUV.copyFrom(vb.uvRect);

        if (this.flipX) {
            let tmp = uvRect.x;
            uvRect.x = uvRect.right;
            uvRect.right = tmp;
        }
        if (this.flipY) {
            let tmp = uvRect.y;
            uvRect.y = uvRect.bottom;
            uvRect.bottom = tmp;
        }

        vb.addQuad(vb.contentRect, null, uvRect);
        vb.addTriangles(0);
    }
}

const tmpUV = new Rectangle();
const tmpRect = new Rectangle();