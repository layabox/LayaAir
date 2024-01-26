import { BufferTargetType, BufferUsage } from "./RenderEnum/BufferTargetType";
export class Buffer {


	_buffer: Float32Array|Uint16Array|Uint8Array|Uint32Array;

	_bufferType: number;
	_bufferUsage: number;

	_byteLength: number = 0; 

	get bufferUsage(): number {
		return this._bufferUsage;
	}

	constructor(targetType: BufferTargetType, bufferUsageType: BufferUsage) {
		//this._glBuffer = LayaGL.renderEngine.createBuffer(targetType,bufferUsageType);
		this._bufferType = targetType;
		this._bufferUsage = bufferUsageType;
	}

	// /**
	//  * @private
	//  */
	// bind(): boolean {
	// 	//return this._glBuffer.bindBuffer();
	// }

	// unbind():void{
	// 	//return this._glBuffer.unbindBuffer();
	// }

	/**
	 * @private
	 */
	destroy(): void {
		// if (this._glBuffer) {
		// 	this._glBuffer.destroy();
		// 	this._glBuffer = null;
		// }
	}
}

