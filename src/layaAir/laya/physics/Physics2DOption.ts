/**
 *  Physics2DOption 用于配置2D物理的默认参数
 */
export class Physics2DOption {

    /**设置是否允许休眠，休眠可以提高稳定性和性能，但通常会牺牲准确性*/
    static allowSleeping: boolean = true;

    /**重力加速度 （单位：米/秒²）*/
    static gravity = { x: 0, y: 9.8 };

    /**是否由外部跟新*/
    static customUpdate: boolean = false;

    /**旋转迭代次数，增大数字会提高精度，但是会降低性能*/
    static velocityIterations: number = 8;

    /**位置迭代次数，增大数字会提高精度，但是会降低性能*/
    static positionIterations: number = 3;

    /**2D游戏默认单位为像素，物理默认单位为米，此值设置了像素和米的转换比率，默认50像素=1米*/
    static pixelRatio: number = 50;

    /**是否开启物理绘制*/
    static debugDraw: boolean = true;

    /**是否绘制形状*/
    static drawShape: boolean = true;

    /**是否绘制关节*/
    static drawJoint: boolean = true;

    /**是否绘制包围盒*/
    static drawAABB: boolean = false;

    /**是否绘制质心*/
    static drawCenterOfMass: boolean = false;
}