import { MathUtil } from "../../maths/MathUtil";
import { VertexStream } from "../../utils/VertexStream";
import { IMeshFactory } from "./MeshFactory";

export class CircleMesh implements IMeshFactory {

    onPopulateMesh(vb: VertexStream) {
        let rect = vb.contentRect;

        const radiusX = rect.width / 2;
        const radiusY = rect.height / 2;
        let sides = Math.ceil(Math.PI * (radiusX + radiusY) / 4);
        sides = MathUtil.clamp(sides, 40, 800);
        const angleDelta = 2 * Math.PI / sides;
        let angle = 0;

        const centerX = rect.x + radiusX;
        const centerY = rect.y + radiusY;
        vb.addVert(centerX, centerY, 0);

        for (let i = 0; i < sides; i++) {
            let vx = Math.cos(angle) * radiusX + centerX;
            let vy = Math.sin(angle) * radiusY + centerY;
            vb.addVert(vx, vy, 0);
            angle += angleDelta;
        }

        for (let i = 0; i < sides; i++) {
            if (i != sides - 1)
                vb.addTriangle(0, i + 1, i + 2);
            else
                vb.addTriangle(0, i + 1, 1);
        }
    }

}