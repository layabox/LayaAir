import { MeshSprite3D } from "laya/d3/core/MeshSprite3D"
	import { Sprite3D } from "laya/d3/core/Sprite3D"
	import { UnlitMaterial } from "laya/d3/core/material/UnlitMaterial"
	import { Vector4 } from "laya/d3/math/Vector4"
	import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh"
	import { BaseTexture } from "laya/resource/BaseTexture"
	import { Texture2D } from "laya/resource/Texture2D"
	
	export class TextureExpandSprite extends Sprite3D {
		private _meshSprite3D:MeshSprite3D;
		private _texture2D:Texture2D;
		private _unlitMaterial:UnlitMaterial;
		private _long:number;
		private _width:number;
		private _repeat:number;
		private _texturePixs:Uint8Array;
		private _picPixs:Uint8Array;
		private _canvas:any;
		
		constructor(width:number, long:number, canvas:any, repeat:number){
			super();
this._long = long;
			this._width = width;
			this._canvas = canvas;
			this._repeat = repeat;
			//创建mesh
			this._meshSprite3D = new MeshSprite3D(PrimitiveMesh.createPlane(this._long, this._width, 10, 10));
			this.addChild(this._meshSprite3D);
			
			//创建材质
			this._unlitMaterial = new UnlitMaterial();
			//设置为透明渲染模式
			this._unlitMaterial.renderMode = UnlitMaterial.RENDERMODE_TRANSPARENT;
			//关闭背面剔除
			//_unlitMaterial.getRenderState(0).cull = 0;
			this._meshSprite3D.meshRenderer.material = this._unlitMaterial;
			//修改材质贴图的平铺和偏移
			var tilingOffset:Vector4 = this._unlitMaterial.tilingOffset;
			tilingOffset.setValue(this._repeat, this._repeat, 0, 0);
			this._unlitMaterial.tilingOffset = tilingOffset;
			
			var pixWidth:number = this._canvas.width;
			var pixHeight:number = this._canvas.height;
			//创建纹理
			this._texture2D = new Texture2D(pixWidth, pixHeight, BaseTexture.FORMAT_R8G8B8A8, true, true);
			this._unlitMaterial.albedoTexture = this._texture2D;
			
			//得到像素数据
			var context = this._canvas.getContext("2d");
			var imgdata:any = context.getImageData(0, 0, pixWidth, pixHeight);
			this._picPixs = new Uint8Array(imgdata.data.buffer);
			//设置纹理像素值，并生成纹理
			this._texture2D.setPixels(this._picPixs);
			this._texture2D.generateMipmap();
		
		}
	
		/**
		 * 重复次数
		 */
		 get repeat():number {
			return this._repeat;
		}
		 set repeat(value:number) {
			this._repeat = value;
			//修改材质贴图的平铺和偏移
			var tilingOffset:Vector4 = this._unlitMaterial.tilingOffset;
			tilingOffset.setValue(this._repeat, this._repeat, 0, 0);
			this._unlitMaterial.tilingOffset = tilingOffset;
		}
	}


