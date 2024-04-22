import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AreasModule } from 'src/areas/areas.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AreasModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/api/areas (GET)', () => {
    jest.spyOn(mockAreas).mockRejectedValueOnce();
    return request(app.getHttpServer()).get('/').expect(200).expect();
  });
});
