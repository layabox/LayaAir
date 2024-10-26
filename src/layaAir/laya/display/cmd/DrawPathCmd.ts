import { Context } from "../../renders/Context"
import { ClassUtils } from "../../utils/ClassUtils";
import { Pool } from "../../utils/Pool"

/**
 * @en Draw vector graphics based on the path
 * @zh 根据路径绘制矢量图形
 */
export class DrawPathCmd {
    /**
     * @en Identifier for the DrawPathCmd
     * @zh 根据路径绘制矢量图形命令的标识符
     */
    static ID: string = "DrawPath";

    /**
     * @en The X-axis position to start drawing.
     * @zh 开始绘制的 X 轴位置。
     */
    x: number;
    /**
     * @en The Y-axis position to start drawing.
     * @zh 开始绘制的 Y 轴位置。
     */
    y: number;
    /**
     * @en Path collection. Paths support the following formats: [["moveTo",x,y],["lineTo",x,y],["arcTo",x1,y1,x2,y2,r],["closePath"]].
     * @zh 路径集合，路径支持以下格式：[["moveTo",x,y],["lineTo",x,y],["arcTo",x1,y1,x2,y2,r],["closePath"]]。
     */
    paths: any[] | null;
    /**
     * @en (Optional) Brush definition, supports the following settings: {fillStyle:"#FF0000"}.
     * @zh （可选）刷子定义，支持以下设置：{fillStyle:"#FF0000"}。
     */
    brush: any;
    /**
     * @en (Optional) Pen definition, supports the following settings: {strokeStyle,lineWidth,lineJoin:"bevel|round|miter",lineCap:"butt|round|square",miterLimit}.
     * @zh （可选）画笔定义，支持以下设置：{strokeStyle,lineWidth,lineJoin:"bevel|round|miter",lineCap:"butt|round|square",miterLimit}。
     */
    pen: any;

    /**
     * @en Create a DrawPathCmd instance
     * @param x The X-axis position to start drawing
     * @param y The Y-axis position to start drawing
     * @param paths Path collection
     * @param brush Brush definition
     * @param pen Pen definition
     * @returns DrawPathCmd instance
     * @zh 创建一个根据路径绘制矢量图形命令实例
     * @param x 开始绘制的 X 轴位置
     * @param y 开始绘制的 Y 轴位置
     * @param paths 路径集合
     * @param brush 刷子定义
     * @param pen 画笔定义
     * @return DrawPathCmd 实例
     */
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
     * @en Recycle to the object pool
     * @zh 回收到对象池
     */
    recover(): void {
        this.paths = null;
        this.brush = null;
        this.pen = null;
        Pool.recover("DrawPathCmd", this);
    }

    /**
     * @en Execute the drawing command
     * @param context The rendering context
     * @param gx Global X offset
     * @param gy Global Y offset
     * @zh 执行绘制命令
     * @param context 渲染上下文
     * @param gx 全局 X 偏移
     * @param gy 全局 Y 偏移
     */
    run(context: Context, gx: number, gy: number): void {
        this.paths && context._drawPath(this.x + gx, this.y + gy, this.paths, this.brush, this.pen);
    }

    /**
     * @en The identifier for the DrawPathCmd
     * @zh 根据路径绘制矢量图形命令的标识符
     */
    get cmdID(): string {
        return DrawPathCmd.ID;
    }

    /**
     * @en Get the boundary points of the path
     * @zh 获取路径的边界点
     */
    getBoundPoints(): number[] {
        let rst: any[] = _tempPoints;
        rst.length = 0;
        let paths = this.paths;
        let len = paths.length;
        for (let i = 0; i < len; i++) {
            let tCMD = paths[i];
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

const _tempPoints: any[] = [];

ClassUtils.regClass("DrawPathCmd", DrawPathCmd);