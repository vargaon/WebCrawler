import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  MongooseModuleOptions,
  MongooseOptionsFactory,
} from '@nestjs/mongoose';

@Injectable()
export class MongooseConfigService implements MongooseOptionsFactory {
  constructor(private configService: ConfigService) {}

  createMongooseOptions(): MongooseModuleOptions {
    return {
      uri: this.configService.get('db.uri', { infer: true }),
      dbName: this.configService.get('db.name', { infer: true }),
      user: this.configService.get('db.user', { infer: true }),
      pass: this.configService.get('db.pass', { infer: true }),
    };
  }
}
