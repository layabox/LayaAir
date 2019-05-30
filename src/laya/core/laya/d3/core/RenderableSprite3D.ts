import { Sprite3D } from "././Sprite3D";
import { Laya3D } from "./../../../Laya3D";
import { Animator } from "../component/Animator"
	import { BaseRender } from "./render/BaseRender"
	import { Scene3D } from "./scene/Scene3D"
	import { Vector4 } from "../math/Vector4"
	import { Shader3D } from "../shader/Shader3D"
	import { ShaderDefines } from "../shader/ShaderDefines"
	import { Node } from "laya/display/Node"
	
	/**
	 * <code>RenderableSprite3D</code> 类用于可渲染3D精灵的父类，抽象类不允许实例。
	 */
	export class RenderableSprite3D extends Sprite3D {
		/**精灵级着色器宏定义,接收阴影。*/
		 static SHADERDEFINE_RECEIVE_SHADOW:number;
		/**精灵级着色器宏定义,光照贴图便宜和缩放。*/
		 static SHADERDEFINE_SCALEOFFSETLIGHTINGMAPUV:number;
		/**精灵级着色器宏定义,光照贴图。*/
		 static SAHDERDEFINE_LIGHTMAP:number;
		
		/**着色器变量名，光照贴图缩放和偏移。*/
		 static LIGHTMAPSCALEOFFSET:number=Shader3D.propertyNameToID("u_LightmapScaleOffset");
		/**着色器变量名，光照贴图。*/
		 static LIGHTMAP:number=Shader3D.propertyNameToID("u_LightMap");
		/**拾取颜色。*/
		 static PICKCOLOR:number=Shader3D.propertyNameToID("u_PickColor");
		
		 pickColor:Vector4;
		
		/**@private */
		 static shaderDefines:ShaderDefines = new ShaderDefines();
		
		/**
		 * @private
		 */
		 static __init__():void {
			RenderableSprite3D.SHADERDEFINE_RECEIVE_SHADOW = RenderableSprite3D.shaderDefines.registerDefine("RECEIVESHADOW");
			RenderableSprite3D.SHADERDEFINE_SCALEOFFSETLIGHTINGMAPUV = RenderableSprite3D.shaderDefines.registerDefine("SCALEOFFSETLIGHTINGMAPUV");
			RenderableSprite3D.SAHDERDEFINE_LIGHTMAP = RenderableSprite3D.shaderDefines.registerDefine("LIGHTMAP");
		}
		
		/** @private */
		 _render:BaseRender;
		
		/**
		 * 创建一个 <code>RenderableSprite3D</code> 实例。
		 */
		constructor(name:string){
			super(name);
		}
		
		/** 
		 * @inheritDoc
		 */
		/*override*/ protected _onInActive():void {
			super._onInActive();
			var scene3D:Scene3D = (<Scene3D>this._scene );
			scene3D._removeRenderObject(this._render);
			(this._render.castShadow) && (scene3D._removeShadowCastRenderObject(this._render));
		
		}
		
		/** 
		 * @inheritDoc
		 */
		/*override*/ protected _onActive():void {
			super._onActive();
			var scene3D:Scene3D = (<Scene3D>this._scene );
			scene3D._addRenderObject(this._render);
			(this._render.castShadow) && (scene3D._addShadowCastRenderObject(this._render));
		}
		
		/**
		 * @inheritDoc
		 */
		/*override*/ protected _onActiveInScene():void {
			super._onActiveInScene();
			
			if (Laya3D._editerEnvironment) {
				var scene:Scene3D = (<Scene3D>this._scene );
				var pickColor:Vector4 = new Vector4();
				scene._allotPickColorByID(this.id, pickColor);
				scene._pickIdToSprite[this.id] = this;
				this._render._shaderValues.setVector(RenderableSprite3D.PICKCOLOR, pickColor);
			}
		}
		
		/**
		 * @private
		 */
		 _addToInitStaticBatchManager():void {
		}
		
		/**
		 * @inheritDoc
		 */
		/*override*/  _setBelongScene(scene:Node):void {
			super._setBelongScene(scene);
			this._render._setBelongScene((<Scene3D>scene ));
		}
		
		/**
		 * @inheritDoc
		 */
		/*override*/  _setUnBelongScene():void {
			this._render._shaderValues.removeDefine(RenderableSprite3D.SAHDERDEFINE_LIGHTMAP);
			super._setUnBelongScene();
		}
		
		/**
		 * @inheritDoc
		 */
		/*override*/ protected _changeHierarchyAnimator(animator:Animator):void {
			if (this._hierarchyAnimator) {
				var renderableSprites:RenderableSprite3D[] = this._hierarchyAnimator._renderableSprites;
				renderableSprites.splice(renderableSprites.indexOf(this), 1);
			}
			if (animator)
				animator._renderableSprites.push(this);
			
			super._changeHierarchyAnimator(animator);
		}
		
		/**
		 * @inheritDoc
		 */
		/*override*/  destroy(destroyChild:boolean = true):void {
			super.destroy(destroyChild);
			this._render._destroy();
			this._render = null;
		}

		/**
		 * @private
		 */
		protected  _create():Node {
			return new RenderableSprite3D(this.name);
		}
	
	}


