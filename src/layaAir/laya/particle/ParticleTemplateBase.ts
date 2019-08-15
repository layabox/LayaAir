import { ParticleSetting } from "./ParticleSetting";
import { Texture } from "../resource/Texture";

/**
 * 
 * <code>ParticleTemplateBase</code> 类是粒子模板基类
 * 
 */
export class ParticleTemplateBase {
    /**
     * 粒子配置数据 
     */
    settings: ParticleSetting;
    /**
     * 粒子贴图 
     */
    protected texture: Texture;
    /**
     * 创建一个新的 <code>ParticleTemplateBase</code> 类实例。
     * 
     */
    constructor() {

    }

    /**
     * 添加一个粒子 
     * @param position 粒子位置
     * @param velocity 粒子速度
     * 
     */
    addParticleArray(position: Float32Array, velocity: Float32Array): void {

    }

}


