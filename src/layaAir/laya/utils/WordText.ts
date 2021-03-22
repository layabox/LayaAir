/**
	 * @private
	 */
export class WordText {
    //TODO:
    id: number;
    save: any[] = [];
    toUpperCase: string = null;
    changed: boolean;
    /**@internal */
    _text: string;
    width: number = -1;	//整个WordText的长度。-1表示没有计算还。
    pageChars: any[] = [];	//把本对象的字符按照texture分组保存的文字信息。里面又是一个数组。具体含义见使用的地方。
    startID: number = 0;	//上面的是个数组，但是可能前面都是空的，加个起始位置
    startIDStroke: number = 0;
    lastGCCnt: number = 0;	//如果文字gc了，需要检查缓存是否有效，这里记录上次检查对应的gc值。
	splitRender: boolean = false;	// 强制拆分渲染
	scalex=1;	// 缓存的时候的缩放
	scaley=1;

    setText(txt: string): void {
        this.changed = true;
        this._text = txt;
        this.width = -1;
        this.cleanCache();
        //pageChars = [];//需要重新更新
    }

    //TODO:coverage
    toString(): string {
        return this._text;
    }

    get length(): number {
        return this._text ? this._text.length : 0;
    }

    //TODO:coverage
    charCodeAt(i: number): number {
        return this._text ? this._text.charCodeAt(i) : NaN;
    }

    //TODO:coverage
    charAt(i: number): string {
        return this._text ? this._text.charAt(i) : null;
    }

    /**
     * 自己主动清理缓存，需要把关联的贴图删掉
     * 不做也可以，textrender会自动清理不用的
     * TODO 重用
     */
    cleanCache(): void {
		// 如果是独占文字贴图的，需要删掉
		//TODO 这个效果不对。会造成文字错乱
		let pagecharse = this.pageChars;
		for( var i in pagecharse){
			let p = pagecharse[i];
            var tex: any = p.tex;
            var words: any[] = p.words;
            if (words.length == 1 && tex && tex.ri) {// 如果有ri表示是独立贴图
                tex.destroy();
            }
		}
		/*
        this.pageChars.forEach(function (p: any): void { // 可能有多个
            var tex: any = p.tex;
            var words: any[] = p.words;
            if (words.length == 1 && tex && tex.ri) {// 如果有ri表示是独立贴图
                tex.destroy();
            }
        });
		*/
        this.pageChars = [];
		this.startID = 0;
		this.scalex=1;
		this.scaley=1;
    }
}

