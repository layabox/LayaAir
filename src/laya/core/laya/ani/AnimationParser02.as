package laya.ani {
	import laya.utils.Byte;
	
	/**
	 * @private
	 */
	public class AnimationParser02 {
		/**@private */
		private static var _templet:AnimationTemplet;
		/**@private */
		private static var _reader:Byte;
		/**@private */
		private static var _strings:Array = [];
		/**@private */
		private static var _BLOCK:Object = {count: 0};
		/**@private */
		private static var _DATA:Object = {offset: 0, size: 0};
		
		/**
		 * @private
		 */
		private static function READ_DATA():void {
			_DATA.offset = _reader.getUint32();
			_DATA.size = _reader.getUint32();
		}
		
		/**
		 * @private
		 */
		//TODO:coverage
		private static function READ_BLOCK():void {
			var count:uint = _BLOCK.count = _reader.getUint16();
			var blockStarts:Array = _BLOCK.blockStarts = [];
			var blockLengths:Array = _BLOCK.blockLengths = [];
			for (var i:int = 0; i < count; i++) {
				blockStarts.push(_reader.getUint32());
				blockLengths.push(_reader.getUint32());
			}
		}
		
		/**
		 * @private
		 */
		//TODO:coverage
		private static function READ_STRINGS():void {
			var offset:uint = _reader.getUint32();
			var count:uint = _reader.getUint16();
			var prePos:int = _reader.pos;
			_reader.pos = offset + _DATA.offset;
			
			for (var i:int = 0; i < count; i++)
				_strings[i] = _reader.readUTFString();
			
			_reader.pos = prePos;
		}
		
		/**
		 * @private
		 */
		//TODO:coverage
		public static function parse(templet:AnimationTemplet, reader:Byte):void {
			_templet = templet;
			_reader = reader;
			var arrayBuffer:ArrayBuffer = reader.__getBuffer();
			READ_DATA();
			READ_BLOCK();
			READ_STRINGS();
			for (var i:int = 0, n:int = _BLOCK.count; i < n; i++) {
				var index:int = reader.getUint16();
				var blockName:String = _strings[index];
				var fn:Function = AnimationParser02["READ_" + blockName];
				if (fn == null)
					throw new Error("model file err,no this function:" + index + " " + blockName);
				else
					fn.call(null);
			}
		}
		
		//TODO:coverage
		public static function READ_ANIMATIONS():void {
			var reader:Byte = _reader;
			var arrayBuffer:ArrayBuffer = reader.__getBuffer();
			var i:int, j:int, k:int, n:int, l:int;
			var keyframeWidth:int = reader.getUint16();
			var interpolationMethod:Array = [];
			interpolationMethod.length = keyframeWidth;
			for (i = 0; i < keyframeWidth; i++)
				interpolationMethod[i] = AnimationTemplet.interpolation[reader.getByte()];
			
			var aniCount:int = reader.getUint8();
			_templet._anis.length = aniCount;
			
			for (i = 0; i < aniCount; i++) {
				var ani:AnimationContent = _templet._anis[i] = new AnimationContent();
				ani.nodes = new Vector.<AnimationNodeContent>;
				var aniName:String = ani.name = _strings[reader.getUint16()];
				_templet._aniMap[aniName] = i;//按名字可以取得动画索引
				ani.bone3DMap = {};
				ani.playTime = reader.getFloat32();
				var boneCount:int = ani.nodes.length = reader.getInt16();
				ani.totalKeyframeDatasLength = 0;
				for (j = 0; j < boneCount; j++) {
					var node:AnimationNodeContent = ani.nodes[j] = new AnimationNodeContent();
					node.keyframeWidth = keyframeWidth;//TODO:存在骨骼里是否合并，需要优化到动画中更合理。
					node.childs = [];
					
					var nameIndex:int = reader.getUint16();
					if (nameIndex >= 0) {
						node.name = _strings[nameIndex];//骨骼名字
						ani.bone3DMap[node.name] = j;
					}
					
					node.keyFrame = new Vector.<KeyFramesContent>;
					node.parentIndex = reader.getInt16();//父对象编号，相对本动画(INT16,-1表示没有)
					node.parentIndex == -1 ? node.parent = null : node.parent = ani.nodes[node.parentIndex]
					
					ani.totalKeyframeDatasLength += keyframeWidth;
					
					node.interpolationMethod = interpolationMethod;//TODO:
					
					if (node.parent != null)
						node.parent.childs.push(node);
					
					var keyframeCount:int = reader.getUint16();
					node.keyFrame.length = keyframeCount;
					var keyFrame:KeyFramesContent = null, lastKeyFrame:KeyFramesContent = null;
					for (k = 0, n = keyframeCount; k < n; k++) {
						keyFrame = node.keyFrame[k] = new KeyFramesContent();
						keyFrame.startTime = reader.getFloat32();
						
						(lastKeyFrame) && (lastKeyFrame.duration = keyFrame.startTime - lastKeyFrame.startTime);
						
						keyFrame.dData = new Float32Array(keyframeWidth);
						keyFrame.nextData = new Float32Array(keyframeWidth);
						
						var offset:int = _DATA.offset;
						
						var keyframeDataOffset:int = reader.getUint32();
						var keyframeDataLength:int = keyframeWidth * 4;
						var keyframeArrayBuffer:ArrayBuffer = arrayBuffer.slice(offset + keyframeDataOffset, offset + keyframeDataOffset + keyframeDataLength);
						keyFrame.data = new Float32Array(keyframeArrayBuffer);
						lastKeyFrame = keyFrame;
					}
					keyFrame.duration = 0;
					
					node.playTime = ani.playTime;//节点总时间可能比总时长大，次处修正
					_templet._calculateKeyFrame(node, keyframeCount, keyframeWidth);
				}
			}
		}
	
	}

}