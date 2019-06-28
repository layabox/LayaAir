import { AnimationNodeContent } from "./AnimationNodeContent";
/**
 * @internal
 * @author ...
 */
export class AnimationContent {
	nodes: AnimationNodeContent[];
	name: string;
	playTime: number;
	bone3DMap: any;
	totalKeyframeDatasLength: number;
}

