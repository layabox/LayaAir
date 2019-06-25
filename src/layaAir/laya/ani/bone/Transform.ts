import { Matrix } from "../../maths/Matrix";


export class Transform {

	skX: number = 0;		// 旋转？
	skY: number = 0;		// 不知道干什么的
	scX: number = 1;		// 缩放
	scY: number = 1;
	x: number = 0;		// 偏移
	y: number = 0;
	skewX: number = 0;	// skew
	skewY: number = 0;
	private mMatrix: Matrix;

	//TODO:coverage
	initData(data: any): void {
		if (data.x != undefined) {
			this.x = data.x;
		}
		if (data.y != undefined) {
			this.y = data.y;
		}
		if (data.skX != undefined) {
			this.skX = data.skX;
		}
		if (data.skY != undefined) {
			this.skY = data.skY;
		}
		if (data.scX != undefined) {
			this.scX = data.scX;
		}
		if (data.scY != undefined) {
			this.scY = data.scY;
		}
	}

	//TODO:coverage
	getMatrix(): Matrix {
		var tMatrix: Matrix;
		if (this.mMatrix) {
			tMatrix = this.mMatrix;
		} else {
			tMatrix = this.mMatrix = new Matrix();
		}

		tMatrix.identity();
		tMatrix.scale(this.scX, this.scY);
		if (this.skewX || this.skewY) {
			this.skew(tMatrix, this.skewX * Math.PI / 180, this.skewY * Math.PI / 180);
		}
		tMatrix.rotate(this.skX * Math.PI / 180);
		tMatrix.translate(this.x, this.y);

		return tMatrix;
	}

	//TODO:coverage
	skew(m: Matrix, x: number, y: number): Matrix {
		var sinX: number = Math.sin(y);
		var cosX: number = Math.cos(y);
		var sinY: number = Math.sin(x);
		var cosY: number = Math.cos(x);

		m.setTo(m.a * cosY - m.b * sinX,
			m.a * sinY + m.b * cosX,
			m.c * cosY - m.d * sinX,
			m.c * sinY + m.d * cosX,
			m.tx * cosY - m.ty * sinX,
			m.tx * sinY + m.ty * cosX);
		return m;
	}
}

