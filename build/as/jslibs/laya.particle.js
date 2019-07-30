(function (exports, parvs) {
	'use strict';

	var parvs__default = 'default' in parvs ? parvs['default'] : parvs;

	/**
	 *  @private
	 */
	class ParticleData {
	    constructor() {
	    }
	    static Create(settings, position, velocity, time) {
	        var particleData = new ParticleData();
	        particleData.position = position;
	        parvs.MathUtil.scaleVector3(velocity, settings.emitterVelocitySensitivity, ParticleData._tempVelocity);
	        var horizontalVelocity = parvs.MathUtil.lerp(settings.minHorizontalVelocity, settings.maxHorizontalVelocity, Math.random());
	        var horizontalAngle = Math.random() * Math.PI * 2;
	        ParticleData._tempVelocity[0] += horizontalVelocity * Math.cos(horizontalAngle);
	        ParticleData._tempVelocity[2] += horizontalVelocity * Math.sin(horizontalAngle);
	        ParticleData._tempVelocity[1] += parvs.MathUtil.lerp(settings.minVerticalVelocity, settings.maxVerticalVelocity, Math.random());
	        particleData.velocity = ParticleData._tempVelocity;
	        particleData.startColor = ParticleData._tempStartColor;
	        particleData.endColor = ParticleData._tempEndColor;
	        var i;
	        if (settings.disableColor) {
	            for (i = 0; i < 3; i++) {
	                particleData.startColor[i] = 1;
	                particleData.endColor[i] = 1;
	            }
	            particleData.startColor[i] = parvs.MathUtil.lerp(settings.minStartColor[i], settings.maxStartColor[i], Math.random()); //R、G、B、A插值
	            particleData.endColor[i] = parvs.MathUtil.lerp(settings.minEndColor[i], settings.maxEndColor[i], Math.random()); //R、G、B、A插值
	        }
	        else {
	            if (settings.colorComponentInter) {
	                for (i = 0; i < 4; i++) {
	                    particleData.startColor[i] = parvs.MathUtil.lerp(settings.minStartColor[i], settings.maxStartColor[i], Math.random()); //R、G、B、A插值
	                    particleData.endColor[i] = parvs.MathUtil.lerp(settings.minEndColor[i], settings.maxEndColor[i], Math.random()); //R、G、B、A插值
	                }
	            }
	            else {
	                parvs.MathUtil.lerpVector4(settings.minStartColor, settings.maxStartColor, Math.random(), particleData.startColor); //RGBA统一插值
	                parvs.MathUtil.lerpVector4(settings.minEndColor, settings.maxEndColor, Math.random(), particleData.endColor); //RGBA统一插值
	            }
	        }
	        particleData.sizeRotation = ParticleData._tempSizeRotation;
	        var sizeRandom = Math.random();
	        particleData.sizeRotation[0] = parvs.MathUtil.lerp(settings.minStartSize, settings.maxStartSize, sizeRandom); //StartSize
	        particleData.sizeRotation[1] = parvs.MathUtil.lerp(settings.minEndSize, settings.maxEndSize, sizeRandom); //EndSize
	        particleData.sizeRotation[2] = parvs.MathUtil.lerp(settings.minRotateSpeed, settings.maxRotateSpeed, Math.random()); //Rotation
	        particleData.radius = ParticleData._tempRadius;
	        var radiusRandom = Math.random();
	        particleData.radius[0] = parvs.MathUtil.lerp(settings.minStartRadius, settings.maxStartRadius, radiusRandom); //StartRadius
	        particleData.radius[1] = parvs.MathUtil.lerp(settings.minEndRadius, settings.maxEndRadius, radiusRandom); //EndRadius
	        particleData.radian = ParticleData._tempRadian;
	        particleData.radian[0] = parvs.MathUtil.lerp(settings.minHorizontalStartRadian, settings.maxHorizontalStartRadian, Math.random()); //StartHorizontalRadian
	        particleData.radian[1] = parvs.MathUtil.lerp(settings.minVerticalStartRadian, settings.maxVerticalStartRadian, Math.random()); //StartVerticleRadian
	        var useEndRadian = settings.useEndRadian;
	        particleData.radian[2] = useEndRadian ? parvs.MathUtil.lerp(settings.minHorizontalEndRadian, settings.maxHorizontalEndRadian, Math.random()) : particleData.radian[0]; //EndHorizontalRadian
	        particleData.radian[3] = useEndRadian ? parvs.MathUtil.lerp(settings.minVerticalEndRadian, settings.maxVerticalEndRadian, Math.random()) : particleData.radian[1]; //EndVerticleRadian
	        particleData.durationAddScale = settings.ageAddScale * Math.random();
	        particleData.time = time;
	        return particleData;
	    }
	}
	ParticleData._tempVelocity = new Float32Array(3);
	ParticleData._tempStartColor = new Float32Array(4);
	ParticleData._tempEndColor = new Float32Array(4);
	ParticleData._tempSizeRotation = new Float32Array(3);
	ParticleData._tempRadius = new Float32Array(2);
	ParticleData._tempRadian = new Float32Array(4);

	/**
	 *  @private
	 */
	class ParticleEmitter {
	    constructor(templet, particlesPerSecond, initialPosition) {
	        this._timeLeftOver = 0;
	        this._tempVelocity = new Float32Array([0, 0, 0]);
	        this._tempPosition = new Float32Array([0, 0, 0]);
	        this._templet = templet;
	        this._timeBetweenParticles = 1.0 / particlesPerSecond;
	        this._previousPosition = initialPosition;
	    }
	    update(elapsedTime, newPosition) {
	        elapsedTime = elapsedTime / 1000; //需秒为单位
	        if (elapsedTime > 0) {
	            parvs.MathUtil.subtractVector3(newPosition, this._previousPosition, this._tempVelocity);
	            parvs.MathUtil.scaleVector3(this._tempVelocity, 1 / elapsedTime, this._tempVelocity);
	            var timeToSpend = this._timeLeftOver + elapsedTime;
	            var currentTime = -this._timeLeftOver;
	            while (timeToSpend > this._timeBetweenParticles) {
	                currentTime += this._timeBetweenParticles;
	                timeToSpend -= this._timeBetweenParticles;
	                parvs.MathUtil.lerpVector3(this._previousPosition, newPosition, currentTime / elapsedTime, this._tempPosition);
	                this._templet.addParticleArray(this._tempPosition, this._tempVelocity);
	            }
	            this._timeLeftOver = timeToSpend;
	        }
	        this._previousPosition[0] = newPosition[0];
	        this._previousPosition[1] = newPosition[1];
	        this._previousPosition[2] = newPosition[2];
	    }
	}

	/**
	     * <code>ParticleSettings</code> 类是粒子配置数据类
	     */
	class ParticleSetting {
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

	/**
	 *
	 * <code>ParticleTemplateBase</code> 类是粒子模板基类
	 *
	 */
	class ParticleTemplateBase {
	    /**
	     * 创建一个新的 <code>ParticleTemplateBase</code> 类实例。
	     *
	     */
	    constructor() {
	    }
	    /**
	     * 添加一个粒子
	     * @param position 粒子位置
	     * @param velocity 粒子速度
	     *
	     */
	    addParticleArray(position, velocity) {
	    }
	}

	/**
	 *  @private
	 */
	class ParticleTemplateWebGL extends ParticleTemplateBase {
	    constructor(parSetting) {
	        super();
	        this._floatCountPerVertex = 29; //0~3为CornerTextureCoordinate,4~6为Position,7~9Velocity,10到13为StartColor,14到17为EndColor,18到20位SizeRotation，21到22位Radius,23到26位Radian，27为DurationAddScaleShaderValue,28为Time
	        this._firstActiveElement = 0;
	        this._firstNewElement = 0;
	        this._firstFreeElement = 0;
	        this._firstRetiredElement = 0;
	        /**@internal */
	        this._currentTime = 0;
	        this.settings = parSetting;
	    }
	    reUse(context, pos) {
	        return 0;
	    }
	    initialize() {
	        var floatStride = 0;
	        this._vertices = this._mesh._vb.getFloat32Array();
	        floatStride = this._mesh._stride / 4;
	        var bufi = 0;
	        var bufStart = 0;
	        for (var i = 0; i < this.settings.maxPartices; i++) {
	            var random = Math.random();
	            var cornerYSegement = this.settings.textureCount ? 1.0 / this.settings.textureCount : 1.0;
	            var cornerY;
	            for (cornerY = 0; cornerY < this.settings.textureCount; cornerY += cornerYSegement) {
	                if (random < cornerY + cornerYSegement)
	                    break;
	            }
	            this._vertices[bufi++] = -1;
	            this._vertices[bufi++] = -1;
	            this._vertices[bufi++] = 0;
	            this._vertices[bufi++] = cornerY;
	            bufi = (bufStart += floatStride);
	            this._vertices[bufi++] = 1;
	            this._vertices[bufi++] = -1;
	            this._vertices[bufi++] = 1;
	            this._vertices[bufi++] = cornerY;
	            bufi = bufStart += floatStride;
	            this._vertices[bufi++] = 1;
	            this._vertices[bufi++] = 1;
	            this._vertices[bufi++] = 1;
	            this._vertices[bufi++] = cornerY + cornerYSegement;
	            bufi = bufStart += floatStride;
	            this._vertices[bufi++] = -1;
	            this._vertices[bufi++] = 1;
	            this._vertices[bufi++] = 0;
	            this._vertices[bufi++] = cornerY + cornerYSegement;
	            bufi = bufStart += floatStride;
	        }
	    }
	    update(elapsedTime) {
	        this._currentTime += elapsedTime / 1000;
	        this.retireActiveParticles();
	        this.freeRetiredParticles();
	        if (this._firstActiveElement == this._firstFreeElement)
	            this._currentTime = 0;
	        if (this._firstRetiredElement == this._firstActiveElement)
	            this._drawCounter = 0;
	    }
	    retireActiveParticles() {
	        const epsilon = 0.0001;
	        var particleDuration = this.settings.duration;
	        while (this._firstActiveElement != this._firstNewElement) {
	            var offset = this._firstActiveElement * this._floatCountPerVertex * 4;
	            var index = offset + 28; //28为Time
	            var particleAge = this._currentTime - this._vertices[index];
	            particleAge *= (1.0 + this._vertices[offset + 27]); //真实时间
	            if (particleAge + epsilon < particleDuration)
	                break;
	            this._vertices[index] = this._drawCounter;
	            this._firstActiveElement++;
	            if (this._firstActiveElement >= this.settings.maxPartices)
	                this._firstActiveElement = 0;
	        }
	    }
	    freeRetiredParticles() {
	        while (this._firstRetiredElement != this._firstActiveElement) {
	            var age = this._drawCounter - this._vertices[this._firstRetiredElement * this._floatCountPerVertex * 4 + 28]; //28为Time
	            //GPU从不滞后于CPU两帧，出于显卡驱动BUG等安全因素考虑滞后三帧
	            if (age < 3)
	                break;
	            this._firstRetiredElement++;
	            if (this._firstRetiredElement >= this.settings.maxPartices)
	                this._firstRetiredElement = 0;
	        }
	    }
	    addNewParticlesToVertexBuffer() {
	    }
	    //由于循环队列判断算法，当下一个freeParticle等于retiredParticle时不添加例子，意味循环队列中永远有一个空位。（由于此判断算法快速、简单，所以放弃了使循环队列饱和的复杂算法（需判断freeParticle在retiredParticle前、后两种情况并不同处理））
	    /**
	     *
	     * @param position
	     * @param velocity
	     * @override
	     */
	    addParticleArray(position, velocity) {
	        var nextFreeParticle = this._firstFreeElement + 1;
	        if (nextFreeParticle >= this.settings.maxPartices)
	            nextFreeParticle = 0;
	        if (nextFreeParticle === this._firstRetiredElement)
	            return;
	        //计算vb数据，填入 _vertices
	        /**
	         * _mesh.addParticle(settings, position, velocity, _currentTime)
	         */
	        var particleData = ParticleData.Create(this.settings, position, velocity, this._currentTime);
	        var startIndex = this._firstFreeElement * this._floatCountPerVertex * 4;
	        for (var i = 0; i < 4; i++) {
	            var j, offset;
	            for (j = 0, offset = 4; j < 3; j++)
	                this._vertices[startIndex + i * this._floatCountPerVertex + offset + j] = particleData.position[j];
	            for (j = 0, offset = 7; j < 3; j++)
	                this._vertices[startIndex + i * this._floatCountPerVertex + offset + j] = particleData.velocity[j];
	            for (j = 0, offset = 10; j < 4; j++)
	                this._vertices[startIndex + i * this._floatCountPerVertex + offset + j] = particleData.startColor[j];
	            for (j = 0, offset = 14; j < 4; j++)
	                this._vertices[startIndex + i * this._floatCountPerVertex + offset + j] = particleData.endColor[j];
	            for (j = 0, offset = 18; j < 3; j++) //StartSize,EndSize,Rotation
	                this._vertices[startIndex + i * this._floatCountPerVertex + offset + j] = particleData.sizeRotation[j];
	            for (j = 0, offset = 21; j < 2; j++) //StartRadius,EndRadius
	                this._vertices[startIndex + i * this._floatCountPerVertex + offset + j] = particleData.radius[j];
	            for (j = 0, offset = 23; j < 4; j++) //StartHorizontalRadian,StartVerticleRadian,EndHorizontalRadian,EndVerticleRadian
	                this._vertices[startIndex + i * this._floatCountPerVertex + offset + j] = particleData.radian[j];
	            this._vertices[startIndex + i * this._floatCountPerVertex + 27] = particleData.durationAddScale;
	            this._vertices[startIndex + i * this._floatCountPerVertex + 28] = particleData.time;
	        }
	        this._firstFreeElement = nextFreeParticle;
	    }
	}

	/**
	 *  @private
	 */
	class ParticleShader extends parvs.Shader {
	    //TODO:coverage
	    constructor() {
	        super(parvs__default, parvs__default, "ParticleShader", null, ['a_CornerTextureCoordinate', 0, 'a_Position', 1, 'a_Velocity', 2, 'a_StartColor', 3,
	            'a_EndColor', 4, 'a_SizeRotation', 5, 'a_Radius', 6, 'a_Radian', 7, 'a_AgeAddScale', 8, 'a_Time', 9]);
	    }
	}
	ParticleShader.vs = parvs__default; // this.__INCLUDESTR__("files/Particle.vs");
	ParticleShader.ps = parvs__default; //this.__INCLUDESTR__("files/Particle.ps");

	/**
	 *  @internal
	 */
	class ParticleShaderValue extends parvs.Value2D {
	    constructor() {
	        super(0, 0);
	        if (!ParticleShaderValue.pShader) {
	            ParticleShaderValue.pShader = new ParticleShader();
	        }
	        /* �ŵ� ParticleShader ����
	        this._attribLocation = ['a_CornerTextureCoordinate', 0, 'a_Position', 1, 'a_Velocity', 2, 'a_StartColor', 3,
	                                'a_EndColor',4,'a_SizeRotation',5,'a_Radius',6,'a_Radian',7,'a_AgeAddScale',8,'a_Time',9];
	        */
	    }
	    /**
	     * @override
	     */
	    upload() {
	        var size = this.size;
	        size[0] = parvs.RenderState2D.width;
	        size[1] = parvs.RenderState2D.height;
	        this.alpha = this.ALPHA * parvs.RenderState2D.worldAlpha;
	        ParticleShaderValue.pShader.upload(this);
	    }
	}
	ParticleShaderValue.pShader = null; //new ParticleShader();

	/**
	 *  @internal
	 */
	class ParticleTemplate2D extends ParticleTemplateWebGL {
	    constructor(parSetting) {
	        super(parSetting);
	        this.x = 0;
	        this.y = 0;
	        this.sv = new ParticleShaderValue();
	        /**@internal */
	        this._key = {};
	        var _this = this;
	        parvs.ILaya.loader.load(this.settings.textureName, parvs.Handler.create(null, function (texture) {
	            _this.texture = texture;
	        }));
	        this.sv.u_Duration = this.settings.duration;
	        this.sv.u_Gravity = this.settings.gravity;
	        this.sv.u_EndVelocity = this.settings.endVelocity;
	        this._blendFn = parvs.BlendMode.fns[parSetting.blendState]; //context._targets?BlendMode.targetFns[blendType]:BlendMode.fns[blendType];
	        this._mesh = parvs.MeshParticle2D.getAMesh(this.settings.maxPartices);
	        this.initialize();
	        //_vertexBuffer =_vertexBuffer2D= VertexBuffer2D.create( -1, WebGLContext.DYNAMIC_DRAW);
	        //_indexBuffer = _indexBuffer2D=IndexBuffer2D.create(WebGLContext.STATIC_DRAW );
	        //loadContent();
	    }
	    getRenderType() { return -111; }
	    releaseRender() { }
	    /**
	     *
	     * @param position
	     * @param velocity
	     * @override
	     */
	    addParticleArray(position, velocity) {
	        // TODO Auto Generated method stub
	        position[0] += this.x;
	        position[1] += this.y;
	        super.addParticleArray(position, velocity);
	    }
	    /*
	    override protected function loadContent():void
	    {
	        var indexes:Uint16Array = new Uint16Array(settings.maxPartices * 6);
	        
	        for (var i:int = 0; i < settings.maxPartices; i++) {
	            indexes[i * 6 + 0] = (i * 4 + 0);
	            indexes[i * 6 + 1] = (i * 4 + 1);
	            indexes[i * 6 + 2] = (i * 4 + 2);
	            
	            indexes[i * 6 + 3] = (i * 4 + 0);
	            indexes[i * 6 + 4] = (i * 4 + 2);
	            indexes[i * 6 + 5] = (i * 4 + 3);
	        }
	        
	        _indexBuffer2D.clear();
	        _indexBuffer2D.append(indexes);
	        _indexBuffer2D.upload();
	    }
	    */
	    /**
	     * @override
	     */
	    addNewParticlesToVertexBuffer() {
	        var _vertexBuffer2D = this._mesh._vb;
	        _vertexBuffer2D.clear();
	        _vertexBuffer2D.append(this._vertices);
	        var start;
	        if (this._firstNewElement < this._firstFreeElement) {
	            // 如果新增加的粒子在Buffer中是连续的区域，只upload一次
	            start = this._firstNewElement * 4 * this._floatCountPerVertex * 4;
	            _vertexBuffer2D.subUpload(start, start, start + (this._firstFreeElement - this._firstNewElement) * 4 * this._floatCountPerVertex * 4);
	        }
	        else {
	            //如果新增粒子区域超过Buffer末尾则循环到开头，需upload两次
	            start = this._firstNewElement * 4 * this._floatCountPerVertex * 4;
	            _vertexBuffer2D.subUpload(start, start, start + (this.settings.maxPartices - this._firstNewElement) * 4 * this._floatCountPerVertex * 4);
	            if (this._firstFreeElement > 0) {
	                _vertexBuffer2D.setNeedUpload();
	                _vertexBuffer2D.subUpload(0, 0, this._firstFreeElement * 4 * this._floatCountPerVertex * 4);
	            }
	        }
	        this._firstNewElement = this._firstFreeElement;
	    }
	    renderSubmit() {
	        if (this.texture && this.texture.getIsReady()) {
	            this.update(parvs.ILaya.timer._delta);
	            this.sv.u_CurrentTime = this._currentTime;
	            if (this._firstNewElement != this._firstFreeElement) {
	                this.addNewParticlesToVertexBuffer();
	            }
	            this.blend();
	            if (this._firstActiveElement != this._firstFreeElement) {
	                var gl = parvs.WebGLContext.mainContext;
	                this._mesh.useMesh(gl);
	                //_vertexBuffer2D.bind();
	                //_indexBuffer2D.bind();
	                this.sv.u_texture = this.texture._getSource();
	                this.sv.upload();
	                if (this._firstActiveElement < this._firstFreeElement) {
	                    gl.drawElements(gl.TRIANGLES, (this._firstFreeElement - this._firstActiveElement) * 6, gl.UNSIGNED_SHORT, this._firstActiveElement * 6 * 2);
	                }
	                else {
	                    parvs.WebGLContext.mainContext.drawElements(gl.TRIANGLES, (this.settings.maxPartices - this._firstActiveElement) * 6, gl.UNSIGNED_SHORT, this._firstActiveElement * 6 * 2);
	                    if (this._firstFreeElement > 0)
	                        gl.drawElements(gl.TRIANGLES, this._firstFreeElement * 6, gl.UNSIGNED_SHORT, 0);
	                }
	                parvs.Stat.renderBatches++;
	            }
	            this._drawCounter++;
	        }
	        return 1;
	    }
	    updateParticleForNative() {
	        if (this.texture && this.texture.getIsReady()) {
	            this.update(parvs.ILaya.timer._delta);
	            this.sv.u_CurrentTime = this._currentTime;
	            if (this._firstNewElement != this._firstFreeElement) {
	                this._firstNewElement = this._firstFreeElement;
	            }
	        }
	    }
	    getMesh() {
	        return this._mesh;
	    }
	    getConchMesh() {
	        return this._conchMesh;
	    }
	    getFirstNewElement() {
	        return this._firstNewElement;
	    }
	    getFirstFreeElement() {
	        return this._firstFreeElement;
	    }
	    getFirstActiveElement() {
	        return this._firstActiveElement;
	    }
	    getFirstRetiredElement() {
	        return this._firstRetiredElement;
	    }
	    setFirstFreeElement(_value) {
	        this._firstFreeElement = _value;
	    }
	    setFirstNewElement(_value) {
	        this._firstNewElement = _value;
	    }
	    addDrawCounter() {
	        this._drawCounter++;
	    }
	    blend() {
	        if (parvs.BlendMode.activeBlendFunction !== this._blendFn) {
	            var gl = parvs.WebGLContext.mainContext;
	            gl.enable(gl.BLEND);
	            this._blendFn(gl);
	            parvs.BlendMode.activeBlendFunction = this._blendFn;
	        }
	    }
	    dispose() {
	        //_vertexBuffer2D.dispose();
	        //_indexBuffer2D.dispose();
	        this._mesh.releaseMesh(); //TODO 什么时候调用。
	    }
	}
	//private var _vertexBuffer2D:VertexBuffer2D;
	//private var _indexBuffer2D:IndexBuffer2D;
	ParticleTemplate2D.activeBlendType = -1;

	/**
	 * <code>EmitterBase</code> 类是粒子发射器类
	 */
	class EmitterBase {
	    constructor() {
	        /**
	         * 积累的帧时间
	         */
	        this._frameTime = 0;
	        /**
	         * 粒子发射速率
	         */
	        this._emissionRate = 60; // emitted particles per second
	        /**
	         * 当前剩余发射时间
	         */
	        this._emissionTime = 0;
	        /**
	         * 发射粒子最小时间间隔
	         */
	        this.minEmissionTime = 1 / 60;
	    }
	    /**
	     * 设置粒子粒子模板
	     * @param particleTemplate 粒子模板
	     *
	     */
	    set particleTemplate(particleTemplate) {
	        this._particleTemplate = particleTemplate;
	    }
	    /**
	     * 设置粒子发射速率
	     * @param emissionRate 粒子发射速率 (个/秒)
	     */
	    set emissionRate(_emissionRate) {
	        if (_emissionRate <= 0)
	            return;
	        this._emissionRate = _emissionRate;
	        (_emissionRate > 0) && (this.minEmissionTime = 1 / _emissionRate);
	    }
	    /**
	     * 获取粒子发射速率
	     * @return 发射速率  粒子发射速率 (个/秒)
	     */
	    get emissionRate() {
	        return this._emissionRate;
	    }
	    /**
	     * 开始发射粒子
	     * @param duration 发射持续的时间(秒)
	     */
	    start(duration = Number.MAX_VALUE) {
	        if (this._emissionRate != 0)
	            this._emissionTime = duration;
	    }
	    /**
	     * 停止发射粒子
	     * @param clearParticles 是否清理当前的粒子
	     */
	    stop() {
	        this._emissionTime = 0;
	    }
	    /**
	     * 清理当前的活跃粒子
	     * @param clearTexture 是否清理贴图数据,若清除贴图数据将无法再播放
	     */
	    clear() {
	        this._emissionTime = 0;
	    }
	    /**
	     * 发射一个粒子
	     *
	     */
	    emit() {
	    }
	    /**
	     * 时钟前进
	     * @param passedTime 前进时间
	     *
	     */
	    advanceTime(passedTime = 1) {
	        this._emissionTime -= passedTime;
	        if (this._emissionTime < 0)
	            return;
	        this._frameTime += passedTime;
	        if (this._frameTime < this.minEmissionTime)
	            return;
	        while (this._frameTime > this.minEmissionTime) {
	            this._frameTime -= this.minEmissionTime;
	            this.emit();
	        }
	    }
	}

	/**
	 *
	 * @private
	 */
	class Emitter2D extends EmitterBase {
	    constructor(_template) {
	        super();
	        this.template = _template;
	    }
	    set template(template) {
	        this._particleTemplate = template;
	        if (!template) {
	            this._emitFun = null;
	            this.setting = null;
	            this._posRange = null;
	        }
	        this.setting = template.settings;
	        this._posRange = this.setting.positionVariance;
	        if (this._particleTemplate instanceof ParticleTemplate2D) {
	            this._emitFun = this.webGLEmit;
	        }
	    }
	    get template() {
	        return this._particleTemplate;
	    }
	    /**
	     * @override
	     */
	    emit() {
	        super.emit();
	        if (this._emitFun != null)
	            this._emitFun();
	    }
	    getRandom(value) {
	        return (Math.random() * 2 - 1) * value;
	    }
	    webGLEmit() {
	        var pos = new Float32Array(3);
	        pos[0] = this.getRandom(this._posRange[0]);
	        pos[1] = this.getRandom(this._posRange[1]);
	        pos[2] = this.getRandom(this._posRange[2]);
	        var v = new Float32Array(3);
	        v[0] = 0;
	        v[1] = 0;
	        v[2] = 0;
	        this._particleTemplate.addParticleArray(pos, v);
	    }
	    canvasEmit() {
	        var pos = new Float32Array(3);
	        pos[0] = this.getRandom(this._posRange[0]);
	        pos[1] = this.getRandom(this._posRange[1]);
	        pos[2] = this.getRandom(this._posRange[2]);
	        var v = new Float32Array(3);
	        v[0] = 0;
	        v[1] = 0;
	        v[2] = 0;
	        this._particleTemplate.addParticleArray(pos, v);
	    }
	}

	/**
	 * <code>Particle2D</code> 类是2D粒子播放类
	 *
	 */
	class Particle2D extends parvs.Sprite {
	    /**
	     * 创建一个新的 <code>Particle2D</code> 类实例。
	     * @param setting 粒子配置数据
	     */
	    constructor(setting) {
	        super();
	        /**@private */
	        this._matrix4 = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]); //默认4x4矩阵
	        /**是否自动播放*/
	        this.autoPlay = true;
	        this.customRenderEnable = true;
	        if (setting)
	            this.setParticleSetting(setting);
	    }
	    /**
	     * 设置 粒子文件地址
	     * @param path 粒子文件地址
	     */
	    set url(url) {
	        this.load(url);
	    }
	    /**
	     * 加载粒子文件
	     * @param url 粒子文件地址
	     */
	    load(url) {
	        parvs.ILaya.loader.load(url, parvs.Handler.create(this, this.setParticleSetting), null, parvs.ILaya.Loader.JSON);
	    }
	    /**
	     * 设置粒子配置数据
	     * @param settings 粒子配置数据
	     */
	    setParticleSetting(setting) {
	        if (!setting)
	            return this.stop();
	        ParticleSetting.checkSetting(setting);
	        this.customRenderEnable = true; //设置custom渲染
	        this._particleTemplate = new ParticleTemplate2D(setting);
	        //this.graphics._saveToCmd(Render.context._drawParticle, [_particleTemplate]);
	        this.graphics._saveToCmd(null, parvs.DrawParticleCmd.create(this._particleTemplate));
	        // canvas 不支持
	        if (!this._emitter) {
	            this._emitter = new Emitter2D(this._particleTemplate);
	        }
	        else {
	            this._emitter.template = this._particleTemplate;
	        }
	        if (this.autoPlay) {
	            this.emitter.start();
	            this.play();
	        }
	    }
	    /**
	     * 获取粒子发射器
	     */
	    get emitter() {
	        return this._emitter;
	    }
	    /**
	     * 播放
	     */
	    play() {
	        parvs.ILaya.timer.frameLoop(1, this, this._loop);
	    }
	    /**
	     * 停止
	     */
	    stop() {
	        parvs.ILaya.timer.clear(this, this._loop);
	    }
	    /**@private */
	    _loop() {
	        this.advanceTime(1 / 60);
	    }
	    /**
	     * 时钟前进
	     * @param passedTime 时钟前进时间
	     */
	    advanceTime(passedTime = 1) {
	        if (this._canvasTemplate) {
	            this._canvasTemplate.advanceTime(passedTime);
	        }
	        if (this._emitter) {
	            this._emitter.advanceTime(passedTime);
	        }
	    }
	    /**
	     *
	     * @param context
	     * @param x
	     * @param y
	     * @override
	     */
	    customRender(context, x, y) {
	        this._matrix4[0] = context._curMat.a;
	        this._matrix4[1] = context._curMat.b;
	        this._matrix4[4] = context._curMat.c;
	        this._matrix4[5] = context._curMat.d;
	        this._matrix4[12] = context._curMat.tx;
	        this._matrix4[13] = context._curMat.ty;
	        var sv = this._particleTemplate.sv;
	        sv.u_mmat = this._matrix4;
	        if (this._canvasTemplate) {
	            this._canvasTemplate.render(context, x, y);
	        }
	    }
	    /**
	     *
	     * @param destroyChild
	     * @override
	     */
	    destroy(destroyChild = true) {
	        if (this._particleTemplate instanceof ParticleTemplate2D)
	            this._particleTemplate.dispose();
	        super.destroy(destroyChild);
	    }
	}
	parvs.ILaya.regClass(Particle2D);

	exports.Emitter2D = Emitter2D;
	exports.EmitterBase = EmitterBase;
	exports.Particle2D = Particle2D;
	exports.ParticleData = ParticleData;
	exports.ParticleEmitter = ParticleEmitter;
	exports.ParticleSetting = ParticleSetting;
	exports.ParticleShader = ParticleShader;
	exports.ParticleShaderValue = ParticleShaderValue;
	exports.ParticleTemplate2D = ParticleTemplate2D;
	exports.ParticleTemplateBase = ParticleTemplateBase;
	exports.ParticleTemplateWebGL = ParticleTemplateWebGL;

}(window.Laya = window.Laya|| {}, Laya));
