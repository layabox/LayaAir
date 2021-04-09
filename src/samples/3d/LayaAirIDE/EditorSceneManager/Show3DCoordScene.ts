import { Laya } from "Laya";
import { Camera } from "laya/d3/core/Camera";
import { UnlitMaterial } from "laya/d3/core/material/UnlitMaterial";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Vector3 } from "laya/d3/math/Vector3";
import { Event } from "laya/events/Event";
import { RenderTexture } from "laya/d3/resource/RenderTexture";
import { RenderTextureDepthFormat, RenderTextureFormat } from "laya/resource/RenderTextureFormat";
import { Texture } from "laya/resource/Texture";
import { Box } from "laya/ui/Box";
import { Image } from "laya/ui/Image";
import { Handler } from "laya/utils/Handler";
import { CameraControlScript, IDE_RotateDirectFlags } from "../EditorComponent/CameraControlScript";
import { BillboardMaterial } from "../EditorMaterial/BillboardMaterial";
import { Vector4 } from "laya/d3/math/Vector4";
import { EditPickUtil } from "../MouseInteraction/EditPickUtil";
import { Script3D } from "laya/d3/component/Script3D";
import { Sprite } from "laya/display/Sprite";

/**
 * miner 用来显示旋转小场景
 */
export class Show3DCoordScene extends Script3D{
    static CoordImageSize:number = 100;
    static pickRect:number =5;
    static CheckColorFZ:Vector4 = new Vector4(44,144,255,255);
    static CheckColorZZ:Vector4 = new Vector4(40,144,255,255);
    static CheckColorFX:Vector4 = new Vector4(247,52,100,255);
    static CheckColorZX:Vector4 = new Vector4(247,52,81,255);
    static CheckColorFY:Vector4 = new Vector4(135,212,2,255);
    static CheckColorZY:Vector4 = new Vector4(135,212,3,255);

    pickColorArray:Uint8Array = new Uint8Array((Show3DCoordScene.pickRect*2+1)*(Show3DCoordScene.pickRect*2+1)*4);
    //小坐标场景
    coord3DScene:Scene3D;
    //图标相机
    tubiaoCamera:Camera;
    //图标相机贴图
    tubiaoTarget:RenderTexture;
    //图标Image
    showImage:Image;
    //主场景相机控制器
    cameraControl:CameraControlScript;
    //主场景panel
    parent:Sprite;
    //@private
    private _tempVec:Vector3 = new Vector3();

    constructor(){
        super();
    }

    init(cameraControl:CameraControlScript,parent:Sprite){
        //
        this.cameraControl = cameraControl;
        this.parent = parent;
        //开启鼠标点击事件
        Laya.stage.on(Event.MOUSE_DOWN,this,this.mouseDown);

        Scene3D.load("res/3DEditorResource/LayaScene_tubiao/Conventional/tubiao.ls",Handler.create(this,function(scene:Scene3D):void{
            Laya.stage.addChild(scene);
            this.Coord3DScene = scene;
            var camera = (<Camera>scene.getChildByName("Main Camera"));
			camera.clearColor = new Vector4(0.0,0.0,0.0,0.0);
			camera.viewport.width=Show3DCoordScene.CoordImageSize;
			camera.viewport.height = Show3DCoordScene.CoordImageSize;
            camera.orthographic = true;
            camera.orthographicVerticalSize = 8;
			this.tubiaoCamera = camera;
            camera.enableHDR = false;
			this.tubiaoTarget = camera.renderTarget = RenderTexture.createFromPool(Show3DCoordScene.CoordImageSize,Show3DCoordScene.CoordImageSize,RenderTextureFormat.R8G8B8A8,RenderTextureDepthFormat.DEPTH_16);
			var tubiaoSprite = scene.getChildByName("tubiao");
            //切换图标材质
			for(let i = 0;i<6;i++){
				var currentMat:UnlitMaterial;
				var transMat:BillboardMaterial;
				currentMat = <UnlitMaterial>(tubiaoSprite.getChildAt(i) as MeshSprite3D).meshRenderer.sharedMaterial;
				transMat = new BillboardMaterial();
				transMat.renderMode = BillboardMaterial.RENDERMODE_TRANSPARENT;
				transMat.alphaTestValue = 0.5;
				transMat.albedoTexture = currentMat.albedoTexture;
				(tubiaoSprite.getChildAt(i) as MeshSprite3D).meshRenderer.sharedMaterial = transMat;
			}
           this.addImage();
        }));
    }



    addImage(){
        this.showImage = new Image();
        
        this.showImage.source = new Texture(this.tubiaoTarget);
        this.parent.addChild(this.showImage);
        this.showImage.top = 10;
        this.showImage.right = 10;
        //Laya.timer.frameLoop(1,this,this.tongbuCameraDir);
    }
    onUpdate(){
        this.tongbuCameraDir();
    }
    tongbuCameraDir(){
        //@ts-ignore
        if(this.tubiaoCamera)
        //@ts-ignore
        CameraControlScript.calByIcoXYZ(Vector3._ZERO,this._tempVec,10,this.cameraControl.currentRotate,this.tubiaoCamera);
     
    }


    mouseDown(e:Event){
        var x = Laya.stage.mouseX;
        var y = Laya.stage.mouseY;
        if(x>this.showImage.x&&x<this.showImage.x+Show3DCoordScene.CoordImageSize){
            if(y>this.showImage.y&&y<this.showImage.y+Show3DCoordScene.CoordImageSize){
                console.log("pick Image");
                EditPickUtil.pickRenderTextureColor(x-this.showImage.x,y-this.showImage.y,this.tubiaoTarget,this.pickColorArray,Show3DCoordScene.pickRect);
                //拿出颜色来检测是否有合格的颜色值，再做相机动画
                for(let i:number = 0,n=this.pickColorArray.length;i<n;i+=4){
                    switch(this.pickColorArray[i+1]){
                        case 144://z
                            if(this.pickColorArray[i]==44&&this.pickColorArray[i+2]==255){
                                this.cameraControl.doRotateAnimator(IDE_RotateDirectFlags.Back);
                                return;
                            }
                            if(this.pickColorArray[i]==40&&this.pickColorArray[i+2]==255){
                                this.cameraControl.doRotateAnimator(IDE_RotateDirectFlags.Front);
                                return;
                            }
                            break;
                        case 52://x
                            if(this.pickColorArray[i]==247&&this.pickColorArray[i+2]==100){
                                this.cameraControl.doRotateAnimator(IDE_RotateDirectFlags.Left);
                                return;
                            }
                            if(this.pickColorArray[i]==247&&this.pickColorArray[i+2]==81){
                                this.cameraControl.doRotateAnimator(IDE_RotateDirectFlags.Right);
                                return;
                            }
                            break;
                        case 212://y
                            if(this.pickColorArray[i]==135&&this.pickColorArray[i+2]==5){
                                this.cameraControl.doRotateAnimator(IDE_RotateDirectFlags.Down);
                                return;
                            }
                            if(this.pickColorArray[i]==135&&this.pickColorArray[i+2]==3){
                                this.cameraControl.doRotateAnimator(IDE_RotateDirectFlags.Up);
                                return;
                            }
                            break;
                        default:
                            break;
                    }
                }
                
            }
        }
    }

    destroy(){
        this.showImage.destroy(true);
        this.coord3DScene.destroy(true);
        Laya.stage.off(Event.MOUSE_DOWN,this,this.mouseDown);

    }
}