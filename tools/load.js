// Charge les données de l'appli dans Node (pour les tests et l'analyse)
const fs=require('fs'),path=require('path');
const files=['ingredients.js','r1-matin.js','r2-france.js','r3-italie-inde.js','r4-asie-mexique.js','r5-monde.js','r6-plus.js','photos.js','d1-matin.js','d2-france-a.js','d3-france-b.js','d4-italie.js','d5-inde.js','d6-asie.js','d7-mexique-orient.js','d8-med-us-afrique.js'];
const extra=fs.readdirSync(path.join(__dirname,'../data')).filter(f=>/^d(9|1\d)-.*\.js$/.test(f)).sort((a,b)=>parseInt(a.slice(1))-parseInt(b.slice(1)));
const code=files.concat(extra).map(f=>fs.readFileSync(path.join(__dirname,'../data',f),'utf8')).join('\n');
module.exports=new Function(code+';return {RECIPES:typeof RECIPES!=="undefined"?RECIPES:null,ING:typeof ING!=="undefined"?ING:null,DETAILS,STORES:typeof STORES!=="undefined"?STORES:null,RAYONS:typeof RAYONS!=="undefined"?RAYONS:null,PHOTOS:typeof PHOTOS!=="undefined"?PHOTOS:null};')();
