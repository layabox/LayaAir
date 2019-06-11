import { ParticleTemplateWebGL } from "././ParticleTemplateWebGL";
import { ParticleSetting } from "././ParticleSetting";
import { ISubmit } from "laya/webgl/submit/ISubmit";
import { ParticleShaderValue } from "./shader/value/ParticleShaderValue";
import { MeshParticle2D } from "laya/webgl/utils/MeshParticle2D";
/**
 *  @private
 */
export declare class ParticleTemplate2D extends ParticleTemplateWebGL implements ISubmit {
    static activeBlendType: number;
    x: number;
    y: number;
    protected _blendFn: Function;
    sv: ParticleShaderValue;
    private _startTime;
    _key: any;
    constructor(parSetting: ParticleSetting);
    getRenderType(): number;
    releaseRender(): void;
    addParticleArray(position: Float32Array, velocity: Float32Array): void;
    addNewParticlesToVertexBuffer(): void;
    renderSubmit(): number;
    updateParticleForNative(): void;
    getMesh(): MeshParticle2D;
    getConchMesh(): any;
    getFirstNewElement(): number;
    getFirstFreeElement(): number;
    getFirstActiveElement(): number;
    getFirstRetiredElement(): number;
    setFirstFreeElement(_value: number): void;
    setFirstNewElement(_value: number): void;
    addDrawCounter(): void;
    blend(): void;
    dispose(): void;
}
