import { Config3D } from "Config3D";
import { Laya } from "Laya";
import { Camera } from "laya/d3/core/Camera";
import { BlinnPhongMaterial } from "laya/d3/core/material/BlinnPhongMaterial";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { RenderContext3D } from "laya/d3/core/render/RenderContext3D";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { Vector2 } from "laya/d3/math/Vector2";
import { Vector3 } from "laya/d3/math/Vector3";
import { Vector4 } from "laya/d3/math/Vector4";
import { RenderTexture } from "laya/d3/resource/RenderTexture";
import { Shader3D } from "laya/d3/shader/Shader3D";
import { EditerScene3D } from "laya/d3Editor/EditerScene3D";
import { PickShader } from "laya/d3Editor/material/PickShader";
import { TransformSprite3D } from "laya/d3Editor/TransformSprite3D";
import { Sprite } from "laya/display/Sprite";
import { Stage } from "laya/display/Stage";
import { Event } from "laya/events/Event";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { BaseTexture } from "laya/webgl/resource/BaseTexture";
import { Laya3D } from "Laya3D";
import { CameraMoveScript } from "../common/CameraMoveScript";

/**
 * ...
 * @author
 */
export class EditorDemo {
	private camera: Camera;
	private renderTargetCamera: Camera;
	private editerScene3d: EditerScene3D;
	private transformSprite3d: TransformSprite3D;

	/** @private */
	private meshPickShader: Shader3D;

	private renderSizeWidth: number;
	private renderSizeHeight: number;

	private lastX: number;
	private lastY: number;
	private curX: number;
	private curY: number;
	private delX: number;
	private delY: number;

	private sprite: Sprite;

	constructor() {

		Shader3D.debugMode = true;
		var config: Config3D = new Config3D();
		config._editerEnvironment = true;
		Laya3D.init(0, 0, config);
		PickShader.initShader();
		Laya.stage.scaleMode = Stage.SCALE_FULL;
		Laya.stage.screenMode = Stage.SCREEN_NONE;
		Stat.show();
		this.meshPickShader = Shader3D.find("GPUPick");
		Scene3D.load("../../../../res/threeDimen/GPUPick/New Scene.ls", Handler.create(this, this.onSceneLoaded));
	}

	onSceneLoaded(scene: Scene3D): void {

		Laya.stage.addChild(scene);
		this.editerScene3d = new EditerScene3D(scene);

		this.camera = (<Camera>scene.getChildByName("Main Camera"));

		var camScript: CameraMoveScript = (<CameraMoveScript>this.camera.addComponent(CameraMoveScript));
		camScript.scene = this.editerScene3d;
		this.renderTargetCamera = (<Camera>scene.addChild(this.camera.clone()));
		this.renderTargetCamera.enableRender = false;
		this.renderTargetCamera.renderingOrder = -1;
		this.renderTargetCamera.clearColor = new Vector4(0.0, 0.0, 0.0, 0.0);

		this.transformSprite3d = this.editerScene3d.transformSprite3D;
		this.transformSprite3d.curCamera = this.camera;

		Sprite3D.load("../../../../res/threeDimen/skinModel/dude/dude.lh", Handler.create(null, function (dude: Sprite3D): void {
			scene.addChild(dude);
		}))
		Sprite3D.load("fire.lh", Handler.create(null, function (sprite: Sprite3D): void {
			sprite.transform.localPosition = new Vector3(2, 3, 0);
			scene.addChild(sprite);
		}))
		Sprite3D.load("../../../../res/threeDimen/staticModel/grid/plane.lh", Handler.create(null, function (sprite: Sprite3D): void {
			(<Sprite3D>scene.addChild(sprite));
			var grid: MeshSprite3D = sprite.getChildAt(0);
			((<BlinnPhongMaterial>grid.meshRenderer.sharedMaterial)).albedoTexture = this.renderTargetCamera.renderTarget;
		}));

		this.onResize();

		this.addEvent();
	}

	private addEvent(): void {
		Laya.stage.on(Event.RESIZE, this, this.onResize);
		Laya.stage.on(Event.MOUSE_DOWN, this, this.onMouseDown);
		Laya.stage.on(Event.MOUSE_UP, this, this.onMouseUp);
		Laya.stage.on(Event.RIGHT_MOUSE_DOWN, this, this.onRightMouseDown);
		Laya.stage.on(Event.RIGHT_MOUSE_UP, this, this.onRightMouseUp);
		Laya.stage.on(Event.KEY_DOWN, this, this.onKeyDown);
	}

	private onResize(e: Event = null): void {

		this.renderSizeWidth = RenderContext3D.clientWidth;
		this.renderSizeHeight = RenderContext3D.clientHeight;
		this.renderTargetCamera.renderTarget && this.renderTargetCamera.renderTarget.destroy();
		this.renderTargetCamera.renderTarget = new RenderTexture(this.renderSizeWidth, this.renderSizeHeight, BaseTexture.FORMAT_RGB_8_8_8);
	}

	private curSelectSprite: Sprite3D;
	private curTransformType: number;
	private vector: Vector3 = new Vector3();
	private tempV: Vector2 = new Vector2();

	private curPos: Vector2 = new Vector2();
	private delPos: Vector2 = new Vector2();
	private delPosNormalize: Vector2 = new Vector2();
	private lastPos: Vector2 = new Vector2();

	private _transform: Vector3 = new Vector3();

	private pointA: Vector3 = new Vector3();
	private pointB: Vector3 = new Vector3();

	private onMouseDown(e: Event = null): void {

		this.renderTargetCamera.render(this.meshPickShader, PickShader.PICK_SHADER_FLAG);


		var pickSprite: Sprite3D = this.pickSpriteByPickColors(e.stageX, e.stageY);



		var name: string;
		if (pickSprite) {
			this.transformSprite3d.reFresh();
			if (!pickSprite.transformType) {
				this.curSelectSprite = pickSprite;
				this.curSelectSprite.transform.position.cloneTo(this.transformSprite3d.transform.position);
				this.transformSprite3d.transform.position = this.transformSprite3d.transform.position;
				this.curSelectSprite.transform.rotation.cloneTo(this.transformSprite3d.transform.rotation);
				this.transformSprite3d.transform.rotation = this.transformSprite3d.transform.rotation;

				var distance: number = Vector3.distance(this.camera.transform.position, this.curSelectSprite.transform.position);
				this.transformSprite3d.transform.scale = new Vector3(distance * 0.25, distance * 0.25, distance * 0.2);
				this.transformSprite3d.active = true;
			} else {
				this.curTransformType = pickSprite.transformType;
				switch (this.curTransformType) {
					case 1:
						this.vector = this.curSelectSprite.transform.right;
						this.transformSprite3d.onSelectChangeColor(this.transformSprite3d.positionX);
						break;
					case 2:
						this.vector = this.curSelectSprite.transform.up;
						this.transformSprite3d.onSelectChangeColor(this.transformSprite3d.positionY);
						break;
					case 3:
						this.vector = this.curSelectSprite.transform.forward;
						this.transformSprite3d.onSelectChangeColor(this.transformSprite3d.positionZ);
						break;
					case 4:
						this.vector = this.curSelectSprite.transform.up;
						this.transformSprite3d.onSelectChangeColor(this.transformSprite3d.rotationX);
						break;
					case 5:
						this.vector = this.curSelectSprite.transform.right;
						this.transformSprite3d.onSelectChangeColor(this.transformSprite3d.rotationY);
						break;
					case 6:
						this.vector = this.curSelectSprite.transform.up;
						this.transformSprite3d.onSelectChangeColor(this.transformSprite3d.rotationZ);
						break;
					case 7:
						this.vector = this.curSelectSprite.transform.right;
						this.transformSprite3d.onSelectChangeColor(this.transformSprite3d.scalingX);
						break;
					case 8:
						this.vector = this.curSelectSprite.transform.up;
						this.transformSprite3d.onSelectChangeColor(this.transformSprite3d.scalingY);
						break;
					case 9:
						this.vector = this.curSelectSprite.transform.forward;
						this.transformSprite3d.onSelectChangeColor(this.transformSprite3d.scalingZ);
						break;
					default:
						break;
				}

				this.camera.worldToViewportPoint(this.curSelectSprite.transform.position, this.pointA);
				Vector3.add(this.curSelectSprite.transform.position, this.vector, this.vector);
				this.camera.worldToViewportPoint(this.vector, this.pointB);
				this.tempV.x = this.pointB.x - this.pointA.x;
				this.tempV.y = this.pointB.y - this.pointA.y;
				Vector2.normalize(this.tempV, this.tempV);

				Laya.stage.on(Event.MOUSE_MOVE, this, this.onMouseMove);
			}
		} else {
			this.transformSprite3d.active = false;
		}
		this.lastX = e.stageX;
		this.lastY = e.stageY;
	}

	private onMouseMove(e: Event = null): void {
		this.curX = e.stageX;
		this.curY = e.stageY;
		this.delPos.x = (this.lastX - this.curX);
		this.delPos.y = (this.lastY - this.curY);

		Vector3._ZERO.cloneTo(this._transform);
		Vector2.normalize(this.delPos, this.delPosNormalize);
		var radius: number = Math.acos(Vector2.dot(this.delPosNormalize, this.tempV));
		var length: number = Vector2.scalarLength(this.delPos);
		var positionRatio: number = 0.01;
		var rotationRatio: number = 0.008;
		var scaleRatio: number = 0.004;
		var offset: number = length * Math.cos(radius);
		switch (this.curTransformType) {
			case 1:
				this._transform.x = -offset * positionRatio;
				this.curSelectSprite.transform.translate(this._transform);
				this.transformSprite3d.transform.translate(this._transform);
				break;
			case 2:
				this._transform.y = -offset * positionRatio;
				this.curSelectSprite.transform.translate(this._transform);
				this.transformSprite3d.transform.translate(this._transform);
				break;
			case 3:
				this._transform.z = offset * positionRatio;
				this.curSelectSprite.transform.translate(this._transform);
				this.transformSprite3d.transform.translate(this._transform);
				break;
			case 4:
				this._transform.x = offset * rotationRatio;
				this.curSelectSprite.transform.rotate(this._transform);
				this.transformSprite3d.transform.rotate(this._transform);
				break;
			case 5:
				this._transform.y = -offset * rotationRatio;
				this.curSelectSprite.transform.rotate(this._transform);
				this.transformSprite3d.transform.rotate(this._transform);
				break;
			case 6:
				this._transform.z = -offset * rotationRatio;
				this.curSelectSprite.transform.rotate(this._transform);
				this.transformSprite3d.transform.rotate(this._transform);
				break;
			case 7:
				this._transform.x = -offset * scaleRatio;
				Vector3.add(this.curSelectSprite.transform.scale, this._transform, this.curSelectSprite.transform.scale);
				this.curSelectSprite.transform.scale = this.curSelectSprite.transform.scale;
				break;
			case 8:
				this._transform.y = -offset * scaleRatio;
				Vector3.add(this.curSelectSprite.transform.scale, this._transform, this.curSelectSprite.transform.scale);
				this.curSelectSprite.transform.scale = this.curSelectSprite.transform.scale;
				break;
			case 9:
				this._transform.z = offset * scaleRatio;
				Vector3.add(this.curSelectSprite.transform.scale, this._transform, this.curSelectSprite.transform.scale);
				this.curSelectSprite.transform.scale = this.curSelectSprite.transform.scale;
				break;
			default:
				break;
		}
		this.lastX = this.curX;
		this.lastY = this.curY;
	}

	private onMouseUp(e: Event = null): void {
		Laya.stage.off(Event.MOUSE_MOVE, this, this.onMouseMove);
	}

	pickSpriteByPickColors(posx: number, posy: number): Sprite3D {
		var pixels: Uint8Array = new Uint8Array(this.renderSizeWidth * this.renderSizeHeight * 4);
		this.renderTargetCamera.renderTarget.getData(0, 0, this.renderSizeWidth, this.renderSizeHeight, pixels);
		var tempSprite: Sprite3D;
		//posx, posy
		var pickSprite: Sprite3D = this.pickSpriteByPickColor(posx, posy, pixels);
		if (pickSprite) {
			if (pickSprite.transformType) {
				return pickSprite;
			}
			tempSprite = pickSprite;
		}
		//posx+1, posy
		pickSprite = this.pickSpriteByPickColor(posx + 1, posy, pixels);
		if (pickSprite) {
			if (pickSprite.transformType) {
				return pickSprite;
			}
			tempSprite = pickSprite;
		}
		//posx-1, posy
		pickSprite = this.pickSpriteByPickColor(posx - 1, posy, pixels);
		if (pickSprite) {
			if (pickSprite.transformType) {
				return pickSprite;
			}
			tempSprite = pickSprite;
		}
		//posx, posy+1
		pickSprite = this.pickSpriteByPickColor(posx, posy + 1, pixels);
		if (pickSprite) {
			if (pickSprite.transformType) {
				return pickSprite;
			}
			tempSprite = pickSprite;
		}
		//posx, posy-1
		pickSprite = this.pickSpriteByPickColor(posx, posy - 1, pixels);
		if (pickSprite) {
			if (pickSprite.transformType) {
				return pickSprite;
			}
			tempSprite = pickSprite;
		}
		//posx-1, posy-1
		pickSprite = this.pickSpriteByPickColor(posx - 1, posy - 1, pixels);
		if (pickSprite) {
			if (pickSprite.transformType) {
				return pickSprite;
			}
			tempSprite = pickSprite;
		}
		//posx+1, posy-1
		pickSprite = this.pickSpriteByPickColor(posx + 1, posy - 1, pixels);
		if (pickSprite) {
			if (pickSprite.transformType) {
				return pickSprite;
			}
			tempSprite = pickSprite;
		}
		//posx-1, posy+1
		pickSprite = this.pickSpriteByPickColor(posx - 1, posy + 1, pixels);
		if (pickSprite) {
			if (pickSprite.transformType) {
				return pickSprite;
			}
			tempSprite = pickSprite;
		}
		//posx+1, posy+1
		pickSprite = this.pickSpriteByPickColor(posx + 1, posy + 1, pixels);
		if (pickSprite) {
			if (pickSprite.transformType) {
				return pickSprite;
			}
			tempSprite = pickSprite;
		}

		//posx+2, posy
		pickSprite = this.pickSpriteByPickColor(posx + 2, posy, pixels);
		if (pickSprite && pickSprite.transformType) {
			return pickSprite;
		}
		//posx-2, posy
		pickSprite = this.pickSpriteByPickColor(posx - 2, posy, pixels);
		if (pickSprite && pickSprite.transformType) {
			return pickSprite;
		}
		//posx, posy+2
		pickSprite = this.pickSpriteByPickColor(posx, posy + 2, pixels);
		if (pickSprite && pickSprite.transformType) {
			return pickSprite;
		}
		//posx, posy-2
		pickSprite = this.pickSpriteByPickColor(posx, posy - 2, pixels);
		if (pickSprite && pickSprite.transformType) {
			return pickSprite;
		}

		//posx+2, posy-1
		pickSprite = this.pickSpriteByPickColor(posx + 2, posy - 1, pixels);
		if (pickSprite && pickSprite.transformType) {
			return pickSprite;
		}
		//posx+2, posy+1
		pickSprite = this.pickSpriteByPickColor(posx + 2, posy + 1, pixels);
		if (pickSprite && pickSprite.transformType) {
			return pickSprite;
		}
		//posx-2, posy-1
		pickSprite = this.pickSpriteByPickColor(posx - 2, posy - 1, pixels);
		if (pickSprite && pickSprite.transformType) {
			return pickSprite;
		}
		//posx-2, posy+1
		pickSprite = this.pickSpriteByPickColor(posx - 2, posy + 1, pixels);
		if (pickSprite && pickSprite.transformType) {
			return pickSprite;
		}
		//posx-1, posy+2
		pickSprite = this.pickSpriteByPickColor(posx - 1, posy + 2, pixels);
		if (pickSprite && pickSprite.transformType) {
			return pickSprite;
		}
		//posx+1, posy+2
		pickSprite = this.pickSpriteByPickColor(posx + 1, posy + 2, pixels);
		if (pickSprite && pickSprite.transformType) {
			return pickSprite;
		}
		//posx-1, posy-2
		pickSprite = this.pickSpriteByPickColor(posx - 1, posy - 2, pixels);
		if (pickSprite && pickSprite.transformType) {
			return pickSprite;
		}
		//posx+1, posy-2
		pickSprite = this.pickSpriteByPickColor(posx + 1, posy - 2, pixels);
		if (pickSprite && pickSprite.transformType) {
			return pickSprite;
		}

		//posx-2, posy-2
		pickSprite = this.pickSpriteByPickColor(posx - 2, posy - 2, pixels);
		if (pickSprite && pickSprite.transformType) {
			return pickSprite;
		}
		//posx+2, posy-2
		pickSprite = this.pickSpriteByPickColor(posx + 2, posy - 2, pixels);
		if (pickSprite && pickSprite.transformType) {
			return pickSprite;
		}
		//posx-2, posy+2
		pickSprite = this.pickSpriteByPickColor(posx - 2, posy + 2, pixels);
		if (pickSprite && pickSprite.transformType) {
			return pickSprite;
		}
		//posx+2, posy+2
		pickSprite = this.pickSpriteByPickColor(posx + 2, posy + 2, pixels);
		if (pickSprite && pickSprite.transformType) {
			return pickSprite;
		}

		return tempSprite;
	}

	pickSpriteByPickColor(posx: number, posy: number, pixels: Uint8Array): Sprite3D {

		if (posx < 0 || posy < 0) {
			return null;
		}

		var index: number = posy * this.renderSizeWidth * 4 + posx * 4;
		var color: Vector4 = new Vector4(pixels[index], pixels[index + 1], pixels[index + 2], 1.0);
		//debugger;
		var id: number = this.editerScene3d.scene._searchIDByPickColor(color);
		var pickSprite: Sprite3D = this.editerScene3d.scene._pickIdToSprite[id];
		if (pickSprite) {
			return pickSprite;
		}
		return null;
	}

	/**键盘按下处理*/
	private onKeyDown(e: any = null): void {
		if (!this.keyBoardIsOk) {
			return;
		}
		if (e["keyCode"] == 87) {
			this.curSelectSprite && (this.transformSprite3d.positionSprite3D.active = true);
			this.curSelectSprite && (this.transformSprite3d.rotationSprite3D.active = false);
			this.curSelectSprite && (this.transformSprite3d.scaleSprite3D.active = false);
		} else if (e["keyCode"] == 69) {
			this.curSelectSprite && (this.transformSprite3d.positionSprite3D.active = false);
			this.curSelectSprite && (this.transformSprite3d.rotationSprite3D.active = true);
			this.curSelectSprite && (this.transformSprite3d.scaleSprite3D.active = false);
		} else if (e["keyCode"] == 82) {
			this.curSelectSprite && (this.transformSprite3d.positionSprite3D.active = false);
			this.curSelectSprite && (this.transformSprite3d.rotationSprite3D.active = false);
			this.curSelectSprite && (this.transformSprite3d.scaleSprite3D.active = true);
		}
	}
	private keyBoardIsOk = true;

	private onRightMouseDown(): void {
		this.keyBoardIsOk = false;
	}

	private onRightMouseUp(): void {
		this.keyBoardIsOk = true;
	}
}

