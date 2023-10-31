import { Vector2 } from "../maths/Vector2"

/**
 *  Physics2DOption 用于配置2D物理的默认参数
 */
export class Physics2DOption {

    /**设置是否允许休眠，休眠可以提高稳定性和性能，但通常会牺牲准确性*/
    allowSleeping: boolean = false;

    /**重力 （单位：像素）*/
    gravity: Vector2 = new Vector2(0, 500);

    /**是否由外部跟新*/
    customUpdate: boolean = false;

    /**旋转迭代次数，增大数字会提高精度，但是会降低性能*/
    velocityIterations: number = 8;

    /**位置迭代次数，增大数字会提高精度，但是会降低性能*/
    positionIterations: number = 3;

    /**2D游戏默认单位为像素，物理默认单位为米，此值设置了像素和米的转换比率，默认50像素=1米*/
    pixelTatio: number = 50;

    /**是否开启物理绘制*/
    debugDraw: boolean = true;

    /**是否绘制形状*/
    drawShape: boolean = true;

    /**是否绘制关节*/
    drawJoint: boolean = true;

    /**是否绘制包围盒*/
    drawAABB: boolean = false;

    /**是否绘制质心*/
    drawCenterOfMass: boolean = false;
}