import { Utils } from "laya/utils/Utils";

export class Network_XML {
	constructor() {
		this.setup();
	}

	private setup(): void {
		var xmlValueContainsError: string = "<root><item>item a</item><item>item b</item>somethis...</root1>";
		var xmlValue: string = "<root><item>item a</item><item>item b</item>somethings...</root>";

		this.proessXML(xmlValueContainsError);
		console.log("\n");
		this.proessXML(xmlValue);
	}

	// 使用xml
	private proessXML(source: string): void {
		try {
			var xml: XMLDocument = Utils.parseXMLFromString(source);
		}
		catch (e) {
			console.log(e.massage);
			return;
		}

		this.printDirectChildren(xml);
	}

	// 打印直接子级
	private printDirectChildren(xml: any): void {
		var rootNode: any = xml.firstChild;

		var nodes: any[] = rootNode.childNodes;
		for (var i: number = 0; i < nodes.length; i++) {
			var node: any = nodes[i];

			// 本节点为元素节点
			if (node.nodeType == 1) {
				console.log("节点名称: " + node.nodeName);
				console.log("元素节点，第一个子节点值为：" + node.firstChild.nodeValue);
			}
			// 本节点是文本节点
			else if (node.nodeType == 3) {
				console.log("文本节点：" + node.nodeValue);
			}
			console.log("\n");
		}
	}

}

