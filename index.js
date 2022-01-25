const http = require ('http');
const Koa =  require('koa');
const koaBody = require ('koa-body');
const cors = require('koa2-cors');
const uuid = require('uuid');
const koaStatic = require('koa-static');
const faker = require('faker');
const path = require('path');

const app = new Koa();

const public = path.join(__dirname, '/public');
app.use(koaStatic(public));

app.use(koaBody({
    urlencoded: true,
    text: true,
    json: true,
    multipart: true,
}));
  
app.use(
    cors({
      origin: '*',
      credentials: true,
      'Access-Control-Allow-Origin': true,
      allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    }),
);

app.use(async (ctx, next) => {
    const origin = ctx.request.get('Origin');
    if (!origin) {
      return await next();
    }
  
    const headers = { 'Access-Control-Allow-Origin': '*', };
  
    if (ctx.request.method !== 'OPTIONS') {
      ctx.response.set({...headers});
      try {
        return await next();
      } catch (e) {
        e.headers = {...e.headers, ...headers};
        throw e;
      }
    }
  
    if (ctx.request.get('Access-Control-Request-Method')) {
      ctx.response.set({
        ...headers,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH',
      });
  
      if (ctx.request.get('Access-Control-Request-Headers')) {
        ctx.response.set('Access-Control-Allow-Headers', ctx.request.get('Access-Control-Request-Headers'));
      }
  
      ctx.response.status = 204;
    }
});

const Router = require('koa-router');
const router = new Router();

const emails = {
    "status": "ok",
    "timestamp": 1553400000,
    "messages": [
      {
        "id": "<uuid>",
        "from": "anya@ivanova",
        "subject": "Hello from Anya",
        "body": "Long message body here" ,
        "received": 1553108200
      },
      {
        "id": "<uuid>",
        "from": "alex@petrov",
        "subject": "Hello from Alex Petrov!",
        "body": "Long message body here",
        "received": 1553107200
      },
    ]
}

function newMail() {
    return {
        id: uuid.v4(),
        from: faker.internet.email(),
        subject: `Hello from ${faker.name.findName()}`,
        body: faker.lorem.paragraph(),
        received: Date.now(),
    }
}

router
    .get('/api/messages/unread', async (ctx, next) => {
      if (emails.messages.length < 10) {
        emails.messages.push(newMail());
        ctx.response.body = emails;
      } else {
        return emails;
      }
    });

app.use(router.routes()).use(router.allowedMethods());


const port = process.env.PORT || 8080;
const server = http.createServer(app.callback());
server.listen(port, (error) => {
  if (error) {
    console.log('Error occured:', error);
    return;
  }
  console.log(`Server is listening on ${port} port`);
});