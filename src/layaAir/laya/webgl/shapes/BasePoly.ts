import { Vector2 } from "../../maths/Vector2";
// 引入角度阈值，用于判断是否为尖角
const minAngle = 15 * Math.PI / 180; // 15度的弧度值
/**
 * 精度
 */
const precision = 1e-13;
const tempData: any[] = new Array(256);
const vec2 = new Vector2();
const line2GeometryVertices: number[] = [];
const line2GeometryIndices: number[] = [];
const line2VertexIndices: number[] = [];

/** @internal */
export type Line2Geometry = {
    vertices: number[];
    indices: number[];
    vertexCount: number;
    indexCount: number;
};

const line2Geometry: Line2Geometry = {
    vertices: line2GeometryVertices,
    indices: line2GeometryIndices,
    vertexCount: 0,
    indexCount: 0,
};

export class BasePoly {

    /** @internal */
    static createLine2Geometry(p: any[], lineWidth: number, loop: boolean): Line2Geometry | null {
        line2GeometryVertices.length = 0;
        line2GeometryIndices.length = 0;
        if (!this.createLine2(p, line2GeometryIndices, lineWidth, 0, line2GeometryVertices, loop))
            return null;
        line2Geometry.vertexCount = line2GeometryVertices.length / 2;
        line2Geometry.indexCount = line2GeometryIndices.length;
        return line2Geometry.indexCount > 0 && line2Geometry.vertexCount > 0 ? line2Geometry : null;
    }

    /**
     * 构造线的三角形数据。根据一个位置数组生成vb和ib
     * @param p
     * @param indices
     * @param lineWidth
     * @param indexBase				顶点开始的值，ib中的索引会加上这个
     * @param outVertex
     * @return
     */
    static createLine2(p: any[], indices: any[], lineWidth: number, indexBase: number, outVertex: any[], loop: boolean): any[] {

        if (p.length < 4) return null;
        let offset = indexBase;
        var points: any[] = tempData.length > (p.length + 2) ? tempData : new Array(p.length + 2);	//可能有loop，所以+2
        points[0] = p[0]; points[1] = p[1];
        /*
        var points:Array = p.concat();
        if (loop) {
            points.push(points[0], points[1]);
        }
        */
        var newlen: number = 2;	//points的下标，也是points的实际长度
        var i: number = 0;
        var length: number = p.length;
        //先过滤一下太相近的点
        for (i = 2; i < length; i += 2) {
            if (Math.abs(p[i] - p[i - 2]) + Math.abs(p[i + 1] - p[i - 1]) > 0.01) {//只是判断是否重合，所以不用sqrt
                points[newlen++] = p[i]; points[newlen++] = p[i + 1];
            }
        }
        //如果终点和起点没有重合，且要求loop的情况的处理
        let delta = Math.abs(p[0] - points[newlen - 2]) + Math.abs(p[1] - points[newlen - 1]);
        if (loop && delta > 0) {
            if (delta > precision) {
                points[newlen++] = p[0]; points[newlen++] = p[1];
            }
            else {
                points[newlen - 2] = p[0]; points[newlen - 1] = p[1];
            }
        }

        var result: any[] = outVertex;
        let startIndex = result.length;
        length = newlen / 2;	//points可能有多余的点，所以要用inew来表示
        var w: number = lineWidth / 2;


        let x1 = points[0];
        let y1 = points[1];
        let x2 = points[2];
        let y2 = points[3];
        let x3: number, y3: number;
        // let startIndex = result.length;

        this.getNormal(x1, y1, x2, y2, w, vec2);
        result.push(x1 - vec2.x, y1 - vec2.y, x1 + vec2.x, y1 + vec2.y);
        let verIndex: number[] = line2VertexIndices;
        verIndex.length = 0;
        let cVerIndex = 0;
        for (i = 1; i < length - 1; i++) {
            x1 = points[(i - 1) * 2];
            y1 = points[(i - 1) * 2 + 1];
            x2 = points[(i) * 2];
            y2 = points[(i) * 2 + 1];
            x3 = points[(i + 1) * 2];
            y3 = points[(i + 1) * 2 + 1];
            cVerIndex = this._setMiddleVertexs(x1, y1, x2, y2, x3, y3, w, result, vec2, verIndex, cVerIndex);
        }

        x1 = points[newlen - 4];
        y1 = points[newlen - 3];
        x2 = points[newlen - 2];
        y2 = points[newlen - 1];

        if (x2 == points[0] && y2 == points[1]) {
            x3 = points[2];
            y3 = points[3];
            cVerIndex = this._setMiddleVertexs(x1, y1, x2, y2, x3, y3, w, result, vec2, verIndex, cVerIndex);

            let len = result.length;
            result[startIndex] = result[len - 4];
            result[startIndex + 1] = result[len - 3];
            result[startIndex + 2] = result[len - 2];
            result[startIndex + 3] = result[len - 1];
            verIndex.push(cVerIndex, cVerIndex + 1, 1, cVerIndex + 1, 1, 0);
        } else {
            this.getNormal(x1, y1, x2, y2, w, vec2);
            result.push(x2 - vec2.x, y2 - vec2.y, x2 + vec2.x, y2 + vec2.y);
            verIndex.push(cVerIndex, cVerIndex + 1, cVerIndex + 2, cVerIndex + 1, cVerIndex + 2, cVerIndex + 3);
        }
        for (let i = 0, len = verIndex.length; i < len; i++) {
            const pIndex = verIndex[i] + offset;
            indices.push(pIndex);
        }
        return result;
    }
    /**
      * 设置中间折角顶点的位置
      * @param x1,y1 第一个点的坐标
      * @param x2,y2 中间点的坐标
      * @param x3,y3 第三个点的坐标
      * @param w 线条宽度的一半
      * @param vertexs 顶点数组
      * @param out 用于存储法向量的临时向量
      * @param join 连接点样式
      */
    private static _setMiddleVertexs(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, w: number, vertexs: number[], out: Vector2, verIndex: number[], cVerIndex: number) {
        this.getNormal(x1, y1, x2, y2, w, out);
        let pl1x = x1 - out.x;
        let pl1y = y1 - out.y;
        let pl2x = x2 - out.x;
        let pl2y = y2 - out.y;

        let pr1x = x1 + out.x;
        let pr1y = y1 + out.y;
        let pr2x = x2 + out.x;
        let pr2y = y2 + out.y;

        this.getNormal(x2, y2, x3, y3, w, out);

        let pl3x = x2 - out.x;
        let pl3y = y2 - out.y;
        let pl4x = x3 - out.x;
        let pl4y = y3 - out.y;

        let pr3x = x2 + out.x;
        let pr3y = y2 + out.y;
        let pr4x = x3 + out.x;
        let pr4y = y3 + out.y;

        let addCount: number | boolean = 1;
        let count = BasePoly.checkCrossPoint(pl1x, pl1y, pl2x, pl2y, pl3x, pl3y, pl4x, pl4y, vertexs, pr1x, pr1y, pr4x, pr4y, x2, y2, w);
        if (false === count) {
            return this._createSimpleLineVertices(x1, y1, x2, y2, x3, y3, vertexs, verIndex, cVerIndex, pr2x, pr2y, pl2x, pl2y);
        } else {
            addCount = BasePoly.checkCrossPoint(pr1x, pr1y, pr2x, pr2y, pr3x, pr3y, pr4x, pr4y, vertexs, pl1x, pl1y, pl4x, pl4y, x2, y2, w);
            if (false === addCount) {
                vertexs.splice(vertexs.length - count * 2, count * 2);
                return this._createSimpleLineVertices(x1, y1, x2, y2, x3, y3, vertexs, verIndex, cVerIndex, pr2x, pr2y, pl2x, pl2y);
            }
        }
        if (2 === addCount) {
            this._setTurnPoint(vertexs, 2);
            verIndex.push(cVerIndex, cVerIndex + 1, cVerIndex + 3, cVerIndex + 1, cVerIndex + 3, cVerIndex + 2);
            cVerIndex += 2;
            verIndex.push(cVerIndex, cVerIndex + 1, cVerIndex + 2);
            cVerIndex += 1;
        } else {
            if (2 === count) {
                verIndex.push(cVerIndex, cVerIndex + 1, cVerIndex + 2, cVerIndex + 1, cVerIndex + 2, cVerIndex + 4);
                cVerIndex += 2;
                verIndex.push(cVerIndex, cVerIndex + 1, cVerIndex + 2);
                cVerIndex += 1;
            } else {
                verIndex.push(cVerIndex, cVerIndex + 1, cVerIndex + 2, cVerIndex + 1, cVerIndex + 2, cVerIndex + 3);
                cVerIndex += 2;
            }
        }

        return cVerIndex;
    }
    /**
      * 计算三个点形成的夹角 (以第二个点为顶点)
      * @param x1 点1的x坐标
      * @param y1 点1的y坐标
      * @param x2 点2的x坐标 (顶点)
      * @param y2 点2的y坐标 (顶点)
      * @param x3 点3的x坐标
      * @param y3 点3的y坐标
      * @returns 夹角 (弧度制)
      */
    private static angleBetweenPoints(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number): number {
        const v1x = x1 - x2;
        const v1y = y1 - y2;
        const v2x = x3 - x2;
        const v2y = y3 - y2;

        const dot = v1x * v2x + v1y * v2y; // 点积
        const len1 = Math.hypot(v1x, v1y);
        const len2 = Math.hypot(v2x, v2y);

        if (len1 === 0 || len2 === 0) return 0; // 避免除零

        let cosTheta = dot / (len1 * len2);

        // 修正浮点误差，避免超出 [-1,1]
        cosTheta = Math.min(1, Math.max(-1, cosTheta));

        return Math.acos(cosTheta); // 返回弧度
    }
    private static _createSimpleLineVertices(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, vertexs: number[], verIndex: number[], cVerIndex: number, pr2x: number, pr2y: number, pl2x: number, pl2y: number) {
        let angle = this.angleBetweenPoints(x1, y1, x2, y2, x3, y3);
        if (angle > Math.PI / 2) {
            vertexs.push(pl2x, pl2y, pr2x, pr2y);
            verIndex.push(cVerIndex, cVerIndex + 1, cVerIndex + 2, cVerIndex + 1, cVerIndex + 2, cVerIndex + 3);
            cVerIndex += 2;
            return cVerIndex;
        }
        vertexs.push(pr2x, pr2y, pl2x, pl2y);
        verIndex.push(cVerIndex, cVerIndex + 1, cVerIndex + 3, cVerIndex + 1, cVerIndex + 3, cVerIndex + 2);
        cVerIndex += 2;
        return cVerIndex;
    }
    private static _setTurnPoint(vertexs: number[], position = 0) {
        let p3x = vertexs[vertexs.length - 2 - position];
        let p3y = vertexs[vertexs.length - 1 - position];
        let p4x = vertexs[vertexs.length - 4 - position];
        let p4y = vertexs[vertexs.length - 3 - position];
        vertexs[vertexs.length - 2 - position] = p4x;
        vertexs[vertexs.length - 1 - position] = p4y;
        vertexs[vertexs.length - 4 - position] = p3x;
        vertexs[vertexs.length - 3 - position] = p3y;
    }

    private static checkCrossPoint(p1x: number, p1y: number, p2x: number, p2y: number, p3x: number, p3y: number, p4x: number, p4y: number, vertexs: number[], pp1x: number, pp1y: number, pp4x: number, pp4y: number, cpx: number, cpy: number, wnum: number) {
        const crossPoint = this.getCrossPoint(p1x, p1y, p2x, p2y, p3x, p3y, p4x, p4y, true);
        if (crossPoint) {
            vertexs.push(crossPoint.x, crossPoint.y);
            return 1;
        } else if (false === crossPoint) {
            return false;
        }
        const crossPoint1 = this.getCrossPoint(pp1x, pp1y, p1x, p1y, p3x, p3y, p4x, p4y, true);
        if (crossPoint1) {
            // vertexs.push(crossPoint1.x, crossPoint1.y);
            // return 1;
            return false;
        } else {
            const crossPoint2 = this.getCrossPoint(p1x, p1y, p2x, p2y, p4x, p4y, pp4x, pp4y, true);
            if (crossPoint2) {
                // vertexs.push(crossPoint2.x, crossPoint2.y);
                // return 1;
                return false;
            }
        }
        const crossPoint3 = this.getCrossPoint(p1x, p1y, p2x, p2y, p3x, p3y, p4x, p4y);
        if (crossPoint3) {
            const d = Math.abs(this.getDistance(cpx, cpy, crossPoint3.x, crossPoint3.y));
            const maxNum = wnum * 1.5;
            // let angle = this.angleBetweenPoints(p1x, p1y, p2x, p2y, p4x, p4y);
            // console.log(180 / Math.PI * angle);
            if (d > maxNum) {
                vertexs.push(p2x, p2y);
                vertexs.push(p3x, p3y);
                return 2;

            }
            vertexs.push(crossPoint3.x, crossPoint3.y);
            return 1;
        }
        return false;
    }

    /**
      * 计算两条直线或线段的交点
      * @param p1x 第一个点的x坐标
      * @param p1y 第一个点的y坐标
      * @param p2x 第二个点的x坐标
      * @param p2y 第二个点的y坐标
      * @param p3x 第三个点的x坐标
      * @param p3y 第三个点的y坐标
      * @param p4x 第四个点的x坐标
      * @param p4y 第四个点的y坐标
      * @param isLineSegment 如果为true则判断两个线段的交点，如果为false则判断两条直线的交点
      * @returns 交点坐标，如果没有交点则返回null
      */
    private static getCrossPoint(p1x: number, p1y: number, p2x: number, p2y: number, p3x: number, p3y: number, p4x: number, p4y: number, isLineSegment: boolean = false): { x: number, y: number } | null | false {
        // 计算第一条直线的方向向量
        const dx1 = p2x - p1x;
        const dy1 = p2y - p1y;

        // 计算第二条直线的方向向量
        const dx2 = p4x - p3x;
        const dy2 = p4y - p3y;

        // 计算分母：dx1 * dy2 - dx2 * dy1
        const denominator = dx1 * dy2 - dx2 * dy1;

        // 如果分母为0，说明两条直线平行或重合，没有交点
        if (Math.abs(denominator) < 1e-10) {
            return false;
        }

        // 计算第一条直线上的参数 t1
        const t1 = ((p3x - p1x) * dy2 - (p3y - p1y) * dx2) / denominator;

        // 计算第二条直线上的参数 t2
        const t2 = ((p3x - p1x) * dy1 - (p3y - p1y) * dx1) / denominator;

        // 如果是线段，需要检查参数是否在[0,1]范围内
        if (isLineSegment) {
            // 检查t1是否在[0,1]范围内
            if (t1 < 0 || t1 > 1) {
                return null;
            }
            // 检查t2是否在[0,1]范围内
            if (t2 < 0 || t2 > 1) {
                return null;
            }
        }

        // 计算交点坐标
        const x = p1x + t1 * dx1;
        const y = p1y + t1 * dy1;

        return { x, y };
    }
    //求两点之间的距离
    private static getDistance(x1: number, y1: number, x2: number, y2: number) {
        return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
    }

    static getNormal(x1: number, y1: number, x2: number, y2: number, w: number, out?: Vector2) {
        if (!out) {
            out = new Vector2();
        }

        let perpx = y2 - y1;
        let perpy = x1 - x2;
        let dist = Math.sqrt(perpx * perpx + perpy * perpy);
        out.x = perpx / dist * w;
        out.y = perpy / dist * w;
        return out;
    }

    /**
     * 相邻的两段线，边界会相交，这些交点可以作为三角形的顶点。有两种可选，一种是采用左左,右右交点，一种是采用 左右，左右交点。当两段线夹角很小的时候，如果采用
     * 左左，右右会产生很长很长的交点，这时候就要采用左右左右交点，相当于把尖角截断。
     * 当采用左左右右交点的时候，直接用切线的垂线。采用左右左右的时候，用切线
     * 切线直接采用两个方向的平均值。不能用3-1的方式，那样垂线和下一段可能都在同一方向（例如都在右方）
     * 注意把重合的点去掉
     * @param path
     * @param color
     * @param width
     * @param loop
     * @param outvb
     * @param vbstride  顶点占用几个float,(bytelength/4)
     * @param outib
     * test:
     * 横线
     * [100,100, 400,100]
     * 竖线
     * [100,100, 100,400]
     * 直角
     * [100,100, 400,100, 400,400]
     * 重合点
     * [100,100,100,100,400,100]
     * 同一直线上的点
     * [100,100,100,200,100,3000]
     * 像老式电视的左边不封闭的图形
     * [98,176,  163,178, 95,66, 175,177, 198,178, 252,56, 209,178,  248,175,  248,266,  209,266, 227,277, 203,280, 188,271,  150,271, 140,283, 122,283, 131,268, 99,268]
     * 
     */
    //TODO:coverage
    static createLineTriangle(path: any[], color: number, width: number, loop: boolean, outvb: Float32Array, vbstride: number, outib: Uint16Array): void {

        var points: any[] = path.slice();
        var ptlen: number = points.length;
        var p1x: number = points[0], p1y: number = points[1];
        var p2x: number = points[2], p2y: number = points[2];
        var len: number = 0;
        var rp: number = 0;
        var dx: number = 0, dy: number = 0;

        //计算每一段的长度，取出有效数据。保存:长度，方向，拐角，切线
        //x,y,len,dx,dy,tx,ty,dot
        //数组中每个都表示当前点开始的长度，方向
        //x,y,dx,dy

        var pointnum: number = ptlen / 2;
        if (pointnum <= 1) return;
        if (pointnum == 2) {
            //TODO
            return;
        }

        var tmpData: any[] = new Array(pointnum * 4);//TODO 做到外面
        var realPtNum: number = 0;	//去掉重复点后的实际点个数。同一直线上的点不做优化
        //var segNum:int = pointnum + (loop?1:0);
        var ci: number = 0;
        for (var i: number = 0; i < pointnum - 1; i++) {
            p1x = points[ci++], p1y = points[ci++];
            p2x = points[ci++], p2y = points[ci++];
            dx = p2x - p1x, dy = p2y - p1y;
            if (dx != 0 && dy != 0) {
                len = Math.sqrt(dx * dx + dy * dy);
                if (len > 1e-3) {
                    rp = realPtNum * 4;
                    tmpData[rp] = p1x;
                    tmpData[rp + 1] = p1y;
                    tmpData[rp + 2] = dx / len;
                    tmpData[rp + 3] = dy / len;
                    realPtNum++;
                }
            }
        }
        if (loop) {//loop的话，需要取第一个点来算
            p1x = points[ptlen - 2], p1y = points[ptlen - 1];
            p2x = points[0], p2y = points[1];
            dx = p2x - p1x, dy = p2y - p1y;
            if (dx != 0 && dy != 0) {//如果长度为零的话，最后这个点就不用加了，上一个点就是指向了第一个点。
                len = Math.sqrt(dx * dx + dy * dy);
                if (len > 1e-3) {
                    rp = realPtNum * 4;
                    tmpData[rp] = p1x;
                    tmpData[rp + 1] = p1y;
                    tmpData[rp + 2] = dx / len;
                    tmpData[rp + 3] = dy / len;
                    realPtNum++;
                }
            }
        } else {//不是loop的话，直接取当前段的朝向，记录在上一个点上
            rp = realPtNum * 4;
            tmpData[rp] = p1x;
            tmpData[rp + 1] = p1y;
            tmpData[rp + 2] = dx / len;
            tmpData[rp + 3] = dy / len;
            realPtNum++;
        }
        ci = 0;

        /**
         * 根据前后两段的方向，计算垂线的方向，根据这个方向和任意一边的dxdy的垂线的点积为w/2可以得到长度。就可以得到增加的点
         */
        //如果相邻两段朝向的dot值接近-1，则表示反向了，需要改成切

        for (i = 0; i < pointnum; i++) {
            p1x = points[ci], p1y = points[ci + 1];
            p2x = points[ci + 2], p2y = points[ci + 3];
            //var p3x: number = points[ci + 4], p3y: number = points[ci + 5];

        }
        if (loop) {

        }

    }
}

