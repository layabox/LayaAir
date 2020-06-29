(function (exports, Laya) {
    'use strict';

    class ParticleSetting {
        constructor() {
            this.textureName = null;
            this.textureCount = 1;
            this.maxPartices = 100;
            this.duration = 1;
            this.ageAddScale = 0;
            this.emitterVelocitySensitivity = 1;
            this.minStartSize = 100;
            this.maxStartSize = 100;
            this.minEndSize = 100;
            this.maxEndSize = 100;
            this.minHorizontalVelocity = 0;
            this.maxHorizontalVelocity = 0;
            this.minVerticalVelocity = 0;
            this.maxVerticalVelocity = 0;
            this.endVelocity = 1;
            this.gravity = new Float32Array([0, 0, 0]);
            this.minRotateSpeed = 0;
            this.maxRotateSpeed = 0;
            this.minStartRadius = 0;
            this.maxStartRadius = 0;
            this.minEndRadius = 0;
            this.maxEndRadius = 0;
            this.minHorizontalStartRadian = 0;
            this.maxHorizontalStartRadian = 0;
            this.minVerticalStartRadian = 0;
            this.maxVerticalStartRadian = 0;
            this.useEndRadian = true;
            this.minHorizontalEndRadian = 0;
            this.maxHorizontalEndRadian = 0;
            this.minVerticalEndRadian = 0;
            this.maxVerticalEndRadian = 0;
            this.minStartColor = new Float32Array([1, 1, 1, 1]);
            this.maxStartColor = new Float32Array([1, 1, 1, 1]);
            this.minEndColor = new Float32Array([1, 1, 1, 1]);
            this.maxEndColor = new Float32Array([1, 1, 1, 1]);
            this.colorComponentInter = false;
            this.disableColor = false;
            this.blendState = 0;
            this.emitterType = "null";
            this.emissionRate = 0;
            this.pointEmitterPosition = new Float32Array([0, 0, 0]);
            this.pointEmitterPositionVariance = new Float32Array([0, 0, 0]);
            this.pointEmitterVelocity = new Float32Array([0, 0, 0]);
            this.pointEmitterVelocityAddVariance = new Float32Array([0, 0, 0]);
            this.boxEmitterCenterPosition = new Float32Array([0, 0, 0]);
            this.boxEmitterSize = new Float32Array([0, 0, 0]);
            this.boxEmitterVelocity = new Float32Array([0, 0, 0]);
            this.boxEmitterVelocityAddVariance = new Float32Array([0, 0, 0]);
            this.sphereEmitterCenterPosition = new Float32Array([0, 0, 0]);
            this.sphereEmitterRadius = 1;
            this.sphereEmitterVelocity = 0;
            this.sphereEmitterVelocityAddVariance = 0;
            this.ringEmitterCenterPosition = new Float32Array([0, 0, 0]);
            this.ringEmitterRadius = 30;
            this.ringEmitterVelocity = 0;
            this.ringEmitterVelocityAddVariance = 0;
            this.ringEmitterUp = 2;
            this.positionVariance = new Float32Array([0, 0, 0]);
        }
        static checkSetting(setting) {
            var key;
            for (key in ParticleSetting._defaultSetting) {
                if (!(key in setting)) {
                    setting[key] = ParticleSetting._defaultSetting[key];
                }
            }
            setting.endVelocity = +setting.endVelocity;
            setting.gravity[0] = +setting.gravity[0];
            setting.gravity[1] = +setting.gravity[1];
            setting.gravity[2] = +setting.gravity[2];
        }
    }
    ParticleSetting._defaultSetting = new ParticleSetting();

    class ParticleTemplateBase {
        constructor() {
        }
        addParticleArray(position, velocity) {
        }
    }

    class ParticleData {
        constructor() {
        }
        static Create(settings, position, velocity, time) {
            var particleData = new ParticleData();
            particleData.position = position;
            Laya.MathUtil.scaleVector3(velocity, settings.emitterVelocitySensitivity, ParticleData._tempVelocity);
            var horizontalVelocity = Laya.MathUtil.lerp(settings.minHorizontalVelocity, settings.maxHorizontalVelocity, Math.random());
            var horizontalAngle = Math.random() * Math.PI * 2;
            ParticleData._tempVelocity[0] += horizontalVelocity * Math.cos(horizontalAngle);
            ParticleData._tempVelocity[2] += horizontalVelocity * Math.sin(horizontalAngle);
            ParticleData._tempVelocity[1] += Laya.MathUtil.lerp(settings.minVerticalVelocity, settings.maxVerticalVelocity, Math.random());
            particleData.velocity = ParticleData._tempVelocity;
            particleData.startColor = ParticleData._tempStartColor;
            particleData.endColor = ParticleData._tempEndColor;
            var i;
            if (settings.disableColor) {
                for (i = 0; i < 3; i++) {
                    particleData.startColor[i] = 1;
                    particleData.endColor[i] = 1;
                }
                particleData.startColor[i] = Laya.MathUtil.lerp(settings.minStartColor[i], settings.maxStartColor[i], Math.random());
                particleData.endColor[i] = Laya.MathUtil.lerp(settings.minEndColor[i], settings.maxEndColor[i], Math.random());
            }
            else {
                if (settings.colorComponentInter) {
                    for (i = 0; i < 4; i++) {
                        particleData.startColor[i] = Laya.MathUtil.lerp(settings.minStartColor[i], settings.maxStartColor[i], Math.random());
                        particleData.endColor[i] = Laya.MathUtil.lerp(settings.minEndColor[i], settings.maxEndColor[i], Math.random());
                    }
                }
                else {
                    Laya.MathUtil.lerpVector4(settings.minStartColor, settings.maxStartColor, Math.random(), particleData.startColor);
                    Laya.MathUtil.lerpVector4(settings.minEndColor, settings.maxEndColor, Math.random(), particleData.endColor);
                }
            }
            particleData.sizeRotation = ParticleData._tempSizeRotation;
            var sizeRandom = Math.random();
            particleData.sizeRotation[0] = Laya.MathUtil.lerp(settings.minStartSize, settings.maxStartSize, sizeRandom);
            particleData.sizeRotation[1] = Laya.MathUtil.lerp(settings.minEndSize, settings.maxEndSize, sizeRandom);
            particleData.sizeRotation[2] = Laya.MathUtil.lerp(settings.minRotateSpeed, settings.maxRotateSpeed, Math.random());
            particleData.radius = ParticleData._tempRadius;
            var radiusRandom = Math.random();
            particleData.radius[0] = Laya.MathUtil.lerp(settings.minStartRadius, settings.maxStartRadius, radiusRandom);
            particleData.radius[1] = Laya.MathUtil.lerp(settings.minEndRadius, settings.maxEndRadius, radiusRandom);
            particleData.radian = ParticleData._tempRadian;
            particleData.radian[0] = Laya.MathUtil.lerp(settings.minHorizontalStartRadian, settings.maxHorizontalStartRadian, Math.random());
            particleData.radian[1] = Laya.MathUtil.lerp(settings.minVerticalStartRadian, settings.maxVerticalStartRadian, Math.random());
            var useEndRadian = settings.useEndRadian;
            particleData.radian[2] = useEndRadian ? Laya.MathUtil.lerp(settings.minHorizontalEndRadian, settings.maxHorizontalEndRadian, Math.random()) : particleData.radian[0];
            particleData.radian[3] = useEndRadian ? Laya.MathUtil.lerp(settings.minVerticalEndRadian, settings.maxVerticalEndRadian, Math.random()) : particleData.radian[1];
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

    class ParticleTemplateWebGL extends ParticleTemplateBase {
        constructor(parSetting) {
            super();
            this._floatCountPerVertex = 29;
            this._firstActiveElement = 0;
            this._firstNewElement = 0;
            this._firstFreeElement = 0;
            this._firstRetiredElement = 0;
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
                var index = offset + 28;
                var particleAge = this._currentTime - this._vertices[index];
                particleAge *= (1.0 + this._vertices[offset + 27]);
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
                var age = this._drawCounter - this._vertices[this._firstRetiredElement * this._floatCountPerVertex * 4 + 28];
                if (age < 3)
                    break;
                this._firstRetiredElement++;
                if (this._firstRetiredElement >= this.settings.maxPartices)
                    this._firstRetiredElement = 0;
            }
        }
        addNewParticlesToVertexBuffer() {
        }
        addParticleArray(position, velocity) {
            var nextFreeParticle = this._firstFreeElement + 1;
            if (nextFreeParticle >= this.settings.maxPartices)
                nextFreeParticle = 0;
            if (nextFreeParticle === this._firstRetiredElement)
                return;
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
                for (j = 0, offset = 18; j < 3; j++)
                    this._vertices[startIndex + i * this._floatCountPerVertex + offset + j] = particleData.sizeRotation[j];
                for (j = 0, offset = 21; j < 2; j++)
                    this._vertices[startIndex + i * this._floatCountPerVertex + offset + j] = particleData.radius[j];
                for (j = 0, offset = 23; j < 4; j++)
                    this._vertices[startIndex + i * this._floatCountPerVertex + offset + j] = particleData.radian[j];
                this._vertices[startIndex + i * this._floatCountPerVertex + 27] = particleData.durationAddScale;
                this._vertices[startIndex + i * this._floatCountPerVertex + 28] = particleData.time;
            }
            this._firstFreeElement = nextFreeParticle;
        }
    }

    var parvs = "attribute vec4 a_CornerTextureCoordinate;\r\nattribute vec3 a_Position;\r\nattribute vec3 a_Velocity;\r\nattribute vec4 a_StartColor;\r\nattribute vec4 a_EndColor;\r\nattribute vec3 a_SizeRotation;\r\nattribute vec2 a_Radius;\r\nattribute vec4 a_Radian;\r\nattribute float a_AgeAddScale;\r\nattribute float a_Time;\r\n\r\nvarying vec4 v_Color;\r\nvarying vec2 v_TextureCoordinate;\r\n\r\nuniform float u_CurrentTime;\r\nuniform float u_Duration;\r\nuniform float u_EndVelocity;\r\nuniform vec3 u_Gravity;\r\n\r\nuniform vec2 size;\r\nuniform mat4 u_mmat;\r\n\r\nvec4 ComputeParticlePosition(in vec3 position, in vec3 velocity,in float age,in float normalizedAge)\r\n{\r\n\r\n   float startVelocity = length(velocity);//起始标量速度\r\n   float endVelocity = startVelocity * u_EndVelocity;//结束标量速度\r\n\r\n   float velocityIntegral = startVelocity * normalizedAge +(endVelocity - startVelocity) * normalizedAge *normalizedAge/2.0;//计算当前速度的标量（单位空间），vt=v0*t+(1/2)*a*(t^2)\r\n   \r\n   vec3 addPosition = normalize(velocity) * velocityIntegral * u_Duration;//计算受自身速度影响的位置，转换标量到矢量    \r\n   addPosition += u_Gravity * age * normalizedAge;//计算受重力影响的位置\r\n   \r\n   float radius=mix(a_Radius.x, a_Radius.y, normalizedAge); //计算粒子受半径和角度影响（无需计算角度和半径时，可用宏定义优化屏蔽此计算）\r\n   float radianHorizontal =mix(a_Radian.x,a_Radian.z,normalizedAge);\r\n   float radianVertical =mix(a_Radian.y,a_Radian.w,normalizedAge);\r\n   \r\n   float r =cos(radianVertical)* radius;\r\n   addPosition.y += sin(radianVertical) * radius;\r\n\t\r\n   addPosition.x += cos(radianHorizontal) *r;\r\n   addPosition.z += sin(radianHorizontal) *r;\r\n  \r\n   addPosition.y=-addPosition.y;//2D粒子位置更新需要取负，2D粒子坐标系Y轴正向朝上\r\n   position+=addPosition;\r\n   return  vec4(position,1.0);\r\n}\r\n\r\nfloat ComputeParticleSize(in float startSize,in float endSize, in float normalizedAge)\r\n{    \r\n    float size = mix(startSize, endSize, normalizedAge);\r\n    return size;\r\n}\r\n\r\nmat2 ComputeParticleRotation(in float rot,in float age)\r\n{    \r\n    float rotation =rot * age;\r\n    //计算2x2旋转矩阵.\r\n    float c = cos(rotation);\r\n    float s = sin(rotation);\r\n    return mat2(c, -s, s, c);\r\n}\r\n\r\nvec4 ComputeParticleColor(in vec4 startColor,in vec4 endColor,in float normalizedAge)\r\n{\r\n\tvec4 color=mix(startColor,endColor,normalizedAge);\r\n    //硬编码设置，使粒子淡入很快，淡出很慢,6.7的缩放因子把置归一在0到1之间，可以谷歌x*(1-x)*(1-x)*6.7的制图表\r\n    color.a *= normalizedAge * (1.0-normalizedAge) * (1.0-normalizedAge) * 6.7;\r\n   \r\n    return color;\r\n}\r\n\r\nvoid main()\r\n{\r\n   float age = u_CurrentTime - a_Time;\r\n   age *= 1.0 + a_AgeAddScale;\r\n   float normalizedAge = clamp(age / u_Duration,0.0,1.0);\r\n   gl_Position = ComputeParticlePosition(a_Position, a_Velocity, age, normalizedAge);//计算粒子位置\r\n   float pSize = ComputeParticleSize(a_SizeRotation.x,a_SizeRotation.y, normalizedAge);\r\n   mat2 rotation = ComputeParticleRotation(a_SizeRotation.z, age);\r\n\t\r\n    mat4 mat=u_mmat;\r\n    gl_Position=vec4((mat*gl_Position).xy,0.0,1.0);\r\n    gl_Position.xy += (rotation*a_CornerTextureCoordinate.xy) * pSize*vec2(mat[0][0],mat[1][1]);\r\n    gl_Position=vec4((gl_Position.x/size.x-0.5)*2.0,(0.5-gl_Position.y/size.y)*2.0,0.0,1.0);\r\n   \r\n   v_Color = ComputeParticleColor(a_StartColor,a_EndColor, normalizedAge);\r\n   v_TextureCoordinate =a_CornerTextureCoordinate.zw;\r\n}\r\n\r\n";

    var parps = "#ifdef GL_FRAGMENT_PRECISION_HIGH\r\nprecision highp float;\r\n#else\r\nprecision mediump float;\r\n#endif\r\n\r\nvarying vec4 v_Color;\r\nvarying vec2 v_TextureCoordinate;\r\nuniform sampler2D u_texture;\r\n\r\nvoid main()\r\n{\t\r\n\tgl_FragColor=texture2D(u_texture,v_TextureCoordinate)*v_Color;\r\n\tgl_FragColor.xyz *= v_Color.w;\r\n}";

    class ParticleShader extends Laya.Shader {
        constructor() {
            super(parvs, parps, "ParticleShader", null, ['a_CornerTextureCoordinate', 0, 'a_Position', 1, 'a_Velocity', 2, 'a_StartColor', 3,
                'a_EndColor', 4, 'a_SizeRotation', 5, 'a_Radius', 6, 'a_Radian', 7, 'a_AgeAddScale', 8, 'a_Time', 9]);
        }
    }
    ParticleShader.vs = parvs;
    ParticleShader.ps = parps;

    class ParticleShaderValue extends Laya.Value2D {
        constructor() {
            super(0, 0);
            if (!ParticleShaderValue.pShader) {
                ParticleShaderValue.pShader = new ParticleShader();
            }
        }
        upload() {
            var size = this.size;
            size[0] = Laya.RenderState2D.width;
            size[1] = Laya.RenderState2D.height;
            this.alpha = this.ALPHA * Laya.RenderState2D.worldAlpha;
            ParticleShaderValue.pShader.upload(this);
        }
    }
    ParticleShaderValue.pShader = null;

    class ParticleTemplate2D extends ParticleTemplateWebGL {
        constructor(parSetting) {
            super(parSetting);
            this.x = 0;
            this.y = 0;
            this.sv = new ParticleShaderValue();
            this._key = {};
            var _this = this;
            Laya.ILaya.loader.load(this.settings.textureName, Laya.Handler.create(null, function (texture) {
                _this.texture = texture;
            }), null, Laya.Loader.IMAGE);
            this.sv.u_Duration = this.settings.duration;
            this.sv.u_Gravity = this.settings.gravity;
            this.sv.u_EndVelocity = this.settings.endVelocity;
            this._blendFn = Laya.BlendMode.fns[parSetting.blendState];
            this._mesh = Laya.MeshParticle2D.getAMesh(this.settings.maxPartices);
            this.initialize();
        }
        getRenderType() { return -111; }
        releaseRender() { }
        addParticleArray(position, velocity) {
            position[0] += this.x;
            position[1] += this.y;
            super.addParticleArray(position, velocity);
        }
        addNewParticlesToVertexBuffer() {
            var _vertexBuffer2D = this._mesh._vb;
            _vertexBuffer2D.clear();
            _vertexBuffer2D.append(this._vertices);
            var start;
            if (this._firstNewElement < this._firstFreeElement) {
                start = this._firstNewElement * 4 * this._floatCountPerVertex * 4;
                _vertexBuffer2D.subUpload(start, start, start + (this._firstFreeElement - this._firstNewElement) * 4 * this._floatCountPerVertex * 4);
            }
            else {
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
                this.update(Laya.ILaya.timer._delta);
                this.sv.u_CurrentTime = this._currentTime;
                if (this._firstNewElement != this._firstFreeElement) {
                    this.addNewParticlesToVertexBuffer();
                }
                this.blend();
                if (this._firstActiveElement != this._firstFreeElement) {
                    var gl = Laya.WebGLContext.mainContext;
                    this._mesh.useMesh(gl);
                    this.sv.u_texture = this.texture._getSource();
                    this.sv.upload();
                    if (this._firstActiveElement < this._firstFreeElement) {
                        gl.drawElements(gl.TRIANGLES, (this._firstFreeElement - this._firstActiveElement) * 6, gl.UNSIGNED_SHORT, this._firstActiveElement * 6 * 2);
                    }
                    else {
                        Laya.WebGLContext.mainContext.drawElements(gl.TRIANGLES, (this.settings.maxPartices - this._firstActiveElement) * 6, gl.UNSIGNED_SHORT, this._firstActiveElement * 6 * 2);
                        if (this._firstFreeElement > 0)
                            gl.drawElements(gl.TRIANGLES, this._firstFreeElement * 6, gl.UNSIGNED_SHORT, 0);
                    }
                    Laya.Stat.renderBatches++;
                }
                this._drawCounter++;
            }
            return 1;
        }
        updateParticleForNative() {
            if (this.texture && this.texture.getIsReady()) {
                this.update(Laya.ILaya.timer._delta);
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
            if (Laya.BlendMode.activeBlendFunction !== this._blendFn) {
                var gl = Laya.WebGLContext.mainContext;
                gl.enable(gl.BLEND);
                this._blendFn(gl);
                Laya.BlendMode.activeBlendFunction = this._blendFn;
            }
        }
        dispose() {
            this._mesh.releaseMesh();
        }
    }
    ParticleTemplate2D.activeBlendType = -1;

    class EmitterBase {
        constructor() {
            this._frameTime = 0;
            this._emissionRate = 60;
            this._emissionTime = 0;
            this.minEmissionTime = 1 / 60;
        }
        set particleTemplate(particleTemplate) {
            this._particleTemplate = particleTemplate;
        }
        set emissionRate(_emissionRate) {
            if (_emissionRate <= 0)
                return;
            this._emissionRate = _emissionRate;
            (_emissionRate > 0) && (this.minEmissionTime = 1 / _emissionRate);
        }
        get emissionRate() {
            return this._emissionRate;
        }
        start(duration = Number.MAX_VALUE) {
            if (this._emissionRate != 0)
                this._emissionTime = duration;
        }
        stop() {
            this._emissionTime = 0;
        }
        clear() {
            this._emissionTime = 0;
        }
        emit() {
        }
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

    class Particle2D extends Laya.Sprite {
        constructor(setting) {
            super();
            this._matrix4 = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
            this.autoPlay = true;
            this.customRenderEnable = true;
            if (setting)
                this.setParticleSetting(setting);
        }
        set url(url) {
            this.load(url);
        }
        load(url) {
            Laya.ILaya.loader.load(url, Laya.Handler.create(this, this.setParticleSetting), null, Laya.ILaya.Loader.JSON);
        }
        setParticleSetting(setting) {
            if (!setting)
                return this.stop();
            ParticleSetting.checkSetting(setting);
            this.customRenderEnable = true;
            this._particleTemplate = new ParticleTemplate2D(setting);
            this.graphics._saveToCmd(null, Laya.DrawParticleCmd.create(this._particleTemplate));
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
        get emitter() {
            return this._emitter;
        }
        play() {
            Laya.ILaya.timer.frameLoop(1, this, this._loop);
        }
        stop() {
            Laya.ILaya.timer.clear(this, this._loop);
        }
        _loop() {
            this.advanceTime(1 / 60);
        }
        advanceTime(passedTime = 1) {
            if (this._canvasTemplate) {
                this._canvasTemplate.advanceTime(passedTime);
            }
            if (this._emitter) {
                this._emitter.advanceTime(passedTime);
            }
        }
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
        destroy(destroyChild = true) {
            if (this._particleTemplate instanceof ParticleTemplate2D)
                this._particleTemplate.dispose();
            super.destroy(destroyChild);
        }
    }
    Laya.ILaya.regClass(Particle2D);

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
            elapsedTime = elapsedTime / 1000;
            if (elapsedTime > 0) {
                Laya.MathUtil.subtractVector3(newPosition, this._previousPosition, this._tempVelocity);
                Laya.MathUtil.scaleVector3(this._tempVelocity, 1 / elapsedTime, this._tempVelocity);
                var timeToSpend = this._timeLeftOver + elapsedTime;
                var currentTime = -this._timeLeftOver;
                while (timeToSpend > this._timeBetweenParticles) {
                    currentTime += this._timeBetweenParticles;
                    timeToSpend -= this._timeBetweenParticles;
                    Laya.MathUtil.lerpVector3(this._previousPosition, newPosition, currentTime / elapsedTime, this._tempPosition);
                    this._templet.addParticleArray(this._tempPosition, this._tempVelocity);
                }
                this._timeLeftOver = timeToSpend;
            }
            this._previousPosition[0] = newPosition[0];
            this._previousPosition[1] = newPosition[1];
            this._previousPosition[2] = newPosition[2];
        }
    }

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

}(window.Laya = window.Laya || {}, Laya));
