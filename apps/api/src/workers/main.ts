import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { WorkersModule } from './workers.module';

async function bootstrap(): Promise<void> {
  const logger = new Logger('WorkerProcess');

  const app = await NestFactory.createApplicationContext(WorkersModule, {
    logger: ['log', 'warn', 'error'],
  });

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    logger.log(`Received ${signal} — shutting down workers gracefully`);
    await app.close();
    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  logger.log('Workers process started — consuming queues');
}

bootstrap();
