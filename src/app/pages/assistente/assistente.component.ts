import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { timeout, finalize } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
@Component({selector:'app-assistente',standalone:true,imports:[CommonModule,FormsModule],
template:`<section class="assistant-page"><div class="page-header"><div><div class="control-tower-badge">ASSISTENTE LOGÍSTICO</div><h1 class="page-title">Pergunte sobre sua operação</h1><p>Respostas a partir dos registros da sua empresa, consultados a cada pergunta.</p></div></div>
<div class="card conversation" aria-live="polite"><p *ngIf="!messages().length">Experimente: “Quais entregas ainda estão pendentes?” ou informe o código de uma entrega.</p>
<article *ngFor="let message of messages()" [class.question]="message.role==='user'"><strong>{{message.role==='user'?'Você':'SmartLog'}}</strong><p>{{message.text}}</p></article>
<p *ngIf="busy()" role="status">Consultando a operação…</p><p *ngIf="error()" role="alert" class="error">{{error()}}</p></div>
<form class="card question-form" (ngSubmit)="send()"><label for="question">Sua pergunta</label><div class="question-row"><input id="question" name="question" class="form-control" [(ngModel)]="question" maxlength="500" required placeholder="Qual o status da minha entrega?"><button class="btn btn-orange" [disabled]="busy()||!question.trim()">Perguntar</button></div></form>
<p class="note">O assistente não altera entregas. Confira informações importantes no registro operacional.</p></section>`,
styles:[`.assistant-page{padding:32px;max-width:1100px;margin:auto}.conversation{padding:24px;min-height:280px;max-height:55dvh;overflow:auto}.conversation article{padding:16px;border-bottom:1px solid #e2e8f0}.conversation p{white-space:pre-wrap;overflow-wrap:anywhere}.question{background:#fff7ed;border-radius:8px}.question-form{padding:20px;margin-top:20px}.question-row{display:flex;gap:12px;margin-top:8px}.form-control{flex:1;min-width:0;padding:12px;border:1px solid #cbd5e1;border-radius:8px}.error{color:#b91c1c}.note{color:#64748b;margin-top:12px}@media(max-width:600px){.assistant-page{padding:16px}.question-row{flex-direction:column}}`]})
export class AssistenteComponent {
  private http=inject(HttpClient); private auth=inject(AuthService);
  question='';busy=signal(false);error=signal('');messages=signal<{role:'user'|'assistant';text:string}[]>([]);
  send() { const question=this.question.trim();if(this.busy()||!question)return;
    const historico=this.messages().slice(-6).map(m=>({role:m.role,content:m.text}));
    this.messages.update(m=>[...m,{role:'user',text:question}]);this.question='';this.busy.set(true);this.error.set('');
    this.http.post<{resposta:string}>(this.auth.apiUrl()+'/chat',{pergunta:question,historico}).pipe(timeout(35000), finalize(()=>this.busy.set(false))).subscribe({
      next:response=>{this.messages.update(m=>[...m,{role:'assistant',text:response.resposta}]);this.busy.set(false);},
      error:error=>{this.question=question;this.error.set(error.error?.message||'Não foi possível consultar o assistente. Tente novamente.');this.busy.set(false);}
    });
  }
}
