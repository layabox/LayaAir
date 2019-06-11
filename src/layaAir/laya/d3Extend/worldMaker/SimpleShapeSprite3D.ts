import { SimpleShapeFilter } from "././SimpleShapeFilter";
import { SimpleShapeEditor } from "././SimpleShapeEditor";
import { SimpleShapeRenderer } from "././SimpleShapeRenderer";
import { Camera } from "laya/d3/core/Camera"
	import { MeshSprite3D } from "laya/d3/core/MeshSprite3D"
	import { RenderableSprite3D } from "laya/d3/core/RenderableSprite3D"
	import { Sprite3D } from "laya/d3/core/Sprite3D"
	import { BaseMaterial } from "laya/d3/core/material/BaseMaterial"
	import { BlinnPhongMaterial } from "laya/d3/core/material/BlinnPhongMaterial"
	import { RenderElement } from "laya/d3/core/render/RenderElement"
	import { Vector4 } from "laya/d3/math/Vector4"
	
	
	/**
	 * ...
	 * @author ...
	 */
	export class SimpleShapeSprite3D extends MeshSprite3D {
		 _simpleShapeMesh:SimpleShapeFilter;
		private  _editor:SimpleShapeEditor = null;

		constructor(props:any){
			super(null);
			this._render = new SimpleShapeRenderer(this);
			this._simpleShapeMesh = new SimpleShapeFilter(props && props.isEditor);

			var renderElement:RenderElement = new RenderElement();
			this._render._renderElements.push(renderElement);			
			//_render._defineDatas.add(MeshSprite3D.SHADERDEFINE_COLOR);
			this._render._shaderValues.addDefine(MeshSprite3D.SHADERDEFINE_COLOR);
			renderElement.setTransform(this._transform);
			renderElement.render = this._render;
			
			var mat:BlinnPhongMaterial = (<BlinnPhongMaterial>this._render.sharedMaterial );
			mat || (mat = new BlinnPhongMaterial());
			mat.albedoColor = new Vector4(1.0, 0.0, 0.0, 1.0);
			renderElement.material = mat;
			
			renderElement.setGeometry(this._simpleShapeMesh);
			
			for (var k  in props) {
				this[k] = props[k];
			}
		}
		
		/**
		 * @inheritDoc
		 */
		/*override*/  _parse(data:any):void {
			
		}
		
		 onSelect():void {
			this._editor.onSelect();
		}
		
		 onUnselect():void {
			this._editor.onUnselect();
			this._editor = null;
		}
		
		 getEditor(cam:Camera):SimpleShapeEditor {
			if(!this._editor){
				this._editor = new SimpleShapeEditor(this, cam);
			}
			return this._editor;
		}
	}

