import { MeshSprite3D } from "laya/d3/core/MeshSprite3D"
	import { Sprite3D } from "laya/d3/core/Sprite3D"
	import { BaseMaterial } from "laya/d3/core/material/BaseMaterial"
	import { BlinnPhongMaterial } from "laya/d3/core/material/BlinnPhongMaterial"
	import { UnlitMaterial } from "laya/d3/core/material/UnlitMaterial"
	import { ShuriKenParticle3D } from "laya/d3/core/particleShuriKen/ShuriKenParticle3D"
	import { ShurikenParticleMaterial } from "laya/d3/core/particleShuriKen/ShurikenParticleMaterial"
	import { Color } from "laya/d3/math/Color"
	/**
	 * ...
	 * @author ...
	 */
	export class ChangeMaterial {
		
		/**@private 根据材质ID来记录本身Alpha值*/
		private static _materialAlpha:any = {};
		/**@private */
		private static _blinn:BlinnPhongMaterial;
		/**@private */
		private	static _unlin:UnlitMaterial;
		/**@private */
		private static _shunri:ShurikenParticleMaterial;
		
		
		/**
		 *转换模型为透明材质 
		 * @param 传入的材质
		 * @param Index  0表示变透明,1表示返回原来的值
		 */
		 static changedToTransform(material:BaseMaterial,Index:number):void
		{
			
				if (material instanceof BlinnPhongMaterial)
				{
					ChangeMaterial._blinn = (<BlinnPhongMaterial>material );
					if(!ChangeMaterial._materialAlpha[ChangeMaterial._blinn.id])
					ChangeMaterial._materialAlpha[ChangeMaterial._blinn.id] = ChangeMaterial._blinn.albedoColorA;
					ChangeMaterial._blinn.albedoColorA = 0.3;
					ChangeMaterial._blinn.renderMode = BlinnPhongMaterial.RENDERMODE_TRANSPARENT;
					
				}else if(material instanceof UnlitMaterial)
				{
					ChangeMaterial._unlin = (<UnlitMaterial>material );
					if(!ChangeMaterial._materialAlpha[ChangeMaterial._unlin.id])
					ChangeMaterial._materialAlpha[ChangeMaterial._unlin.id] = ChangeMaterial._blinn.albedoColorA;
					ChangeMaterial._unlin.albedoColorA = 0.3;
					ChangeMaterial._unlin.renderMode = UnlitMaterial.RENDERMODE_TRANSPARENT;
				}
				else if (material instanceof ShurikenParticleMaterial)
				{
					
					ChangeMaterial._shunri = (<ShurikenParticleMaterial>material );
					if(!ChangeMaterial._materialAlpha[ChangeMaterial._shunri.id])
					ChangeMaterial._materialAlpha[ChangeMaterial._shunri.id] = ChangeMaterial._shunri.colorA;
					ChangeMaterial._shunri.colorA = 0.1;
				}
				else
				{
					console.log("material is not standart");
				}	
		}
		/**
		 *转换为不透明的材质 
		 * @param material 修改材质
		 */
		 static changedToOPAQUE(material:BaseMaterial):void
		{
				
				if (material instanceof BlinnPhongMaterial)
				{
					ChangeMaterial._blinn = (<BlinnPhongMaterial>material );
					if(ChangeMaterial._materialAlpha[ChangeMaterial._blinn.id]==1)
						ChangeMaterial._blinn.renderMode = BlinnPhongMaterial.RENDERMODE_OPAQUE;
					else
						ChangeMaterial._blinn.albedoColorA = ChangeMaterial._materialAlpha[ChangeMaterial._blinn.id];
				}else if(material instanceof UnlitMaterial)
				{
					ChangeMaterial._unlin = (<UnlitMaterial>material );
					if(ChangeMaterial._materialAlpha[ChangeMaterial._unlin.id]==1)
						ChangeMaterial._unlin.renderMode = UnlitMaterial.RENDERMODE_OPAQUE;
					else
						ChangeMaterial._unlin.albedoColorA = ChangeMaterial._materialAlpha[ChangeMaterial._unlin.id];
				}
				else if (material instanceof ShurikenParticleMaterial)
				{
					ChangeMaterial._shunri = (<ShurikenParticleMaterial>material );
					ChangeMaterial._shunri.colorA = ChangeMaterial._materialAlpha[ChangeMaterial._shunri.id];
					
				}
				else
				{
					console.log("material is not standart");
				}	
		}
		
		/**
		 *转换材质 
		 *@param material 修改材质
		 */
		 static changedMaterial(sprite:Sprite3D):void
		{
			var childnums:number = sprite.numChildren;
			var material:BaseMaterial;
			var meshsprite:MeshSprite3D;
			var particle:ShuriKenParticle3D;
			
		
			if (sprite instanceof MeshSprite3D)
			{
				meshsprite = sprite;
				material = meshsprite.meshRenderer.material;
				ChangeMaterial.changedToTransform(material);	
			}
			else if(sprite instanceof ShuriKenParticle3D)
			{
				particle = sprite;
				material = particle.particleRenderer.material;
				ChangeMaterial.changedToTransform(material);
			}
			if (childnums > 0)
			{
				for (var i:number = 0; i < childnums; i++) {
					ChangeMaterial.changedMaterial(sprite.getChildAt(i));
					
				}
			}
			
		}
		
		/**
		 *转换材质颜色
		 * @param material 修改材质 color 修改材质的颜色
		 */
		 static changeMaterialColor(sprite:MeshSprite3D, color:Color):void
		{
			
				var material:BaseMaterial = sprite.meshRenderer.material;
				
				if (material instanceof BlinnPhongMaterial)
				{
					ChangeMaterial._blinn = (<BlinnPhongMaterial>material );
					ChangeMaterial._blinn.albedoColor = color;

				}else if(material instanceof UnlitMaterial)
				{
					ChangeMaterial._unlin = (<UnlitMaterial>material );	
					ChangeMaterial._unlin.albedoColor = color;
				}
				else
				{
					console.log("material is not standart");
				}	
		}
		
		
	}


