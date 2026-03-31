import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';

const PRESIGNED_PUT_TTL = 5 * 60;       // 5 minutos para upload
const PRESIGNED_GET_TTL = 60 * 60;      // 1 hora para leitura

export interface PresignedUpload {
  mediaId: string;
  uploadUrl: string;
  key: string;
}

@Injectable()
export class StorageService implements OnModuleInit {
  private s3: S3Client;
  private bucket: string;
  private publicUrl: string;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    const endpoint = this.config.get<string>('STORAGE_ENDPOINT');
    this.bucket = this.config.getOrThrow<string>('STORAGE_BUCKET');
    this.publicUrl = this.config.getOrThrow<string>('STORAGE_PUBLIC_URL');

    this.s3 = new S3Client({
      region: this.config.get('STORAGE_REGION', 'us-east-1'),
      credentials: {
        accessKeyId: this.config.getOrThrow('STORAGE_ACCESS_KEY'),
        secretAccessKey: this.config.getOrThrow('STORAGE_SECRET_KEY'),
      },
      // MinIO em dev — endpoint customizado
      ...(endpoint && {
        endpoint,
        forcePathStyle: true,
      }),
    });
  }

  /** Gera presigned URL para upload direto do cliente → S3/MinIO */
  async createPresignedUpload(
    prefix: string,
    contentType: string,
  ): Promise<PresignedUpload> {
    const mediaId = randomUUID();
    const ext = contentType.split('/')[1] ?? 'jpg';
    const key = `${prefix}/${mediaId}/original.${ext}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(this.s3, command, {
      expiresIn: PRESIGNED_PUT_TTL,
    });

    return { mediaId, uploadUrl, key };
  }

  /** URL pública (CDN ou MinIO) para um objeto processado */
  publicUrlFor(key: string): string {
    return `${this.publicUrl}/${key}`;
  }

  /** Presigned GET URL para objetos privados */
  async signedReadUrl(key: string): Promise<string> {
    const command = new GetObjectCommand({ Bucket: this.bucket, Key: key });
    return getSignedUrl(this.s3, command, { expiresIn: PRESIGNED_GET_TTL });
  }
}
