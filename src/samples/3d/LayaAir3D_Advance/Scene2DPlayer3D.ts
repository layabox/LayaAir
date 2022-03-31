import { Laya } from "Laya";
import { Camera } from "laya/d3/core/Camera";
import { DirectionLight } from "laya/d3/core/light/DirectionLight";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { Vector3 } from "laya/d3/math/Vector3";
import { Stage } from "laya/display/Stage";
import { KeyBoardManager } from "laya/events/KeyBoardManager";
import { Image } from "laya/ui/Image";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { Laya3D } from "Laya3D";
import { Sprite } from "laya/display/Sprite";
import { RenderTexture } from "laya/d3/resource/RenderTexture";
import { RenderTextureDepthFormat, RenderTextureFormat } from "laya/resource/RenderTextureFormat";
import { Texture } from "laya/resource/Texture";
import { Vector4 } from "laya/d3/math/Vector4";
import { Config } from "Config";
import { Keyboard } from "laya/events/Keyboard";
import { Label } from "laya/ui/Label";

export class Scene2DPlayer3D {

	private orthographicPos: Vector3 = new Vector3(0, 0, 0);
	/** 当前所处的旋转方位 */
	private _rotation: Vector3 = new Vector3(0, 0, 0);
	private rotationW: Vector3 = new Vector3(0, 0, 0);
	private rotationS: Vector3 = new Vector3(0, 180, 0);
	private rotationA: Vector3 = new Vector3(0, 90, 0);
	private rotationD: Vector3 = new Vector3(0, -90, 0);

	private _3DScene: Scene3D;
	private sp3Role: Sprite3D = new Sprite3D();

	private spMonkey: Sprite = new Sprite();
	private spRole: Sprite = new Sprite();
	/** 拖尾的节点精灵 */
	private spTrail: Sprite = new Sprite();
	/** 拖尾的当前转向 */
	private turnLeft: boolean = true;

	constructor() {
		debugger;
		this.initSet();
		this.create2D();

		//由于2D与3D混合，要涉及到屏幕适配后的像素数值转换，最好延迟几帧，保障屏幕适配值正确后再执行相关逻辑。如果是继承了引擎的Script，可以不用延迟，直接写到onStart生命周期里即可
		Laya.timer.frameOnce(5, this, () => {
			this.sp3ToTexture("res/threeDimen/skinModel/LayaMonkey/LayaMonkey.lh", this.spMonkey, 1);

			this.sp3ToTexture("res/threeDimen/skinModel/dude/dude.lh", this.spRole, 2, true);
			this.spRole.pos(385, 399);

			this.sp3ToTexture("res/threeDimen/trail/Cube.lh", this.spTrail, 3);
		});

		//每帧循环
		Laya.timer.frameLoop(1, this, this.onKeyDown);
	}

	/** 初始化设置 */
	initSet(): void {
		Config.useRetinalCanvas = true;
		//初始化3D引擎
		Laya3D.init(0, 0);
		//舞台的适配模式
		Laya.stage.scaleMode = Stage.SCALE_FULL;
		Laya.stage.screenMode = Stage.SCREEN_NONE;
		//显示性能面板
		Stat.show();

		this._3DScene = new Scene3D();
		//添加3D场景到舞台上
		Laya.stage.addChild(this._3DScene);
		//为3D场景添加平行光
		this._3DScene.addChild(new DirectionLight());
	}

	/** 创建2D相关 */
	create2D(): void {
		//创建一个image组件作为2D场景的背景图
		let sceneBackGround: Image = new Image("res/threeDimen/secne.jpg");
		//添加到舞台上
		Laya.stage.addChild(sceneBackGround);

		//添加2D精灵，
		sceneBackGround.addChild(this.spMonkey);
		this.spMonkey.pos(399, 220);
		sceneBackGround.addChild(this.spRole);
		sceneBackGround.addChild(this.spTrail);
		this.spTrail.pos(10, 300);

		//添加操作提示的文本
		let _label = new Label();
		sceneBackGround.addChild(_label);
		_label.text = "点击屏幕后，使用键盘 WSAD 可以控制前后左右移动";
		_label.font = "SimHei";
		_label.fontSize = 38;
		_label.color = "#FFFFFF";
		_label.top = 10;
		_label.centerX = 0;
	}

	/** 加载3D精灵画到2D Texture上 
	 * @param lh 模型的字符串路径
	 * @param sp 2D精灵节点，用于画3D的texture
	 * @param layer 手动指定层ID
	 * @param isRole 是否是可以被控制的主角
	*/
	sp3ToTexture(lh: string, sp: Sprite, layer: number, isRole: boolean = false): void {
		//加载模型，并在加载完之后的回调函数里处理逻辑
		Sprite3D.load(lh, Handler.create(this, (sp3: Sprite3D): void => {
			//把加载完的3D精灵添加到3D场景
			this._3DScene.addChild(sp3);

			//创建一个3D摄像机
			var _camera: Camera = new Camera(0, 0.1, 1000);
			this._3DScene.addChild(_camera);
			//调整摄像机角度
			_camera.transform.rotate(new Vector3(-45, 0, 0), false, false);

			//设置正交相机模式
			_camera.orthographic = true;
			//正交投影垂直矩阵尺寸
			_camera.orthographicVerticalSize = 10;
			_camera.clearColor = new Vector4(0, 0, 0, 0);
			//转换2D屏幕坐标系统到3D正交投影下的坐标系统
			_camera.convertScreenCoordToOrthographicCoord(new Vector3(800, 700, 0), this.orthographicPos);
			sp3.transform.position = this.orthographicPos;
			//初始化精灵缩放比例
			sp3.transform.localScale = new Vector3(1, 1, 1);

			//如果有多个3D需要分别显示控制，清除别的层，用于每一个层只显示一个，只有一个的话，可以不使用层
			_camera.removeAllLayers();
			//添加一个摄像机层
			_camera.addLayer(layer);
			//一定要给对应的渲染对象节点设置层与摄像机一样的层，如果不清楚是哪个节点，就写个循环，把所有节点都遍历设置一下，否则会影响显示结果
			(<Sprite3D>sp3.getChildAt(0).getChildAt(0)).layer = layer;

			//把3D画到512宽高的纹理上，再添加到摄像机的目标纹理，形成动态绑定(一个摄像机只能绑一个，要绑多个就要创建多个摄像机)
			_camera.renderTarget = new RenderTexture(512, 512, RenderTextureFormat.R8G8B8A8, RenderTextureDepthFormat.DEPTHSTENCIL_24_8)
			//再将离屏3D画到2D节点上，至此，就完成把3D画到2D的基础渲染流程
			sp.texture = new Texture(_camera.renderTarget);

			//根据参数决定是否要控制哪个节点
			isRole && (this.sp3Role = sp3);
		}));
	}

	/** 在每帧的循环里帧听键盘事件并作出对应的操作逻辑 */
	private onKeyDown(): void {
		//调整拖尾转向
		if (this.spTrail.x < 20 && this.turnLeft) this.turnLeft = false;
		else if (this.spTrail.x > (Laya.stage.width - 300) && !(this.turnLeft)) this.turnLeft = true;
		//控制拖尾的自动移动
		if (this.turnLeft) this.spTrail.x -= 1;
		else this.spTrail.x += 1;

		if (KeyBoardManager.hasKeyDown(Keyboard.W)) {
			this.spRole.y -= 1;
			this.rotateRole(this.rotationW);
		} else if (KeyBoardManager.hasKeyDown(Keyboard.S)) {
			this.spRole.y += 1;
			this.rotateRole(this.rotationS);
		} else if (KeyBoardManager.hasKeyDown(Keyboard.A)) {
			this.spRole.x -= 1;
			this.rotateRole(this.rotationA);
		} else if (KeyBoardManager.hasKeyDown(Keyboard.D)) {
			this.spRole.x += 1;
			this.rotateRole(this.rotationD);
		}
	}

	/** 改变角色的朝向 
	 * @param r Vector3旋转值
	 */
	private rotateRole(r: Vector3): void {
		if (r === this._rotation) return;
		//按世界坐标改变到指定的方位
		this.sp3Role.transform.rotationEuler = r;
		//纪录当前方位，避免重复改变
		this._rotation = r;
	}
}

