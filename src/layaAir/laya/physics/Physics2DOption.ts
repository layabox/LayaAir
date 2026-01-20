/**
 * @zh Physics2DOption 用于配置2D物理的默认参数
 * @en Physics2DOption is used to configure default parameters for 2D physics
 */
export class Physics2DOption {

    /**
     * @zh 设置是否允许休眠。允许休眠可以提高稳定性和性能，但通常会牺牲准确性。默认为否。
     * @en Sets whether sleeping is allowed. Allowing sleep can improve stability and performance, but it usually comes at the cost of accuracy.The default is false.
     */
    static allowSleeping: boolean = false;

    /**
     * @zh 重力加速度，默认的重力加速度值为 9.8，对应于现实世界中的 9.8米/秒²（m/s²） 。
     * @en Gravity acceleration, with a default value of 9.8, corresponding to 9.8 meters per second squared (m/s²) in the real world.
     */
    static gravity = { x: 0, y: 9.8 };

    /**
     * @zh 表示更新是否由外部执行。默认为否。
     * @en Indicates whether the update is performed externally.The default is false.
     */
    static customUpdate: boolean = false;

    /**
     * @zh 速度迭代次数，用于控制每个物理时间步中，速度约束求解阶段的迭代次数。该参数影响碰撞响应、摩擦效果以及关节稳定性，数值越高，物理结果越稳定，但计算开销也越大。通常推荐使用默认值 8，在性能受限场景可适当降低，在高精度需求场景可适当提高。
     * @en Specifies the number of iterations used to solve velocity constraints in each physics step. This parameter affects collision response, friction behavior, and joint stability. Higher values improve simulation stability at the cost of performance. A default value of 8 is commonly recommended, with lower values for performance-critical scenarios and higher values for accuracy-critical cases.
     */
    static velocityIterations: number = 8;

    /**
     * @zh 位置迭代次数，用于控制 2D 物理系统在每个模拟步中，对碰撞、堆叠和关节约束所产生的位置误差进行修正的迭代次数。数值越高，位置约束收敛越充分，通常可减少穿透与下陷、提升堆叠和关节稳定性，但会增加 CPU 开销。该参数应与时间步、子步（subStep）及速度迭代次数（velocityIterations）配合调整，默认值 3 在多数场景下能兼顾性能与效果。
     * @en Specifies the number of iterations used to correct positional constraint errors caused by collisions, stacking, and joints in each physics step. Higher values improve positional stability (less penetration and sinking, more stable stacks and joints) at the cost of performance. This parameter should be tuned together with the time step, sub-steps, and velocity iterations. A default value of 3 provides a good balance for most scenarios.
     */
    static positionIterations: number = 3;

    /**
     * @zh 渲染像素和物理单位的转换比率，物理引擎中的1长度单位默认转换为50个像素，修改此处可改变物理引擎1长度单位对应的渲染像素值。
     * @en The conversion ratio between rendering pixels and physical units. By default, 1 length unit in the physics engine corresponds to 50 pixels. Modifying this value changes the number of pixels that correspond to 1 length unit in the physics engine.
     */
    static pixelRatio: number = 50;

    /**
     * @zh 是否开启物理绘制。默认为是。
     * @en Whether to enable physics drawing.The default is true.
     */
    static debugDraw: boolean = true;

    /**
     * @zh 是否绘制形状。默认为是。
     * @en Whether to draw shapes.The default is true.
     */
    static drawShape: boolean = true;

    /**
     * @zh 是否绘制关节。默认为是。
     * @en Whether to draw joints.The default is true.
     */
    static drawJoint: boolean = true;

    /**
     * @zh 是否绘制包围盒。默认为否。
     * @en Whether to draw the Bounding Box.The default is false.
     */
    static drawAABB: boolean = false;

    /**
     * @zh 是否绘制质心。默认为否。
     * @en Whether to draw the center of mass.The default is false.
     */
    static drawCenterOfMass: boolean = false;
    /**
     * @zh 子步数，用于定义物理世界中每个模拟步（Step）的时间长度（秒），保证物理计算在不同帧率下具有一致性和稳定性。步长越小，物理精度越高，但 CPU 开销增加。
     * @en Specifies the duration of a single physics simulation step (in seconds), ensuring consistent and stable physics results across different frame rates. Smaller values increase simulation accuracy at the cost of higher CPU usage.
     */
    static subStep: number = 1;
}