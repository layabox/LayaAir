import { Camera, CameraClearFlags } from "laya/d3/core/Camera";
import { RenderContext3D } from "laya/d3/core/render/RenderContext3D";
import { RenderableSprite3D } from "laya/d3/core/RenderableSprite3D";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { Vector4 } from "laya/d3/math/Vector4";
import { Viewport } from "laya/d3/math/Viewport";
import { RenderTexture } from "laya/d3/resource/RenderTexture";
import { RenderTextureDepthFormat, RenderTextureFormat } from "laya/resource/RenderTextureFormat";



/**
 * 编辑器拾取方法库
 * @author miner
 */
export class EditPickUtil {
	public static selectSprite: Sprite3D;
	public static editorCamera: Camera;
	public static pickCamera: Camera;
	public static editorScene: Scene3D;
	public static pickPixel: Uint8Array = new Uint8Array(4);
	public static pickVector4: Vector4 = new Vector4();
	public static oriClearFlag: CameraClearFlags = CameraClearFlags.Nothing;
	public static oriClearColor: Vector4 = new Vector4();
	public static cameraClearColor: Vector4 = new Vector4();
	public static oriPipeLineMode:string;

	/**
	 * 设置点选目标
	 * @param scene 点选scene 
	 * @param camera 点选Camera
	 */
	public static setPickTarget(scene: Scene3D, camera: Camera) {
		EditPickUtil.editorCamera = camera;
		EditPickUtil.editorScene = scene;
		if (!EditPickUtil.pickCamera) {
			EditPickUtil.pickCamera = new Camera();
			EditPickUtil.pickCamera.name = "pick Camera";
		}
		//@ts-ignore
		EditPickUtil.oriPipeLineMode = RenderContext3D._instance.configPipeLineMode;
	}


	/**
	 * 选中的渲染节点
	 * @param posX 相对位置x
	 * @param posY 相对位置y
	 * @param texture 点选图片
	 */
	private static pickRenderableSprite3D(posX: number, posY: number, texture: RenderTexture): RenderableSprite3D {
		var pixelArray = EditPickUtil.pickPixel;
		var pickVec = EditPickUtil.pickVector4;
		var scene = EditPickUtil.editorScene;
		texture.getData(posX, posY, 1, 1, EditPickUtil.pickPixel);
		console.log(this.pickPixel);
		pickVec.setValue(pixelArray[0], pixelArray[1], pixelArray[2], pixelArray[3]);
		//@ts-ignore
		var id = scene._searchIDByPickColor(pickVec);
		//@ts-ignore
		return scene._pickIdToSprite[id];
	}


	static pickRenderTextureColor(posX: number, posY: number, texture: RenderTexture, outPixelArray: Uint8Array, reck: number) {
		texture.getData(posX - reck, posY - reck, reck * 2 + 1, reck * 2 + 1, outPixelArray);
	}

	/**
	 * 获得选中的物体
	 * @param posX 绝对鼠标位置x
	 * @param posY 绝对鼠标位置y
	 * @param offsetX 图片偏移x
	 * @param offsetY 图片偏移y
	 * @param n 范围容错
	 */
	public static pickSelectSprite3D(posX: number, posY: number, offsetX: number = 0, offsetY: number = 0, n: number = 1): Sprite3D {
		var camera = EditPickUtil.editorCamera;
		if (posX < 0 || posY < 0 || !camera) return;
		//@ts-ignore
		var context = RenderContext3D._instance;
		//切换渲染pass
		//var pipeLineModeMode = context.pipelineMode;
		context.configPipeLineMode = "PickSprite";
		EditPickUtil.recordCameraData(camera);
		//渲染节点

		(!EditPickUtil.pickCamera) && (EditPickUtil.pickCamera.renderTarget = RenderTexture.createFromPool(camera.renderTarget.width, camera.renderTarget.height, RenderTextureFormat.R8G8B8A8, RenderTextureDepthFormat.DEPTH_16))
		var RT: RenderTexture = Camera.drawRenderTextureByScene(EditPickUtil.pickCamera, EditPickUtil.editorScene, EditPickUtil.pickCamera.renderTarget);

		var renderableSprite = EditPickUtil.pickRenderableSprite3D(posX - offsetX, posY - offsetY, RT);
		if (renderableSprite)
			EditPickUtil.selectSprite = renderableSprite;
		//还原渲染pass
		context.configPipeLineMode = EditPickUtil.oriPipeLineMode;
		return renderableSprite;
	}

	/**
	 * 记录camera原始数据，设置pick数据
	 * @param camera 
	 */
	public static recordCameraData(camera: Camera) {

		var pickCamera: Camera = EditPickUtil.pickCamera;
		pickCamera.farPlane = camera.farPlane;
		pickCamera.nearPlane = camera.nearPlane;
		pickCamera.transform.worldMatrix = camera.transform.worldMatrix;
		pickCamera.aspectRatio = camera.aspectRatio;
		pickCamera.orthographic = camera.orthographic;

		if (pickCamera.orthographic) {
			pickCamera.orthographicVerticalSize = camera.orthographicVerticalSize;
		}
		pickCamera.clearFlag = CameraClearFlags.SolidColor;
		pickCamera.clearColor = EditPickUtil.cameraClearColor;
	}



	/**
	 * 框选精灵队列
	 */
	public static pickSprite3DsByRect(): Array<Sprite3D> {
		return null;
	}


	/**
	 * 重新设置摄像机
	 * @param camera 
	 * @param width 宽度
	 * @param height 高度
	 */
	public static EditorCameraSet(camera: Camera, width: number, height: number,isOriCamraRenderTarget = true): void {
		var oriTargetTexture: RenderTexture = camera.renderTarget;
		var pickTargetTexture: RenderTexture = EditPickUtil.pickCamera.renderTarget;
		if (!oriTargetTexture) {
			isOriCamraRenderTarget&& (oriTargetTexture = camera.renderTarget = new RenderTexture(width, height, RenderTextureFormat.R8G8B8A8, RenderTextureDepthFormat.DEPTH_16));
			if (!pickTargetTexture)
				pickTargetTexture = EditPickUtil.pickCamera.renderTarget = new RenderTexture(width, height, RenderTextureFormat.R8G8B8A8, RenderTextureDepthFormat.DEPTH_16);
		}
		if (oriTargetTexture&&oriTargetTexture.width == width && oriTargetTexture.height == height) {
			return;
		}
		else {
			//这里用对象池会内存吃紧
			oriTargetTexture&&oriTargetTexture.destroy();
			pickTargetTexture && pickTargetTexture.destroy();
			oriTargetTexture&&(camera.renderTarget = new RenderTexture(width, height, RenderTextureFormat.R8G8B8A8, RenderTextureDepthFormat.DEPTH_16));
			EditPickUtil.pickCamera.renderTarget = new RenderTexture(width, height, RenderTextureFormat.R8G8B8A8, RenderTextureDepthFormat.DEPTH_16);

			camera.render();
			//这里可以是
			camera.viewport = new Viewport(0, 0, width, height);
		}
	}


}