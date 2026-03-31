import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RabbitMQService, QUEUES } from '@infrastructure/messaging/rabbitmq.service';
import { MessageDeduplicationService } from '@infrastructure/messaging/message-deduplication.service';
import { PrismaService } from '@infrastructure/persistence/prisma.service';
import { StorageService } from '@infrastructure/storage/storage.service';
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import sharp from 'sharp';
import { Readable } from 'stream';

interface MediaUploadedPayload {
  workoutId: string;
  mediaId: string;
  s3Key: string;
  contentType: string;
  occurredAt: string;
}

const SIZES = {
  thumbnail: { width: 300, height: 300 },
  medium: { width: 800, height: 800 },
} as const;

@Injectable()
export class MediaProcessingWorker implements OnModuleInit {
  private readonly logger = new Logger(MediaProcessingWorker.name);
  private s3: S3Client;
  private bucket: string;

  constructor(
    private readonly rabbitmq: RabbitMQService,
    private readonly dedup: MessageDeduplicationService,
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly config: ConfigService,
  ) {}

  onModuleInit(): void {
    this.bucket = this.config.getOrThrow<string>('STORAGE_BUCKET');
    const endpoint = this.config.get<string>('STORAGE_ENDPOINT');

    this.s3 = new S3Client({
      region: this.config.get('STORAGE_REGION', 'us-east-1'),
      credentials: {
        accessKeyId: this.config.getOrThrow('STORAGE_ACCESS_KEY'),
        secretAccessKey: this.config.getOrThrow('STORAGE_SECRET_KEY'),
      },
      ...(endpoint && { endpoint, forcePathStyle: true }),
    });

    void this.rabbitmq.consume<MediaUploadedPayload>(
      QUEUES.MEDIA_PROCESSING,
      this.process.bind(this),
    );
  }

  private async process(payload: MediaUploadedPayload, msg: any): Promise<void> {
    const messageId = msg.properties.messageId as string;

    if (await this.dedup.isAlreadyProcessed(messageId)) {
      this.logger.debug(`[media] Mensagem ${messageId} já processada — ignorando`);
      return;
    }

    this.logger.log(
      `[media] Processando mídia ${payload.mediaId} do treino ${payload.workoutId}`,
    );

    try {
      // 1. Download do original do S3/MinIO
      const getCmd = new GetObjectCommand({ Bucket: this.bucket, Key: payload.s3Key });
      const { Body } = await this.s3.send(getCmd);
      const originalBuffer = await this.streamToBuffer(Body as Readable);

      // 2. Gerar thumbnail e medium em WebP
      const [thumbnailBuffer, mediumBuffer] = await Promise.all([
        sharp(originalBuffer)
          .resize(SIZES.thumbnail.width, SIZES.thumbnail.height, {
            fit: 'cover',
            position: 'centre',
          })
          .webp({ quality: 80 })
          .toBuffer(),
        sharp(originalBuffer)
          .resize(SIZES.medium.width, SIZES.medium.height, {
            fit: 'inside',
            withoutEnlargement: true,
          })
          .webp({ quality: 85 })
          .toBuffer(),
      ]);

      // 3. Upload das versões processadas
      const baseKey = payload.s3Key.replace(/\/original\.[^.]+$/, '');
      const thumbnailKey = `${baseKey}/thumbnail.webp`;
      const mediumKey = `${baseKey}/medium.webp`;

      await Promise.all([
        this.s3.send(
          new PutObjectCommand({
            Bucket: this.bucket,
            Key: thumbnailKey,
            Body: thumbnailBuffer,
            ContentType: 'image/webp',
            CacheControl: 'public, max-age=31536000', // imutável
          }),
        ),
        this.s3.send(
          new PutObjectCommand({
            Bucket: this.bucket,
            Key: mediumKey,
            Body: mediumBuffer,
            ContentType: 'image/webp',
            CacheControl: 'public, max-age=31536000',
          }),
        ),
      ]);

      // 4. Atualizar status da mídia no banco para READY
      await this.prisma.workoutMedia.update({
        where: { id: payload.mediaId },
        data: {
          thumbnailUrl: this.storage.publicUrlFor(thumbnailKey),
          mediumUrl: this.storage.publicUrlFor(mediumKey),
          status: 'READY',
        },
      });

      await this.dedup.markAsProcessed(messageId);
      this.logger.log(`[media] Mídia ${payload.mediaId} processada com sucesso`);
    } catch (err) {
      // Marcar como FAILED no banco antes de fazer nack (para não ficar em loop com status PROCESSING)
      await this.prisma.workoutMedia
        .update({
          where: { id: payload.mediaId },
          data: { status: 'FAILED' },
        })
        .catch(() => {
          /* ignora se já foi marcado */
        });

      throw err; // propaga para o RabbitMQService fazer nack → retry → DLQ
    }
  }

  private streamToBuffer(stream: Readable): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      stream.on('data', (chunk: Buffer) => chunks.push(chunk));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);
    });
  }
}
