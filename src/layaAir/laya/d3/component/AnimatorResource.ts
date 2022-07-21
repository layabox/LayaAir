import { SimpleSkinnedMeshRenderer } from "../core/SimpleSkinnedMeshRenderer";
import { Sprite3D } from "../core/Sprite3D";

export class AnimatorResource {
    static getAnimatorResource(sprite: Sprite3D, propertyKey: string) {
        switch (propertyKey) {
            case "simpleSkinnedMeshRenderer":
                return sprite.getComponent(SimpleSkinnedMeshRenderer);
                break;
            case "meshFilter":
                break;
            default:
                //TODO Scripts
                break;
        }
        return null;
    }
}