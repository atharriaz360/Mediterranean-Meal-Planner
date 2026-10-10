const fs=require('fs');const inner=fs.readFileSync(__dirname+'/mark-inner.txt','utf8');
// maskable: full-bleed bg, content scaled into safe zone
fs.writeFileSync(__dirname+'/mediterranean-meal-planner-icon-maskable.svg',`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#1F4A38"/><g transform="translate(6.4 6.4) scale(.8)">${inner}</g></svg>`);
