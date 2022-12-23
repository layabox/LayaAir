import { Camera, CameraClearFlags } from "../Camera";
import { Sprite3D } from "../Sprite3D";
import { Ray } from "../../math/Ray";
import { Vector2 } from "../../math/Vector2";
import { Vector3 } from "../../math/Vector3";
import { Viewport } from "../../math/Viewport";
import { HitResult } from "../../physics/HitResult";
import { Config3D } from "../../../../Config3D";
import { Physics3D } from "../../Physics3D";
import { InputManager } from "../../../events/InputManager";
import { Node } from "../../../display/Node";
import { Scene3D } from "./Scene3D";

const _vec2 = new Vector2();
const _ray = new Ray(new Vector3(), new Vector3());
const _hitResult = new HitResult();

InputManager.prototype.getSprite3DUnderPoint = function (this: InputManager, x: number, y: number): Node {
    _hitResult.succeeded = false;
    _vec2.setValue(x, y);

    for (let scene of <Scene3D[]>this._stage._scene3Ds) {
        let sim = scene._physicsSimulation;
        if (!sim)
            continue;

        let cameras = scene._cameraPool;
        for (let i = cameras.length - 1; i >= 0; i--) {
            let camera = <Camera>cameras[i];
            let viewport: Viewport = camera.viewport;
            let ratio = Config3D.pixelRatio;
            if (x >= viewport.x && y >= viewport.y && x <= viewport.width / ratio && y <= viewport.height / ratio) {
                camera.viewportPointToRay(_vec2, _ray);

                var sucess: boolean = sim.rayCast(_ray, <any>_hitResult);
                if (sucess || (camera.clearFlag === CameraClearFlags.SolidColor || camera.clearFlag === CameraClearFlags.Sky))
                    break;
            }
        }

        if (_hitResult.succeeded)
            return (<Sprite3D>_hitResult.collider.owner);
    }

    return null;
}
