import { RestoreCmd } from "./cmd/RestoreCmd"
import { GrahamScan } from "../maths/GrahamScan"
import { Matrix } from "../maths/Matrix"
import { Point } from "../maths/Point"
import { Rectangle } from "../maths/Rectangle"
import { Pool } from "../utils/Pool"
import { Graphics } from "./Graphics";
import { SaveCmd } from "./cmd/SaveCmd"
import { IGraphicsBoundsAssembler } from "./IGraphics"

/**
 * @ignore
 * @en Graphic bounds data class
 * @zh 图形边界数据类
 */
export class GraphicsBounds {
    private _bounds: Rectangle;
    private _bound2: number[];
    private _cacheType: boolean = null;
    _affectBySize: boolean;

    /**
     * @en Destroy
     * @zh 销毁
     */
    destroy(): void {
        this._cacheType = null;
        this._affectBySize = false;
        this._bounds = null;
        this._bound2 = null;
        Pool.recover("GraphicsBounds", this);
    }

    /**
     * @en Create a new GraphicsBounds instance
     * @zh 创建一个新的GraphicsBounds实例
     */
    static create(): GraphicsBounds {
        return Pool.getItemByClass("GraphicsBounds", GraphicsBounds);
    }

    /**
     * @en Reset data
     * @zh 重置数据
     */
    reset(): void {
        this._cacheType = null;
    }

    /**
     * @en Get the position and size information matrix (CPU intensive, frequent use may cause lag, use sparingly).
     * @param realSize (Optional) Use the real size of the image. Default is false.
     * @returns A Rectangle object composed of position and size.
     * @zh 获取位置及宽高信息矩阵(比较耗CPU，频繁使用会造成卡顿，尽量少用)。
     * @param realSize （可选）使用图片的真实大小，默认为false。
     * @returns 位置与宽高组成的一个Rectangle对象。
     */
    getBounds(g: Graphics, realSize?: boolean): Readonly<Rectangle> {
        realSize = !!realSize;
        if (realSize !== this._cacheType) {
            this._bound2 = this._getCmdPoints(g, realSize);
            this._bounds = Rectangle._getWrapRec(this._bound2, this._bounds);
            this._cacheType = realSize;
        }
        return this._bounds;
    }

    /**
     * @en Get the list of boundary points.
     * @param realSize (Optional) Use the real size of the image. Default is false.
     * @returns An array of boundary points.
     * @zh 获取边界点列表。
     * @param realSize （可选）使用图片的真实大小，默认为false。
     * @returns 边界点的数组。
     */
    getBoundPoints(g: Graphics, realSize?: boolean): ReadonlyArray<number> {
        this.getBounds(g, realSize);
        return this._bound2;
    }

    private _getCmdPoints(g: Graphics, realSize?: boolean): number[] {
        this._affectBySize = false;
        let points = this._bound2 || (this._bound2 = []);
        points.length = 0;

        let cmds = g.cmds;
        let sp = g._sp;
        if (cmds.length == 0) return points;

        _assembler.allPoints = points;
        _assembler.width = sp._width; //不能用sp.width，不然在autoSize时会死循环
        _assembler.height = sp._height;
        _assembler.affectBySize = false;
        _assembler.matrix.identity();

        let matrixs = _tempMatrixArrays;
        matrixs.length = 0;

        for (let i = 0, n = cmds.length; i < n; i++) {
            let cmd = cmds[i];

            switch (cmd.cmdID) {
                case SaveCmd.ID:
                    matrixs.push(_assembler.matrix);
                    _assembler.matrix = _assembler.matrix.clone();
                    break;
                case RestoreCmd.ID: //restore
                    _assembler.matrix = matrixs.pop();
                    break;
                default:
                    _assembler.points.length = 0;
                    if (cmd.getBounds)
                        cmd.getBounds(_assembler);
                    else //没有相应功能的取sprite的
                        _tempRect.setTo(sp.x, sp.y, sp._width, sp._height).getBoundPoints(_assembler.points);
                    if (_assembler.points.length > 0)
                        _assembler.flushPoints();

                    break;
            }
        }
        if (points.length > 200) {
            let rect = Rectangle._getWrapRec(points, _tempRect);
            points.length = 0;
            rect.getBoundPoints(points);
        } else if (points.length > 8)
            GrahamScan.scanPList(points);

        this._affectBySize = _assembler.affectBySize;

        return points;
    }
}

class GraphicsBoundsAssembler implements IGraphicsBoundsAssembler {
    width: number;
    height: number;
    affectBySize: boolean;
    points: number[] = [];
    matrix: Matrix = new Matrix();

    allPoints: number[];

    flushPoints(dx?: number, dy?: number, matrix?: Matrix): void {
        if (dx == null) dx = 0;
        if (dy == null) dy = 0;
        if (matrix) {
            this.matrix.copyTo(_tempMatrix);
            _tempMatrix.concat(matrix);
            matrix = _tempMatrix;
        }
        else
            matrix = this.matrix;
        let len = this.points.length;
        let _tempPoint = Point.TEMP;
        for (let i = 0; i < len; i += 2) {
            _tempPoint.setTo(this.points[i] + dx, this.points[i + 1] + dy);
            if (_tempPoint.x == null) _tempPoint.x = 0;
            if (_tempPoint.y == null) _tempPoint.y = 0;
            matrix.transformPoint(_tempPoint);
            this.allPoints.push(_tempPoint.x, _tempPoint.y);
        }
        this.points.length = 0;
    }

    concatMatrix(matrix: Readonly<Matrix>): void {
        matrix.copyTo(_tempMatrix);
        _tempMatrix.concat(this.matrix);
        _tempMatrix.copyTo(this.matrix);
    }
}

const _assembler = new GraphicsBoundsAssembler();
const _tempMatrix = new Matrix();
const _tempMatrixArrays: Matrix[] = [];
const _tempRect = new Rectangle();