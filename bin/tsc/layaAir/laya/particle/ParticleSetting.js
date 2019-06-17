/**
     * <code>ParticleSettings</code> 类是粒子配置数据类
     */
export class ParticleSetting {
    //.........................................................2D发射器参数.........................................................
    /**
     * 创建一个新的 <code>ParticleSettings</code> 类实例。
     *
     */
    constructor() {
        /**贴图*/
        this.textureName = null;
        /**贴图个数,默认为1可不设置*/
        this.textureCount = 1;
        /**由于循环队列判断算法，最大饱和粒子数为maxPartices-1*/
        this.maxPartices = 100;
        /**粒子持续时间(单位:秒）*/
        this.duration = 1;
        /**如果大于0，某些粒子的持续时间会小于其他粒子,并具有随机性(单位:无）*/
        this.ageAddScale = 0;
        /**粒子受发射器速度的敏感度（需在自定义发射器中编码设置）*/
        this.emitterVelocitySensitivity = 1;
        /**最小开始尺寸（单位：2D像素、3D坐标）*/
        this.minStartSize = 100;
        /**最大开始尺寸（单位：2D像素、3D坐标）*/
        this.maxStartSize = 100;
        /**最小结束尺寸（单位：2D像素、3D坐标）*/
        this.minEndSize = 100;
        /**最大结束尺寸（单位：2D像素、3D坐标）*/
        this.maxEndSize = 100;
        /**最小水平速度（单位：2D像素、3D坐标）*/
        this.minHorizontalVelocity = 0;
        /**最大水平速度（单位：2D像素、3D坐标）*/
        this.maxHorizontalVelocity = 0;
        /**最小垂直速度（单位：2D像素、3D坐标）*/
        this.minVerticalVelocity = 0;
        /**最大垂直速度（单位：2D像素、3D坐标）*/
        this.maxVerticalVelocity = 0;
        /**等于1时粒子从出生到消亡保持一致的速度，等于0时粒子消亡时速度为0，大于1时粒子会保持加速（单位：无）*/
        this.endVelocity = 1;
        /**（单位：2D像素、3D坐标）*/
        this.gravity = new Float32Array([0, 0, 0]);
        /**最小旋转速度（单位：2D弧度/秒、3D弧度/秒）*/
        this.minRotateSpeed = 0;
        /**最大旋转速度（单位：2D弧度/秒、3D弧度/秒）*/
        this.maxRotateSpeed = 0;
        /**最小开始半径（单位：2D像素、3D坐标）*/
        this.minStartRadius = 0;
        /**最大开始半径（单位：2D像素、3D坐标）*/
        this.maxStartRadius = 0;
        /**最小结束半径（单位：2D像素、3D坐标）*/
        this.minEndRadius = 0;
        /**最大结束半径（单位：2D像素、3D坐标）*/
        this.maxEndRadius = 0;
        /**最小水平开始弧度（单位：2D弧度、3D弧度）*/
        this.minHorizontalStartRadian = 0;
        /**最大水平开始弧度（单位：2D弧度、3D弧度）*/
        this.maxHorizontalStartRadian = 0;
        /**最小垂直开始弧度（单位：2D弧度、3D弧度）*/
        this.minVerticalStartRadian = 0;
        /**最大垂直开始弧度（单位：2D弧度、3D弧度）*/
        this.maxVerticalStartRadian = 0;
        /**是否使用结束弧度,false为结束时与起始弧度保持一致,true为根据minHorizontalEndRadian、maxHorizontalEndRadian、minVerticalEndRadian、maxVerticalEndRadian计算结束弧度。*/
        this.useEndRadian = true;
        /**最小水平结束弧度（单位：2D弧度、3D弧度）*/
        this.minHorizontalEndRadian = 0;
        /**最大水平结束弧度（单位：2D弧度、3D弧度）*/
        this.maxHorizontalEndRadian = 0;
        /**最小垂直结束弧度（单位：2D弧度、3D弧度）*/
        this.minVerticalEndRadian = 0;
        /**最大垂直结束弧度（单位：2D弧度、3D弧度）*/
        this.maxVerticalEndRadian = 0;
        /**最小开始颜色*/
        this.minStartColor = new Float32Array([1, 1, 1, 1]);
        /**最大开始颜色*/
        this.maxStartColor = new Float32Array([1, 1, 1, 1]);
        /**最小结束颜色*/
        this.minEndColor = new Float32Array([1, 1, 1, 1]);
        /**最大结束颜色*/
        this.maxEndColor = new Float32Array([1, 1, 1, 1]);
        /**false代表RGBA整体插值，true代表RGBA逐分量插值*/
        this.colorComponentInter = false;
        /**false代表使用参数颜色数据，true代表使用原图颜色数据*/
        this.disableColor = false;
        /**混合模式，待调整，引擎中暂无BlendState抽象*/
        this.blendState = 0;
        //.........................................................3D发射器参数.........................................................
        /**发射器类型,"point","box","sphere","ring"*/
        this.emitterType = "null";
        /**发射器发射速率*/
        this.emissionRate = 0;
        /**点发射器位置*/
        this.pointEmitterPosition = new Float32Array([0, 0, 0]);
        /**点发射器位置随机值*/
        this.pointEmitterPositionVariance = new Float32Array([0, 0, 0]);
        /**点发射器速度*/
        this.pointEmitterVelocity = new Float32Array([0, 0, 0]);
        /**点发射器速度随机值*/
        this.pointEmitterVelocityAddVariance = new Float32Array([0, 0, 0]);
        /**盒发射器中心位置*/
        this.boxEmitterCenterPosition = new Float32Array([0, 0, 0]);
        /**盒发射器尺寸*/
        this.boxEmitterSize = new Float32Array([0, 0, 0]);
        /**盒发射器速度*/
        this.boxEmitterVelocity = new Float32Array([0, 0, 0]);
        /**盒发射器速度随机值*/
        this.boxEmitterVelocityAddVariance = new Float32Array([0, 0, 0]);
        /**球发射器中心位置*/
        this.sphereEmitterCenterPosition = new Float32Array([0, 0, 0]);
        /**球发射器半径*/
        this.sphereEmitterRadius = 1;
        /**球发射器速度*/
        this.sphereEmitterVelocity = 0;
        /**球发射器速度随机值*/
        this.sphereEmitterVelocityAddVariance = 0;
        /**环发射器中心位置*/
        this.ringEmitterCenterPosition = new Float32Array([0, 0, 0]);
        /**环发射器半径*/
        this.ringEmitterRadius = 30;
        /**环发射器速度*/
        this.ringEmitterVelocity = 0;
        /**环发射器速度随机值*/
        this.ringEmitterVelocityAddVariance = 0;
        /**环发射器up向量，0代表X轴,1代表Y轴,2代表Z轴*/
        this.ringEmitterUp = 2;
        //.........................................................3D发射器参数.........................................................
        //.........................................................2D发射器参数.........................................................
        /**发射器位置随机值,2D使用*/
        this.positionVariance = new Float32Array([0, 0, 0]);
    }
    static checkSetting(setting) {
        var key;
        for (key in ParticleSetting._defaultSetting) {
            if (!(key in setting)) {
                setting[key] = ParticleSetting._defaultSetting[key];
            }
        }
        //强转一下防止出错。这几个变量会直接传给shader，如果不是数字的话，有的runtime受不了（例如微信）
        setting.endVelocity = +setting.endVelocity;
        setting.gravity[0] = +setting.gravity[0];
        setting.gravity[1] = +setting.gravity[1];
        setting.gravity[2] = +setting.gravity[2];
    }
}
ParticleSetting._defaultSetting = new ParticleSetting();
