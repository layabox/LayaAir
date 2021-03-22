import { IClone } from "../core/IClone";
import { ShaderDefine } from "./ShaderDefine";

/**
 * <code>DefineDatas</code> 类用于创建宏定义数据集合。
 */
export class DefineDatas implements IClone {
	/** @internal */
	_mask: Array<number> = [];
	/** @internal */
	_length: number = 0;

	/**
	 * 创建一个 <code>DefineDatas</code> 实例。
	 */
	constructor() {
	}

	/**
	 * @internal
	 */
	_intersectionDefineDatas(define: DefineDatas): void {
		var unionMask: Array<number> = define._mask;
		var mask: Array<number> = this._mask;
		for (var i: number = this._length - 1; i >= 0; i--) {
			var value: number = mask[i] & unionMask[i];
			if (value == 0 && i == this._length - 1)
				this._length--;
			else
				mask[i] = value;
		}
	}

	/**
	 * 添加宏定义值。
	 * @param define 宏定义值。
	 */
	add(define: ShaderDefine): void {
		var index: number = define._index;
		var size: number = index + 1;
		var mask: Array<number> = this._mask;
		var maskStart: number = this._length;//must from this._length because this._length maybe less than mask.length and have dirty data should clear.
		if (maskStart < size) {
			(mask.length < size) && (mask.length = size);//mask.length maybe small than size,maybe not.
			for (; maskStart < index; maskStart++)
				mask[maskStart] = 0;
			mask[index] = define._value;
			this._length = size;
		}
		else {
				mask[index] |= define._value;
		}
	}

	/**
	 * 移除宏定义。
	 * @param define 宏定义。
	 */
	remove(define: ShaderDefine): void {
		var index: number = define._index;
		var mask: Array<number> = this._mask;
		var endIndex: number = this._length - 1;
		if (index > endIndex)//不重置Length,避免经常扩充
			return;
		var newValue = mask[index] & ~define._value;
		if (index == endIndex && newValue === 0)
			this._length--;
		else
			mask[index] = newValue;
	}

	/**
	 * 添加宏定义集合。
	 * @param define 宏定义集合。
	 */
	addDefineDatas(define: DefineDatas): void {
		var addMask: Array<number> = define._mask;
		var size: number = define._length;
		var mask: Array<number> = this._mask;
		var maskStart: number = this._length;
		if (maskStart < size) {
			mask.length = size;
			for (var i: number = 0; i < maskStart; i++)
				mask[i] |= addMask[i];
			for (; i < size; i++)
				mask[i] = addMask[i];
			this._length = size;
		} else {
			for (var i: number = 0; i < size; i++)
			{
				mask[i] |= addMask[i];
			}
		}
	}



	/**
	 * 移除宏定义集合。
	 * @param define 宏定义集合。
	 */
	removeDefineDatas(define: DefineDatas): void {
		var removeMask: Array<number> = define._mask;
		var mask: Array<number> = this._mask;
		var endIndex: number = this._length - 1;
		var i = Math.min(define._length,endIndex);
		for (; i >= 0; i--) {
			var newValue = mask[i] & ~removeMask[i];
			if (i == endIndex && newValue === 0) {
				endIndex--;
				this._length--;
			}
			else {
				mask[i] = newValue;
			}
		}
	}


	/**
	 * 是否有宏定义。
	 * @param define 宏定义。
	 */
	has(define: ShaderDefine): boolean {
		var index: number = define._index;
		if (index >= this._length)
			return false;
		return (this._mask[index] & define._value) !== 0;
	}

	/**
	 * 清空宏定义。
	 */
	clear(): void {
		this._length = 0;
	}

	/**
	 * 克隆。
	 * @param	destObject 克隆源。
	 */
	cloneTo(destObject: any): void {
		var destDefineData: DefineDatas = (<DefineDatas>destObject);
		var destMask: Array<number> = destDefineData._mask;
		var mask: Array<number> = this._mask;
		var count: number = this._length;
		destMask.length = count;
		for (var i: number = 0; i < count; i++)
			destMask[i] = mask[i];
		destDefineData._length = count;
	}

	/**
	 * 克隆。
	 * @return	 克隆副本。
	 */
	clone(): any {
		var dest: DefineDatas = new DefineDatas();
		this.cloneTo(dest);
		return dest;
	}
}


