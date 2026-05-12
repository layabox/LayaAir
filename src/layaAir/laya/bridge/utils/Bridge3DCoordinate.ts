import { ILaya } from "../../../ILaya";
import { Camera } from "../../d3/core/Camera";
import { Matrix4x4 } from "../../maths/Matrix4x4";
import { Vector3 } from "../../maths/Vector3";
import { RenderState2D } from "../../webgl/utils/RenderState2D";
import { Bridge3DCamera } from "../Bridge3DCamera";

/**
 * Bridge3D coordinate conversion helpers.
 *
 * 2D logic coordinates are local to the owning Scene (Y-down).
 * 3D world coordinates are Bridge3D scene-local coordinates (Y-up).
 * Scene-to-stage offset/scale is handled by Bridge3DCamera.sceneOffsetMatrix.
 */
export class Bridge3DCoordinate {
    /** @internal */
    private static _tmpInvOffset: Matrix4x4 = new Matrix4x4();
    /** @internal */
    private static _tmpScreenPoint: Vector3 = new Vector3();

    /**
     * Convert Scene-local 2D coordinates to Bridge3D scene-local world coordinates.
     * @param x Scene-local 2D X.
     * @param y Scene-local 2D Y.
     * @param z 3D world Z.
     * @param out Output vector.
     * @param sceneHeight Scene logic height used as the Y-flip baseline.
     */
    static logicTo3D(x: number, y: number, z: number = 0, out?: Vector3, sceneHeight: number = RenderState2D.height): Vector3 {
        if (!out) {
            out = new Vector3();
        }
        out.x = x;
        out.y = sceneHeight - y;
        out.z = z;
        return out;
    }

    /**
     * Convert Bridge3D scene-local world coordinates to Scene-local 2D coordinates.
     * @param worldPos Bridge3D scene-local world position.
     * @param sceneHeight Scene logic height used as the Y-flip baseline.
     */
    static worldTo2D(worldPos: Vector3, sceneHeight: number = RenderState2D.height): { x: number, y: number } {
        return {
            x: worldPos.x,
            y: sceneHeight - worldPos.y
        };
    }

    /**
     * Get current Stage scale. This is informational; Bridge3D conversion itself uses sceneOffsetMatrix.
     */
    static getScale(): { scaleX: number, scaleY: number } {
        const stage = ILaya.stage;
        return {
            scaleX: stage.scaleX,
            scaleY: stage.scaleY
        };
    }

    /**
     * Get current render and scale information for debugging.
     */
    static getRenderInfo(): {
        logicWidth: number,
        logicHeight: number,
        renderWidth: number,
        renderHeight: number,
        scaleX: number,
        scaleY: number
    } {
        const stage = ILaya.stage;
        return {
            logicWidth: stage.width,
            logicHeight: stage.height,
            renderWidth: RenderState2D.width,
            renderHeight: RenderState2D.height,
            scaleX: stage.scaleX,
            scaleY: stage.scaleY
        };
    }

    /**
     * Convert canvas screen coordinates to Bridge3D scene-local world coordinates.
     *
     * For orthographic cameras this maps directly through the orthographic size.
     * For perspective Bridge3D cameras this intersects the camera ray with the target Z plane.
     *
     * @param screenX Canvas pixel X, origin at top-left.
     * @param screenY Canvas pixel Y, origin at top-left.
     * @param camera Bridge3D camera.
     * @param depth Target world Z plane.
     * @param out Output vector.
     */
    static screenTo3D(screenX: number, screenY: number, camera: Camera, depth: number = 0, out?: Vector3): Vector3 {
        if (!out) {
            out = new Vector3();
        }

        const renderWidth = RenderState2D.width;
        const renderHeight = RenderState2D.height;
        const ndcX = (screenX / renderWidth) * 2 - 1;
        const ndcY = 1 - (screenY / renderHeight) * 2;
        const cameraPos = camera.transform.position;

        if (camera.orthographic) {
            const halfHeight = camera.orthographicVerticalSize * 0.5;
            const halfWidth = halfHeight * camera.aspectRatio;

            out.x = cameraPos.x + ndcX * halfWidth;
            out.y = cameraPos.y + ndcY * halfHeight;
            out.z = depth;
        } else {
            const distance = cameraPos.z - depth;
            if (distance <= 0) {
                return out;
            }

            const halfFov = camera.fieldOfView * Math.PI / 180 * 0.5;
            const halfHeight = Math.tan(halfFov) * distance;
            const halfWidth = halfHeight * camera.aspectRatio;

            out.x = cameraPos.x + ndcX * halfWidth;
            out.y = cameraPos.y + ndcY * halfHeight;
            out.z = depth;
        }

        const bridgeCamera = camera as Bridge3DCamera;
        if (bridgeCamera.sceneOffsetMatrix && !bridgeCamera.sceneOffsetIsIdentity) {
            bridgeCamera.sceneOffsetMatrix.invert(Bridge3DCoordinate._tmpInvOffset);
            Bridge3DCoordinate._tmpScreenPoint.x = out.x;
            Bridge3DCoordinate._tmpScreenPoint.y = out.y;
            Bridge3DCoordinate._tmpScreenPoint.z = out.z;
            Vector3.transformCoordinate(Bridge3DCoordinate._tmpScreenPoint, Bridge3DCoordinate._tmpInvOffset, out);
        }

        return out;
    }

    /**
     * Print current coordinate system information.
     */
    static debugInfo(): void {
        const info = Bridge3DCoordinate.getRenderInfo();
        console.log("=== Bridge3D Coordinate System Info ===");
        console.log(`Logic Size: ${info.logicWidth} x ${info.logicHeight}`);
        console.log(`Render Size: ${info.renderWidth} x ${info.renderHeight}`);
        console.log(`Scale: ${info.scaleX.toFixed(3)} x ${info.scaleY.toFixed(3)}`);
        console.log("=======================================");
    }
}
