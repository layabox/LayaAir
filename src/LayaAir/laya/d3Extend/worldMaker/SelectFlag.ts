	import { MeshSprite3D } from "laya/d3/core/MeshSprite3D"
	import { Sprite3D } from "laya/d3/core/Sprite3D"
	import { RenderState } from "laya/d3/core/material/RenderState"
	import { UnlitMaterial } from "laya/d3/core/material/UnlitMaterial"
	import { Vector3 } from "laya/d3/math/Vector3"
	import { Vector4 } from "laya/d3/math/Vector4"
	import { Handler } from "laya/utils/Handler"
	import { BaseTexture } from "laya/resource/BaseTexture"
	import { Texture2D } from "laya/resource/Texture2D"
	/**
	 * ...
	 * @author ...
	 */

	
	export class SelectFlag {
		
		private planeMaterial:UnlitMaterial[] = [];
		private posD:Vector3 = new Vector3();
		private redTilingoffset:Vector4 = new Vector4(1, 1, 0, 0);
		private greenTilingoffset:Vector4 = new Vector4(1, 1, 0, 0);
		private blueTilingoffset:Vector4 = new Vector4(1, 1, 0, 0);
			
		 selectFlag:Sprite3D;
		private redPlane:MeshSprite3D;
		private greenPlane:MeshSprite3D;
		private bluePlane:MeshSprite3D;
		private textures:Texture2D;
		private textures2:Texture2D;
		
		 static FACTOR:number = 10; 
		
		 isLoad:boolean = false;
		
		 currentScale:Vector3 = new Vector3(1,1,1);
		
		constructor(){
				
				Texture2D.load("../../../../res/threeDimen/tiange/222.png",Handler.create(null,function(texture:Texture2D):void{
					this.textures = texture;
				}));
				Texture2D.load("../../../../res/threeDimen/tiange/Assets/111.png",Handler.create(null,function(texture:Texture2D):void{
					this.textures2 = texture;
				}));
				Sprite3D.load("../../../../res/threeDimen/tiange/stage.lh", Handler.create(null, function(sprite:Sprite3D):void {
				this.selectFlag = (<Sprite3D>sprite.getChildByName("flag") );
				this.redPlane = (<MeshSprite3D>this.selectFlag.getChildByName("red") );
				
				this.greenPlane =  (<MeshSprite3D>this.selectFlag.getChildByName("green") );
				this.bluePlane = (<MeshSprite3D>this.selectFlag.getChildByName("blue") );
				
				
				
				
				this.planeMaterial.push((<UnlitMaterial>(this.redPlane.meshRenderer.sharedMaterial) ));
				this.planeMaterial.push((<UnlitMaterial>(this.greenPlane.meshRenderer.sharedMaterial) ));
				this.planeMaterial.push((<UnlitMaterial>(this.bluePlane.meshRenderer.sharedMaterial) ));
				
				this.planeMaterial[0].albedoTexture = this.textures;
				this.planeMaterial[1].albedoTexture = this.textures;
				this.planeMaterial[2].albedoTexture = this.textures;
				
				
				for (var i:number = 0; i < 3; i++) {
					this.planeMaterial[i].getRenderState(0).cull = 0;
					this.planeMaterial[i].renderQueue = 8000;
					this.planeMaterial[i].getRenderState(0).depthTest = RenderState.DEPTHTEST_OFF;
					
				}
				this.isLoad = true;
			}));
		}
		
		 resetFlag(CameraVector3:Vector3):void
		{
				 Vector3.subtract(CameraVector3,this.selectFlag.transform.position,this.posD);
				
				var scale:number = this.selectFlag.transform.scale.x;
				if (this.posD.x > 0)
				{
					this.bluePlane.transform.localPositionX = 0.5 ;
					this.greenPlane.transform.localPositionX = 0.5;
					this.greenTilingoffset.x = -1;
					this.blueTilingoffset.x = -1;
					
					
				}
				else
				{
					this.bluePlane.transform.localPositionX = -0.5;
					this.greenPlane.transform.localPositionX = -0.5;
					this.greenTilingoffset.x = 1;
					this.blueTilingoffset.x = 1
				}
				if (this.posD.y > 0)
				{
					this.redPlane.transform.localPositionY = 0.5;
					this.bluePlane.transform.localPositionY = 0.5;
					this.redTilingoffset.y = -1;
					this.blueTilingoffset.y = 1;
					
				}
				else
				{
					this.redPlane.transform.localPositionY = -0.5;
					this.bluePlane.transform.localPositionY = -0.5;
					this.redTilingoffset.y = 1;
					this.blueTilingoffset.y = -1;
					
				}
				if (this.posD.z > 0)
				{
					this.redPlane.transform.localPositionZ = 0.5;
					this.greenPlane.transform.localPositionZ = 0.5;
					this.redTilingoffset.x = -1;
					this.greenTilingoffset.y = -1;
				}
				else
				{
					this.redPlane.transform.localPositionZ = -0.5;
					this.greenPlane.transform.localPositionZ = -0.5;
					this.redTilingoffset.x = 1;
					this.greenTilingoffset.y = 1;
					
				}
				this.redPlane.transform.localPositionX = 0;
				this.greenPlane.transform.localPositionY = 0;
				this.bluePlane.transform.localPositionZ = 0;
				this.bluePlane.transform.localPosition = this.bluePlane.transform.localPosition;
				this.redPlane.transform.localPosition = this.redPlane.transform.localPosition;
				this.greenPlane.transform.localPosition = this.greenPlane.transform.localPosition;
			
				this.planeMaterial[0].tilingOffset = this.redTilingoffset;
				this.planeMaterial[1].tilingOffset = this.greenTilingoffset;
				this.planeMaterial[2].tilingOffset = this.blueTilingoffset;
				
		}
		
		//颜色面变亮变暗
		//红的是0，蓝的的1，绿的是2
		 planeLightInvert(PlaneIndex:number,IsLight:boolean):void
		{
			if (IsLight)
			{
				this.planeMaterial[PlaneIndex].albedoTexture = this.textures;
			}
			else
			{
				this.planeMaterial[PlaneIndex].albedoTexture = this.textures2;
			}
		}
		
		
		 resetScalebyCamera(Cameravector:Vector3):void
		{
			var distance:number = Vector3.distance(this.selectFlag.transform.position, Cameravector);
			var s = distance / SelectFlag.FACTOR;
			this.currentScale.x = s;
			this.currentScale.y = s;
			this.currentScale.z = s;
			this.selectFlag.transform.scale = this.currentScale;
			
		}

	}


