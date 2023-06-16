import { Laya } from "Laya";
import { Stage } from "laya/display/Stage";
import { Browser } from "laya/utils/Browser";
import { HalfFloatUtils } from "laya/utils/HalfFloatUtils";
import { Stat } from "laya/utils/Stat";
import { Laya3D } from "Laya3D";

/**
 * ...
 * @author ...
 */
export class DataViewPerformance {
	static instance: DataViewPerformance;
	count: number = 40960 / 4;
	arrayBuffer0: ArrayBuffer = new ArrayBuffer(40960);
	arrayBuffer1: ArrayBuffer = new ArrayBuffer(40960);
	float32Array: Float32Array = new Float32Array(this.arrayBuffer0);
	dataView: DataView = new DataView(this.arrayBuffer1);

	constructor() {
		Laya.init(0, 0).then(() => {
			Laya.stage.scaleMode = Stage.SCALE_FULL;
			Laya.stage.screenMode = Stage.SCREEN_NONE;
			Stat.show();
			DataViewPerformance.instance = this;
		});
	}

	test(): void {
		var i: number = 0;
		var t: number = 0;
		var v: number = 0;

		t = Browser.now();
		for (i = 0; i < this.count; i++) {
			this.float32Array[i] = this.count - i;
		}
		console.log("Write_Float32Array：", Browser.now() - t);

		t = Browser.now();
		for (i = 0; i < this.count; i++) {
			this.dataView.setFloat32(i * 4, this.count - i, true);
		}
		console.log("Write_DataView：", Browser.now() - t);

		t = Browser.now();
		v = 0;
		for (i = 0; i < this.count; i++) {
			v += this.float32Array[i];
		}
		console.log("Read_Float32Array：", Browser.now() - t);

		t = Browser.now();
		v = 0;
		for (i = 0; i < this.count; i++) {
			v + this.dataView.getFloat32(i * 4, true);
		}
		console.log("Read_DataView：", Browser.now() - t);

		t = Browser.now();
		v = 0;
		for (i = 0; i < this.count; i++) {
			v += HalfFloatUtils.convertToNumber(this.float32Array[i]);
		}
		console.log("Convert_Float16Array：", Browser.now() - t);
	}

}


