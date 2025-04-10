import { Rectangle } from "../../maths/Rectangle";
import { VertexStream } from "../../utils/VertexStream";
import { genSliceMesh, IMeshFactory } from "./MeshFactory";

export class FlipMesh implements IMeshFactory {
    flipX: boolean = true;
    flipY: boolean = false;

    onPopulateMesh(vb: VertexStream) {
        const tmpUV = Rectangle.create();
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

        let sizeGrid = vb.mainTex._sizeGrid;
        if (sizeGrid) {
            let gridRect = Rectangle.create();
            let sourceWidth = vb.mainTex.sourceWidth;
            let sourceHeight = vb.mainTex.sourceHeight;
            gridRect.setTo(sizeGrid[3], sizeGrid[0],
                sourceWidth - sizeGrid[1] - sizeGrid[3],
                sourceHeight - sizeGrid[0] - sizeGrid[2]);

            if (this.flipX)
                gridRect.x = sourceWidth - gridRect.right;
            if (this.flipY)
                gridRect.y = sourceHeight - gridRect.bottom;

            genSliceMesh(vb, vb.contentRect, uvRect, gridRect, sizeGrid[4] === 1 ? 0xff : 0);
        }
        else {
            vb.addQuad(vb.contentRect, null, uvRect);
            vb.triangulateQuad(0);
        }
        tmpUV.recover();
    }
}