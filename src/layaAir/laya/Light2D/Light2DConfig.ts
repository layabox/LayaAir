import { Color } from "../maths/Color";

/**
 * 2D灯光全局配置参数
 */
export class Light2DConfig {
    lightHeight: number = 1; //灯光高度（0~1，影响法线效果）
    ambient: Color = new Color(0.25, 0.25, 0.25, 0); //环境光
    ambientLayerMask: number = 1; //环境光影响的层
}