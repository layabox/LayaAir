import { Graphics } from "../display/Graphics"
import { Point } from "../maths/Point"
import { Rectangle } from "../maths/Rectangle"
import { ILaya } from "../../ILaya";

/**
 * 鼠标点击区域，可以设置绘制一系列矢量图作为点击区域和非点击区域（目前只支持圆形，矩形，多边形）
 *
 */
export class HitArea {

    /**@private */
    private static _cmds: any[] = [];
    /**@private */
    private static _rect: Rectangle = new Rectangle();
    /**@private */
    private static _ptPoint: Point = new Point();
    /**@private */
    private _hit: Graphics;
    /**@private */
    private _unHit: Graphics;

    /**
     * 检测对象是否包含指定的点。
     * @param	x	点的 X 轴坐标值（水平位置）。
     * @param	y	点的 Y 轴坐标值（垂直位置）。
     * @return	如果包含指定的点，则值为 true；否则为 false。
     */
    contains(x: number, y: number): boolean {
        if (!HitArea._isHitGraphic(x, y, this.hit)) return false;
        return !HitArea._isHitGraphic(x, y, this.unHit);
    }

    /**
     * @internal
     * 是否击中Graphic
     */
    static _isHitGraphic(x: number, y: number, graphic: Graphics): boolean {
        if (!graphic) return false;
        var cmds: any[] = graphic.cmds;
        if (!cmds && graphic._one) {
            cmds = HitArea._cmds;
            cmds.length = 1;
            cmds[0] = graphic._one;
        }
        if (!cmds) return false;
        var i: number, len: number;
        len = cmds.length;
        var cmd: any;
        for (i = 0; i < len; i++) {
            cmd = cmds[i];
            if (!cmd) continue;
            switch (cmd.cmdID) {
                case "Translate":
                    x -= cmd.tx;
                    y -= cmd.ty;
            }
            if (HitArea._isHitCmd(x, y, cmd)) return true;
        }
        return false;
    }

    /**
     * @internal
     * 是否击中绘图指令
     */
    static _isHitCmd(x: number, y: number, cmd: any): boolean {
        if (!cmd) return false;
        var rst: boolean = false;
        switch (cmd.cmdID) {
            case "DrawRect":
                HitArea._rect.setTo(cmd.x, cmd.y, cmd.width, cmd.height);
                rst = HitArea._rect.contains(x, y);
                break;
            case "DrawCircle":
                var d: number;
                x -= cmd.x;
                y -= cmd.y;
                d = x * x + y * y;
                rst = d < cmd.radius * cmd.radius;
                break;
            case "DrawPoly":
                x -= cmd.x;
                y -= cmd.y;
                rst = HitArea._ptInPolygon(x, y, cmd.points);
                break;
        }
        return rst;
    }

    /**
     * @internal
     * 坐标是否在多边形内
     */
    static _ptInPolygon(x: number, y: number, areaPoints: any[]): boolean {
        var p: Point = HitArea._ptPoint;
        p.setTo(x, y);
        // 交点个数
        var nCross: number = 0;
        var p1x: number, p1y: number, p2x: number, p2y: number;
        var len: number;
        len = areaPoints.length;
        for (var i: number = 0; i < len; i += 2) {
            p1x = areaPoints[i];
            p1y = areaPoints[i + 1];
            p2x = areaPoints[(i + 2) % len];
            p2y = areaPoints[(i + 3) % len];
            //var p1:Point = areaPoints[i];
            //var p2:Point = areaPoints[(i + 1) % areaPoints.length]; // 最后一个点与第一个点连线
            if (p1y == p2y) continue;
            if (p.y < Math.min(p1y, p2y)) continue;
            if (p.y >= Math.max(p1y, p2y)) continue;
            // 求交点的x坐标
            var tx: number = (p.y - p1y) * (p2x - p1x) / (p2y - p1y) + p1x;
            // 只统计p1p2与p向右射线的交点
            if (tx > p.x) nCross++;
        }
        // 交点为偶数，点在多边形之外
        return (nCross % 2 == 1);
    }

    /**
     * 可点击区域，可以设置绘制一系列矢量图作为点击区域（目前只支持圆形，矩形，多边形）
     */
    get hit(): Graphics {
        if (!this._hit) this._hit = new ILaya.Graphics();
        return this._hit;
    }

    set hit(value: Graphics) {
        this._hit = value;
    }

    /**
     * 不可点击区域，可以设置绘制一系列矢量图作为非点击区域（目前只支持圆形，矩形，多边形）
     */
    get unHit(): Graphics {
        if (!this._unHit) this._unHit = new ILaya.Graphics();
        return this._unHit;
    }

    set unHit(value: Graphics) {
        this._unHit = value;
    }
}

