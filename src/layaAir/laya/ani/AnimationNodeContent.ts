import { KeyFramesContent } from "./KeyFramesContent";
/**
 * @internal
 */
export class AnimationNodeContent {
	name: string;
	parentIndex: number;
	parent: AnimationNodeContent;
	keyframeWidth: number;
	lerpType: number;
	interpolationMethod: any[];
	childs: any[];
	keyFrame: KeyFramesContent[];// = new Vector.<KeyFramesContent>;
	playTime: number;
	extenData: ArrayBuffer;
	dataOffset: number;
}

