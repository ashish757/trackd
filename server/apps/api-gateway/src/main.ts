import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { PROXY_CONFIG } from './proxy.config';
import { AppModule } from './app.module';
import { LoggingInterceptor } from '@app/common';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const logger = new Logger('API-Gateway');

    // Enable global logging interceptor
    app.useGlobalInterceptors(new LoggingInterceptor());

    // 1. Setup Proxies Dynamically
    const wsProxies = [];

    Object.entries(PROXY_CONFIG).forEach(([path, target]) => {
        const isWs = path === '/socket.io';
        const proxy = createProxyMiddleware({
            target,
            changeOrigin: true,
            ws: isWs,
        });

        app.use(path, proxy);
        if (isWs) wsProxies.push(proxy);
    });

    // 2. Handle WebSocket Upgrades (Critical for Socket.io)
    const server = app.getHttpServer();
    server.on('upgrade', (req, socket, head) => {
        // Find the proxy handling socket.io and upgrade the connection
        wsProxies.forEach((proxy) => {
            if (req.url.startsWith('/socket.io')) {
                proxy.upgrade(req, socket, head);
            }
        });
    });

    // 3. Middlewares & Global Config
    app.enableCors({
        origin: ['https://trackd-ten.vercel.app', 'http://localhost:5173'],
        credentials: true,
    });

    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

    const port = process.env.PORT || 3000;
    await app.listen(port);
    logger.log(`Gateway is routing traffic on port ${port}`);
}
bootstrap();