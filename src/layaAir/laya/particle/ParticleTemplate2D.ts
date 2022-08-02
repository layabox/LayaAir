import { ParticleSetting } from "./ParticleSetting";
import { ISubmit } from "../webgl/submit/ISubmit";
import { ParticleShaderValue } from "./shader/value/ParticleShaderValue";
import { ILaya } from "../../ILaya";
import { BlendMode } from "../webgl/canvas/BlendMode";
import { MeshParticle2D } from "../webgl/utils/MeshParticle2D";
import { VertexBuffer2D } from "../webgl/utils/VertexBuffer2D";
import { Stat } from "../utils/Stat";
import { RenderStateContext } from "../RenderEngine/RenderStateContext";
import { LayaGL } from "../layagl/LayaGL";
import { MeshTopology } from "../RenderEngine/RenderEnum/RenderPologyMode";
import { IndexFormat } from "../RenderEngine/RenderEnum/IndexFormat";
import { Texture } from "../resource/Texture";
import { Resource } from "../resource/Resource";
import { ParticleData } from "./ParticleData";

export class ParticleTemplate2D extends Resource implements ISubmit {
    /**
     * 粒子配置数据 
     */
    public readonly settings: ParticleSetting;
    /**
     * 粒子贴图 
     */
    public readonly texture: Texture;

    protected _vertices: Float32Array;
    protected _mesh: MeshParticle2D;
    protected _conchMesh: any;

    protected _floatCountPerVertex: number = 29;//0~3为CornerTextureCoordinate,4~6为Position,7~9Velocity,10到13为StartColor,14到17为EndColor,18到20位SizeRotation，21到22位Radius,23到26位Radian，27为DurationAddScaleShaderValue,28为Time

    protected _firstActiveElement: number = 0;
    protected _firstNewElement: number = 0;
    protected _firstFreeElement: number = 0;
    protected _firstRetiredElement: number = 0;
    /**@internal */
    _currentTime: number = 0;
    protected _drawCounter: number;

    static activeBlendType: number = -1;
    x: number = 0;

    y: number = 0;
    protected _blendFn: Function;
    sv: ParticleShaderValue = new ParticleShaderValue();

    /**@internal */
    _key: any = {};

    constructor(settings: ParticleSetting, texture: Texture) {
        super();

        this.settings = settings;
        this.texture = texture;
        this.texture._addReference();

        this.sv.u_Duration = this.settings.duration;
        this.sv.u_Gravity = this.settings.gravity;
        this.sv.u_EndVelocity = this.settings.endVelocity;

        this._blendFn = BlendMode.fns[settings.blendState]; //context._targets?BlendMode.targetFns[blendType]:BlendMode.fns[blendType];
        this._mesh = MeshParticle2D.getAMesh(this.settings.maxPartices);

        this.initialize();
    }

    getRenderType(): number { return -111 }

    releaseRender(): void { }

    protected initialize(): void {
        var floatStride: number = 0;
        this._vertices = this._mesh._vb.getFloat32Array();
        floatStride = this._mesh._stride / 4;
        var bufi: number = 0;
        var bufStart: number = 0;
        for (var i: number = 0; i < this.settings.maxPartices; i++) {
            var random: number = Math.random();
            var cornerYSegement: number = this.settings.textureCount ? 1.0 / this.settings.textureCount : 1.0;
            var cornerY: number;

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

    /**
     * 
     * @param position 
     * @param velocity 
     * @override
     */
    addParticleArray(position: Float32Array, velocity: Float32Array): void {
        // TODO Auto Generated method stub
        position[0] += this.x;
        position[1] += this.y;

        //由于循环队列判断算法，当下一个freeParticle等于retiredParticle时不添加例子，意味循环队列中永远有一个空位。（由于此判断算法快速、简单，所以放弃了使循环队列饱和的复杂算法（需判断freeParticle在retiredParticle前、后两种情况并不同处理））
        var nextFreeParticle: number = this._firstFreeElement + 1;

        if (nextFreeParticle >= this.settings.maxPartices)
            nextFreeParticle = 0;

        if (nextFreeParticle === this._firstRetiredElement)
            return;

        //计算vb数据，填入 _vertices
        /**
         * _mesh.addParticle(settings, position, velocity, _currentTime)
         */
        var particleData: ParticleData = ParticleData.create(this.settings, position, velocity, this._currentTime);

        var startIndex: number = this._firstFreeElement * this._floatCountPerVertex * 4;
        for (var i: number = 0; i < 4; i++) {
            var j: number, offset: number;
            for (j = 0, offset = 4; j < 3; j++)
                this._vertices[startIndex + i * this._floatCountPerVertex + offset + j] = particleData.position[j];

            for (j = 0, offset = 7; j < 3; j++)
                this._vertices[startIndex + i * this._floatCountPerVertex + offset + j] = particleData.velocity[j];

            for (j = 0, offset = 10; j < 4; j++)
                this._vertices[startIndex + i * this._floatCountPerVertex + offset + j] = particleData.startColor[j];

            for (j = 0, offset = 14; j < 4; j++)
                this._vertices[startIndex + i * this._floatCountPerVertex + offset + j] = particleData.endColor[j];

            for (j = 0, offset = 18; j < 3; j++)//StartSize,EndSize,Rotation
                this._vertices[startIndex + i * this._floatCountPerVertex + offset + j] = particleData.sizeRotation[j];

            for (j = 0, offset = 21; j < 2; j++)//StartRadius,EndRadius
                this._vertices[startIndex + i * this._floatCountPerVertex + offset + j] = particleData.radius[j];

            for (j = 0, offset = 23; j < 4; j++)//StartHorizontalRadian,StartVerticleRadian,EndHorizontalRadian,EndVerticleRadian
                this._vertices[startIndex + i * this._floatCountPerVertex + offset + j] = particleData.radian[j];

            this._vertices[startIndex + i * this._floatCountPerVertex + 27] = particleData.durationAddScale;

            this._vertices[startIndex + i * this._floatCountPerVertex + 28] = particleData.time;
        }

        this._firstFreeElement = nextFreeParticle;
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
    addNewParticlesToVertexBuffer(): void {
        var _vertexBuffer2D: VertexBuffer2D = this._mesh._vb;
        _vertexBuffer2D.buffer2D.clear();
        _vertexBuffer2D.buffer2D.append(this._vertices);

        var start: number;
        if (this._firstNewElement < this._firstFreeElement) {
            // 如果新增加的粒子在Buffer中是连续的区域，只upload一次
            start = this._firstNewElement * 4 * this._floatCountPerVertex * 4;
            _vertexBuffer2D.buffer2D.subUpload(start, start, start + (this._firstFreeElement - this._firstNewElement) * 4 * this._floatCountPerVertex * 4);
        } else {
            //如果新增粒子区域超过Buffer末尾则循环到开头，需upload两次
            start = this._firstNewElement * 4 * this._floatCountPerVertex * 4;
            _vertexBuffer2D.buffer2D.subUpload(start, start, start + (this.settings.maxPartices - this._firstNewElement) * 4 * this._floatCountPerVertex * 4);

            if (this._firstFreeElement > 0) {
                _vertexBuffer2D.buffer2D.setNeedUpload();
                _vertexBuffer2D.buffer2D.subUpload(0, 0, this._firstFreeElement * 4 * this._floatCountPerVertex * 4);
            }
        }
        this._firstNewElement = this._firstFreeElement;
    }


    renderSubmit(): number {
        if (this.texture && this.texture.valid) {
            this.update(ILaya.timer._delta);
            this.sv.u_CurrentTime = this._currentTime;
            if (this._firstNewElement != this._firstFreeElement) {
                this.addNewParticlesToVertexBuffer();
            }

            this.blend();

            if (this._firstActiveElement != this._firstFreeElement) {
                //var gl: WebGLRenderingContext = RenderStateContext.mainContext;
                this._mesh.useMesh();
                //_vertexBuffer2D.bind();
                //_indexBuffer2D.bind();
                this.sv.u_texture = this.texture._getSource();
                this.sv.upload();


                if (this._firstActiveElement < this._firstFreeElement) {
                    LayaGL.renderDrawContext.drawElements(MeshTopology.Triangles, (this._firstFreeElement - this._firstActiveElement) * 6, IndexFormat.UInt16, this._firstActiveElement * 6 * 2);
                }
                else {

                    LayaGL.renderDrawContext.drawElements(MeshTopology.Triangles, (this.settings.maxPartices - this._firstActiveElement) * 6, IndexFormat.UInt16, this._firstActiveElement * 6 * 2);
                    if (this._firstFreeElement > 0)
                        LayaGL.renderDrawContext.drawElements(MeshTopology.Triangles, this._firstFreeElement * 6, IndexFormat.UInt16, 0);
                }

                Stat.renderBatches++;
            }
            this._drawCounter++;
        }
        return 1;
    }

    updateParticleForNative(): void {
        if (this.texture && this.texture.valid) {
            this.update(ILaya.timer._delta);
            this.sv.u_CurrentTime = this._currentTime;
            if (this._firstNewElement != this._firstFreeElement) {
                this._firstNewElement = this._firstFreeElement;
            }
        }
    }

    update(elapsedTime: number): void {
        this._currentTime += elapsedTime / 1000;
        this.retireActiveParticles();
        this.freeRetiredParticles();

        if (this._firstActiveElement == this._firstFreeElement)
            this._currentTime = 0;

        if (this._firstRetiredElement == this._firstActiveElement)
            this._drawCounter = 0;
    }

    private retireActiveParticles(): void {
        const epsilon: number = 0.0001;
        var particleDuration: number = this.settings.duration;
        while (this._firstActiveElement != this._firstNewElement) {
            var offset: number = this._firstActiveElement * this._floatCountPerVertex * 4;
            var index: number = offset + 28;//28为Time
            var particleAge: number = this._currentTime - this._vertices[index];
            particleAge *= (1.0 + this._vertices[offset + 27]);//真实时间
            if (particleAge + epsilon < particleDuration)
                break;

            this._vertices[index] = this._drawCounter;

            this._firstActiveElement++;

            if (this._firstActiveElement >= this.settings.maxPartices)
                this._firstActiveElement = 0;
        }
    }

    private freeRetiredParticles(): void {
        while (this._firstRetiredElement != this._firstActiveElement) {
            var age: number = this._drawCounter - this._vertices[this._firstRetiredElement * this._floatCountPerVertex * 4 + 28];//28为Time
            //GPU从不滞后于CPU两帧，出于显卡驱动BUG等安全因素考虑滞后三帧
            if (age < 3)
                break;

            this._firstRetiredElement++;

            if (this._firstRetiredElement >= this.settings.maxPartices)
                this._firstRetiredElement = 0;
        }
    }

    getMesh(): MeshParticle2D {
        return this._mesh;
    }

    getConchMesh(): any {
        return this._conchMesh;
    }

    getFirstNewElement(): number {
        return this._firstNewElement;
    }

    getFirstFreeElement(): number {
        return this._firstFreeElement;
    }

    getFirstActiveElement(): number {
        return this._firstActiveElement;
    }

    getFirstRetiredElement(): number {
        return this._firstRetiredElement;
    }

    setFirstFreeElement(_value: number): void {
        this._firstFreeElement = _value;
    }

    setFirstNewElement(_value: number): void {
        this._firstNewElement = _value;
    }

    addDrawCounter(): void {
        this._drawCounter++;
    }

    blend(): void {
        if (BlendMode.activeBlendFunction !== this._blendFn) {
            RenderStateContext.setBlend(true);
            this._blendFn();
            BlendMode.activeBlendFunction = this._blendFn;
        }
    }

    protected _disposeResource(): void {
        this.texture._removeReference();
        this._mesh.releaseMesh();
    }
}

