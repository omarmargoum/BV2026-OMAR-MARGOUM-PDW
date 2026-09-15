import { Controller, Get } from "@nestjs/common";
@Controller('test')
export class TestController{
    @Get()
        public get():string{
            return 'test';
        }
    }
