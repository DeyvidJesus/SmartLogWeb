// Administrative maintenance requested by the owner; secrets never reach logs or artifacts.
import {spawnSync} from 'node:child_process';
import {resolve} from 'node:path';
import {appendFileSync} from 'node:fs';

function fail(message){
  if(process.env.GITHUB_STEP_SUMMARY)appendFileSync(process.env.GITHUB_STEP_SUMMARY,`Preparação NEXT interrompida: ${message}\n`);
  throw new Error(message);
}

const site='2e4e6ab4-bb98-4100-80db-4a074a4ecb66';
const mode=process.env.SMARTLOG_DEMO_MODE || 'preview';
if(!['preview','apply'].includes(mode))fail('Modo de preparação inválido.');
if(!process.env.NETLIFY_AUTH_TOKEN)fail('NETLIFY_AUTH_TOKEN ausente. Nenhum dado foi alterado.');
const result=spawnSync('npx',['--yes','netlify-cli@27.14.2','env:get','FIREBASE_SERVICE_ACCOUNT_JSON','--site',site,'--context','production','--scope','functions','--json'],
  {encoding:'utf8',maxBuffer:4*1024*1024,timeout:120000});
if(result.status!==0)fail('Não foi possível acessar a configuração Firebase do site Netlify. Nenhum dado foi alterado.');
let credential;
try{credential=JSON.parse(result.stdout).FIREBASE_SERVICE_ACCOUNT_JSON;
  const account=JSON.parse(credential);
  if(account.type!=='service_account'||account.project_id!=='smartlog-b9b37')throw new Error();
}catch{fail('Configuração administrativa Firebase indisponível ou incompatível. Nenhum dado foi alterado.');}
const env={...process.env,FIREBASE_SERVICE_ACCOUNT_JSON:credential};
delete env.NETLIFY_AUTH_TOKEN;
const child=spawnSync(process.execPath,[resolve('SmartLogAPI/netlify/refresh-next-cases.mjs'),...(mode==='apply'?['--apply']:[])],
  {env,stdio:'inherit',timeout:240000});
if(child.error)throw new Error('A preparação não terminou. Consulte o backup antes de repetir.');
process.exitCode=child.status ?? 1;
