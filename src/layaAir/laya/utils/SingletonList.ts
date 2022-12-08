
/**
 * <code>SingletonList</code> 类用于实现单例队列。
 */
export class SingletonList<T> {
    /**@internal [只读]*/
    elements: Array<T> = [];
    /** @internal [只读]*/
    length: number = 0;

    /**
     * 创建一个新的 <code>SingletonList</code> 实例。
     */
    constructor() {
    }

    /**
     * @internal
     */
    protected _add(element: T): void {
        if (this.length === this.elements.length)
            this.elements.push(element);
        else
            this.elements[this.length] = element;
    }

    /**
     * @internal
     */
    add(element: T): void {
        let index = this.elements.indexOf(element);
        if ((typeof (element) != "number") && index != -1 && index < this.length)
            return;
        if (this.length === this.elements.length)
            this.elements.push(element);
        else
            this.elements[this.length] = element;
        this.length++;
    }

    indexof(element:T){
        let index = this.elements.indexOf(element);
        if(index!=-1&&index<this.length)
            return index;
        return -1;
    }

    /**
     * @internal
     * @param element 
     */
    remove(element: T): void {
        let index = this.elements.indexOf(element);
        if (index != -1 && index < this.length) {
            this.elements[index] = this.elements[this.length - 1];
            this.length--;
        }

    }

    /**
     * @internal
     */
    clear(){
        this.elements = [];
        this.length = 0;
    }

    destroy() {
        this.elements = null;
    }
}


