import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { Readable } from 'typeorm/platform/PlatformTools';

@Injectable()
export class MinioService implements OnModuleInit {
  private minioClient: Minio.Client;
  private bucketName: string;

  constructor(private configService: ConfigService) {
    this.minioClient = new Minio.Client({
      endPoint: this.configService.getOrThrow('MINIO_ENDPOINT'),
      port: +this.configService.getOrThrow('MINIO_PORT'),
      useSSL: false,
      accessKey: this.configService.getOrThrow('MINIO_ACCESS_KEY'),
      secretKey: this.configService.getOrThrow('MINIO_SECRET_KEY'),
    });

    this.bucketName = this.configService.getOrThrow('MINIO_BUCKET_NAME');
  }

  async onModuleInit() {
    await this.createBucketIfNotExists();
  }

  async createBucketIfNotExists() {
    const bucketExists = await this.minioClient.bucketExists(this.bucketName);

    if (!bucketExists) {
      await this.minioClient.makeBucket(this.bucketName, this.bucketName);
      const publicPolicy = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: '*',
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${this.bucketName}/*`],
          },
        ],
      };

      await this.minioClient.setBucketPolicy(
        this.bucketName,
        JSON.stringify(publicPolicy),
      );
    }
  }

  async uploadFile(fileName: string, filePath: string, mimeType: string) {
    const metaData = {
      'Content-Type': mimeType,
    };

    const uploadedFile = await this.minioClient.fPutObject(
      this.bucketName,
      fileName,
      filePath,
      metaData,
    );
    return uploadedFile;
  }

  async uploadFileStream(
    fileName: string,
    fileStream: Readable,
    mimeType: string,
  ) {
    const metaData = {
      'Content-Type': mimeType,
    };
    const uploadedFile = await this.minioClient.putObject(
      this.bucketName,
      fileName,
      fileStream,
      metaData,
    );
    return uploadedFile;
  }

  async getFileUrl(fileName: string) {
    const url = await this.minioClient.presignedUrl(
      'GET',
      this.bucketName,
      fileName,
    );
    if (process.env.NODE_ENV === 'development') {
      return url;
    }
    return url.replace(
      this.configService.get('MINIO_ENDPOINT'),
      process.env.MINIO_HOST,
    );
  }

  async deleteFile(fileName: string) {
    console.log(fileName);
    await this.minioClient.removeObject(this.bucketName, fileName);
  }

  async deleteFiles(fileNames: string[]) {
    this.minioClient.removeObjects(this.bucketName, fileNames, (err) => {
      if (err) {
        console.error('Error deleting objects:', err);
      } else {
        console.log('Objects deleted successfully');
      }
    });
  }

  async getFileStream(fileName: string) {
    try {
      const stream = await this.minioClient.getObject(
        this.bucketName,
        fileName,
      );
      return stream;
    } catch (err) {
      console.error('Error occurred while downloading file:', err);
    }
  }
}
