import { Image } from '../model/image';
import { Abstract } from './view'

export class Cyberdrop extends Abstract {
   
    public name(): string {
        return document.querySelector<HTMLElement>('#title').innerText;
    }
    public queryLinksImages(): void | [Image] {
        var name:string = this.name();
        if(window.origin == 'https://bunkr.is'){
            const {innerText} = document.getElementById("__NEXT_DATA__");
            const {props:{pageProps:{files}}} = JSON.parse(innerText);

            for (const i in files){
                var link:{name:string; size:string; timestamp:number; cdn:string; i:string} = files[i];
                this.images.push(new Image(name,(link.name.toLowerCase().endsWith('.mp4') ? 'https://media-files.bunkr.is':link.cdn) + '/' + link.name,Number.parseInt(i)));
            }
        }else{
            document.querySelectorAll<HTMLAnchorElement>('a.image').forEach((item:HTMLAnchorElement,index:number)=>{
                if(window.origin == 'https://bunkr.is' && (item.href.endsWith('.mp4') || item.href.endsWith('.MP4'))){
                    this.images.push(new Image(name,item.href.replace('https://cdn.bunkr.is','https://media-files.bunkr.is'),index));
                }else{
                }
                this.images.push(new Image(name,item.href,index));
            });
        }
        this.images = this.images.reverse().map((image:Image,index:number) =>{
            image.index = index;
            index = index + 1;
            var idx: string | number = '' || index;
            if (index <= 9) {
                idx = '0' + index;
            }
            image.name = image.name.replace(/[\d]+$/,idx.toString());
            return image;
        });
    }


}