/**
	 * XML转Object类
	 * @author ww
	 * 
	 */
	export class XML2ObjectNodejs {
		// Address of the XML file to be parsed
		
		
		private static _arrays:any[];
		
		 static ChildrenSign:string = "childNodes";
		 static parse(node:any,isFirst:boolean=true):any {
			var obj:any = {};
			if(isFirst)
				obj.Name = node.localName;
			
			var numOfChilds:number = node[XML2ObjectNodejs.ChildrenSign]?node[XML2ObjectNodejs.ChildrenSign].length:0;
			//trace("nodeChilds",numOfChilds,node[ChildrenSign],ChildrenSign);
			var childs:any[]=[];
			var children:any={};
			obj.c = children;
			obj.cList = childs;
			for(var i:number = 0; i<numOfChilds; i++) {
				var childNode:any = node[XML2ObjectNodejs.ChildrenSign][i];
				var childNodeName:string = childNode.localName;
				var value:any;
				var numOfAttributes:number
				if (!childNodeName) continue;
				value = XML2ObjectNodejs.parse(childNode,true);
				childs.push(value);
				if(children[childNodeName]) {
					if(XML2ObjectNodejs.getTypeof(children[childNodeName]) == "array") {
						children[childNodeName].push(value);
					} else {
						children[childNodeName] = [children[childNodeName], value];
					}
				} else if(XML2ObjectNodejs.isArray(childNodeName)) {
					children[childNodeName] = [value];
				} else {
					children[childNodeName] = value;
				}
			}
			
			numOfAttributes=0;
			if(node.attributes)
			{
				numOfAttributes = node.attributes.length;		
				var prop:any={};
				obj.p=prop;
				for(i=0; i<numOfAttributes; i++) {
					//				trace(node.attributes()[i]);
					prop[node.attributes[i].name.toString()] = String(node.attributes[i].nodeValue);
				}
			}
			
			if(numOfChilds == 0) {
				if(numOfAttributes == 0) {
					//obj = "";
				} else {
					//					obj._content = "";
				}
			}
			return obj;
		}
		 static getArr(v:any):any[]
		{
			if(!v) return [];
			if(XML2ObjectNodejs.getTypeof(v)=="array") return v;
			return [v];
		}
		 static get arrays():any[] {
			if(!XML2ObjectNodejs._arrays) {
				XML2ObjectNodejs._arrays = [];
			}
			return XML2ObjectNodejs._arrays;
		}
		 static set arrays(a:any[]) {
			XML2ObjectNodejs._arrays = a;
		}
		private static isArray(nodeName:string):boolean {
			var numOfArrays:number = XML2ObjectNodejs._arrays ? XML2ObjectNodejs._arrays.length : 0;
			for(var i:number=0; i<numOfArrays; i++) {
				if(nodeName == XML2ObjectNodejs._arrays[i]) {
					return true;
				}
			}
			return false;
		}
		private static getTypeof(o:any):string {
			if(typeof(o) == "object") {
				if(o.length == null) {
					return "object";
				} else if(typeof(o.length) == "number") {
					return "array";
				} else {
					return "object";
				}
			} else {
				return typeof(o);
			}
		}
		
		
		
	}

