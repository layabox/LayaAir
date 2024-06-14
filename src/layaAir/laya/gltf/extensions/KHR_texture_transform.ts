import * as glTF from "../glTFInterface";

import { Material } from "../../resource/Material";
import { IBatchProgress } from "../../net/BatchProgress";
import { glTFMaterial } from "../glTFInterface";
import { glTFResource } from "../glTFResource";
import { glTFExtension } from "./glTFExtension";
import { Matrix3x3 } from "../../maths/Matrix3x3";
import { Vector2 } from "../../maths/Vector2";

const ExtensionName = "KHR_texture_transform";

const translation = new Matrix3x3();
const rotation = new Matrix3x3();

const offset = new Vector2;
const scale = new Vector2;

/** @internal */
export class KHR_texture_transform implements glTFExtension {

    readonly name: string = ExtensionName;

    private _resource: glTFResource;

    constructor(resource: glTFResource) {
        this._resource = resource;
    }

    createTransform(extension: glTF.glTFTextureTransform) {
        offset.setValue(0, 0);
        if (extension.offset) {
            offset.fromArray(extension.offset);
        }
        Matrix3x3.createFromTranslation(offset, translation);

        let rot = extension.rotation ?? 0;
        Matrix3x3.createFromRotation(-rot, rotation);

        scale.setValue(1, 1);
        if (extension.scale) {
            scale.fromArray(extension.scale);
        }

        let trans = new Matrix3x3();
        Matrix3x3.multiply(translation, rotation, trans);
        trans.scale(scale, trans);
        return trans;
    }

    loadExtensionTextureInfo(info: glTF.glTFTextureInfo) {
        let extension: glTF.glTFTextureTransform = info.extensions?.KHR_texture_transform;

        let trans = this.createTransform(extension);
        let texCoord = extension.texCoord;

        return {
            transform: trans,
            texCoord: texCoord
        }
    }

}

glTFResource.registerExtension(ExtensionName, (resource) => new KHR_texture_transform(resource));