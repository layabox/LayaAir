import { LayaEnv } from "../../../LayaEnv";
import { MathUtil } from "../../maths/MathUtil";
import { Rectangle } from "../../maths/Rectangle";
import { ClassUtils } from "../../utils/ClassUtils";
import { VertexStream } from "../../utils/VertexStream";
import { IMeshFactory } from "./MeshFactory";

export enum FillMethod {
    None,
    Horizontal,
    Vertical,
    Radial90,
    Radial180,
    Radial360,
}

export enum FillOrigin {
    Top,
    Bottom,
    Left,
    Right,

    TopLeft = 0,
    TopRight = 1,
    BottomLeft = 2,
    BottomRight = 3
}

export class ProgressMesh implements IMeshFactory {
    /**
     * @en The origin point for filling. Its meaning varies depending on the method.
     * - When the method is Horizontal, use FillOrigin.Left and FillOrigin.Right to indicate the starting point;
     * - When the method is Vertical, use FillOrigin.Top and FillOrigin.Bottom to indicate the starting point;
     * - When the method is Radial90, use FillOrigin.TopLeft, FillOrigin.TopRight, FillOrigin.BottomLeft, and FillOrigin.BottomRight to indicate the four corners;
     * - When the method is Radial180, use FillOrigin.Top, FillOrigin.Bottom, FillOrigin.Left, and FillOrigin.Right to indicate the four sides, starting from the center of the corresponding side;
     * - When the method is Radial360, use FillOrigin.Top, FillOrigin.Bottom, FillOrigin.Left, and FillOrigin.Right to indicate the four sides, starting from the center of the corresponding side;
     * 
     * @zh 填充的起始点。method不同，值的含义也不同。
     * - 当method为Horizontal时，使用FillOrigin.Left和FillOrign.Right表示起始点；
     * - 当method为Vertical时，使用FillOrigin.Top和FillOrigin.Bottom表示起始点；
     * - 当method为Radial90时，使用FillOrigin.TopLeft、FillOrigin.TopRight、FillOrigin.BottomLeft、FillOrigin.BottomRight四个值表示四个角；
     * - 当method为Radial180时，使用FillOrigin.Top、FillOrigin.Bottom、FillOrigin.Left、FillOrigin.Right四个值表示四个边，从对应边的中心开始填充；
     * - 当method为Radial360时，使用FillOrigin.Top、FillOrigin.Bottom、FillOrigin.Left、FillOrigin.Right四个值表示四个边，从对应边的中心开始填充；
     */
    origin: number = 0;

    /**
     * @en The amount of fill, ranging from 0 to 1.
     * @zh 填充的数量，范围从0到1。
     */
    amount: number = 0.6;

    /**
     * @en Whether the filling is done in a clockwise direction. Only applicable for Radial90, Radial180, and Radial360 methods.
     * @zh 填充是否按顺时针方向进行。仅对Radial90、Radial180和Radial360方法适用。
     */
    clockwise: boolean = true;

    private _method: number = 5;

    /**
     * @en The filling method.
     * @zh 填充的方法。
     */
    get method(): FillMethod {
        return this._method;
    }

    set method(value: FillMethod) {
        if (this._method != value) {
            this._method = value;
            if (!LayaEnv.isPlaying
                && (value === FillMethod.Horizontal || value === FillMethod.Vertical)
                && this.origin > 1)
                this.origin = 0;
        }
    }

    onPopulateMesh(vb: VertexStream): void {
        let amount = MathUtil.clamp01(this.amount);
        switch (this.method) {
            case FillMethod.Horizontal:
                fillHorizontal(vb, vb.contentRect, this.origin, amount);
                break;

            case FillMethod.Vertical:
                fillVertical(vb, vb.contentRect, this.origin, amount);
                break;

            case FillMethod.Radial90:
                fillRadial90(vb, vb.contentRect, this.origin, amount, this.clockwise);
                break;

            case FillMethod.Radial180:
                fillRadial180(vb, vb.contentRect, this.origin, amount, this.clockwise);
                break;

            case FillMethod.Radial360:
                fillRadial360(vb, vb.contentRect, this.origin, amount, this.clockwise);
                break;

            default:
                vb.addQuad(vb.contentRect);
                vb.triangulateQuad(0);
                break;
        }
    }
}

ClassUtils.regClass("ProgressMesh", ProgressMesh);

function fillHorizontal(vb: VertexStream, vertRect: Readonly<Rectangle>, origin: number, amount: number): void {
    const tmpRect = Rectangle.create();
    let rect = tmpRect.copyFrom(vertRect);
    let a = rect.width * amount;
    if (origin === FillOrigin.Right || origin === FillOrigin.Bottom)
        rect.x += (rect.width - a);
    rect.width = a;

    vb.addQuad(rect);
    vb.triangulateQuad(0);

    tmpRect.recover();
}

function fillVertical(vb: VertexStream, vertRect: Readonly<Rectangle>, origin: number, amount: number): void {
    const tmpRect = Rectangle.create();
    let rect = tmpRect.copyFrom(vertRect);
    let a = rect.height * amount;
    if (origin === FillOrigin.Right || origin === FillOrigin.Bottom)
        rect.y += (rect.height - a);
    rect.height = a;

    vb.addQuad(rect);
    vb.triangulateQuad(0);

    tmpRect.recover();
}

function fillRadial90(vb: VertexStream, vertRect: Readonly<Rectangle>, origin: FillOrigin, amount: number, clockwise: boolean): void {
    let flipX = origin === FillOrigin.TopRight || origin === FillOrigin.BottomRight;
    let flipY = origin === FillOrigin.BottomLeft || origin === FillOrigin.BottomRight;
    if (flipX !== flipY)
        clockwise = !clockwise;

    let ratio = clockwise ? amount : (1 - amount);
    let tan = Math.tan(Math.PI * 0.5 * ratio);
    let thresold = false;
    if (ratio !== 1)
        thresold = (vertRect.height / vertRect.width - tan) > 0;
    if (!clockwise)
        thresold = !thresold;
    let x = vertRect.x + (ratio === 0 ? Number.MAX_VALUE : (vertRect.height / tan));
    let y = vertRect.y + (ratio === 1 ? Number.MAX_VALUE : (vertRect.width * tan));
    let x2 = x;
    let y2 = y;
    if (flipX)
        x2 = vertRect.width - x;
    if (flipY)
        y2 = vertRect.height - y;
    let xMin = flipX ? (vertRect.width - vertRect.x) : vertRect.x;
    let yMin = flipY ? (vertRect.height - vertRect.y) : vertRect.y;
    let xMax = flipX ? -vertRect.x : vertRect.right;
    let yMax = flipY ? -vertRect.y : vertRect.bottom;

    vb.addVert(xMin, yMin);

    if (clockwise)
        vb.addVert(xMax, yMin);

    if (y > vertRect.bottom) {
        if (thresold)
            vb.addVert(x2, yMax);
        else
            vb.addVert(xMax, yMax);
    } else
        vb.addVert(xMax, y2);

    if (x > vertRect.right) {
        if (thresold)
            vb.addVert(xMax, y2);
        else
            vb.addVert(xMax, yMax);
    } else
        vb.addVert(x2, yMax);

    if (!clockwise)
        vb.addVert(xMin, yMax);

    if (flipX === flipY) {
        vb.addTriangle(0, 1, 2);
        vb.addTriangle(0, 2, 3);
    } else {
        vb.addTriangle(2, 1, 0);
        vb.addTriangle(3, 2, 0);
    }
}

function fillRadial180(vb: VertexStream, vertRect: Readonly<Rectangle>, origin: FillOrigin, amount: number, clockwise: boolean): void {
    const tmpRect = Rectangle.create();
    let rect = tmpRect.copyFrom(vertRect);
    switch (origin) {
        case FillOrigin.Top:
            if (amount <= 0.5) {
                rect.width /= 2;
                if (clockwise)
                    rect.x += rect.width;

                fillRadial90(vb, rect, clockwise ? FillOrigin.TopLeft : FillOrigin.TopRight, amount / 0.5, clockwise);
                let vec = vb.getPos(-4);
                vb.addQuad(Rectangle.TEMP.setTo(vec.x, vec.y, 0, 0));
                vb.triangulateQuad(-4);
            } else {
                rect.width /= 2;
                if (!clockwise)
                    rect.x += rect.width;

                fillRadial90(vb, rect, clockwise ? FillOrigin.TopRight : FillOrigin.TopLeft, (amount - 0.5) / 0.5, clockwise);

                if (clockwise)
                    rect.x += rect.width;
                else
                    rect.x -= rect.width;
                vb.addQuad(rect);
                vb.triangulateQuad(-4);
            }
            break;

        case FillOrigin.Bottom:
            if (amount <= 0.5) {
                rect.width /= 2;
                if (!clockwise)
                    rect.x += rect.width;

                fillRadial90(vb, rect, clockwise ? FillOrigin.BottomRight : FillOrigin.BottomLeft, amount / 0.5, clockwise);
                let vec = vb.getPos(-4);
                vb.addQuad(Rectangle.TEMP.setTo(vec.x, vec.y, 0, 0));
                vb.triangulateQuad(-4);
            } else {
                rect.width /= 2;
                if (clockwise)
                    rect.x += rect.width;

                fillRadial90(vb, rect, clockwise ? FillOrigin.BottomLeft : FillOrigin.BottomRight, (amount - 0.5) / 0.5, clockwise);

                if (clockwise)
                    rect.x -= rect.width;
                else
                    rect.x += rect.width;
                vb.addQuad(rect);
                vb.triangulateQuad(-4);
            }
            break;

        case FillOrigin.Left:
            if (amount <= 0.5) {
                rect.height /= 2;
                if (!clockwise)
                    rect.y += rect.height;

                fillRadial90(vb, rect, clockwise ? FillOrigin.BottomLeft : FillOrigin.TopLeft, amount / 0.5, clockwise);
                let vec = vb.getPos(-4);
                vb.addQuad(Rectangle.TEMP.setTo(vec.x, vec.y, 0, 0));
                vb.triangulateQuad(-4);
            } else {
                rect.height /= 2;
                if (clockwise)
                    rect.y += rect.height;

                fillRadial90(vb, rect, clockwise ? FillOrigin.TopLeft : FillOrigin.BottomLeft, (amount - 0.5) / 0.5, clockwise);

                if (clockwise)
                    rect.y -= rect.height;
                else
                    rect.y += rect.height;
                vb.addQuad(rect);
                vb.triangulateQuad(-4);
            }
            break;

        case FillOrigin.Right:
            if (amount <= 0.5) {
                rect.height /= 2;
                if (clockwise)
                    rect.y += rect.height;

                fillRadial90(vb, rect, clockwise ? FillOrigin.TopRight : FillOrigin.BottomRight, amount / 0.5, clockwise);
                let vec = vb.getPos(-4);
                vb.addQuad(Rectangle.TEMP.setTo(vec.x, vec.y, 0, 0));
                vb.triangulateQuad(-4);
            } else {
                rect.height /= 2;
                if (!clockwise)
                    rect.y += rect.height;

                fillRadial90(vb, rect, clockwise ? FillOrigin.BottomRight : FillOrigin.TopRight, (amount - 0.5) / 0.5, clockwise);

                if (clockwise)
                    rect.y += rect.height;
                else
                    rect.y -= rect.height;
                vb.addQuad(rect);
                vb.triangulateQuad(-4);
            }
            break;
    }
    tmpRect.recover();
}

function fillRadial360(vb: VertexStream, vertRect: Readonly<Rectangle>, origin: FillOrigin, amount: number, clockwise: boolean): void {
    const tmpRect = Rectangle.create();
    let rect = tmpRect.copyFrom(vertRect);
    switch (origin) {
        case FillOrigin.Top:
            if (amount < 0.5) {
                rect.width /= 2;
                if (clockwise)
                    rect.x += rect.width;

                fillRadial180(vb, rect, clockwise ? FillOrigin.Left : FillOrigin.Right, amount / 0.5, clockwise);
                let vec = vb.getPos(-8);
                vb.addQuad(Rectangle.TEMP.setTo(vec.x, vec.y, 0, 0));
                vb.triangulateQuad(-4);
            } else {
                rect.width /= 2;
                if (!clockwise)
                    rect.x += rect.width;

                fillRadial180(vb, rect, clockwise ? FillOrigin.Right : FillOrigin.Left, (amount - 0.5) / 0.5, clockwise);

                if (clockwise)
                    rect.x += rect.width;
                else
                    rect.x -= rect.width;
                vb.addQuad(rect);
                vb.triangulateQuad(-4);
            }
            break;

        case FillOrigin.Bottom:
            if (amount < 0.5) {
                rect.width /= 2;
                if (!clockwise)
                    rect.x += rect.width;

                fillRadial180(vb, rect, clockwise ? FillOrigin.Right : FillOrigin.Left, amount / 0.5, clockwise);
                let vec = vb.getPos(-8);
                vb.addQuad(Rectangle.TEMP.setTo(vec.x, vec.y, 0, 0));
                vb.triangulateQuad(-4);
            } else {
                rect.width /= 2;
                if (clockwise)
                    rect.x += rect.width;

                fillRadial180(vb, rect, clockwise ? FillOrigin.Left : FillOrigin.Right, (amount - 0.5) / 0.5, clockwise);

                if (clockwise)
                    rect.x -= rect.width;
                else
                    rect.x += rect.width;
                vb.addQuad(rect);
                vb.triangulateQuad(-4);
            }
            break;

        case FillOrigin.Left:
            if (amount < 0.5) {
                rect.height /= 2;
                if (!clockwise)
                    rect.y += rect.height;

                fillRadial180(vb, rect, clockwise ? FillOrigin.Bottom : FillOrigin.Top, amount / 0.5, clockwise);
                let vec = vb.getPos(-8);
                vb.addQuad(Rectangle.TEMP.setTo(vec.x, vec.y, 0, 0));
                vb.triangulateQuad(-4);
            } else {
                rect.height /= 2;
                if (clockwise)
                    rect.y += rect.height;

                fillRadial180(vb, rect, clockwise ? FillOrigin.Top : FillOrigin.Bottom, (amount - 0.5) / 0.5, clockwise);

                if (clockwise)
                    rect.y -= rect.height;
                else
                    rect.y += rect.height;
                vb.addQuad(rect);
                vb.triangulateQuad(-4);
            }
            break;

        case FillOrigin.Right:
            if (amount < 0.5) {
                rect.height /= 2;
                if (clockwise)
                    rect.y += rect.height;

                fillRadial180(vb, rect, clockwise ? FillOrigin.Top : FillOrigin.Bottom, amount / 0.5, clockwise);
                let vec = vb.getPos(-8);
                vb.addQuad(Rectangle.TEMP.setTo(vec.x, vec.y, 0, 0));
                vb.triangulateQuad(-4);
            } else {
                rect.height /= 2;
                if (!clockwise)
                    rect.y += rect.height;

                fillRadial180(vb, rect, clockwise ? FillOrigin.Bottom : FillOrigin.Top, (amount - 0.5) / 0.5, clockwise);

                if (clockwise)
                    rect.y += rect.height;
                else
                    rect.y -= rect.height;
                vb.addQuad(rect);
                vb.triangulateQuad(-4);
            }
            break;
    }
    tmpRect.recover();
}