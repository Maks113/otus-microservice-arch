import { Test, TestingModule } from '@nestjs/testing';
import { RestController } from './rest.controller';
import { RestService } from './rest.service';

describe('RestController', () => {
  let appController: RestController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [RestController],
      providers: [RestService],
    }).compile();

    appController = app.get<RestController>(RestController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });
});
