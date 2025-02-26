import { Rectangle } from "../../maths/Rectangle";
import { VertexStream } from "../../utils/VertexStream";
import { IMeshFactory } from "./MeshFactory";

export enum FlipDirection {
    None,
    Horizontal,
    Vertical,
    Both
}

export class FlipMesh implements IMeshFactory {
    dir: FlipDirection = 0;

    onPopulateMesh(vb: VertexStream) {
        let tmpRect = Rectangle.TEMP.copyFrom(vb.uvRect);

        if (this.dir != FlipDirection.None) {
            if (this.dir == FlipDirection.Horizontal || this.dir == FlipDirection.Both) {
                let tmp = tmpRect.x;
                tmpRect.x = tmpRect.right;
                tmpRect.right = tmp;
            }
            if (this.dir == FlipDirection.Vertical || this.dir == FlipDirection.Both) {
                let tmp = tmpRect.y;
                tmpRect.y = tmpRect.bottom;
                tmpRect.bottom = tmp;
            }
        }

        vb.addQuad(vb.contentRect, null, tmpRect);
        vb.addTriangles(0);
    }
}