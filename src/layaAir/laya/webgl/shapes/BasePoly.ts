import { Vector2 } from "../../maths/Vector2";
// 引入角度阈值，用于判断是否为尖角
const minAngle = 15 * Math.PI / 180; // 15度的弧度值
export class BasePoly {

    private static tempData: any[] = new Array(256);
    private static vec2: Vector2;
    private static tempIndexs: any[] = new Array(4);

    private static _checkMinAngle(p1x: number, p1y: number, p2x: number, p2y: number, p3x: number, p3y: number): boolean {
        // 计算相邻线段的方向向量
        const v1x = p2x - p1x;
        const v1y = p2y - p1y;
        const v2x = p3x - p2x;
        const v2y = p3y - p2y;

        // 计算方向向量的点积
        const dot = v1x * v2x + v1y * v2y;
        // const cross = v1x * v2y - v1y * v2x;

        // 计算方向向量的长度
        const len1 = Math.sqrt(v1x * v1x + v1y * v1y);
        const len2 = Math.sqrt(v2x * v2x + v2y * v2y);

        // 计算夹角的余弦值
        const cosAngle = dot / (len1 * len2);
        const angle = Math.acos(Math.abs(cosAngle));
        return Math.abs(angle) < minAngle;
    }


    /**
     * 构造线的三角形数据。根据一个位置数组生成vb和ib
     * @param	p
     * @param	indices
     * @param	lineWidth
     * @param	indexBase				顶点开始的值，ib中的索引会加上这个
     * @param	outVertex
     * @return
     */
    static createLine2(p: any[], indices: any[], lineWidth: number, indexBase: number, outVertex: any[], loop: boolean): any[] {

        if (p.length < 4) return null;
        var points: any[] = BasePoly.tempData.length > (p.length + 2) ? BasePoly.tempData : new Array(p.length + 2);	//可能有loop，所以+2
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
        if (loop && Math.abs(p[0] - points[newlen - 2]) + Math.abs(p[1] - points[newlen - 1]) > 0) {
            points[newlen++] = p[0]; points[newlen++] = p[1];
        }

        var result: any[] = outVertex;
        length = newlen / 2;	//points可能有多余的点，所以要用inew来表示
        var w: number = lineWidth / 2;

        var p1x: number, p1y: number, p2x: number, p2y: number, p3x: number, p3y: number;

        p1x = points[0];
        p1y = points[1];
        p2x = points[2];
        p2y = points[3];
        let startIndex = result.length;

        this.vec2 = this.getNormal(p1x, p1y, p2x, p2y, w, this.vec2);
        result.push(p1x - this.vec2.x, p1y - this.vec2.y, p1x + this.vec2.x, p1y + this.vec2.y);
        for (i = 1; i < length - 1; i++) {
            p1x = points[(i - 1) * 2];
            p1y = points[(i - 1) * 2 + 1];
            p2x = points[(i) * 2];
            p2y = points[(i) * 2 + 1];
            p3x = points[(i + 1) * 2];
            p3y = points[(i + 1) * 2 + 1];


            indices.push(indexBase + 0, indexBase + 1, indexBase + 3, indexBase + 3, indexBase + 2, indexBase + 0);
            indexBase += 2;
            // 夹角小于阈值,视为尖角,使用线段的中点作为拐角处的顶点
            if (!this._setMiddleVertexs(p1x, p1y, p2x, p2y, p3x, p3y, w, result, this.vec2, indices, indexBase)) {
                indexBase += 2;
            }
            else {
                indexBase += 4;
            }
        }

        p1x = points[newlen - 4];
        p1y = points[newlen - 3];
        p2x = points[newlen - 2];
        p2y = points[newlen - 1];

        this.vec2 = this.getNormal(p1x, p1y, p2x, p2y, w, this.vec2);
        result.push(p2x - this.vec2.x, p2y - this.vec2.y, p2x + this.vec2.x, p2y + this.vec2.y);
        indices.push(indexBase + 0, indexBase + 1, indexBase + 3, indexBase + 3, indexBase + 2, indexBase + 0);
        if (p2x == points[0] && p2y == points[1]) {
            p3x = points[2];
            p3y = points[3];
            let last = result.length / 2;
            indexBase += 4;
            let tempData = BasePoly.tempData;
            tempData[0] = last - 2;
            tempData[1] = last - 1;
            tempData[2] = 0;
            tempData[3] = 1;
            this._setMiddleVertexs(p1x, p1y, p2x, p2y, p3x, p3y, w, result, this.vec2, indices, indexBase, tempData);
        }
        return result;
    }

    private static _setMiddleVertexs(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, w: number, vertexs: number[], out: Vector2, indices: number[], indexBase: number, edgeIndexArray: number[] = null) {
        this.getNormal(x1, y1, x2, y2, w, out);
        let perpx = out.x;
        let perpy = out.y;
        this.getNormal(x2, y2, x3, y3, w, out);
        let perp2x = out.x;
        let perp2y = out.y;
        if (this._checkMinAngle(x1, y1, x2, y2, x3, y3)) {
            if (!edgeIndexArray) {
                vertexs.push(x2 - perpx, y2 - perpy, x2 + perpx, y2 + perpy);
                vertexs.push(x2 - perp2x, y2 - perp2y, x2 + perp2x, y2 + perp2y);
                indices.push(indexBase + 0, indexBase + 1, indexBase + 3, indexBase + 3, indexBase + 2, indexBase + 0);
            }
            else {
                indices.push(edgeIndexArray[0], edgeIndexArray[1], edgeIndexArray[3], edgeIndexArray[3], edgeIndexArray[2], edgeIndexArray[0]);
            }
            return false;
        }

        let a1 = (-perpy + y1) - (-perpy + y2);
        let b1 = (-perpx + x2) - (-perpx + x1);
        let c1 = (-perpx + x1) * (-perpy + y2) - (-perpx + x2) * (-perpy + y1);
        let a2 = (-perp2y + y3) - (-perp2y + y2);
        let b2 = (-perp2x + x2) - (-perp2x + x3);
        let c2 = (-perp2x + x3) * (-perp2y + y2) - (-perp2x + x2) * (-perp2y + y3);
        let denom = a1 * b2 - a2 * b1;
        denom = a1 * b2 - a2 * b1;
        if (Math.abs(denom) < 0.1) {
            denom += 10.1;
            vertexs.push(x2 - perpx, y2 - perpy, x2 + perpx, y2 + perpy);
            return true;
        }
        let px = (b1 * c2 - b2 * c1) / denom;
        let py = (a2 * c1 - a1 * c2) / denom;
        if (!edgeIndexArray) {
            vertexs.push(x2 - perpx, y2 - perpy, x2 + perpx, y2 + perpy);
            if (denom > 0) {
                vertexs.push(px, py, x2, y2);
                indices.push(indexBase + 0, indexBase + 2, indexBase + 4);
                indices.push(indexBase + 4, indexBase + 3, indexBase + 0);
            }
            else {
                vertexs.push(x2 - (px - x2), y2 - (py - y2), x2, y2);
                indices.push(indexBase + 1, indexBase + 2, indexBase + 5);
                indices.push(indexBase + 5, indexBase + 3, indexBase + 1);
            }
            vertexs.push(x2 - perp2x, y2 - perp2y, x2 + perp2x, y2 + perp2y);
        }
        else {
            if (denom > 0) {
                vertexs.push(px, py, x2, y2);
                indices.push(edgeIndexArray[0], indexBase + 0, edgeIndexArray[2]);
                indices.push(edgeIndexArray[2], indexBase + 1, edgeIndexArray[0]);
            }
            else {
                vertexs.push(x2 - (px - x2), y2 - (py - y2), x2, y2);
                indices.push(edgeIndexArray[1], indexBase + 0, edgeIndexArray[3]);
                indices.push(edgeIndexArray[3], indexBase + 1, edgeIndexArray[1]);
            }
        }
        //vertexs.push(px, py, x2 - (px - x2), y2 - (py - y2));
        return true;
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
     * @param	path
     * @param	color
     * @param	width
     * @param	loop
     * @param	outvb
     * @param	vbstride  顶点占用几个float,(bytelength/4)
     * @param	outib
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

