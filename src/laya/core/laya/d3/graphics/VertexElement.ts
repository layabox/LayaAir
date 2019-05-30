/**
	 * <code>VertexElement</code> 类用于创建顶点结构分配。
	 */
	export class VertexElement {
		 offset:number;
		 elementFormat:string;
		 elementUsage:number;
		//public var usageIndex:int;//TODO:待确定是否添加
		
		constructor(offset:number, elementFormat:string, elementUsage:number){
			this.offset = offset;
			this.elementFormat = elementFormat;
			this.elementUsage = elementUsage;
			//this.usageIndex = usageIndex;
		}
	
	}

