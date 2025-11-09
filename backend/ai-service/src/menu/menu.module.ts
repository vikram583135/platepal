import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MenuController } from './menu.controller';
import { MenuService } from './menu.service';
import { OpenAIService } from '../common/openai.service';

@Module({
  imports: [HttpModule],
  controllers: [MenuController],
  providers: [MenuService, OpenAIService],
  exports: [MenuService],
})
export class MenuModule {}

