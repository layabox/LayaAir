import { Resource } from "../../../resource/Resource";

export class AnimatorController extends Resource {
    constructor(data: any) {
        super();
        console.log("實例化Controller!!", data);
    }
}