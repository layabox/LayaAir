	
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
			if (this.json) return (window as any).Laya.SceneUtils.createByData(null,this.json);
			return null;
		}
	}

