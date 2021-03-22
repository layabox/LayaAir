/**
 * 关键帧
 */
export class KeyFramesContent {
	//TODO 这个对内存影响较大，建议减少一下
	/**开始时间 */
	startTime: number;
	/**持续时间 */
	duration: number;
	/**私有插值方式 */
	interpolationData: any[];//私有插值方式 [type0(插值类型),Data0(插值数据,可为空)，type1(插值类型),Data1(插值数据,可为空)] 注意：254全线性插值，255全不插值
	/**数据 */
	data: Float32Array;//= new Float32Array();	数据
	/**数据变化量 */
	dData: Float32Array;//= new Float32Array();	数据变化量
	/**下一次的数据 */
	nextData: Float32Array;//= new Float32Array();

}


