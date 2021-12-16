export class Image {
    public name: string;
    public src: string;
    public index:number;
    public blob?:Blob;
    public done:boolean = false;
    private tr: HTMLElement;

    constructor(name: string, src: string, index: number) {
        this.index = index;
        index = index + 1;
        this.src = src;
        var idx: string | number = '' || index;
        if (index <= 9) {
            idx = '0' + index;
        }
        this.name = name.replaceAll(/[<>:"\/\\|?*]+/g, '') + ' ' + idx;
    }

    public getCell(): HTMLElement {
        if (this.tr == null || this.tr == undefined) {
            this.tr = document.createElement('li');
        }
        return this.tr;
    }
}