import { Color } from "../maths/Color";
import { Vector3 } from "../maths/Vector3";

/**
 * 2D灯光全局配置参数
 */
export class Light2DConfig {

    /**
     * @en Light direction vector (affects normal effect)
     * @zh 灯光方向矢量（影响法线效果）
     */
    static lightDirection: Vector3 = new Vector3(-1, 0, 1);

    /**
     * @en ambient light color
     * @zh 环境光颜色
     */
    static ambientColor: Color = new Color(0.2, 0.2, 0.2, 0);

    /**
     * @en Layers affected by ambient light (affects all layers by default)
     * @zh 环境光影响的层（默认影响所有层）
     */
    static ambientLayerMask: number = -1;

    /**
     * @en Light and shadow map multisampling number (1 or 4, affects jagged shadow edges)
     * @zh 光影图多重采样数（1或4，影响阴影边缘锯齿）
     */
    static multiSamples: number = 4;
}