import { AppService } from "./app.service";
import { SpeakerIdentification } from "./speaker-identification";

export class AudioGeneration {
    appService: AppService;
    voiceMap: { [key: number]: Promise<Blob> | Blob } = {};
    paragraphs: string[] = [];
    speakerIdentification: SpeakerIdentification;

    constructor(appService: AppService, paragraphs: string[], speakerIdentification: SpeakerIdentification) {
        this.appService = appService;
        this.voiceMap = {};
        this.paragraphs = paragraphs;
        this.speakerIdentification = speakerIdentification;
    }

    public async GetAudio(counter: number): Promise<Blob> {
        if (!this.voiceMap[counter]) {
            await this.GenerateAudio(counter);
        }

        // Generate next audio in advance
        this.GenerateAudio(counter + 1);
        this.GenerateAudio(counter + 2);

        return this.voiceMap[counter];
    }

    public async GenerateAudio(counter: number): Promise<void> {
        if (this.voiceMap[counter]) {
            return;
        }

        const speaker = this.speakerIdentification.GetSpeaker(counter);
        this.voiceMap[counter] = this.appService.GetVoice(this.paragraphs[counter], speaker);
        this.voiceMap[counter] = await this.voiceMap[counter];
    }
}
