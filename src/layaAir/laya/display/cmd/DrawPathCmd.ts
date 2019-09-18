import { Context } from "../../resource/Context"
import { Pool } from "../../utils/Pool"

/**
 * 根据路径绘制矢量图形
 */
export class DrawPathCmd {
    static ID: string = "DrawPath";

    /**
     * 开始绘制的 X 轴位置。
     */
    x: number;
    /**
     * 开始绘制的 Y 轴位置。
     */
    y: number;
    /**
     * 路径集合，路径支持以下格式：[["moveTo",x,y],["lineTo",x,y],["arcTo",x1,y1,x2,y2,r],["closePath"]]。
     */
    paths: any[]|null;
    /**
     * （可选）刷子定义，支持以下设置{fillStyle:"#FF0000"}。
     */
    brush: any;
    /**
     * （可选）画笔定义，支持以下设置{strokeStyle,lineWidth,lineJoin:"bevel|round|miter",lineCap:"butt|round|square",miterLimit}。
     */
    pen: any;

    /**@private */
    static create(x: number, y: number, paths: any[], brush: any, pen: any): DrawPathCmd {
        var cmd: DrawPathCmd = Pool.getItemByClass("DrawPathCmd", DrawPathCmd);
        cmd.x = x;
        cmd.y = y;
        cmd.paths = paths;
        cmd.brush = brush;
        cmd.pen = pen;
        return cmd;
    }

    /**
     * 回收到对象池
     */
    recover(): void {
        this.paths = null;
        this.brush = null;
        this.pen = null;
        Pool.recover("DrawPathCmd", this);
    }

    /**@private */
    run(context: Context, gx: number, gy: number): void {
        this.paths && context._drawPath(this.x + gx, this.y + gy, this.paths, this.brush, this.pen);
    }

    /**@private */
    get cmdID(): string {
        return DrawPathCmd.ID;
    }

}

