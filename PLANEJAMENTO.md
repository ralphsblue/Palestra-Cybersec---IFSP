# Planejamento - Demo de Conscientização em Cybersec

**Evento:** Semana da Tecnologia - IFSP Birigui (curso TSI)
**Data:** 28/10/2026
**Orientador:** Prof. Rogério Pinto
**Autorização:** Institucional (IFSP Birigui) + professor orientador

## Objetivo

Demonstrar, de forma controlada e ética, quanta informação um site qualquer consegue coletar apenas por a pessoa abrir o link e interagir.
O site se apresenta como um "sorteio".
A revelação dos dados coletados acontece somente no final da palestra, como material de conscientização.

Mensagem central: "abrir um link desconhecido não é um ato inofensivo."

---

## Princípios éticos e legais (ler antes de desenvolver)

Isto é uma simulação de conscientização, não uma coleta real de dados para uso posterior.
As regras abaixo não são opcionais.

- **Escopo fechado:** só participa quem está na plateia da palestra. Nada de divulgar o link fora do evento.
- **LGPD / consentimento:** mesmo sendo demo educacional, inclua um aviso. A melhor abordagem é um termo "escondido à vista" (letra pequena, checkbox pré-marcado) que ninguém lê - isso vira parte da própria lição ("você aceitou sem ler").
- **Dados sensíveis:** NÃO colete e NÃO armazene senhas reais, CPF real, dados bancários reais. Veja a seção de senhas abaixo para a forma segura de passar essa mensagem.
- **Retenção:** todos os dados coletados são apagados logo após a palestra. Defina isso no código (TTL / botão de wipe) e mostre isso para a plateia.
- **Anonimização na apresentação:** ao projetar os dados no final, não exponha a identidade de ninguém sem querer. Mostre exemplos agregados ou peça voluntários.
- **Transparência final:** a revelação é o ponto. Ninguém sai da sala sem saber que foi uma demo e o que foi (e não foi) coletado.

---

## Categoria 1 - Coletado automaticamente (só por abrir o link)

Este é o núcleo da lição: nada disso pede permissão, o site recebe de graça.

### Via servidor (do request HTTP)
- Endereço IP
- Geolocalização aproximada por IP (cidade, região, provedor/ISP) - via serviço tipo ipapi/ipinfo
- Provedor de internet / se é rede móvel ou fixa
- `Referer` (de onde a pessoa veio)
- Timestamp exato do acesso
- Idioma preferido (`Accept-Language`)

### Via navegador (JavaScript, sem prompt)
- User-Agent: navegador, versão, sistema operacional e versão
- Resolução de tela e tamanho da janela (viewport)
- Profundidade de cor, densidade de pixel (retina?)
- Fuso horário e offset (`Intl.DateTimeFormat`)
- Idioma(s) do navegador (`navigator.languages`)
- Número de núcleos de CPU (`navigator.hardwareConcurrency`)
- Memória aproximada do device (`navigator.deviceMemory`)
- Tipo de conexão (`navigator.connection` - 4g, wifi, downlink)
- Suporte a toque (indica celular/tablet)
- Cookies habilitados, Do Not Track
- Bateria (nível e se está carregando) - API depreciada, mas funciona em alguns navegadores
- Plugins / mimetypes

### Fingerprinting (identificador único mesmo sem login)
- Canvas fingerprint (renderiza texto/forma e lê os pixels - varia por GPU/driver)
- WebGL fingerprint (fabricante e modelo da GPU)
- AudioContext fingerprint
- Lista de fontes instaladas
- Combinação de tudo acima gerando um hash único -> dá pra reconhecer o mesmo visitante entre sessões, mesmo em aba anônima

Ponto didático forte: mostrar o hash único e dizer "este é o seu 'RG' invisível - você não logou, mas te reconheço."

---

## Categoria 2 - Coletado com permissão do navegador (prompt)

Mostra que um clique distraído em "Permitir" entrega muito mais.

- **Geolocalização precisa (GPS):** `navigator.geolocation` - pede permissão, mas muita gente clica "permitir" achando que é pro sorteio ("ver se você está na região"). Entrega latitude/longitude exatas.
- **DECIDIDO: NÃO usar câmera/microfone.** Cortado por questão ética.
- **Notificações:** permissão pra mandar push depois.
- **Clipboard:** leitura da área de transferência (bem restrito em navegadores modernos, mas vale citar).

Boa prática na demo: capturar o fato de que a permissão foi concedida, sem reter o conteúdo sensível (não guardar coordenada exata além do necessário pra mostrar que deu).

---

## Categoria 3 - Coletado via formulário (o que a pessoa digita)

A pessoa entrega achando que é cadastro do sorteio.
Aqui mora o engano clássico de engenharia social.

Campos plausíveis num "sorteio":
- Nome completo
- E-mail
- Telefone / WhatsApp
- Data de nascimento ("pra validar maioridade")
- Instagram / @ ("pra marcar o ganhador")
- Cidade

### Sobre senha (DECIDIDO)

O momento mais impactante é mostrar reúso de senha.

- Peça pra "criar uma senha pra conta do sorteio".
- **Armazenamento:** plain-text no banco, MAS exibido mascarado no painel (ex. `ab••••3x` - mostra primeiro/último char e comprimento, esconde o miolo). Nunca projetar a senha inteira legível.
- Justificável porque: escopo fechado (só plateia), dados wipados logo após a palestra, e o mascaramento evita expor senha real de alguém no projetor.
- A lição: "você acabou de digitar, num site aleatório de sorteio, uma senha que talvez use no seu e-mail e banco - e ele guardou em texto puro, como 99% dos sites ruins."

Opcional (bônus didático): checar a senha contra Have I Been Pwned via k-anonymity (envia só prefixo do hash SHA-1) e mostrar "sua senha já apareceu em N vazamentos".

Nunca peça CPF, cartão ou senha de banco de verdade. Se quiser ilustrar, use campo claramente fake ou explique verbalmente.

---

## Categoria 4 - Comportamento

- Tempo total na página
- Se rolou até o fim / leu os termos (quase ninguém lê - ótimo pra lição)
- Cliques, caminho do mouse
- Se aceitou os termos sem abrir
- Quantas vezes voltou (via fingerprint)

---

## Login com Google (OAuth) - vetor principal de identidade

Não precisa de escopo sensível, logo sem burocracia de verificação do Google.
Escopo básico `openid email profile` já entrega dado real e verificado:

- Nome completo
- E-mail real (verificado pelo Google)
- Foto de perfil
- ID único da conta Google
- Locale / idioma

Lição: a pessoa clica "Continuar com Google" na correria e entrega **identidade real verificada** pra um site de sorteio aleatório, sem ler a tela de consentimento.

**Importante - NÃO dá pra roubar o cookie de sessão do Google do nosso site, e isso é parte da lição:**
- Same-origin policy: JS só lê cookie do próprio domínio.
- HttpOnly: cookie de sessão do Google nem é visível pra JS.
- SameSite: nem é enviado em request cross-site.
- Roubo real exigiria malware, XSS dentro do google.com, ou acesso físico - nada disso parte de "abrir um link".
- Slide: "o navegador te protege do roubo de sessão de propósito. O risco não é o cookie - é o que você entrega voluntariamente."

Setup: Google Cloud Console -> projeto -> OAuth consent screen -> client ID/secret. Exige HTTPS no site.

**Evitar o aviso "app não verificado":** esse interstitial aparece por escopo sensível OU por app em "Testing". Com só escopos básicos (`openid email profile`), publicar o consent screen como "In production" -> sem security review, sem burocracia, e some o aviso. A tela fica idêntica a qualquer login Google legítimo. Preencher nome do app, email de suporte (logo é opcional - pode disparar brand verification). TESTAR no celular antes do dia 28.

## Fluxo da experiência (proposta)

1. Link divulgado antes/no início da palestra (QR code no slide, grupo da turma).
2. Landing de "sorteio" chamativa, prêmio plausível.
3. Cadastro/login (incluindo "Continuar com Google") -> formulário.
4. Permissões pedidas com pretexto ("confirmar região", "selfie de presença").
5. Tela de "inscrição confirmada, boa sorte!".
6. Nos bastidores: tudo logado num painel.
7. **Final da palestra:** abre o painel ao vivo, mostra o que foi coletado de cada categoria, revela que era demo, explica cada vetor e como se proteger.

---

## Dificuldade técnica (estimativa)

| Dado | Dificuldade | Precisa backend? |
|------|-------------|------------------|
| IP + geoloc por IP | Fácil | Sim |
| User-Agent, tela, timezone, idioma | Fácil | Não (só coletar e enviar) |
| Hardware (CPU, RAM, conexão) | Fácil | Não |
| Canvas/WebGL/Audio fingerprint | Médio | Não (lib ex. FingerprintJS) |
| GPS preciso | Fácil (precisa permissão) | Não |
| Câmera/mic | Médio (permissão + ética) | Não |
| Formulário | Fácil | Sim (armazenar) |
| Have I Been Pwned check | Médio | Não (API pública) |
| Painel de revelação ao vivo | Médio | Sim |

---

## Stack (DECIDIDO: mais simples possível)

- Front: HTML/CSS/JS puro.
- Backend: Node + Express (um arquivo só). (Flask é alternativa equivalente.)
- OAuth: `passport-google-oauth20`.
- Fingerprint: FingerprintJS (open source).
- Armazenamento: SQLite (arquivo único, fácil de wipar).
- Painel: página /admin protegida por senha, polling simples.
- Hospedagem: Render/Railway/Vercel free + domínio plausível com HTTPS (OAuth exige HTTPS).

---

## Ameaça de app Android (apenas conceitual - slide, não implementar)

Usado para contrastar o risco do site (que a demo mostra ao vivo) com o risco MUITO maior de instalar um app.
Nada disso é construído ou executado - é material de apresentação.

**O contraste da palestra:** "tudo que mostrei o *site* coletou sozinho, dentro do sandbox do navegador. Agora imagine se você tivesse *instalado* o 'app do sorteio' fora da Play Store."

Como o ataque real funciona (fluxo, para explicar no slide):
1. Isca leva a baixar um APK fora da Play Store (sideload).
2. Na primeira abertura, o app pede permissão de **Acessibilidade** com pretexto ("ative para o app funcionar / ler o código do sorteio").
3. Acessibilidade foi feita pra ajudar pessoas com deficiência - dá ao app poder de ler tudo na tela e simular toques.
4. Com isso, um trojan consegue: ler o que você digita (keylogger), capturar a tela, auto-aprovar outras permissões, interceptar SMS/2FA, sobrepor telas falsas de banco (overlay).

Casos reais pra citar: **Cerberus**, **Anatsa/TeaBot**, **SharkBot** - trojans bancários Android que abusam de Acessibilidade. Vários já entraram na própria Play Store disfarçados de leitor de PDF/QR.

Mensagem: a permissão de Acessibilidade é a "chave mestra" do Android. Um site não alcança isso - um app instalado, sim.

Proteção (vai pro slide de defesa):
- Só instalar apps da Play Store / App Store oficiais.
- Desconfiar de qualquer app que peça Acessibilidade sem motivo claro.
- Revisar Configurações -> Acessibilidade e remover o que não reconhece.
- Nunca sideload de APK vindo de link/sorteio.

## Como fechar a palestra (slide de proteção)

Toda coleta vira uma dica defensiva:

- IP/geoloc -> use VPN quando fizer sentido.
- Fingerprint -> navegador com proteção (Firefox resist fingerprinting, Brave), extensões.
- Permissões -> só conceda câmera/GPS a sites confiáveis; revise permissões.
- Formulário -> desconfie de sorteio bom demais; e-mail descartável.
- Senha -> nunca reutilize; use gerenciador de senhas; 2FA.
- Geral -> leia antes de clicar "aceitar"; verifique o domínio.

---

## Termo "escondido à vista" (consentimento)

Faz papel duplo: cobertura ética/legal real E parte da lição.

**Regra de ouro:** o texto tem que ser VERDADEIRO. Diz que é uma demo, que dados são coletados, que são apagados depois.
Assim existe consentimento genuíno - a pegadinha é ética porque a informação está lá; só está em letra miúda que ninguém lê.
É isso que separa demo de conscientização de um golpe de verdade.

**Posicionamento:**
- Rodapé minúsculo no form + checkbox "Li e aceito os termos" JÁ pré-marcado.
- Link "termos" discreto, que abre o texto completo.

**Uso na revelação final:** abrir o termo e ler em voz alta - "estava escrito aqui que era demo e que eu pegaria tudo. Quem leu? Vocês aceitaram igual aceitam em qualquer site."

**Rascunho do texto do termo:**

> Termos de Participação
>
> Este site é uma demonstração educacional de segurança da informação, parte da Semana da Tecnologia do IFSP Birigui (curso TSI), sob orientação do Prof. Rogério Pinto.
> Não é um sorteio real.
> Ao participar, você concorda que este site coleta e exibe, para fins didáticos, dados do seu dispositivo e navegador (endereço IP, localização aproximada, modelo/sistema, identificador de navegador), os dados que você digitar no formulário e, caso use "Entrar com Google", seu nome, e-mail e foto de perfil.
> Esses dados serão exibidos ao final da palestra apenas para conscientização e apagados na sua frente ao término do evento.
> Nenhum dado será armazenado, compartilhado ou usado para qualquer outra finalidade.
> Se não concorda, basta fechar esta página.

## Pendências de decisão

- [x] ~~Câmera/mic~~ -> NÃO usar (ética)
- [x] ~~Senha~~ -> plain-text, exibida mascarada no painel; HIBP opcional
- [x] ~~Stack~~ -> Node/Express + SQLite + passport-google-oauth20 + FingerprintJS
- [x] ~~Login Google~~ -> OAuth escopo básico; roubo de cookie é impossível (vira lição)
- [x] ~~Nome/domínio~~ -> "IFSP - Palestra CyberSec"
- [x] ~~Prêmio fictício~~ -> caixa de chocolate
- [x] ~~Termo escondido~~ -> rascunho acima; letra miúda + checkbox pré-marcado
- [x] ~~Wipe dos dados~~ -> manual, ao vivo na frente da plateia (botão /admin "Apagar tudo")
- [ ] Roteiro da revelação final (Rafael escreve)
