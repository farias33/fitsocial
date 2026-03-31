import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { InfrastructureModule } from '@infrastructure/infrastructure.module';
import { StorageService } from '@infrastructure/storage/storage.service';
import { RankingUpdateWorker } from '@interfaces/workers/ranking-update.worker';
import { MediaProcessingWorker } from '@interfaces/workers/media-processing.worker';
import { NotificationWorker } from '@interfaces/workers/notification.worker';
import { FeedWorker } from '@interfaces/workers/feed.worker';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    InfrastructureModule,
  ],
  providers: [
    StorageService,
    RankingUpdateWorker,
    MediaProcessingWorker,
    NotificationWorker,
    FeedWorker,
  ],
})
export class WorkersModule {}
