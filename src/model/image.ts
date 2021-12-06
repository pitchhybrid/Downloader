
export class Image {
    public name: string;
    public src: string;

    private tr: HTMLElement;

    constructor(name: string, src: string, index: number) {
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

    public file(b: Blob | string | ArrayBuffer): string {
        if (b instanceof Blob) {
            if (b.type == 'image' || 'image/jpeg' || 'image/jpg') {
                return this.name + '.jpg';
            }
            if (b.type == 'image/png') {
                return this.name + '.png';
            }
            if (b.type == 'image/gif') {
                return this.name + '.gif';
            }
        }
        return 'none.jpg';
    }
}