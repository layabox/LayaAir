/**
	 * <code>ParticleSettings</code> 类是粒子配置数据类
	 */
export class ParticleSetting {
    /**贴图*/
    textureName: string = null;
    /**贴图个数,默认为1可不设置*/
    textureCount: number = 1;
    /**由于循环队列判断算法，最大饱和粒子数为maxPartices-1*/
    maxPartices: number = 100;
    /**粒子持续时间(单位:秒）*/
    duration: number = 1;
    /**如果大于0，某些粒子的持续时间会小于其他粒子,并具有随机性(单位:无）*/
    ageAddScale: number = 0;

    /**粒子受发射器速度的敏感度（需在自定义发射器中编码设置）*/
    emitterVelocitySensitivity: number = 1;

    /**最小开始尺寸（单位：2D像素、3D坐标）*/
    minStartSize: number = 100;
    /**最大开始尺寸（单位：2D像素、3D坐标）*/
    maxStartSize: number = 100;
    /**最小结束尺寸（单位：2D像素、3D坐标）*/
    minEndSize: number = 100;
    /**最大结束尺寸（单位：2D像素、3D坐标）*/
    maxEndSize: number = 100;

    /**最小水平速度（单位：2D像素、3D坐标）*/
    minHorizontalVelocity: number = 0;
    /**最大水平速度（单位：2D像素、3D坐标）*/
    maxHorizontalVelocity: number = 0;
    /**最小垂直速度（单位：2D像素、3D坐标）*/
    minVerticalVelocity: number = 0;
    /**最大垂直速度（单位：2D像素、3D坐标）*/
    maxVerticalVelocity: number = 0;
    /**等于1时粒子从出生到消亡保持一致的速度，等于0时粒子消亡时速度为0，大于1时粒子会保持加速（单位：无）*/
    endVelocity: number = 1;

    /**（单位：2D像素、3D坐标）*/
    gravity: Float32Array = new Float32Array([0, 0, 0]);

    /**最小旋转速度（单位：2D弧度/秒、3D弧度/秒）*/
    minRotateSpeed: number = 0;
    /**最大旋转速度（单位：2D弧度/秒、3D弧度/秒）*/
    maxRotateSpeed: number = 0;

    /**最小开始半径（单位：2D像素、3D坐标）*/
    minStartRadius: number = 0;
    /**最大开始半径（单位：2D像素、3D坐标）*/
    maxStartRadius: number = 0;
    /**最小结束半径（单位：2D像素、3D坐标）*/
    minEndRadius: number = 0;
    /**最大结束半径（单位：2D像素、3D坐标）*/
    maxEndRadius: number = 0;

    /**最小水平开始弧度（单位：2D弧度、3D弧度）*/
    minHorizontalStartRadian: number = 0;
    /**最大水平开始弧度（单位：2D弧度、3D弧度）*/
    maxHorizontalStartRadian: number = 0;
    /**最小垂直开始弧度（单位：2D弧度、3D弧度）*/
    minVerticalStartRadian: number = 0;
    /**最大垂直开始弧度（单位：2D弧度、3D弧度）*/
    maxVerticalStartRadian: number = 0;

    /**是否使用结束弧度,false为结束时与起始弧度保持一致,true为根据minHorizontalEndRadian、maxHorizontalEndRadian、minVerticalEndRadian、maxVerticalEndRadian计算结束弧度。*/
    useEndRadian: boolean = true;
    /**最小水平结束弧度（单位：2D弧度、3D弧度）*/
    minHorizontalEndRadian: number = 0;
    /**最大水平结束弧度（单位：2D弧度、3D弧度）*/
    maxHorizontalEndRadian: number = 0;
    /**最小垂直结束弧度（单位：2D弧度、3D弧度）*/
    minVerticalEndRadian: number = 0;
    /**最大垂直结束弧度（单位：2D弧度、3D弧度）*/
    maxVerticalEndRadian: number = 0;

    /**最小开始颜色*/
    minStartColor: Float32Array = new Float32Array([1, 1, 1, 1]);
    /**最大开始颜色*/
    maxStartColor: Float32Array = new Float32Array([1, 1, 1, 1]);
    /**最小结束颜色*/
    minEndColor: Float32Array = new Float32Array([1, 1, 1, 1]);
    /**最大结束颜色*/
    maxEndColor: Float32Array = new Float32Array([1, 1, 1, 1]);

    /**false代表RGBA整体插值，true代表RGBA逐分量插值*/
    colorComponentInter: boolean = false;
    /**false代表使用参数颜色数据，true代表使用原图颜色数据*/
    disableColor: boolean = false;
    /**混合模式，待调整，引擎中暂无BlendState抽象*/
    blendState: number = 0;

    //.........................................................3D发射器参数.........................................................
    /**发射器类型,"point","box","sphere","ring"*/
    emitterType: string = "null";
    /**发射器发射速率*/
    emissionRate: number = 0;

    /**点发射器位置*/
    pointEmitterPosition: Float32Array = new Float32Array([0, 0, 0]);
    /**点发射器位置随机值*/
    pointEmitterPositionVariance: Float32Array = new Float32Array([0, 0, 0]);
    /**点发射器速度*/
    pointEmitterVelocity: Float32Array = new Float32Array([0, 0, 0]);
    /**点发射器速度随机值*/
    pointEmitterVelocityAddVariance: Float32Array = new Float32Array([0, 0, 0]);

    /**盒发射器中心位置*/
    boxEmitterCenterPosition: Float32Array = new Float32Array([0, 0, 0]);
    /**盒发射器尺寸*/
    boxEmitterSize: Float32Array = new Float32Array([0, 0, 0]);
    /**盒发射器速度*/
    boxEmitterVelocity: Float32Array = new Float32Array([0, 0, 0]);
    /**盒发射器速度随机值*/
    boxEmitterVelocityAddVariance: Float32Array = new Float32Array([0, 0, 0]);

    /**球发射器中心位置*/
    sphereEmitterCenterPosition: Float32Array = new Float32Array([0, 0, 0]);
    /**球发射器半径*/
    sphereEmitterRadius: number = 1;
    /**球发射器速度*/
    sphereEmitterVelocity: number = 0;
    /**球发射器速度随机值*/
    sphereEmitterVelocityAddVariance: number = 0;

    /**环发射器中心位置*/
    ringEmitterCenterPosition: Float32Array = new Float32Array([0, 0, 0]);
    /**环发射器半径*/
    ringEmitterRadius: number = 30;
    /**环发射器速度*/
    ringEmitterVelocity: number = 0;
    /**环发射器速度随机值*/
    ringEmitterVelocityAddVariance: number = 0;
    /**环发射器up向量，0代表X轴,1代表Y轴,2代表Z轴*/
    ringEmitterUp: number = 2;
    //.........................................................3D发射器参数.........................................................

    //.........................................................2D发射器参数.........................................................
    /**发射器位置随机值,2D使用*/
    positionVariance: Float32Array = new Float32Array([0, 0, 0]);

    //.........................................................2D发射器参数.........................................................

    /**
     * 创建一个新的 <code>ParticleSettings</code> 类实例。
     *
     */
    constructor() {

    }
    private static _defaultSetting: ParticleSetting = new ParticleSetting();

    static checkSetting(setting: any): void {
        var key: string;
        for (key in ParticleSetting._defaultSetting) {
            if (!(key in setting)) {
                setting[key] = (ParticleSetting._defaultSetting as any)[key];
            }
        }
        //强转一下防止出错。这几个变量会直接传给shader，如果不是数字的话，有的runtime受不了（例如微信）
        setting.endVelocity = +setting.endVelocity;
        setting.gravity[0] = +setting.gravity[0];
        setting.gravity[1] = +setting.gravity[1];
        setting.gravity[2] = +setting.gravity[2];
    }

}


