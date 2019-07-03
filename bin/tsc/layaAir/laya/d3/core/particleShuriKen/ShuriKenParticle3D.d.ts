import { RenderableSprite3D } from "../RenderableSprite3D";
import { ShurikenParticleRenderer } from "./ShurikenParticleRenderer";
import { ShurikenParticleSystem } from "./ShurikenParticleSystem";
/**
 * <code>ShuriKenParticle3D</code> 3D粒子。
 */
export declare class ShuriKenParticle3D extends RenderableSprite3D {
    /**
     * 获取粒子系统。
     * @return  粒子系统。
     */
    readonly particleSystem: ShurikenParticleSystem;
    /**
     * 获取粒子渲染器。
     * @return  粒子渲染器。
     */
    readonly particleRenderer: ShurikenParticleRenderer;
    /**
     * 创建一个 <code>Particle3D</code> 实例。
     * @param settings value 粒子配置。
     */
    constructor();
    /**
     * @inheritDoc
     */
    _parse(data: any, spriteMap: any): void;
    /**
     * @inheritDoc
     */
    _activeHierarchy(activeChangeComponents: any[]): void;
    /**
     * @inheritDoc
     */
    _inActiveHierarchy(activeChangeComponents: any[]): void;
    /**
     * <p>销毁此对象。</p>
     * @param	destroyChild 是否同时销毁子节点，若值为true,则销毁子节点，否则不销毁子节点。
     */
    destroy(destroyChild?: boolean): void;
}
