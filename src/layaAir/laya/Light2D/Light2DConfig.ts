import { Color } from "../maths/Color";
import { Vector3 } from "../maths/Vector3";

/**
 * 2D灯光全局配置参数
 */
export class Light2DConfig {
    lightDirection: Vector3 = new Vector3(-1, 0, 1); //灯光方向矢量（影响法线效果）
    ambientColor: Color = new Color(0.2, 0.2, 0.2, 0); //环境光颜色
    ambientLayerMask: number = -1; //环境光影响的层（默认影响所有层）
    multiSamples: number = 4; //光影图多重采样数（1或4，影响阴影边缘锯齿）
}