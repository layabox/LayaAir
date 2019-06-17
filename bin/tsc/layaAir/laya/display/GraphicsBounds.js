import { AlphaCmd } from "./cmd/AlphaCmd";
import { DrawCircleCmd } from "./cmd/DrawCircleCmd";
import { DrawCurvesCmd } from "./cmd/DrawCurvesCmd";
import { DrawImageCmd } from "./cmd/DrawImageCmd";
import { DrawLineCmd } from "./cmd/DrawLineCmd";
import { DrawLinesCmd } from "./cmd/DrawLinesCmd";
import { DrawPathCmd } from "./cmd/DrawPathCmd";
import { DrawPieCmd } from "./cmd/DrawPieCmd";
import { DrawPolyCmd } from "./cmd/DrawPolyCmd";
import { DrawRectCmd } from "./cmd/DrawRectCmd";
import { DrawTextureCmd } from "./cmd/DrawTextureCmd";
import { FillTextureCmd } from "./cmd/FillTextureCmd";
import { RestoreCmd } from "./cmd/RestoreCmd";
import { RotateCmd } from "./cmd/RotateCmd";
import { ScaleCmd } from "./cmd/ScaleCmd";
import { TransformCmd } from "./cmd/TransformCmd";
import { TranslateCmd } from "./cmd/TranslateCmd";
import { Bezier } from "../maths/Bezier";
import { GrahamScan } from "../maths/GrahamScan";
import { Matrix } from "../maths/Matrix";
import { Point } from "../maths/Point";
import { Rectangle } from "../maths/Rectangle";
import { Render } from "../renders/Render";
import { Pool } from "../utils/Pool";
import { Utils } from "../utils/Utils";
/**
 * @private
 * Graphic bounds数据类
 */
export class GraphicsBounds {
    constructor() {
        /**@private */
        this._cacheBoundsType = false;
    }
    /**
     * 销毁
     */
    destroy() {
        this._graphics = null;
        this._cacheBoundsType = false;
        if (this._temp)
            this._temp.length = 0;
        if (this._rstBoundPoints)
            this._rstBoundPoints.length = 0;
        if (this._bounds)
            this._bounds.recover();
        this._bounds = null;
        Pool.recover("GraphicsBounds", this);
    }
    /**
     * 创建
     */
    static create() {
        return Pool.getItemByClass("GraphicsBounds", GraphicsBounds);
    }
    /**
     * 重置数据
     */
    reset() {
        this._temp && (this._temp.length = 0);
    }
    /**
     * 获取位置及宽高信息矩阵(比较耗CPU，频繁使用会造成卡顿，尽量少用)。
     * @param realSize	（可选）使用图片的真实大小，默认为false
     * @return 位置与宽高组成的 一个 Rectangle 对象。
     */
    getBounds(realSize = false) {
        if (!this._bounds || !this._temp || this._temp.length < 1 || realSize != this._cacheBoundsType) {
            this._bounds = Rectangle._getWrapRec(this.getBoundPoints(realSize), this._bounds);
        }
        this._cacheBoundsType = realSize;
        return this._bounds;
    }
    /**
     * @private
     * @param realSize	（可选）使用图片的真实大小，默认为false
     * 获取端点列表。
     */
    getBoundPoints(realSize = false) {
        if (!this._temp || this._temp.length < 1 || realSize != this._cacheBoundsType)
            this._temp = this._getCmdPoints(realSize);
        this._cacheBoundsType = realSize;
        return this._rstBoundPoints = Utils.copyArray(this._rstBoundPoints, this._temp);
    }
    _getCmdPoints(realSize = false) {
        var context = Render._context;
        var cmds = this._graphics.cmds;
        var rst;
        rst = this._temp || (this._temp = []);
        rst.length = 0;
        if (!cmds && this._graphics._one != null) {
            GraphicsBounds._tempCmds.length = 0;
            GraphicsBounds._tempCmds.push(this._graphics._one);
            cmds = GraphicsBounds._tempCmds;
        }
        if (!cmds)
            return rst;
        var matrixs = GraphicsBounds._tempMatrixArrays;
        matrixs.length = 0;
        var tMatrix = GraphicsBounds._initMatrix;
        tMatrix.identity();
        var tempMatrix = GraphicsBounds._tempMatrix;
        var cmd;
        var tex;
        for (var i = 0, n = cmds.length; i < n; i++) {
            cmd = cmds[i];
            switch (cmd.cmdID) {
                case AlphaCmd.ID: //save //TODO:是否还需要
                    matrixs.push(tMatrix);
                    tMatrix = tMatrix.clone();
                    break;
                case RestoreCmd.ID: //restore
                    tMatrix = matrixs.pop();
                    break;
                case ScaleCmd.ID: //scale
                    tempMatrix.identity();
                    tempMatrix.translate(-cmd.pivotX, -cmd.pivotY);
                    tempMatrix.scale(cmd.scaleX, cmd.scaleY);
                    tempMatrix.translate(cmd.pivotX, cmd.pivotY);
                    this._switchMatrix(tMatrix, tempMatrix);
                    break;
                case RotateCmd.ID: //case context._rotate: 
                    tempMatrix.identity();
                    tempMatrix.translate(-cmd.pivotX, -cmd.pivotY);
                    tempMatrix.rotate(cmd.angle);
                    tempMatrix.translate(cmd.pivotX, cmd.pivotY);
                    this._switchMatrix(tMatrix, tempMatrix);
                    break;
                case TranslateCmd.ID: //translate
                    tempMatrix.identity();
                    tempMatrix.translate(cmd.tx, cmd.ty);
                    this._switchMatrix(tMatrix, tempMatrix);
                    break;
                case TransformCmd.ID: //context._transform:
                    tempMatrix.identity();
                    tempMatrix.translate(-cmd.pivotX, -cmd.pivotY);
                    tempMatrix.concat(cmd.matrix);
                    tempMatrix.translate(cmd.pivotX, cmd.pivotY);
                    this._switchMatrix(tMatrix, tempMatrix);
                    break;
                case DrawImageCmd.ID: //case context._drawTexture: 
                case FillTextureCmd.ID: //case context._fillTexture
                    GraphicsBounds._addPointArrToRst(rst, Rectangle._getBoundPointS(cmd.x, cmd.y, cmd.width, cmd.height), tMatrix);
                    break;
                case DrawTextureCmd.ID: //case context._drawTextureTransform: 
                    tMatrix.copyTo(tempMatrix);
                    if (cmd.matrix)
                        tempMatrix.concat(cmd.matrix);
                    GraphicsBounds._addPointArrToRst(rst, Rectangle._getBoundPointS(cmd.x, cmd.y, cmd.width, cmd.height), tempMatrix);
                    break;
                case DrawImageCmd.ID:
                    tex = cmd.texture;
                    if (realSize) {
                        if (cmd.width && cmd.height) {
                            GraphicsBounds._addPointArrToRst(rst, Rectangle._getBoundPointS(cmd.x, cmd.y, cmd.width, cmd.height), tMatrix);
                        }
                        else {
                            GraphicsBounds._addPointArrToRst(rst, Rectangle._getBoundPointS(cmd.x, cmd.y, tex.width, tex.height), tMatrix);
                        }
                    }
                    else {
                        var wRate = (cmd.width || tex.sourceWidth) / tex.width;
                        var hRate = (cmd.height || tex.sourceHeight) / tex.height;
                        var oWidth = wRate * tex.sourceWidth;
                        var oHeight = hRate * tex.sourceHeight;
                        var offX = tex.offsetX > 0 ? tex.offsetX : 0;
                        var offY = tex.offsetY > 0 ? tex.offsetY : 0;
                        offX *= wRate;
                        offY *= hRate;
                        GraphicsBounds._addPointArrToRst(rst, Rectangle._getBoundPointS(cmd.x - offX, cmd.y - offY, oWidth, oHeight), tMatrix);
                    }
                    break;
                case FillTextureCmd.ID:
                    if (cmd.width && cmd.height) {
                        GraphicsBounds._addPointArrToRst(rst, Rectangle._getBoundPointS(cmd.x, cmd.y, cmd.width, cmd.height), tMatrix);
                    }
                    else {
                        tex = cmd.texture;
                        GraphicsBounds._addPointArrToRst(rst, Rectangle._getBoundPointS(cmd.x, cmd.y, tex.width, tex.height), tMatrix);
                    }
                    break;
                case DrawTextureCmd.ID:
                    var drawMatrix;
                    if (cmd.matrix) {
                        tMatrix.copyTo(tempMatrix);
                        tempMatrix.concat(cmd.matrix);
                        drawMatrix = tempMatrix;
                    }
                    else {
                        drawMatrix = tMatrix;
                    }
                    if (realSize) {
                        if (cmd.width && cmd.height) {
                            GraphicsBounds._addPointArrToRst(rst, Rectangle._getBoundPointS(cmd.x, cmd.y, cmd.width, cmd.height), drawMatrix);
                        }
                        else {
                            tex = cmd.texture;
                            GraphicsBounds._addPointArrToRst(rst, Rectangle._getBoundPointS(cmd.x, cmd.y, tex.width, tex.height), drawMatrix);
                        }
                    }
                    else {
                        tex = cmd.texture;
                        wRate = (cmd.width || tex.sourceWidth) / tex.width;
                        hRate = (cmd.height || tex.sourceHeight) / tex.height;
                        oWidth = wRate * tex.sourceWidth;
                        oHeight = hRate * tex.sourceHeight;
                        offX = tex.offsetX > 0 ? tex.offsetX : 0;
                        offY = tex.offsetY > 0 ? tex.offsetY : 0;
                        offX *= wRate;
                        offY *= hRate;
                        GraphicsBounds._addPointArrToRst(rst, Rectangle._getBoundPointS(cmd.x - offX, cmd.y - offY, oWidth, oHeight), drawMatrix);
                    }
                    break;
                case DrawRectCmd.ID: //case context._drawRect:
                    GraphicsBounds._addPointArrToRst(rst, Rectangle._getBoundPointS(cmd.x, cmd.y, cmd.width, cmd.height), tMatrix);
                    break;
                case DrawCircleCmd.ID: //case context._drawCircle
                    GraphicsBounds._addPointArrToRst(rst, Rectangle._getBoundPointS(cmd.x - cmd.radius, cmd.y - cmd.radius, cmd.radius + cmd.radius, cmd.radius + cmd.radius), tMatrix);
                    break;
                case DrawLineCmd.ID: //drawLine
                    GraphicsBounds._tempPoints.length = 0;
                    var lineWidth;
                    lineWidth = cmd.lineWidth * 0.5;
                    if (cmd.fromX == cmd.toX) {
                        GraphicsBounds._tempPoints.push(cmd.fromX + lineWidth, cmd.fromY, cmd.toX + lineWidth, cmd.toY, cmd.fromX - lineWidth, cmd.fromY, cmd.toX - lineWidth, cmd.toY);
                    }
                    else if (cmd.fromY == cmd.toY) {
                        GraphicsBounds._tempPoints.push(cmd.fromX, cmd.fromY + lineWidth, cmd.toX, cmd.toY + lineWidth, cmd.fromX, cmd.fromY - lineWidth, cmd.toX, cmd.toY - lineWidth);
                    }
                    else {
                        GraphicsBounds._tempPoints.push(cmd.fromX, cmd.fromY, cmd.toX, cmd.toY);
                    }
                    GraphicsBounds._addPointArrToRst(rst, GraphicsBounds._tempPoints, tMatrix);
                    break;
                case DrawCurvesCmd.ID: //context._drawCurves:					
                    GraphicsBounds._addPointArrToRst(rst, Bezier.I.getBezierPoints(cmd.points), tMatrix, cmd.x, cmd.y);
                    break;
                case DrawLinesCmd.ID: //drawpoly
                case DrawPolyCmd.ID: //drawpoly
                    GraphicsBounds._addPointArrToRst(rst, cmd.points, tMatrix, cmd.x, cmd.y);
                    break;
                case DrawPathCmd.ID: //drawPath
                    GraphicsBounds._addPointArrToRst(rst, this._getPathPoints(cmd.paths), tMatrix, cmd.x, cmd.y);
                    break;
                case DrawPieCmd.ID: //drawPie
                    GraphicsBounds._addPointArrToRst(rst, this._getPiePoints(cmd.x, cmd.y, cmd.radius, cmd.startAngle, cmd.endAngle), tMatrix);
                    break;
            }
        }
        if (rst.length > 200) {
            rst = Utils.copyArray(rst, Rectangle._getWrapRec(rst)._getBoundPoints());
        }
        else if (rst.length > 8)
            rst = GrahamScan.scanPList(rst);
        return rst;
    }
    _switchMatrix(tMatix, tempMatrix) {
        tempMatrix.concat(tMatix);
        tempMatrix.copyTo(tMatix);
    }
    static _addPointArrToRst(rst, points, matrix, dx = 0, dy = 0) {
        var i, len;
        len = points.length;
        for (i = 0; i < len; i += 2) {
            GraphicsBounds._addPointToRst(rst, points[i] + dx, points[i + 1] + dy, matrix);
        }
    }
    static _addPointToRst(rst, x, y, matrix) {
        var _tempPoint = Point.TEMP;
        _tempPoint.setTo(x ? x : 0, y ? y : 0);
        matrix.transformPoint(_tempPoint);
        rst.push(_tempPoint.x, _tempPoint.y);
    }
    /**
     * 获得drawPie命令可能的产生的点。注意 这里只假设用在包围盒计算上。
     * @param	x
     * @param	y
     * @param	radius
     * @param	startAngle
     * @param	endAngle
     * @return
     */
    _getPiePoints(x, y, radius, startAngle, endAngle) {
        var rst = GraphicsBounds._tempPoints;
        GraphicsBounds._tempPoints.length = 0;
        var k = Math.PI / 180;
        var d1 = endAngle - startAngle;
        if (d1 >= 360 || d1 <= -360) {
            // 如果满了一圈了
            rst.push(x - radius, y - radius);
            rst.push(x + radius, y - radius);
            rst.push(x + radius, y + radius);
            rst.push(x - radius, y + radius);
            return rst;
        }
        // 
        rst.push(x, y); // 中心
        var delta = d1 % 360;
        if (delta < 0)
            delta += 360;
        // 一定增加，且在360以内的end
        var end1 = startAngle + delta;
        // 转成弧度
        var st = startAngle * k;
        var ed = end1 * k;
        // 起点
        rst.push(x + radius * Math.cos(st), y + radius * Math.sin(st));
        // 终点
        rst.push(x + radius * Math.cos(ed), y + radius * Math.sin(ed));
        // 圆形的四个边界点
        // 按照90度对齐，看看会经历几个90度
        var s1 = Math.ceil(startAngle / 90) * 90; //开始的。start的下一个90度
        var s2 = Math.floor(end1 / 90) * 90; //结束。end的上一个90度
        for (var cs = s1; cs <= s2; cs += 90) {
            var csr = cs * k;
            rst.push(x + radius * Math.cos(csr), y + radius * Math.sin(csr));
        }
        return rst;
        /*
        var segnum:int = 32;
        var step:Number = delta / segnum;
        var i:Number;
        var angle:Number = startAngle;
        for (i = 0; i <= segnum; i++) {
            rst.push(x + radius * Math.cos(angle), y + radius * Math.sin(angle));
            angle += step;
        }
        */
    }
    _getPathPoints(paths) {
        var i, len;
        var rst = GraphicsBounds._tempPoints;
        rst.length = 0;
        len = paths.length;
        var tCMD;
        for (i = 0; i < len; i++) {
            tCMD = paths[i];
            if (tCMD.length > 1) {
                rst.push(tCMD[1], tCMD[2]);
                if (tCMD.length > 3) {
                    rst.push(tCMD[3], tCMD[4]);
                }
            }
        }
        return rst;
    }
}
/**@private */
GraphicsBounds._tempMatrix = new Matrix();
/**@private */
GraphicsBounds._initMatrix = new Matrix();
/**@private */
GraphicsBounds._tempPoints = [];
/**@private */
GraphicsBounds._tempMatrixArrays = [];
/**@private */
GraphicsBounds._tempCmds = [];
