import { LayaEnv } from "../../LayaEnv";
import { Graphics } from "../display/Graphics"
import { Sprite } from "../display/Sprite";
import { Point } from "../maths/Point"
import { Rectangle } from "../maths/Rectangle"
import { ClassUtils } from "./ClassUtils";
import { IHitArea } from "./IHitArea";

const _rect: Rectangle = new Rectangle();
const _ptPoint: Point = new Point();

/**
 * @en The `HitArea` class represents a mouse click area that can be defined by a series of vector shapes for clickable and non-clickable regions (currently only supports circles, rectangles, and polygons).
 * @zh `HitArea` 类表示一个鼠标点击区域，可以通过一系列矢量图形定义为可点击和非可点击区域（目前仅支持圆形、矩形和多边形）。
 */
export class HitArea implements IHitArea {
    /**
     * @internal
     */
    _hit: Graphics;

    /**
     * @internal
     */
    _unHit: Graphics;

    /**
     * @en Checks whether the object contains a specified point.
     * @param x The x-coordinate of the point (horizontal position).
     * @param y The y-coordinate of the point (vertical position).
     * @param sp The Sprite object that contains the point.
     * @returns true if the object contains the specified point; otherwise false.
     * @zh 检测对象是否包含指定的点。
     * @param x 点的 X 轴坐标值（水平位置）。
     * @param y 点的 Y 轴坐标值（垂直位置）。
     * @param sp 包含该点的 Sprite 对象。
     * @returns 如果包含指定的点，则值为 true；否则为 false。
     */
    contains(x: number, y: number, sp: Sprite): boolean {
        if (!HitArea._isHitGraphic(x, y, sp, this._hit))
            return false;
        return !HitArea._isHitGraphic(x, y, sp, this._unHit);
    }

    /**
     * @internal
     * @en Has it hit Graphic
     * @zh 是否击中Graphic
     */
    static _isHitGraphic(x: number, y: number, sp: Sprite, graphic: Graphics): boolean {
        if (!graphic) return false;
        let cmds = graphic.cmds;
        if (cmds.length == 0) return false;
        let len = cmds.length;
        for (let i = 0; i < len; i++) {
            let cmd = cmds[i];
            if (!cmd) continue;
            switch (cmd.cmdID) {
                case "Translate":
                    x -= cmd.tx;
                    y -= cmd.ty;
            }
            if (HitArea._isHitCmd(x, y, sp, cmd)) return true;
        }
        return false;
    }

    /**
     * @internal
     * @en Determines whether a point is hit within a specific drawing command.
     * @zh 是否击中绘图指令
     */
    static _isHitCmd(x: number, y: number, sp: Sprite, cmd: any): boolean {
        if (!cmd) return false;
        var rst: boolean = false;
        switch (cmd.cmdID) {
            case "DrawRect":
                if (cmd.percent)
                    _rect.setTo(cmd.x * sp.width, cmd.y * sp.height, cmd.width * sp.width, cmd.height * sp.height);
                else
                    _rect.setTo(cmd.x, cmd.y, cmd.width, cmd.height);
                rst = _rect.contains(x, y);
                break;
            case "DrawCircle":
                let r = cmd.radius;
                var d: number;
                if (cmd.percent) {
                    x -= cmd.x * sp.width;
                    y -= cmd.y * sp.height;
                    r *= sp.width;
                }
                else {
                    x -= cmd.x;
                    y -= cmd.y;
                }
                d = x * x + y * y;
                rst = d < r * r;
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
     * @en Determines whether a point is inside a polygon.
     * @zh 坐标是否在多边形内
     */
    static _ptInPolygon(x: number, y: number, areaPoints: any[]): boolean {
        var p: Point = _ptPoint;
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
     * @en The Graphics object that defines the clickable area.(currently only supports circles, rectangles, and polygons).
     * @zh 定义可点击区域的 Graphics 对象。（目前只支持圆形，矩形，多边形）
     */
    get hit(): Graphics {
        if (!this._hit) this._hit = new Graphics();
        return this._hit;
    }

    set hit(value: Graphics) {
        this._hit = value;
    }

    /**
     * @en The Graphics object that defines the non-clickable area,(currently only supports circles, rectangles, and polygons).
     * @zh 定义不可点击区域的 Graphics 对象。（目前只支持圆形，矩形，多边形）
     */
    get unHit(): Graphics {
        if (!this._unHit) this._unHit = new Graphics();
        return this._unHit;
    }

    set unHit(value: Graphics) {
        this._unHit = value;
    }

    /**
     * @en Called after deserialization.
     * @zh 序列化后调用。
     */
    onAfterDeserialize() {
        if (LayaEnv.isPlaying) {
            if ((<any>this)._hitCmds) {
                this.hit.cmds = (<any>this)._hitCmds;
                delete (<any>this)._hitCmds;
            }

            if ((<any>this)._unHitCmds) {
                this.unHit.cmds = (<any>this)._unHitCmds;
                delete (<any>this)._unHitCmds;
            }
        }
    }
}

ClassUtils.regClass("HitArea", HitArea);

