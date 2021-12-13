var mime = require('browser-mime');

export class Image {
    public name: string;
    public src: string;
    public index:number;
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

    public file(b: Blob | string | ArrayBuffer): string {
        if (b instanceof Blob) {
            return this.name + '.' + mime.extension(b.type);
            // if (b.type == 'image' || 'image/jpeg' || 'image/jpg') {
            // }
            // if (b.type == 'image/png') {
            //     return this.name + '.png';
            // }
            // if (b.type == 'image/gif') {
            //     return this.name + '.gif';
            // }
            // if (b.type == 'video' || 'video/mp4') {
            //     return this.name + '.mp4';
            // }
        }
        return 'none.jpg';
    }
}