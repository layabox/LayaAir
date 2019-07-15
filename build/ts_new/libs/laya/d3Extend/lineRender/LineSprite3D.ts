import { LineFilter } from "./LineFilter";
import { LineRenderer } from "./LineRenderer";
import { LineMaterial } from "./LineMaterial";
import { Camera } from "laya/d3/core/Camera"
	import { RenderableSprite3D } from "laya/d3/core/RenderableSprite3D"
	import { BaseMaterial } from "laya/d3/core/material/BaseMaterial"
	import { RenderElement } from "laya/d3/core/render/RenderElement"
	import { Vector3 } from "laya/d3/math/Vector3"
	import { ShaderDefines } from "laya/d3/shader/ShaderDefines"
	import { Context } from "laya/resource/Context"
	
	/**
	 * ...
	 * @author
	 */
	export class LineSprite3D extends RenderableSprite3D {
		/**@private */
		 static shaderDefines:ShaderDefines = new ShaderDefines(RenderableSprite3D.shaderDefines);
		
		/**
		 * @private
		 */
		 static __init__():void {
		}
		
		/** @private */
		private _geometryFilter:LineFilter;
		
		/**
		 * 获取line过滤器。
		 * @return  line过滤器。
		 */
		 get lineFilter():LineFilter {
			return (<LineFilter>this._geometryFilter );
		}
		
		/**
		 * 获取line渲染器。
		 * @return  line渲染器。
		 */
		 get lineRender():LineRenderer {
			return (<LineRenderer>this._render );
		}
		
		constructor(camera:Camera,name:string=null){
			this._geometryFilter = new LineFilter();
			((<LineFilter>this._geometryFilter ))._camera = camera;
			this._render = new LineRenderer(this);
			
			this._changeRenderObjects((<LineRenderer>this._render ), 0, LineMaterial.defaultMaterial);
			super(name);
		}
		
		 addPosition(position:Vector3):void {
			((<LineFilter>this._geometryFilter )).addDataForVertexBuffer(position);
		}
		
		/**
		 * @inheritDoc
		 */
		 _changeRenderObjects(sender:LineRenderer, index:number, material:BaseMaterial):void {
			var renderObjects:RenderElement[] = this._render._renderElements;
			(material) || (material = LineMaterial.defaultMaterial);
			var renderElement:RenderElement = renderObjects[index];
			(renderElement) || (renderElement = renderObjects[index] = new RenderElement());
			renderElement.setTransform(this._transform);
			renderElement.setGeometry(this._geometryFilter);
			renderElement.render = this._render;
			renderElement.material = material;
		}
		
		 _update(state:Context):void {//TODO:
			//super._update(state);
			//(_geometryFilter as lineFilter)._update(state);
		}
	
	}


