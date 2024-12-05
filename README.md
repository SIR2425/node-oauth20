# Autenticação OAuth2.0 Google

### Passo 1: Criar um Projeto no Google Cloud Console

1. Aceda a Google Cloud Console.

2. Crie um novo projeto ou escolha um já existente.

3. Com o projeto selecionado, aceda A **Google Auth Platform**

4. Preencha a informação solicitada

   1. [Appname + email] + [Audience (external)] + [contact email] + [Terms] + [Fiinsh] + [CREATE]

5. Cirie um Cliente OAuth em [**CREATE OAUTH CLIENT]** 

   1. tipo Web Application

   2. Escolha um nome para este cliente

   3. Configure as URI de origem da web app

   4. ```bash
      http://localhost:3000
      ```

   5. Defina o URI de redirecionamento:

      ```bash
      http://localhost:3000/auth/google/callback
      ```

   6. Crie a identidade do cliente

   7. Salve e copie o `Client ID` e o `Client Secret`.

### Passo 2: Setup para desenvolvimento

1. **Inicializar um projeto Node.js**:

   ```bash
   npm init
   ```

2. **Instalar as dependências necessárias**:

   ```bash
   npm install express passport passport-google-oauth20 express-session dotenv
   ```

3. **Estrutura dos arquivos**:

   - Crie um ficheiro principal chamado `app.js`.
   - Crie um ficheiro `.env` para armazenar variáveis de ambiente.

### Passo 3: Configuração do ficheiro `.env`

`.env`

```bash
# GOOGLE
GOOGLE_CLIENT_ID=google_client_id
GOOGLE_CLIENT_SECRET=google_client_secret
# SESSION
SESSION_SECRET="voltaruben"
# SERVER
PORT=3000
```

### Passo 4: Webapp com Node.js + Express + Passport

`app.js`

#### 1. Importar Dependências e Configurar Express

```javascript
import express from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import session from 'express-session';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
```

- Importação dos módulos necessários.
- Utilizamos o `dotenv` para carregar as variáveis de ambiente definidas em `.env`.

#### 2. Configurar o Passport com Google OAuth

```javascript
passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:3000/auth/google/callback'
  },
  (accessToken, refreshToken, profile, done) => {
    // Aqui poderia ser acrescentada código de verificação / registo de utilizador na BD
    return done(null, profile);
  }
));
```

- A estratégia do Google OAuth é configurada usando o `clientID` e o `clientSecret`.
- O `callbackURL` é para onde o Google redirecionará após a autenticação.

#### 3. Serialize e Deserialize do utilizador

Esta lógica permite definir que dados são extraídos do objeto user do Google Auth, para manter em informação de sessão na Web App.

Neste exemplo apenas o `user.id`está a ser utilizado.

```javascript
// Serialize user to session
passport.serializeUser((user, done) => {
  // storing ID and displayName from google account
  const userinfo = {id : user.id, displayName : user.displayName}
  done(null, userinfo);
});

// Deserialize user from session
passport.deserializeUser((userinfo, done) => {
    // could look up the user information in the database
    // and pass it to the done function
  done(null,userinfo);
});
```

- **Serialize**: Define o que será guardado na informação de sessão
- **Deserialize**: Eventual recuperação dos dados do utilizador a partir do `id` ou outra info guardada na informação de sessão.

#### 4. Configurar o middleware de Sessão e Passport

```javascript
app.use(session({ secret: proc.env.SESSION_SECRET, resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
```

- O `express-session` é usado para gerenciar sessões.
- `passport.initialize()` e `passport.session()` são necessários para integrar o Passport com o Express e `express-session`

#### 5. Definir as Rotas

```javascript
app.get('/', (req, res) => {
  res.send('<h1>Home Page</h1><a href="/auth/google">Login with Google Account</a>');
});

app.get('/auth/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

app.get('/auth/google/callback', passport.authenticate('google', {
  failureRedirect: '/'
}), (req, res) => {
  res.redirect('/profile');
});

app.get('/profile', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/');
  }
  res.send(`<h1>Profile Page</h1><p>Welcome, ${req.user.displayName}</p><a href="/logout">Logout</a>`);
});

app.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
});
```

- **Rota `/`**: Página inicial com link para o login através do Google.
- **Rota `/auth/google`**: Inicia a autenticação com o Google.
- **Rota `/auth/google/callback`**: Callback do Google após autenticação bem-sucedida ou falha.
- **Rota `/profile`**: Exibe o perfil do utilizador após autenticação.
- **Rota `/logout`**: Faz o logout do utilizador e o redireciona para a página inicial.

#### 6. Iniciar o Servidor

```javascript
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

- Inicia o servidor na porta especificada.

### Passo 5: Testar a Web App

1. **Iniciar o Servidor**:

   - Execute o comando:

     ```
     node app.js
     ```

   - Pode aceder à web app em `http://localhost:3000`.

2. **Abrir o Navegador**:

   - Aceda a  `http://localhost:3000` e clique em "Login with Google Account".
   - Autentique-se usando a conta Google e aceda à página de perfil ``http://localhost:3000/profile``

### Considerações Finais

- **Segurança**: Nunca use segredos ou informações sensíveis em texto puro. Use variáveis de ambiente e outras práticas seguras.
- **Banco de Dados**: Para uma aplicação real, será necessário integrar uma base de dados (ex.: MongoDB, PostgreSQL) para armazenar informações dos utilizadores.
- **Produção**: Em produção, use HTTPS em vez de HTTP e configure um servidor seguro.# node-oauth20
