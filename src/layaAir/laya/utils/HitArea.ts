import { DrawCircleCmd } from "../display/cmd/DrawCircleCmd";
import { DrawEllipseCmd } from "../display/cmd/DrawEllipseCmd";
import { DrawPolyCmd } from "../display/cmd/DrawPolyCmd";
import { DrawRectCmd } from "../display/cmd/DrawRectCmd";
import { Graphics } from "../display/Graphics"
import { IGraphicsCmd } from "../display/IGraphics";
import { Sprite } from "../display/Sprite";
import { Rectangle } from "../maths/Rectangle"
import { ClassUtils } from "./ClassUtils";
import { IHitArea } from "./IHitArea";
import { Utils } from "./Utils";

const _rect: Rectangle = new Rectangle();

/**
 * @en The `HitArea` class represents a mouse click area that can be defined by a series of vector shapes for clickable and non-clickable regions (currently only supports circles, rectangles, and polygons).
 * @zh `HitArea` 类表示一个鼠标点击区域，可以通过一系列矢量图形定义为可点击和非可点击区域（目前仅支持圆形、矩形和多边形）。
 * @blueprintable
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
     * @blueprintIgnore
     */
    contains(x: number, y: number, sp: Sprite): boolean {
        if (HitArea._isHitGraphic(x, y, sp, this._unHit))
            return false;

        return HitArea._isHitGraphic(x, y, sp, this._hit);
    }

    /**
     * @en Moves the hit area to a new position.
     * @param x The new x-coordinate of the hit area.
     * @param y The new y-coordinate of the hit area.
     * @param hit Whether to move the hit area.
     * @param unhit Whether to move the unhit area.
     * @zh 将命中区域移动到新位置。
     * @param x 新的 x 轴坐标位置。
     * @param y 新的 y 轴坐标位置。 
     * @param hit 是否移动命中区域。
     * @param unhit 是否移动未命中区域。
     */
    moveTo(x: number, y: number, hit: boolean, unhit: boolean): void {
        if (hit && this._hit) {
            for (let cmd of this._hit.cmds) {
                (cmd as any).x = x;
                (cmd as any).y = y;
            }
        }

        if (unhit && this._unHit) {
            for (let cmd of this._unHit.cmds) {
                (cmd as any).x = x;
                (cmd as any).y = y;
            }
        }
    }

    private static _isHitGraphic(x: number, y: number, sp: Sprite, g: Graphics): boolean {
        if (!g) return false;
        return g.cmds.findIndex(cmd => cmd && HitArea._isHitCmd(x, y, sp, cmd)) !== -1;
    }

    private static _isHitCmd(x: number, y: number, sp: Sprite, cmd: IGraphicsCmd): boolean {
        if (!cmd) return false;
        var rst: boolean = false;
        switch (cmd.cmdID) {
            case DrawRectCmd.ID: {
                let tcmd = cmd as DrawRectCmd;
                if (tcmd.percent)
                    _rect.setTo(tcmd.x * sp.width, tcmd.y * sp.height, tcmd.width * sp.width, tcmd.height * sp.height);
                else
                    _rect.setTo(tcmd.x, tcmd.y, tcmd.width, tcmd.height);
                rst = _rect.contains(x, y);
                break;
            }
            case DrawCircleCmd.ID: {
                let tcmd = cmd as DrawCircleCmd;
                let r = tcmd.radius;
                let d: number;
                if (tcmd.percent) {
                    x -= tcmd.x * sp.width;
                    y -= tcmd.y * sp.height;
                    r *= sp.width;
                }
                else {
                    x -= tcmd.x;
                    y -= tcmd.y;
                }
                d = x * x + y * y;
                rst = d < r * r;
                break;
            }
            case DrawEllipseCmd.ID: {
                let tcmd = cmd as DrawEllipseCmd;
                let d: number;
                let rx = tcmd.width / 2;
                let ry = tcmd.height / 2;
                if (tcmd.percent) {
                    x -= tcmd.x * sp.width;
                    y -= tcmd.y * sp.height;
                    rx *= sp.width;
                    ry *= sp.height;
                }
                else {
                    x -= tcmd.x;
                    y -= tcmd.y;
                }
                d = Math.pow(x / rx, 2) + Math.pow(x / ry, 2);
                rst = d < 1;
                break;
            }
            case DrawPolyCmd.ID: {
                let tcmd = cmd as DrawPolyCmd;
                x -= tcmd.x;
                y -= tcmd.y;
                rst = Utils.testPointInPolygon(x, y, tcmd.points);
                break;
            }
        }
        return rst;
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
     * @internal
     */
    onAfterDeserialize() {
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

ClassUtils.regClass("HitArea", HitArea);

