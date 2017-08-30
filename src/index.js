#!/usr/bin/env node
const Log = require('log');
const log = new Log('info');
// -------------------koa----------------------
const Koa = require('koa');
const app = new Koa();
const server = require('http').Server(app.callback());
const querystring = require('querystring');

const syncConfig = require('./sync_config');
const rhconf = require('../conf/realhook.json');
syncConfig(rhconf);


// middleware
const koaBody = require('koa-body');
const Router = require('koa-router');
const router = new Router();
const realstatus = require('./mid_realstatus');
// const senttcp = require('./mid_sendtcp');

app.use(koaBody());
app.use(router.routes());
app.use(router.allowedMethods());
router.use(realstatus.keepReal());
// router.use(rhconf.realhook.stat_path, senttcp());


router.post(rhconf.realhook.stat_path, async (ctx, next) => {
    // console.log(JSON.stringify(ctx.request.body));
});

server.listen(rhconf.realhook.stat_port, () => {
    log.info(`Realhook server start at: ${rhconf.realhook.stat_port}`);
});


// --------------socket.io--------------------
const io = require('socket.io')(server);
const realhook = io.of('/realhook');

realhook.on('connection', (socket) => {
    setInterval(function () {
        socket.emit('realdata', realstatus.status);
    }, 1000);
});