import { BoneSlot } from "./BoneSlot";
/**
 * @internal
 * @en The `DeformSlotDisplayData` class is used internally to store and manage the display data for deformable slots in animations.
 * @zh `DeformSlotDisplayData` 类用于在动画中存储和管理可变形插槽的显示数据。
 */
export class DeformSlotDisplayData {

	/**
	 * @en The bone slot to which the deform data is applied.
	 * @zh 应用变形数据的骨骼插槽。
	 */
	boneSlot: BoneSlot;
	/**
	 * @en The index of the slot in the skin.
	 * @zh 插槽在皮肤中的索引。
	 */
	slotIndex: number = -1;
	/**
	 * @en The name of the attachment associated with the deform data.
	 * @zh 与变形数据相关的附件名称。
	 */
	attachment: string;
	/**
	 * @en A list of time values corresponding to the keyframes of the deform animation.
	 * @zh 对应于变形动画关键帧的时间值列表。
	 */
	timeList: number[] = [];
	/**
	 * @en A list of vertex data arrays for each keyframe, representing the deformed state.
	 * @zh 每个关键帧的顶点数据数组列表，代表变形状态。
	 */
	vectices: any[][] = [];
	/**
	 * @en A list indicating whether there is a tween between keyframes.
	 * @zh 指示关键帧之间是否存在缓动的列表。
	 */
	tweenKeyList: boolean[] = [];

	/**
	 * @en The deformed vertex data applied to the slot.
	 * @zh 应用于插槽的变形顶点数据。
	 */
	deformData: any[];
	/**
	 * @en The current frame index for the deform animation.
	 * @zh 变形动画的当前帧索引。
	 */
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

	/**
	 * @en Applies the deform data to the bone slot based on the given time and alpha value.
	 * @param time The current time of the animation.
	 * @param boneSlot The bone slot to which the deform data will be applied.
	 * @param alpha The alpha value for tweening between keyframes, default is 1.
	 * @zh 根据给定的时间和 alpha 值将变形数据应用到骨骼插槽。
	 * @param time 当前动画的时间。
	 * @param boneSlot 应用变形数据的骨骼插槽。
	 * @param alpha 用于在关键帧之间补间的 alpha 值，默认为 1。
	 */
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


