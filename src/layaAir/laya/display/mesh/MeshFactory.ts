import { Rectangle } from "../../maths/Rectangle";
import { VertexStream } from "../../utils/VertexStream";

/** @blueprintInheritable */
export interface IMeshFactory {
    onPopulateMesh(vb: VertexStream): void;
}

const gridTileIndice = [-1, 0, -1, 2, 4, 3, -1, 1, -1];
const TRIANGLES_9_GRID = [
    4, 0, 1, 1, 5, 4,
    5, 1, 2, 2, 6, 5,
    6, 2, 3, 3, 7, 6,
    8, 4, 5, 5, 9, 8,
    9, 5, 6, 6, 10, 9,
    10, 6, 7, 7, 11, 10,
    12, 8, 9, 9, 13, 12,
    13, 9, 10, 10, 14, 13,
    14, 10, 11,
    11, 15, 14
];

const gridTexX = [0, 0, 0, 0];
const gridTexY = [0, 0, 0, 0];
const gridX = [0, 0, 0, 0];
const gridY = [0, 0, 0, 0];
const atlasUVEdgeEpsilon = 1e-7;

export function genSliceMesh(vb: VertexStream, contentRect: Readonly<Rectangle>, uvRect: Readonly<Rectangle>, gridRect: Readonly<Rectangle>, tileGridIndice: number) {
    const sourceW = vb.mainTex.sourceWidth;
    const sourceH = vb.mainTex.sourceHeight;

    const sx = uvRect.width / sourceW;
    const sy = uvRect.height / sourceH;
    const xMax = gridRect.right;
    const yMax = gridRect.bottom;

    gridTexX.length = 0;
    gridTexX.push(
        uvRect.x,
        uvRect.x + gridRect.x * sx,
        uvRect.x + xMax * sx,
        uvRect.right
    );
    gridTexY.length = 0;
    gridTexY.push(
        uvRect.y,
        uvRect.y + gridRect.y * sy,
        uvRect.y + yMax * sy,
        uvRect.bottom
    );
    insetZeroGridAtlasEdgeUVs(vb, sourceW, sourceH, gridRect, gridTexX, gridTexY);

    gridX[0] = contentRect.x;
    if (contentRect.width >= (sourceW - gridRect.width)) {
        gridX[1] = gridX[0] + gridRect.x;
        gridX[2] = contentRect.right - (sourceW - xMax);
        gridX[3] = contentRect.right;
    } else {
        const tmp = gridRect.x / (sourceW - xMax);
        const adjustedTmp = gridX[0] + contentRect.width * tmp / (1 + tmp);
        gridX[1] = adjustedTmp;
        gridX[2] = adjustedTmp;
        gridX[3] = contentRect.right;
    }

    gridY[0] = contentRect.y;
    if (contentRect.height >= (sourceH - gridRect.height)) {
        gridY[1] = gridY[0] + gridRect.y;
        gridY[2] = contentRect.bottom - (sourceH - yMax);
        gridY[3] = contentRect.bottom;
    } else {
        const tmp = gridRect.y / (sourceH - yMax);
        const adjustedTmp = gridY[0] + contentRect.height * tmp / (1 + tmp);
        gridY[1] = adjustedTmp;
        gridY[2] = adjustedTmp;
        gridY[3] = contentRect.bottom;
    }

    if (tileGridIndice === 0) {
        for (let cy = 0; cy < 4; cy++) {
            for (let cx = 0; cx < 4; cx++) {
                vb.addVert(gridX[cx], gridY[cy], null, gridTexX[cx], gridTexY[cy]);
            }
        }
        vb.addTriangles(TRIANGLES_9_GRID);
    } else {
        const drawRect = Rectangle.create();
        const uvRect = Rectangle.create();
        let qi = vb.vertCount;

        for (let pi = 0; pi < 9; pi++) {
            const col = pi % 3;
            const row = Math.floor(pi / 3);
            const part = gridTileIndice[pi];
            Rectangle.minMaxRect(gridX[col], gridY[row], gridX[col + 1], gridY[row + 1], drawRect);
            Rectangle.minMaxRect(gridTexX[col], gridTexY[row], gridTexX[col + 1], gridTexY[row + 1], uvRect);

            if (part !== -1 && (tileGridIndice & (1 << part)) !== 0) {
                if (qi !== vb.vertCount)
                    vb.triangulateQuad(qi);

                genTileMesh(vb, drawRect, uvRect,
                    (part === 0 || part === 1 || part === 4) ? gridRect.width : drawRect.width,
                    (part === 2 || part === 3 || part === 4) ? gridRect.height : drawRect.height,
                    true, true);

                qi = vb.vertCount;
            } else {
                vb.addQuad(drawRect, null, uvRect);
            }
        }
        if (qi !== vb.vertCount)
            vb.triangulateQuad(qi);

        drawRect.recover();
        uvRect.recover();
    }
}

export function genTileMesh(vb: VertexStream,
    drawRect: Readonly<Rectangle>, uvRect: Readonly<Rectangle>,
    sourceW: number, sourceH: number,
    repeatX: boolean, repeatY: boolean) {

    let hc = repeatX ? (Math.ceil(drawRect.width / sourceW) - 1) : 0;
    let vc = repeatY ? (Math.ceil(drawRect.height / sourceH) - 1) : 0;
    let tailWidth = drawRect.width - hc * sourceW;
    let tailHeight = drawRect.height - vc * sourceH;

    const tmpRect = Rectangle.create();
    const tmpUV = Rectangle.create();
    let qi = vb.vertCount;

    for (let i = 0; i <= hc; i++) {
        for (let j = 0; j <= vc; j++) {
            tmpRect.setTo(drawRect.x + i * sourceW,
                drawRect.y + j * sourceH,
                (i < hc) ? sourceW : tailWidth,
                (j < vc) ? sourceH : tailHeight);

            tmpUV.setTo(uvRect.x, uvRect.y,
                (i < hc || !repeatX) ? uvRect.width : uvRect.width * tailWidth / sourceW,
                (j < vc || !repeatY) ? uvRect.height : uvRect.height * tailHeight / sourceH);

            vb.addQuad(tmpRect, null, tmpUV);
        }
    }
    vb.triangulateQuad(qi);

    tmpRect.recover();
    tmpUV.recover();
}

function insetZeroGridAtlasEdgeUVs(vb: VertexStream, sourceW: number, sourceH: number, gridRect: Readonly<Rectangle>, texX: number[], texY: number[]): void {
    const texture = vb.mainTex;
    if (!texture)
        return;

    const uvrect = texture.uvrect;
    if (!uvrect || (uvrect[0] === 0 && uvrect[1] === 0 && uvrect[2] === 1 && uvrect[3] === 1))
        return;

    const bitmap = texture.bitmap;
    if (!bitmap || bitmap.width <= 0 || bitmap.height <= 0)
        return;

    const minU = uvrect[0];
    const minV = uvrect[1];
    const maxU = minU + uvrect[2];
    const maxV = minV + uvrect[3];
    const halfU = Math.min(0.5 / bitmap.width, uvrect[2] * 0.5);
    const halfV = Math.min(0.5 / bitmap.height, uvrect[3] * 0.5);

    if (isZeroGridSize(gridRect.x)) {
        texX[0] = insetAtlasEdgeUV(texX[0], minU, maxU, halfU);
        texX[1] = insetAtlasEdgeUV(texX[1], minU, maxU, halfU);
    }
    if (isZeroGridSize(sourceW - gridRect.right)) {
        texX[2] = insetAtlasEdgeUV(texX[2], minU, maxU, halfU);
        texX[3] = insetAtlasEdgeUV(texX[3], minU, maxU, halfU);
    }

    if (isZeroGridSize(gridRect.y)) {
        texY[0] = insetAtlasEdgeUV(texY[0], minV, maxV, halfV);
        texY[1] = insetAtlasEdgeUV(texY[1], minV, maxV, halfV);
    }
    if (isZeroGridSize(sourceH - gridRect.bottom)) {
        texY[2] = insetAtlasEdgeUV(texY[2], minV, maxV, halfV);
        texY[3] = insetAtlasEdgeUV(texY[3], minV, maxV, halfV);
    }
}

function isZeroGridSize(value: number): boolean {
    return Math.abs(value) <= atlasUVEdgeEpsilon;
}

function insetAtlasEdgeUV(value: number, min: number, max: number, halfTexel: number): number {
    if (isNearUVEdge(value, min))
        return min + halfTexel;
    if (isNearUVEdge(value, max))
        return max - halfTexel;
    return value;
}

function isNearUVEdge(value: number, edge: number): boolean {
    return Math.abs(value - edge) <= atlasUVEdgeEpsilon;
}
