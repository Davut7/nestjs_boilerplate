import { Module } from '@nestjs/common';
import { MediaService } from './media.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MinioModule } from 'src/minio/minio.module';
import { MediaEntity } from './entities/mediaEntity';
import { MinioService } from 'src/minio/minio.service';

@Module({
  imports: [TypeOrmModule.forFeature([MediaEntity]), MinioModule],
  providers: [MediaService, MinioService],
  exports: [MediaService, MinioService],
})
export class MediaModule {}
