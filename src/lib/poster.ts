import type { Collection, Plate } from "./catalog";
import { pad } from "./catalog";
const PAPER = "#F1EEE9";
function wrap(ctx: CanvasRenderingContext2D, text:string, maxWidth:number, startX:number, y:number, lineHeight:number):number {
 let line="";const words=text.split(/\s+/);
 for(const word of words) { const test=line? `${line} ${word}`:word;
  if(ctx.measureText(test).width>maxWidth && line) {ctx.fillText(line,startX,y);y+=lineHeight;line=word;} else line=test;
 }
 if(line)ctx.fillText(line,startX,y);
 return y;
}
function getImage(src:string):Promise<HTMLImageElement> {
 return new Promise((resolve,reject)=>{
  const img = new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(new Error("Couldn't load this illustration."));img.src=src;
 });
}
export async function renderPoster(plate:Plate,collection:Collection):Promise<Blob>{
 const w=1600,h=2000;
 const canvas=document.createElement("canvas");canvas.width=w;canvas.height=h;
 const ctx=canvas.getContext("2d"); if(!ctx)throw new Error("Canvas is not supported.");
 ctx.fillStyle=PAPER;ctx.fillRect(0,0,w,h);
 const img=await getImage(plate.image);
 const box=w*(plate.imageScale/100), imageRatio=img.naturalWidth/img.naturalHeight;
 let dw=box,dh=box;if(imageRatio>1) dh=box/imageRatio;else dw=box*imageRatio;
 ctx.drawImage(img,(w-dw)/2,670-dh/2,dw,dh);
 const left=172;
 ctx.textAlign="left";
 ctx.fillStyle=collection.accent;ctx.font="italic 56px Georgia, serif";ctx.fillText(pad(plate.number),left,1510);
 ctx.fillStyle="#24221D";
 const name=plate.commonName || "Untitled study";
 let size=80;
 do {ctx.font=`${size}px Georgia, 'Times New Roman', serif`; if(ctx.measureText(name).width <w-2*left)break;size-=3}while(size>45);
 ctx.fillText(name,left,1602);
 if(plate.scientificName){ctx.font="italic 46px Georgia, 'Times New Roman', serif";ctx.fillText(plate.scientificName,left,1670);}
 ctx.font="31px Georgia, 'Times New Roman', serif";
 const originLine=`${collection.originLabel}: ${plate.origin||'Not specified'}`;
 wrap(ctx,originLine,w-2*left,left,1742,47);
 return await new Promise<Blob>((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error("Could not create PNG.")),"image/png"));
}
export async function downloadPoster(plate:Plate,collection:Collection) {
 const blob=await renderPoster(plate,collection);
 const url=URL.createObjectURL(blob);
 const anchor=document.createElement("a");
 anchor.href=url;anchor.download=`${collection.title}_${pad(plate.number)}_${plate.commonName.replace(/[^a-z0-9]+/gi,"_").replace(/^_|_$/g,"")}.png`;
 document.body.appendChild(anchor);anchor.click();anchor.remove();
 setTimeout(()=>URL.revokeObjectURL(url),1500);
}
