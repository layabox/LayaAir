import { EmitterBase } from "./EmitterBase";
import { ParticleSetting } from "../ParticleSetting"
import { ParticleTemplate2D } from "../ParticleTemplate2D"
import { ParticleTemplateBase } from "../ParticleTemplateBase"

/**
 * 
 * @private
 */
export class Emitter2D extends EmitterBase {
    setting: ParticleSetting;
    private _posRange: Float32Array;
    private _canvasTemplate: ParticleTemplateBase;
    private _emitFun: Function;
    constructor(_template: ParticleTemplateBase) {
        super();
        this.template = _template;
    }
    set template(template: ParticleTemplateBase) {
        this._particleTemplate = template;
        if (!template) {
            this._emitFun = null;
            this.setting = null;
            this._posRange = null;
        };
        this.setting = template.settings;
        this._posRange = this.setting.positionVariance;
        if (this._particleTemplate instanceof ParticleTemplate2D) {
            this._emitFun = this.webGLEmit;
        }
    }
    get template(): ParticleTemplateBase {
        return this._particleTemplate;
    }
    /**
     * @override
     */
    emit(): void {
        super.emit();
        if (this._emitFun != null)
            this._emitFun();
    }

    getRandom(value: number): number {
        return (Math.random() * 2 - 1) * value;
    }

    webGLEmit(): void {
        var pos: Float32Array = new Float32Array(3);
        pos[0] = this.getRandom(this._posRange[0]);
        pos[1] = this.getRandom(this._posRange[1]);
        pos[2] = this.getRandom(this._posRange[2]);
        var v: Float32Array = new Float32Array(3);
        v[0] = 0;
        v[1] = 0;
        v[2] = 0;
        this._particleTemplate.addParticleArray(pos, v);
    }
    canvasEmit(): void {
        var pos: Float32Array = new Float32Array(3);
        pos[0] = this.getRandom(this._posRange[0]);
        pos[1] = this.getRandom(this._posRange[1]);
        pos[2] = this.getRandom(this._posRange[2]);
        var v: Float32Array = new Float32Array(3);
        v[0] = 0;
        v[1] = 0;
        v[2] = 0;
        this._particleTemplate.addParticleArray(pos, v);
    }

}

