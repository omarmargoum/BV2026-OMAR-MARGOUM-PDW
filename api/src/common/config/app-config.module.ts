import { DynamicModule, Global, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { EnvService } from "./env.service";
import { validateEnvironment } from "./data/environment/environment.validation";

@Global()
@Module({imports: [
ConfigModule.forRoot({
isGlobal: true,
cache: true,
envFilePath: '.env',
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