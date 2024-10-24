import { SkinnedMeshRenderer } from "../d3/core/SkinnedMeshRenderer";
import { SkinnedMeshSprite3D } from "../d3/core/SkinnedMeshSprite3D";
import { Mesh } from "../d3/resource/models/Mesh";
import { Vector3 } from "../maths/Vector3";
import { Vector4 } from "../maths/Vector4";
import { Loader } from "../net/Loader";
import { Material } from "../resource/Material";

SkinnedMeshSprite3D && (function () {
    let old_parse = SkinnedMeshSprite3D.prototype._parse;
    SkinnedMeshSprite3D.prototype._parse = function (this: SkinnedMeshSprite3D, data: any, spriteMap: any): void {
        old_parse.call(this, data, spriteMap);

        var render: SkinnedMeshRenderer = this.skinnedMeshRenderer;
        var lightmapIndex: any = data.lightmapIndex;
        (lightmapIndex != null) && (render.lightmapIndex = lightmapIndex);
        var lightmapScaleOffsetArray: any[] = data.lightmapScaleOffset;
        (lightmapScaleOffsetArray) && (render.lightmapScaleOffset = new Vector4(lightmapScaleOffsetArray[0], lightmapScaleOffsetArray[1], lightmapScaleOffsetArray[2], lightmapScaleOffsetArray[3]));
        (data.enableRender != undefined) && (render.enabled = data.enableRender);
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
        render.localBounds = render.localBounds;
        if (spriteMap) {
            var rootBoneData: number = data.rootBone;
            render.rootBone = spriteMap[rootBoneData];
            var bonesData: any[] = data.bones;
            var n: number;
            for (i = 0, n = bonesData.length; i < n; i++)
                (render as SkinnedMeshRenderer).bones.push(spriteMap[bonesData[i]]);

            render.bones = render.bones;
        }
    };
})();