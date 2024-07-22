//import { PerfHUD } from "./PerfHUD";
let DATANUM = 300;
/**
 * @internal
 * @en Performance data class, used to store and manage performance-related data.
 * @zh 性能数据类，用于存储和管理性能相关的数据。
 */
export class PerfData {
    /**
     * @en A unique identifier for the performance data.
     * @zh 性能数据的唯一标识符。
     */
    id: number;
    /**
     * @en The name of the performance data.
     * @zh 性能数据的名称。
     */
    name: string;
    /**
     * @en The color value associated with the performance data.
     * @zh 与性能数据关联的颜色值。
     */
    color: number;
    /**
     * @en The scale factor for the performance data.
     * @zh 性能数据的缩放因子。
     */
    scale: number = 1.0;
    /**
     * @en An array to store the performance data points.
     * @zh 存储性能数据点的数组。
     */
    datas: any[] = new Array(DATANUM);
    /**
     * @en The current position in the data array for new data points.
     * @zh 新数据点在数据数组中的当前位置。
     */
    datapos: number = 0;
    /**
     * @en Constructor for the PerfData class.
     * Initializes a new performance metric with the given parameters.
     * @param id Unique identifier for the metric
     * @param color Color representation for the metric
     * @param name Descriptive name of the metric
     * @param scale Scaling factor for the metric values
     * @zh PerfData类的构造函数。
     * 使用给定的参数初始化一个新的性能数据。
     * @param id 性能数据的唯一标识符
     * @param color 性能数据的颜色表示
     * @param name 性能数据的描述性名称
     * @param scale 性能数据的缩放因子
     */
    constructor(id: number, color: number, name: string, scale: number) {
        this.id = id;
        this.color = color;
        this.name = name;
        this.scale = scale;
    }
    /**
     * @en Adds a new data point to the performance data.
     * @param v The value of the new data point to be added.
     * @zh 向性能数据添加一个新的数据点。
     * @param v 要添加的新数据点的值。
     */
    addData(v: number): void {
        this.datas[this.datapos] = v;
        this.datapos++;
        this.datapos %= DATANUM;
    }
}

