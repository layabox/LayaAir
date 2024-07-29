/**
 * @en Physics2DOption is used to configure default parameters for 2D physics
 * @zh Physics2DOption 用于配置2D物理的默认参数
 */
export class Physics2DOption {

    /**
     * @en Sets whether sleeping is allowed. Allowing sleep can improve stability and performance, but it usually comes at the cost of accuracy.The default is false.
     * @zh 设置是否允许休眠。允许休眠可以提高稳定性和性能，但通常会牺牲准确性。默认为否。
     */
    static allowSleeping: boolean = false;

    /**
     * @en Gravity acceleration, with a default value of 9.8, corresponding to 9.8 meters per second squared (m/s²) in the real world.
     * @zh 重力加速度，默认的重力加速度值为 9.8，对应于现实世界中的 9.8米/秒²（m/s²） 。
     */
    static gravity = { x: 0, y: 9.8 };

    /**
     * @en Indicates whether the update is performed externally.The default is false.
     * @zh 表示更新是否由外部执行。默认为否。
     */
    static customUpdate: boolean = false;

    /**
     * @en The number of velocity iterations. Increasing this number will improve accuracy but reduce performance.The default is 8.
     * @zh 旋转迭代次数。增大此数字会提高精度，但会降低性能。默认为8。
     */
    static velocityIterations: number = 8;

    /**
     * @en The number of position iterations. Increasing this number will improve accuracy but reduce performance.The default is 3.
     * @zh 位置迭代次数。增大此数字会提高精度，但会降低性能。默认为3。
     */
    static positionIterations: number = 3;

    /**
     * @en The conversion ratio between rendering pixels and physical units. By default, 1 length unit in the physics engine corresponds to 50 pixels. Modifying this value changes the number of pixels that correspond to 1 length unit in the physics engine.
     * @zh 渲染像素和物理单位的转换比率，物理引擎中的1长度单位默认转换为50个像素，修改此处可改变物理引擎1长度单位对应的渲染像素值。
     */
    static pixelRatio: number = 50;

    /**
     * @en Whether to enable physics drawing.The default is true.
     * @zh 是否开启物理绘制。默认为是。
     */
    static debugDraw: boolean = true;

    /**
     * @en Whether to draw shapes.The default is true.
     * @zh 是否绘制形状。默认为是。
     */
    static drawShape: boolean = true;

    /**
     * @en Whether to draw joints.The default is true.
     * @zh 是否绘制关节。默认为是。
     */
    static drawJoint: boolean = true;

    /**
     * @en Whether to draw the Bounding Box.The default is false.
     * @zh 是否绘制包围盒。默认为否。
     */
    static drawAABB: boolean = false;

    /**
     * @en Whether to draw the center of mass.The default is false.
     * @zh 是否绘制质心。默认为否。
     */
    static drawCenterOfMass: boolean = false;
}