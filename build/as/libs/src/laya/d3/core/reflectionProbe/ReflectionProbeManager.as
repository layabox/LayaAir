package laya.d3.core.reflectionProbe {
	import laya.d3.core.render.BaseRender;
	import laya.d3.component.SimpleSingletonList;
	import laya.d3.resource.TextureCube;
	import laya.d3.math.Vector4;

	/**
	 * <code>ReflectionProbeManager</code> 类用于反射探针管理
	 * @miner 
	 */
	public class ReflectionProbeManager {

		public function ReflectionProbeManager(){}
		public function set sceneReflectionProbe(value:TextureCube):void{}
		public function set sceneReflectionCubeHDRParam(value:Vector4):void{}

		/**
		 * 更新baseRender的反射探针
		 * @param baseRender 
		 */
		public function _updateMotionObjects(baseRender:BaseRender):void{}

		/**
		 * 添加运动物体。
		 * @param 运动物体 。
		 */
		public function addMotionObject(renderObject:BaseRender):void{}

		/**
		 * 更新运动物体的反射探针信息
		 */
		public function update():void{}

		/**
		 * 更新传入所有渲染器反射探针
		 * @param 渲染器列表 
		 */
		public function updateAllRenderObjects(baseRenders:SimpleSingletonList):void{}

		/**
		 * 清楚变动队列
		 */
		public function clearMotionObjects():void{}
		public function destroy():void{}
	}

}
