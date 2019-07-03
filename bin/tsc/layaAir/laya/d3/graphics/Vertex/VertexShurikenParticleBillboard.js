import { VertexShuriKenParticle } from "./VertexShuriKenParticle";
import { VertexDeclaration } from "../VertexDeclaration";
import { VertexElement } from "../VertexElement";
import { VertexElementFormat } from "../VertexElementFormat";
/**
 * <code>VertexShurikenParticle</code> 类用于创建粒子顶点结构。
 */
export class VertexShurikenParticleBillboard extends VertexShuriKenParticle {
    constructor(cornerTextureCoordinate, positionStartLifeTime, velocity, startColor, startSize, startRotation0, startRotation1, startRotation2, ageAddScale, time, startSpeed, randoms0, randoms1, simulationWorldPostion) {
        super();
        this._cornerTextureCoordinate = cornerTextureCoordinate;
        this._positionStartLifeTime = positionStartLifeTime;
        this._velocity = velocity;
        this._startColor = startColor;
        this._startSize = startSize;
        this._startRotation0 = startRotation0;
        this._startRotation1 = startRotation1;
        this._startRotation2 = startRotation2;
        this._startLifeTime = ageAddScale;
        this._time = time;
        this._startSpeed = startSpeed;
        this._randoms0 = this.random0;
        this._randoms1 = this.random1;
        this._simulationWorldPostion = simulationWorldPostion;
    }
    static get vertexDeclaration() {
        return VertexShurikenParticleBillboard._vertexDeclaration;
    }
    get cornerTextureCoordinate() {
        return this._cornerTextureCoordinate;
    }
    get positionStartLifeTime() {
        return this._positionStartLifeTime;
    }
    get velocity() {
        return this._velocity;
    }
    get startColor() {
        return this._startColor;
    }
    get startSize() {
        return this._startSize;
    }
    get startRotation0() {
        return this._startRotation0;
    }
    get startRotation1() {
        return this._startRotation1;
    }
    get startRotation2() {
        return this._startRotation2;
    }
    get startLifeTime() {
        return this._startLifeTime;
    }
    get time() {
        return this._time;
    }
    get startSpeed() {
        return this._startSpeed;
    }
    get random0() {
        return this._randoms0;
    }
    get random1() {
        return this._randoms1;
    }
    get simulationWorldPostion() {
        return this._simulationWorldPostion;
    }
}
/**@internal */
VertexShurikenParticleBillboard._vertexDeclaration = new VertexDeclaration(152, [new VertexElement(0, VertexElementFormat.Vector4, VertexShuriKenParticle.PARTICLE_CORNERTEXTURECOORDINATE0),
    new VertexElement(16, VertexElementFormat.Vector4, VertexShuriKenParticle.PARTICLE_SHAPEPOSITIONSTARTLIFETIME),
    new VertexElement(32, VertexElementFormat.Vector4, VertexShuriKenParticle.PARTICLE_DIRECTIONTIME),
    new VertexElement(48, VertexElementFormat.Vector4, VertexShuriKenParticle.PARTICLE_STARTCOLOR0),
    new VertexElement(64, VertexElementFormat.Vector3, VertexShuriKenParticle.PARTICLE_STARTSIZE),
    new VertexElement(76, VertexElementFormat.Vector3, VertexShuriKenParticle.PARTICLE_STARTROTATION),
    new VertexElement(88, VertexElementFormat.Single, VertexShuriKenParticle.PARTICLE_STARTSPEED),
    new VertexElement(92, VertexElementFormat.Vector4, VertexShuriKenParticle.PARTICLE_RANDOM0),
    new VertexElement(108, VertexElementFormat.Vector4, VertexShuriKenParticle.PARTICLE_RANDOM1),
    new VertexElement(124, VertexElementFormat.Vector3, VertexShuriKenParticle.PARTICLE_SIMULATIONWORLDPOSTION),
    new VertexElement(136, VertexElementFormat.Vector4, VertexShuriKenParticle.PARTICLE_SIMULATIONWORLDROTATION)]);
