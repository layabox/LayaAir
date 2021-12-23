import { Node } from "../../display/Node";
import { Loader } from "../../net/Loader";
import { Animator } from "../component/Animator";
import { Vector3 } from "../math/Vector3";
import { Vector4 } from "../math/Vector4";
import { Mesh } from "../resource/models/Mesh";
import { Shader3D } from "../shader/Shader3D";
import { Utils3D } from "../utils/Utils3D";
import { Bounds } from "./Bounds";
import { MeshFilter } from "./MeshFilter";
import { MeshSprite3D } from "./MeshSprite3D";
import { RenderableSprite3D } from "./RenderableSprite3D";
import { Sprite3D } from "./Sprite3D";
import { Material } from "./material/Material";
import { SimpleSkinnedMeshRenderer } from "./SimpleSkinnedMeshRenderer";
import { Texture2D } from "../../resource/Texture2D";



/**
 * <code>SkinnedMeshSprite3D</code> 类用于创建网格。
 */
export class SimpleSkinnedMeshSprite3D extends RenderableSprite3D {
	/**@internal */
	static _tempArray0: any[] = [];

	/** */
	static SIMPLE_SIMPLEANIMATORTEXTURE:number = Shader3D.propertyNameToID("u_SimpleAnimatorTexture");
	static SIMPLE_SIMPLEANIMATORPARAMS:number = Shader3D.propertyNameToID("u_SimpleAnimatorParams");
	static SIMPLE_SIMPLEANIMATORTEXTURESIZE:number = Shader3D.propertyNameToID("u_SimpleAnimatorTextureSize");
	/**
	 * @internal
	 */
	static __init__(): void {
		SimpleSkinnedMeshRenderer.SIMPLE_SIMPLEANIMATORPARAMS = SimpleSkinnedMeshSprite3D.SIMPLE_SIMPLEANIMATORPARAMS;
		SimpleSkinnedMeshRenderer.SIMPLE_SIMPLEANIMATORTEXTURE = SimpleSkinnedMeshSprite3D.SIMPLE_SIMPLEANIMATORTEXTURE;
		SimpleSkinnedMeshRenderer.SIMPLE_SIMPLEANIMATORTEXTURESIZE = SimpleSkinnedMeshSprite3D.SIMPLE_SIMPLEANIMATORTEXTURESIZE;
	}

	/** @internal */
	private _meshFilter: MeshFilter;

	/**
	 * 网格过滤器。
	 */
	get meshFilter(): MeshFilter {
		return this._meshFilter;
	}

	/**
	 * 网格渲染器。
	 */
	get simpleSkinnedMeshRenderer(): SimpleSkinnedMeshRenderer {
		return (<SimpleSkinnedMeshRenderer>this._render);
	}

	/**
	 * 创建一个 <code>MeshSprite3D</code> 实例。
	 * @param mesh 网格,同时会加载网格所用默认材质。
	 * @param name 名字。
	 */
	constructor(mesh: Mesh = null, name: string = null) {
		super(name);
		this._meshFilter = new MeshFilter(this);
		this._render = new SimpleSkinnedMeshRenderer(this);
		(mesh) && (this._meshFilter.sharedMesh = mesh);
	}

	/**
	 * @inheritDoc
	 * @override
	 * @internal
	 */
	_parse(data: any, spriteMap: any): void {
		super._parse(data, spriteMap);
		var render: SimpleSkinnedMeshRenderer = this.simpleSkinnedMeshRenderer;
		var lightmapIndex: any = data.lightmapIndex;
		(lightmapIndex != null) && (render.lightmapIndex = lightmapIndex);
		var lightmapScaleOffsetArray: any[] = data.lightmapScaleOffset;
		(lightmapScaleOffsetArray) && (render.lightmapScaleOffset = new Vector4(lightmapScaleOffsetArray[0], lightmapScaleOffsetArray[1], lightmapScaleOffsetArray[2], lightmapScaleOffsetArray[3]));
		(data.enableRender != undefined) && (render.enable = data.enableRender);
		(data.receiveShadows != undefined) && (render.receiveShadow = data.receiveShadows);
		(data.castShadow != undefined) && (render.castShadow = data.castShadow);
		var meshPath: string;
		meshPath = data.meshPath;
		if (meshPath) {
			var mesh: Mesh = Loader.getRes(meshPath);//加载失败mesh为空
			(mesh) && (this.meshFilter.sharedMesh = mesh);
		}

		var materials: any[] = data.materials;
		if (materials) {
			var sharedMaterials: Material[] = render.sharedMaterials;
			var materialCount: number = materials.length;
			sharedMaterials.length = materialCount;
			for (var i: number = 0; i < materialCount; i++) {
				sharedMaterials[i] = Loader.getRes(materials[i].path);
			}
			render.sharedMaterials = sharedMaterials;
		}

		var boundBox: any = data.boundBox;
		var min: any[] = boundBox.min;
		var max: any[] = boundBox.max;
		render.localBounds.setMin(new Vector3(min[0], min[1], min[2]));
		render.localBounds.setMax(new Vector3(max[0], max[1], max[2]));

		if (spriteMap) {
			var rootBoneData: number = data.rootBone;
			render.rootBone = spriteMap[rootBoneData];
			var bonesData: any[] = data.bones;
			var n: number;
			for (i = 0, n = bonesData.length; i < n; i++)
				render.bones.push(spriteMap[bonesData[i]]);

			render._bonesNums = data.bonesNums? data.bonesNums:render.bones.length;
		} else {//[兼容代码]
			(data.rootBone) && (render._setRootBone(data.rootBone));//[兼容性]
		}
		var animatorTexture:string = data.animatorTexture;
		if(animatorTexture)
		{
			var animatortexture:Texture2D = Loader.getRes(animatorTexture);
			(render as SimpleSkinnedMeshRenderer).simpleAnimatorTexture = animatortexture;
		}
	}

	/**
	 * @inheritDoc
	 * @override
	 * @internal
	 */
	protected _changeHierarchyAnimator(animator: Animator): void {
		super._changeHierarchyAnimator(animator);
		this.simpleSkinnedMeshRenderer._setCacheAnimator(animator);
	}


	/**
	 * @inheritDoc
	 * @override
	 * @internal
	 */
	_cloneTo(destObject: any, srcRoot: Node, dstRoot: Node): void {
		var meshSprite3D: MeshSprite3D = (<MeshSprite3D>destObject);
		meshSprite3D.meshFilter.sharedMesh = this.meshFilter.sharedMesh;
		var meshRender: SimpleSkinnedMeshRenderer = (<SimpleSkinnedMeshRenderer>this._render);
		var destMeshRender: SimpleSkinnedMeshRenderer = (<SimpleSkinnedMeshRenderer>meshSprite3D._render);
		destMeshRender.enable = meshRender.enable;
		destMeshRender.sharedMaterials = meshRender.sharedMaterials;
		destMeshRender.castShadow = meshRender.castShadow;
		var lightmapScaleOffset: Vector4 = meshRender.lightmapScaleOffset;
		lightmapScaleOffset && (destMeshRender.lightmapScaleOffset = lightmapScaleOffset.clone());
		destMeshRender.receiveShadow = meshRender.receiveShadow;
		destMeshRender.sortingFudge = meshRender.sortingFudge;
		destMeshRender._rootBone = meshRender._rootBone;

		var bones: Sprite3D[] = meshRender.bones;
		var destBones: Sprite3D[] = destMeshRender.bones;
		var bonesCount: number = bones.length;
		destBones.length = bonesCount;

		var rootBone: Sprite3D = meshRender.rootBone;
		if (rootBone) {
			var pathes: any[] = Utils3D._getHierarchyPath(srcRoot, rootBone, SimpleSkinnedMeshSprite3D._tempArray0);
			if (pathes)
				destMeshRender.rootBone = (<Sprite3D>Utils3D._getNodeByHierarchyPath(dstRoot, pathes));
			else
				destMeshRender.rootBone = rootBone;
		}

		for (var i: number = 0; i < bones.length; i++) {
			pathes = Utils3D._getHierarchyPath(srcRoot, bones[i], SimpleSkinnedMeshSprite3D._tempArray0);
			if (pathes)
				destBones[i] = (<Sprite3D>Utils3D._getNodeByHierarchyPath(dstRoot, pathes));
			else
				destBones[i] = bones[i];
		}

		var lbb: Bounds = meshRender.localBounds;
		(lbb) && (lbb.cloneTo(destMeshRender.localBounds));
		

		destMeshRender.simpleAnimatorOffset = meshRender.simpleAnimatorOffset;
		destMeshRender.simpleAnimatorTexture = meshRender.simpleAnimatorTexture;
		destMeshRender._bonesNums = meshRender._bonesNums;

		super._cloneTo(destObject, srcRoot, dstRoot);//父类函数在最后,组件应该最后赋值，否则获取材质默认值等相关函数会有问题
	}

	/**
	 * @inheritDoc
	 * @override
	 */
	destroy(destroyChild: boolean = true): void {
		if (this.destroyed)
			return;
		super.destroy(destroyChild);
		this._meshFilter.destroy();
	}

	/**
	 * @internal
	 */
	protected _create(): Node {
		return new SimpleSkinnedMeshSprite3D();
	}

}

