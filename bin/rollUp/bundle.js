window.Laya=window.Laya||{};

(function (Laya) {
	'use strict';

	class CameraMoveScript extends Laya.Script {
	    constructor() {
	        super();
	        this._tempVector3 = new Laya.Vector3();
	        this.yawPitchRoll = new Laya.Vector3();
	        this.resultRotation = new Laya.Quaternion();
	        this.tempRotationZ = new Laya.Quaternion();
	        this.tempRotationX = new Laya.Quaternion();
	        this.tempRotationY = new Laya.Quaternion();
	        this.rotaionSpeed = 0.00006;
	        this.speed = 0.01;
	    }
	    _updateRotation() {
	        if (Math.abs(this.yawPitchRoll.y) < 1.50) {
	            Laya.Quaternion.createFromYawPitchRoll(this.yawPitchRoll.x, this.yawPitchRoll.y, this.yawPitchRoll.z, this.tempRotationZ);
	            this.tempRotationZ.cloneTo(this.camera.transform.localRotation);
	            this.camera.transform.localRotation = this.camera.transform.localRotation;
	        }
	    }
	    onAwake() {
	        Laya.Laya.stage.on(Laya.Event.RIGHT_MOUSE_DOWN, this, this.mouseDown);
	        Laya.Laya.stage.on(Laya.Event.RIGHT_MOUSE_UP, this, this.mouseUp);
	        this.camera = this.owner;
	    }
	    onUpdate() {
	        var elapsedTime = Laya.Laya.timer.delta;
	        if (!isNaN(this.lastMouseX) && !isNaN(this.lastMouseY) && this.isMouseDown) {
	            var scene = this.owner.scene;
	            Laya.InputManager.hasKeyDown(87) && this.moveForward(-this.speed * elapsedTime);
	            Laya.InputManager.hasKeyDown(83) && this.moveForward(this.speed * elapsedTime);
	            Laya.InputManager.hasKeyDown(65) && this.moveRight(-this.speed * elapsedTime);
	            Laya.InputManager.hasKeyDown(68) && this.moveRight(this.speed * elapsedTime);
	            Laya.InputManager.hasKeyDown(81) && this.moveVertical(this.speed * elapsedTime);
	            Laya.InputManager.hasKeyDown(69) && this.moveVertical(-this.speed * elapsedTime);
	            var offsetX = Laya.Laya.stage.mouseX - this.lastMouseX;
	            var offsetY = Laya.Laya.stage.mouseY - this.lastMouseY;
	            var yprElem = this.yawPitchRoll;
	            yprElem.x -= offsetX * this.rotaionSpeed * elapsedTime;
	            yprElem.y -= offsetY * this.rotaionSpeed * elapsedTime;
	            this._updateRotation();
	        }
	        this.lastMouseX = Laya.Laya.stage.mouseX;
	        this.lastMouseY = Laya.Laya.stage.mouseY;
	    }
	    onDestroy() {
	        Laya.Laya.stage.off(Laya.Event.RIGHT_MOUSE_DOWN, this, this.mouseDown);
	        Laya.Laya.stage.off(Laya.Event.RIGHT_MOUSE_UP, this, this.mouseUp);
	    }
	    mouseDown(e) {
	        this.camera.transform.localRotation.getYawPitchRoll(this.yawPitchRoll);
	        this.lastMouseX = Laya.Laya.stage.mouseX;
	        this.lastMouseY = Laya.Laya.stage.mouseY;
	        this.isMouseDown = true;
	    }
	    mouseUp(e) {
	        this.isMouseDown = false;
	    }
	    mouseOut(e) {
	        this.isMouseDown = false;
	    }
	    moveForward(distance) {
	        this._tempVector3.x = this._tempVector3.y = 0;
	        this._tempVector3.z = distance;
	        this.camera.transform.translate(this._tempVector3);
	    }
	    moveRight(distance) {
	        this._tempVector3.y = this._tempVector3.z = 0;
	        this._tempVector3.x = distance;
	        this.camera.transform.translate(this._tempVector3);
	    }
	    moveVertical(distance) {
	        this._tempVector3.x = this._tempVector3.z = 0;
	        this._tempVector3.y = distance;
	        this.camera.transform.translate(this._tempVector3, false);
	    }
	}

	let packurl = 'sample-resource/2d';
	let sceneurl = packurl + '/cacheasbmp.ls';
	var is3d = true;
	class SceneLoad1 {
	    constructor() {
	        if (!Laya.LayaEnv.isConch) {
	            Laya.LayaGL.unitRenderModuleDataFactory = new Laya.WebUnitRenderModuleDataFactory();
	            Laya.LayaGL.renderDeviceFactory = new Laya.WebGLRenderDeviceFactory();
	            Laya.Laya3DRender.renderOBJCreate = new Laya.LengencyRenderEngine3DFactory();
	            Laya.Laya3DRender.Render3DModuleDataFactory = new Laya.Web3DRenderModuleFactory();
	            Laya.Laya3DRender.Render3DPassFactory = new Laya.WebGL3DRenderPassFactory();
	            Laya.LayaGL.renderOBJCreate = new Laya.WebGLRenderEngineFactory();
	            Laya.LayaGL.render2DRenderPassFactory = new Laya.WebGLRender2DProcess();
	        }
	        else {
	            Laya.LayaGL.unitRenderModuleDataFactory = new Laya.RTUintRenderModuleDataFactory();
	            Laya.LayaGL.renderDeviceFactory = new Laya.GLESRenderDeviceFactory();
	            Laya.Laya3DRender.renderOBJCreate = new Laya.LengencyRenderEngine3DFactory();
	            Laya.Laya3DRender.Render3DModuleDataFactory = new Laya.RT3DRenderModuleFactory();
	            Laya.Laya3DRender.Render3DPassFactory = new Laya.GLES3DRenderPassFactory();
	            Laya.LayaGL.renderOBJCreate = new Laya.GLESRenderEngineFactory();
	            Laya.LayaGL.render2DRenderPassFactory = new Laya.GLESRender2DProcess();
	        }
	        Laya.Laya.init(0, 0).then(() => Laya.__awaiter(this, void 0, void 0, function* () {
	            Laya.Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
	            Laya.Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
	            Laya.Shader3D.debugMode = true;
	            yield Laya.Laya.loader.loadPackage(packurl, null, null);
	            yield this.loadSceneResource();
	        }));
	    }
	    loadSceneResource() {
	        return Laya.__awaiter(this, void 0, void 0, function* () {
	            if (!is3d) {
	                let scene = yield Laya.Laya.loader.load(sceneurl);
	                Laya.Laya.stage.addChild(scene.create());
	            }
	            else {
	                Laya.Scene3D.load(sceneurl, Laya.Handler.create(this, function (scene) {
	                    Laya.Laya.stage.addChild(scene);
	                    var camera = scene.getChildByName("Main Camera");
	                    if (camera)
	                        camera.addComponent(CameraMoveScript);
	                }));
	            }
	        });
	    }
	}

	Laya.Resource.DEBUG = true;
	Laya.LayaGL.renderOBJCreate = new Laya.WebGLRenderEngineFactory();
	new SceneLoad1();

})(Laya);
