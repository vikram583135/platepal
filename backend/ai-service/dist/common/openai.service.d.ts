import { ConfigService } from '@nestjs/config';
export declare class OpenAIService {
    private configService;
    private readonly logger;
    private readonly genAI;
    private readonly model;
    constructor(configService: ConfigService);
    generateCompletion(prompt: string, systemPrompt?: string): Promise<string>;
    generateJSON(prompt: string, systemPrompt?: string): Promise<any>;
    private getMockResponse;
    private getMockJSONResponse;
}
