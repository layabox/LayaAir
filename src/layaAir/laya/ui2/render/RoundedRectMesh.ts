import { VertexStream } from "../../utils/VertexStream";
import { IMeshFactory } from "./MeshFactory";

export class RoundedRectMesh implements IMeshFactory {
    lt: number = 6;
    rt: number = 6;
    lb: number = 6;
    rb: number = 6;

    onPopulateMesh(vb: VertexStream) {
        let w = vb.contentRect.width;
        let h = vb.contentRect.height;
        let radiusX = w / 2;
        let radiusY = h / 2;
        let cornerMaxRadius = Math.min(radiusX, radiusY);
        let centerX = radiusX;
        let centerY = radiusY;

        vb.addVert(centerX, centerY, 0);

        let cnt = vb.vertCount;
        for (let i = 0; i < 4; i++) {
            let radius = 0;
            switch (i) {
                case 0:
                    radius = this.rb;
                    break;
                case 1:
                    radius = this.lb;
                    break;
                case 2:
                    radius = this.lt;
                    break;
                case 3:
                    radius = this.rt;
                    break;
            }
            radius = Math.min(cornerMaxRadius, radius);

            let offsetX = 0;
            let offsetY = 0;

            if (i === 0 || i === 3) offsetX = w - radius * 2;
            if (i === 0 || i === 1) offsetY = h - radius * 2;

            if (radius !== 0) {
                let partNumSides = Math.max(1, Math.ceil(Math.PI * radius / 8)) + 1;
                let angleDelta = Math.PI / 2 / partNumSides;
                let angle = Math.PI / 2 * i;
                let startAngle = angle;

                for (let j = 1; j <= partNumSides; j++) {
                    if (j === partNumSides) angle = startAngle + Math.PI / 2; //消除精度误差带来的不对齐
                    vb.addVert(offsetX + Math.cos(angle) * radius + radius,
                        offsetY + Math.sin(angle) * radius + radius,
                        0);
                    angle += angleDelta;
                }
            } else {
                vb.addVert(offsetX, offsetY, 0);
            }
        }
        cnt = vb.vertCount - cnt;

        for (let i = 0; i < cnt; i++)
            vb.addTriangle(0, i + 1, i === cnt - 1 ? 1 : i + 2);
    }
}