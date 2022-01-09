
import { Image } from './../model/image';
import { saveAs } from 'file-saver';
import JSZip = require('jszip');
import {sizeOf,file} from './../utils/utils';
import { ids } from 'webpack';

export abstract class Abstract {
    private sidebar: HTMLElement;
    private mainBTNEl: HTMLElement;
    private title: HTMLElement;
    public list: HTMLElement;

    public zip: JSZip = new JSZip();
    public folder:JSZip;
    public speed:number[] = [];
    private zipEls:{[id:string]:HTMLLIElement} = {}; 
    
    public images:Image[] = [];
    
    public fails:Set<Image> = new Set<Image>();

    constructor() {
        document.body.insertAdjacentHTML('afterbegin',require('./template/index.html').default);
        this.sidebar = document.getElementById('templateSideBar');
        this.list = document.getElementById('sidebarList');
        this.mainBTNEl = document.getElementById('mainBTN');
        this.title = document.getElementById('headerDownloader');
        document.getElementById('zipProgress').style.padding = '0';
        document.getElementById('sidebarBTN').onclick = () => {
            if(this.sidebar.style.left == '-500px'){
                this.sidebar.style.left = '0.5px';
            }else{
                this.sidebar.style.left = '-500px';
            }
        };
    }

    public abstract name(): string;

    public abstract queryLinksImages(): [Image] | void;

    public render(): void {
        var name: string = this.name();
        this.folder = this.zip.folder(name);
        this.button(async (e: PointerEvent) => {
            try {
                this.clear();
                const stream:Blob = await this.processar((progress:Metadata ): void => {
                    this.addZipProgress(progress);
                });
                var toggle:boolean = (document.getElementById('btnZipCbz') as HTMLInputElement).checked;
                saveAs(stream, name + (toggle ? '.cbz' : '.zip'));
            } catch (error) {
                GM_notification({text:error});
            }
        });
    }

    private scroolList(cell:HTMLElement):void{
        this.list.appendChild(cell);
        const parent:HTMLElement = this.list.parentNode as HTMLElement;
        parent.scrollTop = parent.scrollHeight;
    }

    public addList(image: Image, progress: Tampermonkey.ProgressResponseBase): void {
        const cell: HTMLElement = image.getCell() // li;
        cell.title = image.src;
        cell.onclick = (ev:MouseEvent) => {
            if(image.done)
                this.notify(image.index);
            ev.preventDefault();
        };
        var { percent,speed,downloaded } = this.info(progress);
        cell.innerHTML = `
            <p style="text-align: left; text-decoration: underline;">${image.name}</p>           
            <p class="progress-k" style="width: ${percent};"></p>
            <p><small style="float:left">${downloaded} (${percent})</small><small style="float:right">${speed}</small></p>`;
        (cell.getElementsByClassName('progress-k')[0] as HTMLElement).style.padding = '3px';
        this.scroolList(cell);
    }

    public addErrorList(image: Image,retry:number): void {
        const cell: HTMLElement = image.getCell() // li;
        cell.title = image.src;
        cell.onclick = (ev:MouseEvent) => {
            if(!image.done)
                this.notify(image.index);
            ev.preventDefault();
        };
        cell.innerHTML = `
            <p style="text-align: left; text-decoration: underline;">${image.name}</p>           
            <p class="progress-k" style="width: 100%;"></p>
            <p><small style="float:left; color: #ca2222;">Error:. Unstable Server</small><small style="float:right">retry:. ${retry}</small></p>`;
        const style:CSSStyleDeclaration = (cell.getElementsByClassName('progress-k')[0] as HTMLElement).style;
        style.padding = '3px';
        style.backgroundColor = '#ca2222';
        this.scroolList(cell);
    }

    private info(progress: Tampermonkey.ProgressResponseBase):Progress{
        
        this.speed.push(progress.loaded);

        const data:Progress = {
            percent: `${((progress.loaded / progress.totalSize) * 100).toFixed(2)}%`,
            downloaded: `${sizeOf(progress.loaded)} of ${sizeOf(progress.totalSize)}`,
        };
        
        data.speed = this.speed.length > 10 ? `${sizeOf(progress.loaded - this.speed[this.speed.length - 10])}/s`:`${sizeOf(progress.loaded)}/s`;
        
        return data;
    }

    private getLi(title:string):HTMLLIElement{
        var els = this.zipEls[title];
        if(els)
            return this.zipEls[title];
        else
            return this.zipEls[title] = document.createElement('li');
    }

    public addZipProgress(progress:Metadata){
        if(progress.currentFile){
            var li:HTMLLIElement = this.getLi(progress.currentFile);
            li.title = progress.percent.toString();
            const [_folder,_file] = progress.currentFile.split('/');
            li.innerHTML = `<p>${_file || _folder}</p>`;
            document.getElementById('zipList').appendChild(li);
            var style:CSSStyleDeclaration = document.getElementById('zipProgress').style;
            style.padding = '3px';
            style.width = progress.percent + '%';
            document.getElementById('zipPercent').innerHTML = `<small>${document.getElementById('zipList').childElementCount - 1} of ${this.images.length} (${progress.percent.toFixed(2)}%)</small>`;
            (this.list.parentNode as HTMLElement).scrollTop = (this.list.parentNode as HTMLElement).scrollHeight;
        }
    }

    public notify(index:number): void{
        var el:Image = this.images[index];
        GM_notification({
            text:el.name + ' ' + el.src,
            onclick:():void => {
                console.log(el)
                window.open(el.src,'_blank')
            }
        })
    }

    public button(f: (e: PointerEvent) => void): void {
        this.mainBTNEl.onclick = f;
    }

    private clear(): void {
        var done:boolean = true;
        if(this.images){
            for(const image of this.images){
                if(image.done == false){
                    done = false;
                    break;
                }
            }
        }
        if(done){
            while (this.list.firstChild) {
                this.list.removeChild(this.list.firstChild);
            }
        }
    }

    public async * [Symbol.asyncIterator](): AsyncGenerator<Image>{
       for(var i = 0; i < this.images.length; i++ ){
           var retry = 1;
           if(!this.images[i].done){
               do{
                   this.speed = [];
                   try {
                    this.images[i].blob = await this.download<Blob>(
                        this.images[i].src,
                        {
                            onprogress: (event: Tampermonkey.ProgressResponse<Blob>): void => {
                                this.addList(this.images[i], event);
                                this.title.innerHTML = `<small>${this.list.childElementCount} of ${this.images.length}</small>`;
                            }
                        });
                        this.images[i].done = true;
                        yield this.images[i]
                   } catch (error) {
                        this.addErrorList(this.images[i],retry);
                        this.images[i].done = false;
                        console.error(error)
                        retry++
                   }
               }while(!this.images[i].done && retry <= 5);
           }
       }
    }

    public async processar(progress?:(progress:Metadata) => void): Promise<Blob>{
        for await (const image of this){
            if(image.done){
                this.folder.file(file(image), image.blob);
            }
        }
        return this.zip.generateAsync({ type: 'blob', comment: window.location.href }, progress);
    }

    public download<T>(url: string, 
        { onprogress,
            method = 'GET',
            prop = 'response', 
            responseType = 'blob',
            timeout = 0,
        }: Download<T>): Promise<T> {
        
        return new Promise((resolve: (value: T | PromiseLike<T>) => void, reject: (reason?:any ) => void): void => {
            GM_xmlhttpRequest<T>({ method, url, responseType, timeout,
                onprogress,
                revalidate:true,
                onload: (xml: Tampermonkey.Response<T>) => {
                    if(xml.readyState != 4){
                        return;
                    }
                    if (xml.status == 200)
                        resolve(xml[prop]);
                    else
                        reject(xml.statusText);
                },
                onerror:(error:Tampermonkey.ErrorResponse) => {
                    reject(error);
                },
                ontimeout:()=>{
                    reject('timeout')
                },
                onabort:() =>{
                    reject('abort')
                }
            });
        });
    }
}

type Download<T> = {
    method?: 'GET' | 'POST';
    responseType?: 'blob' | 'json' | 'arraybuffer' | undefined;
    onprogress?: (event: Tampermonkey.ProgressResponse<T>) => void;
    timeout?:number;
    prop?: 'response' | 'responseText' | 'responseHeaders' | 'responseXML' | 'context';
};

type Metadata = { 
    percent: number; 
    currentFile: string; 
}

type Progress = {
    percent:string; 
    downloaded:string;
    speed?:string;
}
