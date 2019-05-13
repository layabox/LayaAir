	import { SceneUtils } from "../utils/SceneUtils"
	
	/**
	 * 模板，预制件
	 */
	export class Prefab {
		/**@private */
		 json:any;
		
		/**
		 * 通过预制创建实例
		 */
		 create():any {
			if (this.json) return SceneUtils.createByData(null,this.json);
			return null;
		}
	}

