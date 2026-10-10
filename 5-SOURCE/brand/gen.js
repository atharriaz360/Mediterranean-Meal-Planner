// generates olive-sprig mark
const f=n=>+n.toFixed(2);
function leaf(x,y,ang,L,W){const a=ang*Math.PI/180,dx=Math.cos(a),dy=Math.sin(a),nx=-dy,ny=dx;
 const tx=x+dx*L,ty=y+dy*L,mx=x+dx*L*.5,my=y+dy*L*.5;
 return `M${f(x)} ${f(y)}Q${f(mx+nx*W)} ${f(my+ny*W)} ${f(tx)} ${f(ty)}Q${f(mx-nx*W)} ${f(my-ny*W)} ${f(x)} ${f(y)}Z`;}
// stem from (17,49) to (47,17), slight curve
const stem='M16 50 C26 42 36 32 46 17';
const pts=[[21,46,-100,14,4.6],[24.5,43.5,5,14,4.6],[29.5,39,-105,13.5,4.4],[33,35.6,0,13,4.3],[38,29.6,-108,12,4],[41,25.5,-5,11.5,3.9],[46,17,-48,9,3.2]];
const leaves=pts.map(p=>leaf(...p)).join('');
module.exports={stem,leaves};
if(require.main===module){
const cream='#FBF6EC';
const svg=(bg=true)=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">${bg?'<rect width="64" height="64" rx="16" fill="#1F4A38"/>':''}<circle cx="34" cy="29" r="16" fill="#F2B84B"/><path d="${stem}" fill="none" stroke="${cream}" stroke-width="2.4" stroke-linecap="round"/><path d="${leaves}" fill="${cream}"/><path d="M27 40.6 Q28.5 43 28.6 44.5" fill="none" stroke="#FBF6EC" stroke-width="1.4" stroke-linecap="round"/><ellipse cx="29.2" cy="48.6" rx="3.8" ry="4.9" transform="rotate(-18 29.2 48.6)" fill="#D9683A"/></svg>`;
require('fs').writeFileSync(__dirname+'/mark.svg',svg());
}
