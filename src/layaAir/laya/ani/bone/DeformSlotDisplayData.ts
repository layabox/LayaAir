import { BoneSlot } from "./BoneSlot";
/**
 * @internal
 */
export class DeformSlotDisplayData {

	boneSlot: BoneSlot;
	slotIndex: number = -1;
	attachment: string;
	timeList: number[] = [];
	vectices: any[][] = [];
	tweenKeyList: boolean[] = [];

	deformData: any[];
	frameIndex: number = 0;

	//TODO:coverage
	constructor() {

	}

	private binarySearch1(values: number[], target: number): number {
		var low: number = 0;
		var high: number = values.length - 2;
		if (high == 0)
			return 1;
		var current: number = high >>> 1;
		while (true) {
			if (values[Math.floor(current + 1)] <= target)
				low = current + 1;
			else
				high = current;
			if (low == high)
				return low + 1;
			current = (low + high) >>> 1;
		}
		return 0; // Can't happen.
	}

	//TODO:coverage
	apply(time: number, boneSlot: BoneSlot, alpha: number = 1): void {
		time += 0.05;
		if (this.timeList.length <= 0) {
			return;
		}
		var i = 0;
		var tTime = this.timeList[0];
		if (time < tTime) {
			return;
		}

		var tVertexCount = this.vectices[0].length;
		var tVertices: any[] = [];
		var tFrameIndex = this.binarySearch1(this.timeList, time);
		this.frameIndex = tFrameIndex;
		if (time >= this.timeList[this.timeList.length - 1]) {
			var lastVertices: any[] = this.vectices[this.vectices.length - 1];

			if (alpha < 1) {
				for (i = 0; i < tVertexCount; i++) {
					tVertices[i] += (lastVertices[i] - tVertices[i]) * alpha;
				}
			} else {
				for (i = 0; i < tVertexCount; i++) {
					tVertices[i] = lastVertices[i];
				}
			}
			this.deformData = tVertices;
			return;
		}

		//var tTweenKey: boolean = this.tweenKeyList[this.frameIndex];
		var tPrevVertices = this.vectices[this.frameIndex - 1];
		var tNextVertices = this.vectices[this.frameIndex];
		var tPreFrameTime = this.timeList[this.frameIndex - 1];
		var tFrameTime = this.timeList[this.frameIndex];

		if (this.tweenKeyList[tFrameIndex - 1]) {
			alpha = (time - tPreFrameTime) / (tFrameTime - tPreFrameTime);
		} else {
			alpha = 0;
		}

		var tPrev: number;
		for (i = 0; i < tVertexCount; i++) {
			tPrev = tPrevVertices[i];
			tVertices[i] = tPrev + (tNextVertices[i] - tPrev) * alpha;
		}
		this.deformData = tVertices;
	}

}


