(function (exports, parvs) {
	'use strict';

	var parvs__default = 'default' in parvs ? parvs['default'] : parvs;

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
	            particleData.startColor[i] = parvs.MathUtil.lerp(settings.minStartColor[i], settings.maxStartColor[i], Math.random());
	            particleData.endColor[i] = parvs.MathUtil.lerp(settings.minEndColor[i], settings.maxEndColor[i], Math.random());
	        }
	        else {
	            if (settings.colorComponentInter) {
	                for (i = 0; i < 4; i++) {
	                    particleData.startColor[i] = parvs.MathUtil.lerp(settings.minStartColor[i], settings.maxStartColor[i], Math.random());
	                    particleData.endColor[i] = parvs.MathUtil.lerp(settings.minEndColor[i], settings.maxEndColor[i], Math.random());
	                }
	            }
	            else {
	                parvs.MathUtil.lerpVector4(settings.minStartColor, settings.maxStartColor, Math.random(), particleData.startColor);
	                parvs.MathUtil.lerpVector4(settings.minEndColor, settings.maxEndColor, Math.random(), particleData.endColor);
	            }
	        }
	        particleData.sizeRotation = ParticleData._tempSizeRotation;
	        var sizeRandom = Math.random();
	        particleData.sizeRotation[0] = parvs.MathUtil.lerp(settings.minStartSize, settings.maxStartSize, sizeRandom);
	        particleData.sizeRotation[1] = parvs.MathUtil.lerp(settings.minEndSize, settings.maxEndSize, sizeRandom);
	        particleData.sizeRotation[2] = parvs.MathUtil.lerp(settings.minRotateSpeed, settings.maxRotateSpeed, Math.random());
	        particleData.radius = ParticleData._tempRadius;
	        var radiusRandom = Math.random();
	        particleData.radius[0] = parvs.MathUtil.lerp(settings.minStartRadius, settings.maxStartRadius, radiusRandom);
	        particleData.radius[1] = parvs.MathUtil.lerp(settings.minEndRadius, settings.maxEndRadius, radiusRandom);
	        particleData.radian = ParticleData._tempRadian;
	        particleData.radian[0] = parvs.MathUtil.lerp(settings.minHorizontalStartRadian, settings.maxHorizontalStartRadian, Math.random());
	        particleData.radian[1] = parvs.MathUtil.lerp(settings.minVerticalStartRadian, settings.maxVerticalStartRadian, Math.random());
	        var useEndRadian = settings.useEndRadian;
	        particleData.radian[2] = useEndRadian ? parvs.MathUtil.lerp(settings.minHorizontalEndRadian, settings.maxHorizontalEndRadian, Math.random()) : particleData.radian[0];
	        particleData.radian[3] = useEndRadian ? parvs.MathUtil.lerp(settings.minVerticalEndRadian, settings.maxVerticalEndRadian, Math.random()) : particleData.radian[1];
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

	class ParticleShader extends parvs.Shader {
	    constructor() {
	        super(parvs__default, parvs__default, "ParticleShader", null, ['a_CornerTextureCoordinate', 0, 'a_Position', 1, 'a_Velocity', 2, 'a_StartColor', 3,
	            'a_EndColor', 4, 'a_SizeRotation', 5, 'a_Radius', 6, 'a_Radian', 7, 'a_AgeAddScale', 8, 'a_Time', 9]);
	    }
	}
	ParticleShader.vs = parvs__default;
	ParticleShader.ps = parvs__default;

	class ParticleShaderValue extends parvs.Value2D {
	    constructor() {
	        super(0, 0);
	        if (!ParticleShaderValue.pShader) {
	            ParticleShaderValue.pShader = new ParticleShader();
	        }
	    }
	    upload() {
	        var size = this.size;
	        size[0] = parvs.RenderState2D.width;
	        size[1] = parvs.RenderState2D.height;
	        this.alpha = this.ALPHA * parvs.RenderState2D.worldAlpha;
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
	        parvs.ILaya.loader.load(this.settings.textureName, parvs.Handler.create(null, function (texture) {
	            _this.texture = texture;
	        }));
	        this.sv.u_Duration = this.settings.duration;
	        this.sv.u_Gravity = this.settings.gravity;
	        this.sv.u_EndVelocity = this.settings.endVelocity;
	        this._blendFn = parvs.BlendMode.fns[parSetting.blendState];
	        this._mesh = parvs.MeshParticle2D.getAMesh(this.settings.maxPartices);
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
	            this.update(parvs.ILaya.timer._delta);
	            this.sv.u_CurrentTime = this._currentTime;
	            if (this._firstNewElement != this._firstFreeElement) {
	                this.addNewParticlesToVertexBuffer();
	            }
	            this.blend();
	            if (this._firstActiveElement != this._firstFreeElement) {
	                var gl = parvs.WebGLContext.mainContext;
	                this._mesh.useMesh(gl);
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

	class Particle2D extends parvs.Sprite {
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
	        parvs.ILaya.loader.load(url, parvs.Handler.create(this, this.setParticleSetting), null, parvs.ILaya.Loader.JSON);
	    }
	    setParticleSetting(setting) {
	        if (!setting)
	            return this.stop();
	        ParticleSetting.checkSetting(setting);
	        this.customRenderEnable = true;
	        this._particleTemplate = new ParticleTemplate2D(setting);
	        this.graphics._saveToCmd(null, parvs.DrawParticleCmd.create(this._particleTemplate));
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
	        parvs.ILaya.timer.frameLoop(1, this, this._loop);
	    }
	    stop() {
	        parvs.ILaya.timer.clear(this, this._loop);
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
	parvs.ILaya.regClass(Particle2D);

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
