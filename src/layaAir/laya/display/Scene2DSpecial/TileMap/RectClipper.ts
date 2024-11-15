
import { Matrix } from "../../../maths/Matrix";
import { Point } from "../../../maths/Point";
import { Rectangle } from "../../../maths/Rectangle";
import { Vector2 } from "../../../maths/Vector2";
import { Vector4 } from "../../../maths/Vector4";
import { TileMapUtils } from "./TileMapUtils";

//对于给定的轴，计算两个多边形的在轴上的投影值，并存储最大值和最小值
//所有的顶点相对于中心点, 轴的方向为逆时针方向
class AlexData {
    private _x: number;
    private _y: number;
    private _rectValueMin: number;
    private _rectValueMax: number;
    constructor() {
        this._x = 0;
        this._y = 0;
        this._rectValueMin = 0;
        this._rectValueMax = 0;
    }
    private _dotValue(x: number, y: number): number {
        return this._x * x + this._y * y;
    }

    private _getDotMinMax(datas: number[], out: Vector2) {
        out.x = Number.MAX_VALUE;
        out.y = -Number.MAX_VALUE;
        for (var i = 0; i < datas.length; i += 2) {
            let value = this._dotValue(datas[i], datas[i + 1]);
            out.x = Math.min(out.x, value);
            out.y = Math.max(out.y, value);
        }
    }

    public setAlex(x: number, y: number) {
        let ds = Math.hypot(x, y);
        this._x = -y / ds;
        this._y = x / ds;
    }

    public updateVerter(rectDatas: number[], ploygons: number[]) {
        let temp = Vector2.TempVector2;
        this._getDotMinMax(rectDatas, temp);
        this._rectValueMin = temp.x;
        this._rectValueMax = temp.y;

        this._getDotMinMax(ploygons, temp);

        let d = (temp.y - temp.x) * 0.5;
        this._rectValueMin -= d;
        this._rectValueMax += d;
    }

    public testCollider(x: number, y: number): boolean {
        let value = this._dotValue(x, y);
        return value < this._rectValueMin || value > this._rectValueMax;
    }
}

/**
 * 矩形裁切器
 * 用于裁切矩形区域，判断一个平行四边形是否在矩形区域内
 * 原理： 分离轴定理
 */
export class RectClipper {
    private _clipperRect: Rectangle;
    private _polygonSize: Vector2;
    private _polygonTransform: Matrix;
    private _ploygRect: Vector4;
    private _matrix: Matrix;
    private _axis: AlexData[];

    private _rectDatas: number[];
    private _polygons: number[];
    private _polygonW: number;
    private _polygonH: number;
    constructor() {
        this._clipperRect = new Rectangle();
        this._polygonSize = new Vector2();
        this._polygonTransform = new Matrix();
        this._ploygRect = new Vector4();
        this._matrix = new Matrix();
        this._axis = [];
        this._axis.push(new AlexData());
        this._axis.push(new AlexData());
        this._axis.push(new AlexData());
        this._axis.push(new AlexData());
        this._axis[0].setAlex(1, 0);
        this._axis[1].setAlex(0, 1);
    }

    private _mrgePoint(x: number, y: number, out: Vector4) {
        let point = Point.TEMP;
        point.setTo(x, y);
        this._matrix.invertTransformPoint(point);
        out.x = Math.min(out.x, point.x);
        out.y = Math.min(out.y, point.y);
        out.z = Math.max(out.z, point.x);
        out.w = Math.max(out.w, point.y);
    }

    private _updateCliperInPolygonRect() {
        this._ploygRect.setValue(Number.MAX_VALUE, Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE);
        let halfw = this._clipperRect.width * 0.5;
        let halfh = this._clipperRect.height * 0.5;
        this._mrgePoint(-halfw, -halfh, this._ploygRect);
        this._mrgePoint(halfw, -halfh, this._ploygRect);
        this._mrgePoint(halfw, halfh, this._ploygRect);
        this._mrgePoint(-halfw, halfh, this._ploygRect);
    }

    private _updateAxiDatas() {
        if (this._rectDatas == null) return;

        let halfw = this._polygonW;
        let halfh = this._polygonH;
        this._polygons = [];
        const p = Vector2.TempVector2;
        TileMapUtils.transfromPointNByValue(this._matrix, -halfw, -halfh, p);
        this._polygons.push(p.x, p.y);
        TileMapUtils.transfromPointNByValue(this._matrix, halfw, -halfh, p);
        this._polygons.push(p.x, p.y);
        TileMapUtils.transfromPointNByValue(this._matrix, halfw, halfh, p);
        this._polygons.push(p.x, p.y);
        TileMapUtils.transfromPointNByValue(this._matrix, -halfw, halfh, p);
        this._polygons.push(p.x, p.y);

        let dx = this._polygons[2] - this._polygons[0];
        let dy = this._polygons[3] - this._polygons[1];
        this._axis[2].setAlex(dx, dy);

        dx = this._polygons[4] - this._polygons[2];
        dy = this._polygons[5] - this._polygons[3];
        this._axis[3].setAlex(dx, dy);

        this._axis[0].updateVerter(this._rectDatas, this._polygons);
        this._axis[1].updateVerter(this._rectDatas, this._polygons);
        this._axis[2].updateVerter(this._rectDatas, this._polygons);
        this._axis[3].updateVerter(this._rectDatas, this._polygons);

    }


    //跟新裁切区域数据
    private _updateClipRect(cliper: Rectangle): boolean {
        if (cliper.equals(this._clipperRect)) return false
        cliper.cloneTo(this._clipperRect);
        let halfw = cliper.width * 0.5;
        let halfh = cliper.height * 0.5;
        this._rectDatas = [-halfw, -halfh, halfw, -halfh, halfw, halfh, -halfw, halfh];
        return true
    }


    //更新测试区域数据
    private _updatePolygonSize(size: Vector2) {
        if (Vector2.equals(size, this._polygonSize)) return false;
        size.cloneTo(this._polygonSize);
        return true
    }

    //更新测试区域转世界矩阵
    private _updatePolygonTransform(matrix: Matrix) {
        if (matrix.a == this._polygonTransform.a && matrix.b == this._polygonTransform.b && matrix.c == this._polygonTransform.c && matrix.d == this._polygonTransform.d && matrix.tx == this._polygonTransform.tx && matrix.ty == this._polygonTransform.ty) return false;
        matrix.copyTo(this._polygonTransform);
        return true;
    }


    public getploygRect(): Vector4 {  return this._ploygRect;  }

    /**
     * 设置裁切区域数据
     * @param clipperRect 裁切区域矩形（相对于世界的参数）
     * @param size 测试区域大小
     * @param matrix 测试区域转世界矩阵
     */
    public setClipper(clipperRect: Rectangle, size: Vector2, matrix: Matrix, clipperRot: number=0) {
        //更新裁切区域数据
        let isDiffClipper = this._updateClipRect(clipperRect);
        //更新测试区域数据
        let isDiffSize = this._updatePolygonSize(size);
        //更新测试区域转世界矩阵
        let isDiffMatrix = this._updatePolygonTransform(matrix);


        if (isDiffClipper || isDiffMatrix) {
            this._matrix.identity();
            let ofx = this._clipperRect.x + this._clipperRect.width * 0.5;
            let ofy = this._clipperRect.y + this._clipperRect.height * 0.5;
            this._matrix.setMatrix(ofx, ofy, 1, 1, clipperRot, 0, 0, 0, 0);
            this._matrix.invert();
            Matrix.mul(matrix, this._matrix, this._matrix);
            this._updateCliperInPolygonRect();
        }

        if (isDiffClipper || isDiffSize || isDiffMatrix) {
            this._updateAxiDatas();
        }
    }

    // 是否在裁切区域内
    public isClipper(x: number, y: number): boolean {
        const p = Vector2.TempVector2;
        TileMapUtils.transfromPointByValue(this._matrix, x, y, p);
        if (this._axis[0].testCollider(p.x, p.y)) return true;
        if (this._axis[1].testCollider(p.x, p.y)) return true;
        if (this._axis[2].testCollider(p.x, p.y)) return true;
        if (this._axis[3].testCollider(p.x, p.y)) return true;

        return false;
    }
}