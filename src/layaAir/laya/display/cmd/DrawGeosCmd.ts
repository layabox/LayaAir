import { IRenderGeometryElement } from "../../RenderDriver/DriverDesign/RenderDevice/IRenderGeometryElement";
import { Context, IGraphicCMD } from "../../renders/Context"
import { Material } from "../../resource/Material";
import { Pool } from "../../utils/Pool"

/**
 * @en Draw multiple geometries command
 * @zh 绘制多个几何体命令
 */
export class DrawGeosCmd implements IGraphicCMD {
    /**
     * @en Identifier for the DrawGeosCmd
     * @zh 绘制多个几何体命令的标识符
     */
    static ID: string = "DrawGeoCmd";
    /**
     * @en Geometry element to be rendered
     * @zh 要渲染的几何体元素
     */
    geo: IRenderGeometryElement;
    /**
     * @en Array of [Material, startIndex, count] tuples for each geometry
     * @zh 每个几何体的 [材质, 起始索引, 数量] 元组数组
     */
    elements: [Material, number, number][];

    /**
     * @private
     * @en Create a DrawGeosCmd instance
     * @param geo Geometry element to be rendered
     * @param elements Array of [Material, startIndex, count] tuples for each geometry
     * @returns A DrawGeosCmd instance
     * @zh 创建一个 DrawGeosCmd 实例
     * @param geo 要渲染的几何体元素
     * @param elements 每个几何体的 [材质, 起始索引, 数量] 元组数组
     * @returns DrawGeosCmd 实例
     */
    static create(geo: IRenderGeometryElement, elements: [Material, number, number][]): DrawGeosCmd {
        var cmd: DrawGeosCmd = Pool.getItemByClass("DrawGeosCmd", DrawGeosCmd);
        cmd.init(geo, elements);
        return cmd;
    }

    /**
     * @en Initialize the DrawGeosCmd
     * @param geo Geometry element to be rendered
     * @param elements Array of [Material, startIndex, count] tuples for each geometry
     * @zh 初始化绘制多个几何体
     * @param geo 要渲染的几何体元素
     * @param elements 每个几何体的 [材质, 起始索引, 数量] 元组数组
     */
    init(geo: IRenderGeometryElement, elements: [Material, number, number][]): void {
        this.elements = elements;
        this.geo = geo;
    }

    /**
     * @en Recycle the instance to the object pool
     * @zh 将实例回收到对象池
     */
    recover(): void {
        Pool.recover("DrawGeosCmd", this);
    }

    /**
     * @en Execute the draw geometries command
     * @param context The rendering context
     * @param gx Global x-coordinate
     * @param gy Global Y-coordinate
     * @zh 执行绘制多个几何体命令
     * @param context 渲染上下文
     * @param gx 全局X坐标
     * @param gy 全局Y坐标
     */
    run(context: Context, gx: number, gy: number): void {
        context.drawGeos(this.geo, this.elements, gx, gy);
    }

    /**
     * @en The identifier for the DrawGeosCmd
     * @zh 绘制多个几何体命令的标识符
     */
    get cmdID(): string {
        return DrawGeosCmd.ID;
    }
}
