import { ParticleTemplateBase } from "./ParticleTemplateBase";
import { ParticleSetting } from "./ParticleSetting";
import { ParticleData } from "./ParticleData";
import { MeshParticle2D } from "../webgl/utils/MeshParticle2D";
import { Context } from "../resource/Context";


/**
 *  @private
 */
export class ParticleTemplateWebGL extends ParticleTemplateBase {
    protected _vertices: Float32Array;
    //protected var _vertexBuffer:Buffer;
    //protected var _indexBuffer:Buffer;
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

    constructor(parSetting: ParticleSetting) {
        super();
        this.settings = parSetting;
    }

    reUse(context: Context, pos: number): number {
        return 0;
    }

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

    addNewParticlesToVertexBuffer(): void {
    }

    //由于循环队列判断算法，当下一个freeParticle等于retiredParticle时不添加例子，意味循环队列中永远有一个空位。（由于此判断算法快速、简单，所以放弃了使循环队列饱和的复杂算法（需判断freeParticle在retiredParticle前、后两种情况并不同处理））
    /**
     * 
     * @param position 
     * @param velocity 
     * @override
     */
    addParticleArray(position: Float32Array, velocity: Float32Array): void {
        var nextFreeParticle: number = this._firstFreeElement + 1;

        if (nextFreeParticle >= this.settings.maxPartices)
            nextFreeParticle = 0;

        if (nextFreeParticle === this._firstRetiredElement)
            return;

        //计算vb数据，填入 _vertices
        /**
         * _mesh.addParticle(settings, position, velocity, _currentTime)
         */
        var particleData: ParticleData = ParticleData.Create(this.settings, position, velocity, this._currentTime);

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

}

