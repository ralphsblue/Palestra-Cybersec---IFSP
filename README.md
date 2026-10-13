# IFSP - Palestra CyberSec

Site de demonstração educacional de conscientização em segurança da informação.
Semana da Tecnologia - IFSP Birigui (curso TSI), sob orientação do Prof. Rogério Pinto.

Se apresenta como um "sorteio" para mostrar, de forma ética e autorizada, quanta informação um site qualquer coleta quando a pessoa apenas abre o link e interage.
Os dados são exibidos no painel ao final da palestra e apagados ao vivo na frente da plateia.

Veja `PLANEJAMENTO.md` para o escopo completo, decisões e cuidados éticos.

## Requisitos

- Node.js 22 ou superior (usa o SQLite embutido `node:sqlite`, sem dependências nativas).

## Instalação

```bash
npm install
cp .env.example .env   # no Windows PowerShell: copy .env.example .env
```

Edite o `.env` e preencha os valores (veja a seção Configuração).

## Rodar

```bash
npm start
```

- Site: http://localhost:3000
- Painel: http://localhost:3000/admin (usuário/senha do `.env`)

## Configuração (.env)

| Variável | Para que serve |
|----------|----------------|
| `PORT` | Porta do servidor (padrão 3000) |
| `BASE_URL` | URL pública. Local: `http://localhost:3000`. Produção: `https://seu-dominio` |
| `SESSION_SECRET` | String aleatória longa para a sessão |
| `ADMIN_USER` / `ADMIN_PASS` | Credenciais do painel `/admin` |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | OAuth do Google (opcional) |

Se as credenciais do Google ficarem em branco, o botão "Continuar com Google" não aparece - o resto funciona normalmente.

## Configurar o Login com Google (opcional, mas recomendado)

1. https://console.cloud.google.com -> crie um projeto.
2. "APIs e Serviços" -> "Tela de permissão OAuth" (OAuth consent screen):
   - Tipo: Externo.
   - Preencha nome do app, e-mail de suporte, e-mail do desenvolvedor.
   - Escopos: apenas `openid`, `email`, `profile` (não-sensíveis).
   - **Publique como "Em produção"** (In production). Com escopos básicos não há revisão de segurança, e isso remove o aviso "app não verificado".
3. "Credenciais" -> "Criar credenciais" -> "ID do cliente OAuth" -> "Aplicativo da Web":
   - Authorized redirect URI: `${BASE_URL}/auth/google/callback`
     (local: `http://localhost:3000/auth/google/callback`; produção: `https://seu-dominio/auth/google/callback`).
4. Copie o Client ID e Client Secret para o `.env`.

> O Google exige HTTPS em produção. Em `localhost` o HTTP é aceito para teste.

## Deploy (produção)

- Qualquer host Node com HTTPS (Render, Railway, Fly.io).
- Defina `BASE_URL` com o domínio https público e atualize o redirect URI no Google.
- Um domínio com cara de sorteio ajuda a demonstração.

## Fluxo da demo

1. Divulgue o link / QR code no início da palestra.
2. A plateia se cadastra achando ser um sorteio de caixa de chocolates.
3. Os dados chegam em tempo real no `/admin`.
4. No final, projete o `/admin`, revele tudo, explique cada vetor e clique em **"Apagar tudo (ao vivo)"** na frente de todos.

## Privacidade / ética

- Escopo fechado: só a plateia do evento.
- Consentimento real no termo (letra miúda, mas verdadeiro).
- Sem câmera/microfone.
- Senha guardada só para a demonstração de reúso, exibida mascarada, apagada ao fim.
- Wipe manual ao vivo encerra a coleta.
