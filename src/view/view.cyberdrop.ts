import { Image } from '../model/image';
import { Abstract } from './view'

export class Cyberdrop extends Abstract {
   
    public name(): string {
        return document.querySelector<HTMLElement>('#title').innerText;
    }
    public queryLinksImages(): void | [Image] {
        var name:string = this.name();
        document.querySelectorAll<HTMLAnchorElement>('a.image').forEach((item:HTMLAnchorElement,index:number)=>{
            if(window.origin == 'https://bunkr.is' && (item.href.endsWith('.mp4') || item.href.endsWith('.MP4'))){
                this.images.push(new Image(name,item.href.replace('https://cdn.bunkr.is','https://stream.bunkr.is/d'),index));
            }else{
                this.images.push(new Image(name,item.href,index));
            }
        });
        this.images = this.images.reverse().map((image:Image,index:number) =>{
            image.index = index;
            var idx: string | number = '' || index;
            if (index <= 9) {
                idx = '0' + index;
            }
            image.name = image.name.replace(/[\d]+$/,idx.toString());
            ;
            return image;
        });
    }


}