const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const KB = '/var/www/orquestrai/knowledge';
function ts(){ const d=new Date(); const p=n=>String(n).padStart(2,'0'); return d.getFullYear()+p(d.getMonth()+1)+p(d.getDate())+'-'+p(d.getHours())+p(d.getMinutes())+p(d.getSeconds()); }
function safe(s){ return String(s||'').replace(/[^A-Za-z0-9._-]/g,'_').slice(0,80); }
router.post('/blocos/save', express.json({limit:'5mb'}), (req,res)=>{
  try{
    const {n='SEM-N', titulo='', resumo='', script=''} = req.body||{};
    const file = path.join(KB,'blocos', safe(n)+'-'+ts()+'.md');
    const md = '# '+n+' — '+titulo+'\n\n## Resumo\n'+resumo+'\n\n## Script\n```bash\n'+script+'\n```\n';
    fs.writeFileSync(file, md, 'utf8');
    const line = '- ['+ts()+'] '+n+' — '+String(titulo).replace(/\n/g,' ').slice(0,160)+'\n';
    fs.appendFileSync(path.join(KB,'contextos','recentes.md'), line, 'utf8');
    res.json({ok:true, file});
  }catch(e){ res.status(500).json({ok:false, err:String(e)}); }
});
router.post('/licoes/save', express.json({limit:'5mb'}), (req,res)=>{
  try{
    const {n='SEM-N', titulo='', licao=''} = req.body||{};
    const file = path.join(KB,'licoes', safe(n)+'-'+ts()+'.md');
    const md = '# Lição — '+n+'\n\n'+(titulo?('**'+titulo+'**\n\n'):'')+licao+'\n';
    fs.writeFileSync(file, md, 'utf8');
    res.json({ok:true, file});
  }catch(e){ res.status(500).json({ok:false, err:String(e)}); }
});
module.exports = router;
