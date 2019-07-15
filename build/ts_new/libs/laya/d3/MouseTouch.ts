import { Sprite3D } from "./core/Sprite3D"

/**
 * @internal
 */
export class MouseTouch {
	/**@internal */
	_pressedSprite: Sprite3D = null;
	/**@internal */
	_pressedLoopCount: number = -1;
	/**@internal */
	sprite: Sprite3D = null;
	/**@internal */
	mousePositionX: number = 0;
	/**@internal */
	mousePositionY: number = 0;

	constructor() {

	}
}


