/**
description
 性能测试:比较数组、对象、位运算等不同访问方式的执行效率
 */
import { Laya } from "Laya";
import { Stage } from "laya/display/Stage";
import { Event } from "laya/events/Event";
import { Browser } from "laya/utils/Browser";
import { Stat } from "laya/utils/Stat";
import { Laya3D } from "Laya3D";

/**
 * ...
 * @author ...
 */
export class ArrayObjectPerformance {
	c: number = 3;
	count: number = 3000000;
	offset: number = Math.floor(50);//2147483647+1和2147483647+0差5倍

	array: any[] = new Array(this.count);
	object: any = {};
	defineObject: any = {};

	constructor() {
		Laya.init(0, 0).then(() => {
			Laya.stage.scaleMode = Stage.SCALE_FULL;
			Laya.stage.screenMode = Stage.SCREEN_NONE;
			Stat.show();

			// for (var i: number = 0; i < this.count; i++) {
			// 	this.array[this.offset + i * this.c] = this.count - i;
			// }

			// for (var i: number = 0; i < this.count; i++) {
			// 	this.object[this.offset + i * this.c] = this.count - i;
			// }

			Laya.stage.on(Event.MOUSE_DOWN, this, function (): void {
				var f: number = 0;
				var t: number = performance.now();
				// for (var i: number = 0; i < this.count; i++) {
				// 	f += this.offset + i * this.c;
				// }
				// console.log("ArrayKey", performance.now() - t);

				// f = 0;
				// t = performance.now();
				// for (var i: number = 0; i < this.count; i++) {
				// 	f += this.offset + i * this.c;
				// }
				// console.log("ObjectKey", performance.now() - t);

				// f = 0;
				// t = performance.now();
				// for (var i: number; i < this.count; i++) {
				// 	f += this.array[this.offset + i * this.c];
				// }
				// console.log("Array", performance.now() - t);

				// f = 0;
				// t = performance.now();
				// for (var i: number = 0; i < this.count; i++) {
				// 	f += this.object[this.offset + i * this.c];
				// }
				// console.log("Object", performance.now() - t);



				t = performance.now();
				for (var i: number = 0; i < 32; i++) {
					this.defineObject[1 << i] = 1 << i;
				}
				console.log("DefineKeyObject", performance.now() - t);


				t = performance.now();
				f = 0;
				for (var i: number = 0; i < this.count; i++) {
					for (var j: number = 0; j < 32; j++)
						f = this.defineObject[1 << j];
				}
				console.log("DefineObject", performance.now() - t);

			});
		});

	}
}


