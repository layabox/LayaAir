import { Laya } from "Laya";
import { Script3D } from "laya/d3/component/Script3D";
import { Quaternion } from "laya/d3/math/Quaternion";
import { Vector3 } from "laya/d3/math/Vector3";
import { Event } from "laya/events/Event";
import { KeyBoardManager } from "laya/events/KeyBoardManager";
/**
 * ...
 * @author
 */
export class CameraMoveScript extends Script3D {
    constructor() {
        super();
        /** @private */
        this._tempVector3 = new Vector3();
        this.yawPitchRoll = new Vector3();
        this.resultRotation = new Quaternion();
        this.tempRotationZ = new Quaternion();
        this.tempRotationX = new Quaternion();
        this.tempRotationY = new Quaternion();
        this.rotaionSpeed = 0.00006;
    }
    /**
     * @private
     */
    _updateRotation() {
        if (Math.abs(this.yawPitchRoll.y) < 1.50) {
            Quaternion.createFromYawPitchRoll(this.yawPitchRoll.x, this.yawPitchRoll.y, this.yawPitchRoll.z, this.tempRotationZ);
            this.tempRotationZ.cloneTo(this.camera.transform.localRotation);
            this.camera.transform.localRotation = this.camera.transform.localRotation;
        }
    }
    /**
     * @inheritDoc
     */
    /*override*/ onAwake() {
        Laya.stage.on(Event.RIGHT_MOUSE_DOWN, this, this.mouseDown);
        Laya.stage.on(Event.RIGHT_MOUSE_UP, this, this.mouseUp);
        //Laya.stage.on(Event.RIGHT_MOUSE_OUT, this, mouseOut);
        this.camera = this.owner;
    }
    /**
     * @inheritDoc
     */
    /*override*/ onUpdate() {
        var elapsedTime = Laya.timer.delta;
        if (!isNaN(this.lastMouseX) && !isNaN(this.lastMouseY) && this.isMouseDown) {
            var scene = this.owner.scene;
            KeyBoardManager.hasKeyDown(87) && this.moveForward(-0.01 * elapsedTime); //W
            KeyBoardManager.hasKeyDown(83) && this.moveForward(0.01 * elapsedTime); //S
            KeyBoardManager.hasKeyDown(65) && this.moveRight(-0.01 * elapsedTime); //A
            KeyBoardManager.hasKeyDown(68) && this.moveRight(0.01 * elapsedTime); //D
            KeyBoardManager.hasKeyDown(81) && this.moveVertical(0.01 * elapsedTime); //Q
            KeyBoardManager.hasKeyDown(69) && this.moveVertical(-0.01 * elapsedTime); //E
            var offsetX = Laya.stage.mouseX - this.lastMouseX;
            var offsetY = Laya.stage.mouseY - this.lastMouseY;
            var yprElem = this.yawPitchRoll;
            yprElem.x -= offsetX * this.rotaionSpeed * elapsedTime;
            yprElem.y -= offsetY * this.rotaionSpeed * elapsedTime;
            this._updateRotation();
        }
        this.lastMouseX = Laya.stage.mouseX;
        this.lastMouseY = Laya.stage.mouseY;
    }
    /**
     * @inheritDoc
     */
    /*override*/ onDestroy() {
        Laya.stage.off(Event.RIGHT_MOUSE_DOWN, this, this.mouseDown);
        Laya.stage.off(Event.RIGHT_MOUSE_UP, this, this.mouseUp);
        //Laya.stage.off(Event.RIGHT_MOUSE_OUT, this, mouseOut);
    }
    mouseDown(e) {
        this.camera.transform.localRotation.getYawPitchRoll(this.yawPitchRoll);
        this.lastMouseX = Laya.stage.mouseX;
        this.lastMouseY = Laya.stage.mouseY;
        this.isMouseDown = true;
    }
    mouseUp(e) {
        this.isMouseDown = false;
    }
    mouseOut(e) {
        this.isMouseDown = false;
    }
    /**
     * 向前移动。
     * @param distance 移动距离。
     */
    moveForward(distance) {
        this._tempVector3.x = this._tempVector3.y = 0;
        this._tempVector3.z = distance;
        this.camera.transform.translate(this._tempVector3);
    }
    /**
     * 向右移动。
     * @param distance 移动距离。
     */
    moveRight(distance) {
        this._tempVector3.y = this._tempVector3.z = 0;
        this._tempVector3.x = distance;
        this.camera.transform.translate(this._tempVector3);
    }
    /**
     * 向上移动。
     * @param distance 移动距离。
     */
    moveVertical(distance) {
        this._tempVector3.x = this._tempVector3.z = 0;
        this._tempVector3.y = distance;
        this.camera.transform.translate(this._tempVector3, false);
    }
}
