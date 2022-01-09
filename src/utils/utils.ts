import { Image } from "../model/image";

var mime = require('browser-mime');

export function sizeOf(bytes:number): string {
    if (bytes == 0) { return "0.00 B"; }
    var e = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, e)).toFixed(2) + ' ' + ' KMGTP'.charAt(e) + 'B';
}

export function file(image:Image): string {
    return image.name + '.' + mime.extension(image.blob.type);
}