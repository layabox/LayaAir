import { EmitterBase } from "././EmitterBase";
import { ParticleTemplate2D } from "../ParticleTemplate2D";
/**
 *
 * @private
 */
export class Emitter2D extends EmitterBase {
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
        ;
        this.setting = template.settings;
        this._posRange = this.setting.positionVariance;
        if (this._particleTemplate instanceof ParticleTemplate2D) {
            this._emitFun = this.webGLEmit;
        }
    }
    get template() {
        return this._particleTemplate;
    }
    /*override*/ emit() {
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
