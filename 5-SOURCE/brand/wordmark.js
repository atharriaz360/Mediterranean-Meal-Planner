const opentype=require('opentype.js'),fs=require('fs');
const {stem,leaves}=require('./gen.js');
const b=fs.readFileSync('node_modules/@fontsource/fraunces/files/fraunces-latin-600-normal.woff');const font=opentype.parse(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength));
const ib=fs.readFileSync('node_modules/@fontsource/inter/files/inter-latin-600-normal.woff');const inter=opentype.parse(ib.buffer.slice(ib.byteOffset,ib.byteOffset+ib.byteLength));
function textPath(t,size,x,y,ls=0,fnt=font){const font=fnt;let p=new opentype.Path(),cx=x;for(const ch of t){const g=font.charToGlyph(ch);const gp=g.getPath(+cx.toFixed(2),y,size);p.extend(gp);cx+=g.advanceWidth*size/font.unitsPerEm+ls;}return {d:p.toPathData(2),w:cx-x};}
const cream='#FBF6EC';
const markInner=`<circle cx="34" cy="29" r="16" fill="#F2B84B"/><path d="${stem}" fill="none" stroke="${cream}" stroke-width="2.4" stroke-linecap="round"/><path d="${leaves}" fill="${cream}"/><path d="M27 40.6 Q28.5 43 28.6 44.5" fill="none" stroke="${cream}" stroke-width="1.4" stroke-linecap="round"/><ellipse cx="29.2" cy="48.6" rx="3.8" ry="4.9" transform="rotate(-18 29.2 48.6)" fill="#D9683A"/>`;
const mark=(x,y,s,bg='#1D5673')=>`<g transform="translate(${x} ${y}) scale(${s/64})"><rect width="64" height="64" rx="16" fill="${bg}"/>${markInner}</g>`;
const W=textPath('Mediterranean',64,100,62);
const T=textPath('MEAL PLANNER',11.2,103,88,2.35,inter);
const VW=Math.ceil(100+Math.max(W.w,T.w+3)+6);
const horiz=(ink,sub)=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VW} 100"><title>Mediterranean Meal Planner</title>${mark(0,8,84)}<path d="${W.d}" fill="${ink}"/><path d="${T.d}" fill="${sub}"/></svg>`;
fs.writeFileSync(__dirname+'/mediterranean-meal-planner-logo.svg',horiz('#1E2A30','#1D5673'));
fs.writeFileSync(__dirname+'/mediterranean-meal-planner-logo-light.svg',horiz('#FBF6EC','#F2B84B'));
fs.writeFileSync(__dirname+'/mediterranean-meal-planner-icon.svg',`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">${mark(0,0,64)}</svg>`);
// small wordmark path only (for app sidebar)
const S=textPath('Mediterranean',26,0,24);
fs.writeFileSync(__dirname+'/wordmark-path.json',JSON.stringify({d:S.d,w:Math.ceil(S.w)}));
fs.writeFileSync(__dirname+'/mark-inner.txt',markInner);
console.log('ok',W.w,S.w);
