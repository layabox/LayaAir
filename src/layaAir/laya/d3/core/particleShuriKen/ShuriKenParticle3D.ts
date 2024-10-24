import { Node } from "../../../display/Node";
import { RenderableSprite3D } from "../RenderableSprite3D";
import { Sprite3D } from "../Sprite3D";
import { ShurikenParticleRenderer } from "./ShurikenParticleRenderer";
import { ShurikenParticleSystem } from "./ShurikenParticleSystem";

/**
 * @en ShuriKenParticle3D is a class of 3D particle system.
 * @zh ShuriKenParticle3D 是3D粒子系统的类。
 */
export class ShuriKenParticle3D extends RenderableSprite3D {

	/** @internal */
	private _particleSystem: ShurikenParticleSystem;

	/**
	 * @en The particle system.
	 * @zh 粒子系统。
	 */
	get particleSystem(): ShurikenParticleSystem {
		return this._particleSystem;
	}

	/**
	 * @en The particle renderer.
	 * @zh 粒子渲染器。
	 */
	get particleRenderer(): ShurikenParticleRenderer {
		return <ShurikenParticleRenderer>this._render;
	}

	/**
	 * @ignore
	 * @en creates an instance of the ShuriKenParticle3D class.
	 * @zh 创建Particle3D类的实例。
	 */
	constructor() {
		super(null);
		this._render = this.addComponent(ShurikenParticleRenderer) as ShurikenParticleRenderer;
		this._particleSystem = (this._render as ShurikenParticleRenderer)._particleSystem;
	}

	/**
	 * @override
	 * @en Destroy this object.
	 * @param	destroyChild Whether to destroy the child node. If true, the child node will be destroyed, otherwise it will not be destroyed.
	 * @zh 销毁此对象。
	 * @param	destroyChild 是否同时销毁子节点，若值为true,则销毁子节点，否则不销毁子节点。
	 */
	destroy(destroyChild: boolean = true): void {
		if (this._destroyed)
			return;
		super.destroy(destroyChild);
	}
}


