import { Injectable, NotFoundException } from '@nestjs/common';
import { In, QueryRunner, Repository } from 'typeorm';
import { MinioService } from '../minio/minio.service';
import { InjectRepository } from '@nestjs/typeorm';
import { MediaEntity } from './entities/mediaEntity';
import { ITransformedFile } from 'src/helpers/common/interfaces/fileTransform.interface';
import { LanguageEnum } from 'src/helpers/constants';

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(MediaEntity)
    private mediaRepository: Repository<MediaEntity>,
    private minioService: MinioService,
  ) {}

  async createFilesMedia(
    files: ITransformedFile[],
    entityId: string,
    queryRunner: QueryRunner,
    entityColumn: string,
  ) {
    const fileIds: string[] = [];
    for (const file of files) {
      const media = new MediaEntity();
      media.originalName = file.originalName;
      media.fileName = file.fileName;
      media.filePath = file.filePath;
      media.mimeType = file.mimeType;
      media[entityColumn] = entityId;
      media.size = file.size;
      await queryRunner.manager.save(MediaEntity, media);
      fileIds.push(media.id);
    }

    return { message: 'Media uploaded successfully', fileIds };
  }

  async createFileMedia(
    file: ITransformedFile,
    entityId: string,
    queryRunner: QueryRunner,
    entityColumn: string,
    entityLng?: LanguageEnum,
  ) {
    console.log(entityLng);
    const media = new MediaEntity();
    media.originalName = file.originalName;
    media.fileName = file.fileName;
    media.filePath = file.filePath;
    media.mimeType = file.mimeType;
    media[entityColumn] = entityId;
    media.size = file.size;
    await queryRunner.manager.save(MediaEntity, media);
    return media.id;
  }

  async deleteMedias(fileIds: string[], queryRunner: QueryRunner) {
    const files = await queryRunner.manager.find(MediaEntity, {
      where: { id: In(fileIds) },
    });
    if (!files) throw new NotFoundException('Some files are not found!');
    const fileNames = files.map((file) => file.fileName);
    await this.minioService.deleteFiles(fileNames);
    await queryRunner.manager.delete(MediaEntity, { id: In(fileIds) });
  }

  async deleteOneMedia(mediaId: string, queryRunner: QueryRunner) {
    const file = await queryRunner.manager.findOne(MediaEntity, {
      where: { id: mediaId },
    });
    if (!file) throw new NotFoundException('Some files are not found!');
    await this.minioService.deleteFile(file.fileName);
    await queryRunner.manager.delete(MediaEntity, { id: mediaId });
  }

  async getOneMedia(mediaId: string) {
    const media = await this.mediaRepository.findOne({
      where: { id: mediaId },
    });
    if (!media) throw new NotFoundException('Media not found!');
    return media;
  }

  async getMediaByLng(entityColumn: string, entityId: string) {
    const media = await this.mediaRepository.findOne({
      where: { [entityColumn]: entityId },
    });
    return media;
  }
}
