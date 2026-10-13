# IFSP - Palestra CyberSec

Fala, dev!

Esse é um site de demonstração educacional de conscientização em segurança da informação. Vou palestrar na faculdade sobre o tema.

De inicio, o site se apresenta como um "sorteio", onde o usuário insere seus dados para participar. Depois, ao final da palestra, mostramos, de forma ética e autorizada, quanta informação um site qualquer coleta quando a pessoa apenas abre o link e interage.
Os dados são exibidos no painel ao final da palestra e apagados ao vivo na frente da plateia. Por questões éticas e legais, não estamos acessando câmera, microfone ou outras informações sensíveis NESSE site, já que ele sera aberto ao público.
Porém, para demonstração para o público, temos outro site interno que tem controle da câmera e microfone do usuário (basta ele aceitar), mas que é utilizado apenas pelos organizadores da palestra.

Como a palestra ainda não aconteceu e tudo isso ainda está em desenvolvimento, isso ainda está desatualizado no meu GitHub. Vou subir assim que a palestra for realizada. tmj nação

E como eu disse, fica em paz pq tudo isso tem autorização legal e aprovação do IFSP, além da tutela do Professor Rogério Pinto.

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

## Deploy (produção)

- Qualquer host Node com HTTPS.
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
- Wipe manual ao vivo encerra a coleta.
