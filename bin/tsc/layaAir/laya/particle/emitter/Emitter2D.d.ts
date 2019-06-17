import { EmitterBase } from "././EmitterBase";
import { ParticleSetting } from "../ParticleSetting";
import { ParticleTemplateBase } from "../ParticleTemplateBase";
/**
 *
 * @private
 */
export declare class Emitter2D extends EmitterBase {
    setting: ParticleSetting;
    private _posRange;
    private _canvasTemplate;
    private _emitFun;
    constructor(_template: ParticleTemplateBase);
    template: ParticleTemplateBase;
    emit(): void;
    getRandom(value: number): number;
    webGLEmit(): void;
    canvasEmit(): void;
}
