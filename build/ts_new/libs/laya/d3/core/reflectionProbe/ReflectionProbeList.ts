import { SingletonList } from "../../component/SingletonList";
import { ReflectionProbe } from "./ReflectionProbe";

/**
 * <code>ReflectionProbeList</code> 类用于实现反射探针队列。
 * @miner
 */
export class ReflectionProbeList extends SingletonList<ReflectionProbe>{
	/**
	 * 创建一个新的 <code>ReflectionProbeList</code> 实例。
	 */
	constructor() {
		super();
	}
	
	/**
	 * @internal
	 */
	add(singleElement:ReflectionProbe){
		this._add(singleElement);
		singleElement._setIndexInReflectionList(this.length++);
	}

	/**
	 * @internal
	 */
	remove(singleElement:ReflectionProbe){
		var index:number = singleElement._getIndexInReflectionList();
		this.length--;
		if(index !== this.length) {
			var end = this.elements[this.length];
			this.elements[index] = end;
			end._setIndexInReflectionList(index);
		}
		singleElement._setIndexInReflectionList(-1);
	}

}


