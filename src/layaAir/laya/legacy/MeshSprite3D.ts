import { MeshRenderer } from "../d3/core/MeshRenderer";
import { MeshSprite3D } from "../d3/core/MeshSprite3D";
import { Vector4 } from "../maths/Vector4";
import { Loader } from "../net/Loader";
import { Material } from "../resource/Material";

MeshSprite3D && (function () {
    let old_parse = MeshSprite3D.prototype._parse;
    MeshSprite3D.prototype._parse = function (this: MeshSprite3D, data: any, spriteMap: any): void {
        old_parse.call(this, data, spriteMap);

        var render: MeshRenderer = this.meshRenderer;
        var lightmapIndex: any = data.lightmapIndex;
        (lightmapIndex != null) && (render.lightmapIndex = lightmapIndex);
        var lightmapScaleOffsetArray: any[] = data.lightmapScaleOffset;
        (lightmapScaleOffsetArray) && (render.lightmapScaleOffset = new Vector4(lightmapScaleOffsetArray[0], lightmapScaleOffsetArray[1], lightmapScaleOffsetArray[2], lightmapScaleOffsetArray[3]));
        (data.meshPath != undefined) && (this.meshFilter.sharedMesh = Loader.getRes(data.meshPath));
        (data.enableRender != undefined) && (render._enabled = data.enableRender);
        (data.receiveShadows != undefined) && (render.receiveShadow = data.receiveShadows);
        (data.castShadow != undefined) && (render.castShadow = data.castShadow);
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
    };
})();