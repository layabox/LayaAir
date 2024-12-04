import { SimpleSkinnedMeshRenderer } from "../d3/core/SimpleSkinnedMeshRenderer";
import { SimpleSkinnedMeshSprite3D } from "../d3/core/SimpleSkinnedMeshSprite3D";
import { Mesh } from "../d3/resource/models/Mesh";
import { Vector3 } from "../maths/Vector3";
import { Vector4 } from "../maths/Vector4";
import { Loader } from "../net/Loader";
import { Material } from "../resource/Material";
import { Texture2D } from "../resource/Texture2D";

SimpleSkinnedMeshSprite3D && (function () {
    let old_parse = SimpleSkinnedMeshSprite3D.prototype._parse;
    SimpleSkinnedMeshSprite3D.prototype._parse = function (this: SimpleSkinnedMeshSprite3D, data: any, spriteMap: any): void {
        old_parse.call(this, data, spriteMap);

        var render: SimpleSkinnedMeshRenderer = this.simpleSkinnedMeshRenderer;
        var lightmapIndex: any = data.lightmapIndex;
        (lightmapIndex != null) && (render.lightmapIndex = lightmapIndex);
        var lightmapScaleOffsetArray: any[] = data.lightmapScaleOffset;
        (lightmapScaleOffsetArray) && (render.lightmapScaleOffset = new Vector4(lightmapScaleOffsetArray[0], lightmapScaleOffsetArray[1], lightmapScaleOffsetArray[2], lightmapScaleOffsetArray[3]));
        (data.enableRender != undefined) && (render.enabled = data.enableRender);
        (data.receiveShadows != undefined) && (render.receiveShadow = data.receiveShadows);
        (data.castShadow != undefined) && (render.castShadow = data.castShadow);
        let meshPath: string = data.meshPath;
        if (meshPath) {
            let mesh: Mesh = Loader.getRes(meshPath);//加载失败mesh为空
            (mesh) && (this.meshFilter.sharedMesh = mesh);
        }

        var materials: any[] = data.materials;
        if (materials) {
            let sharedMaterials: Material[] = render.sharedMaterials;
            let materialCount: number = materials.length;
            sharedMaterials.length = materialCount;
            for (let i = 0; i < materialCount; i++) {
                sharedMaterials[i] = Loader.getRes(materials[i].path);
            }
            render.sharedMaterials = sharedMaterials;
        }

        var boundBox: any = data.boundBox;
        var min: any[] = boundBox.min;
        var max: any[] = boundBox.max;
        render.localBounds.setMin(new Vector3(min[0], min[1], min[2]));
        render.localBounds.setMax(new Vector3(max[0], max[1], max[2]));
        render.localBounds = render.localBounds;
        if (spriteMap) {
            let rootBoneData: number = data.rootBone;
            render.rootBone = spriteMap[rootBoneData];
            let bonesData: any[] = data.bones;
            for (let i = 0, n = bonesData.length; i < n; i++)
                render.bones.push(spriteMap[bonesData[i]]);
            render.bones = render.bones;
            render._bonesNums = data.bonesNums ? data.bonesNums : render.bones.length;
        }
        // else {//[兼容代码]
        // 	(data.rootBone) && (render._setRootBone(data.rootBone));//[兼容性]
        // }
        var animatorTexture: string = data.animatorTexture;
        if (animatorTexture) {
            let animatortexture: Texture2D = Loader.getRes(animatorTexture, Loader.TEXTURE2D);
            render.simpleAnimatorTexture = animatortexture;
        }
    };
})();