export const environment = {
  production: false,
  apiUrl: '/api/v1',
  defaultEmpresaId: 'empresa-001',
  // Token do atalho de autenticação de desenvolvimento da SmartLogAPI.
  // Deve coincidir com smartlog.security.dev-auth.token (perfil "dev" da API,
  // variável SMARTLOG_DEV_AUTH_TOKEN). Não é aceito pela API fora do perfil dev.
  devAuthToken: 'smartlog-dev-token'
};
