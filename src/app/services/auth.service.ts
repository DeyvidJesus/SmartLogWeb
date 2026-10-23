import { Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
export interface UserProfile { uid: string; nome: string; email: string; role: 'ADMIN'|'MOTORISTA'|'CLIENTE'|''; empresaId: string; demo?: boolean; }
@Injectable({providedIn:'root'})
export class AuthService {
  private readonly TOKEN_KEY='smartlog_token';
  private refreshInFlight: Promise<string> | null = null;
  readonly token=signal(localStorage.getItem(this.TOKEN_KEY) || environment.devAuthToken);
  readonly empresaId=signal(localStorage.getItem('smartlog_empresa_id') || environment.defaultEmpresaId);
  readonly apiUrl=signal(localStorage.getItem('smartlog_api_url') || environment.apiUrl);
  readonly currentUser=signal<UserProfile>({uid:'',nome:environment.devAuthToken ? 'Demonstração local' : 'Entrar',email:'',role:environment.devAuthToken ? 'ADMIN':'',empresaId:this.empresaId()});
  setToken(token:string) { localStorage.setItem(this.TOKEN_KEY,token); this.token.set(token); }
  setEmpresaId(value:string) { localStorage.setItem('smartlog_empresa_id',value); this.empresaId.set(value); this.currentUser.update(u=>({...u,empresaId:value})); }
  setApiUrl(value:string) { localStorage.setItem('smartlog_api_url',value); this.apiUrl.set(value); }
  isAuthenticated() { return !!this.token(); }
  isAdmin() { return this.currentUser().role==='ADMIN'; }
  async signIn(email:string,password:string) {
    const response=await fetch((environment.firebaseAuthEmulatorUrl ? environment.firebaseAuthEmulatorUrl+'/identitytoolkit.googleapis.com/v1' : 'https://identitytoolkit.googleapis.com/v1')+'/accounts:signInWithPassword?key='+environment.firebaseApiKey,{
      method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password,returnSecureToken:true})
    });
    const session=await response.json();
    if(!response.ok) throw new Error('Não foi possível entrar. Confira e-mail e senha.');
    this.setToken(session.idToken);
    localStorage.setItem('smartlog_refresh_token',session.refreshToken);
    localStorage.setItem('smartlog_token_expires',String(Date.now()+Number(session.expiresIn)*1000));
    try { await this.loadProfile(); if(!this.isAdmin()) throw new Error('Este painel exige um perfil administrador.'); }
    catch(e) { this.logout(); throw e; }
  }
  async loadProfile() {
    const response=await fetch(this.apiUrl()+'/me',{headers:{Authorization:'Bearer '+await this.getValidToken()}});
    if(!response.ok) throw new Error('Sua conta não foi autorizada na API. Verifique o cadastro da empresa.');
    const profile:UserProfile=await response.json();
    this.currentUser.set(profile); this.setEmpresaId(profile.empresaId);
    return profile;
  }
  async getValidToken():Promise<string> {
    const refresh=localStorage.getItem('smartlog_refresh_token');
    if(!refresh || Date.now()<Number(localStorage.getItem('smartlog_token_expires')||0)-60000) return this.token();
    if(!this.refreshInFlight) this.refreshInFlight=this.refresh(refresh).finally(()=>this.refreshInFlight=null);
    return this.refreshInFlight;
  }
  private async refresh(refreshToken:string) {
    const response=await fetch((environment.firebaseAuthEmulatorUrl ? environment.firebaseAuthEmulatorUrl+'/securetoken.googleapis.com/v1' : 'https://securetoken.googleapis.com/v1')+'/token?key='+environment.firebaseApiKey,{
      method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},
      body:new URLSearchParams({grant_type:'refresh_token',refresh_token:refreshToken}).toString()
    });
    if(!response.ok) { this.logout(); throw new Error('Sessão expirada. Entre novamente.'); }
    const data=await response.json(); this.setToken(data.id_token);
    localStorage.setItem('smartlog_refresh_token',data.refresh_token);
    localStorage.setItem('smartlog_token_expires',String(Date.now()+Number(data.expires_in)*1000));
    return data.id_token as string;
  }
  logout() {
    for(const key of [this.TOKEN_KEY,'smartlog_refresh_token','smartlog_token_expires','smartlog_empresa_id']) localStorage.removeItem(key);
    this.token.set(''); this.empresaId.set(''); this.currentUser.set({uid:'',nome:'Entrar',email:'',role:'',empresaId:''});
  }
}
