import { AppService } from "./app.service";
import { CharacterIdentification } from "./character-identification";

export class AudioGeneration {
    appService: AppService;
    voiceMap: { [key: number]: Blob } = {};
    paragraphs: string[] = [];
    characterIdentification: CharacterIdentification;

    constructor(appService: AppService, paragraphs: string[], characterIdentification: CharacterIdentification) {
        this.appService = appService;
        this.voiceMap = {};
        this.paragraphs = paragraphs;
        this.characterIdentification = characterIdentification;
    }

    public async GetAudio(counter: number): Promise<Blob> {
        console.log('GetAudio ', counter);
        if (!this.voiceMap[counter]) {
            console.log('GetAudio not found ', this.voiceMap[counter]);
            await this.GenerateAudio(counter);
        }

        // Generate next audio in advance
        this.GenerateAudio(counter + 1);
        return this.voiceMap[counter];
    }

    public async GenerateAudio(counter: number): Promise<Blob> {
        console.log('GenerateAudio ', counter);
        const character = this.characterIdentification.GetCharacter(counter);
        const audio = await this.appService.GetVoice(this.paragraphs[counter], character);
        this.voiceMap[counter] = audio;
        return audio;
    }
}
