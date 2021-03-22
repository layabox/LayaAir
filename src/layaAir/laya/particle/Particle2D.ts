import { ParticleTemplateBase } from "./ParticleTemplateBase";
import { Sprite } from "../display/Sprite";
import { ParticleSetting } from "./ParticleSetting";
import { Handler } from "../utils/Handler";
import { ILaya } from "../../ILaya";
import { Context } from "../resource/Context";
import { ParticleTemplate2D } from "./ParticleTemplate2D"
import { EmitterBase } from "./emitter/EmitterBase"
import { Emitter2D } from "./emitter/Emitter2D"
import { DrawParticleCmd } from "../display/cmd/DrawParticleCmd"
import { ClassUtils } from "../utils/ClassUtils";

/**
 * <code>Particle2D</code> 类是2D粒子播放类
 *
 */
export class Particle2D extends Sprite {
    /**@private */
    private _matrix4: Float32Array = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);//默认4x4矩阵
    /**@private */
    private _particleTemplate: ParticleTemplateBase;
    /**@private */
    private _canvasTemplate: any;
    /**@private */
    private _emitter: EmitterBase;
    /**是否自动播放*/
    autoPlay: boolean = true;

    tempCmd: any;

    /**
     * 创建一个新的 <code>Particle2D</code> 类实例。
     * @param setting 粒子配置数据
     */
    constructor(setting: ParticleSetting) {
        super();
        this.customRenderEnable = true;
        if (setting) this.setParticleSetting(setting);
    }

    /**
     * 设置 粒子文件地址
     * @param path 粒子文件地址
     */
    set url(url: string) {
        this.load(url);
    }

    /**
     * 加载粒子文件
     * @param url 粒子文件地址
     */
    load(url: string): void {
        ILaya.loader.load(url, Handler.create(this, this.setParticleSetting), null, ILaya.Loader.JSON);
    }

    /**
     * 设置粒子配置数据
     * @param settings 粒子配置数据
     */
    setParticleSetting(setting: ParticleSetting): void {
        if (!setting) return this.stop();
        ParticleSetting.checkSetting(setting);
        this.customRenderEnable = true;//设置custom渲染
        this._particleTemplate = new ParticleTemplate2D(setting);
        //this.graphics._saveToCmd(Render.context._drawParticle, [_particleTemplate]);
        this.graphics._saveToCmd(null, DrawParticleCmd.create((<ParticleTemplate2D>this._particleTemplate)));
        // canvas 不支持
        if (!this._emitter) {
            this._emitter = new Emitter2D(this._particleTemplate);
        } else {
            ((<Emitter2D>this._emitter)).template = this._particleTemplate;
        }
        if (this.autoPlay) {
            this.emitter.start();
            this.play();
        }
    }

    /**
     * 获取粒子发射器
     */
    get emitter(): EmitterBase {
        return this._emitter;
    }

    /**
     * 播放
     */
    play(): void {
        ILaya.timer.frameLoop(1, this, this._loop);
    }

    /**
     * 停止
     */
    stop(): void {
        ILaya.timer.clear(this, this._loop);
    }

    /**@private */
    private _loop(): void {
        this.advanceTime(1 / 60);
    }

    /**
     * 时钟前进
     * @param passedTime 时钟前进时间
     */
    advanceTime(passedTime: number = 1): void {
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
    customRender(context: Context, x: number, y: number): void {
        this._matrix4[0] = context._curMat.a;
        this._matrix4[1] = context._curMat.b;
        this._matrix4[4] = context._curMat.c;
        this._matrix4[5] = context._curMat.d;
        this._matrix4[12] = context._curMat.tx;
        this._matrix4[13] = context._curMat.ty;
        var sv: any = ((<ParticleTemplate2D>this._particleTemplate)).sv;
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
    destroy(destroyChild: boolean = true): void {
        if (this._particleTemplate instanceof ParticleTemplate2D)
            ((<ParticleTemplate2D>this._particleTemplate)).dispose();
        super.destroy(destroyChild);
    }
}
ClassUtils.regClass("laya.particle.Particle2D", Particle2D);
ClassUtils.regClass("Laya.Particle2D", Particle2D);
ILaya.regClass(Particle2D);