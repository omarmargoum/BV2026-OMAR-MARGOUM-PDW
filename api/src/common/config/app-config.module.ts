import {
     Global, 
     Module 
    } from "@nestjs/common";
import { 
    ConfigModule 
} from "@nestjs/config";
import { 
    EnvService 
} from "./env.service.js";
import { 
    validateEnvironment 
} from "./data/environment/environment.validation.js";

@Global()
@Module({imports: [
ConfigModule.forRoot({
isGlobal: true,
cache: true,
envFilePath: '.env',
expandVariables: true,
validate: validateEnvironment,
}),
],
providers: [
EnvService,
],
exports: [
EnvService,
],
})
export class AppConfigModule {}