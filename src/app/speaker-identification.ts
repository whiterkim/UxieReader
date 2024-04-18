import { AppService } from "./app.service";
import { Speaker } from "./model/speaker";

export class SpeakerIdentification {
    appService: AppService;
    availableCharacters: any[];
    speakerMap: { [key: number]: Speaker } = {};
    paragraphs: string[] = [];
    processedUnitlCounter: number = 0;
    restCallLock: boolean = false;

    constructor(appService: AppService, availableCharacters: any[], paragraphs: string[]) {
        this.speakerMap = {};
        this.appService = appService;
        this.availableCharacters = availableCharacters;
        this.paragraphs = paragraphs;
    }

    static Default(): Speaker {
        return {
            textIndex: -1,
            speaker: 'narration',
            gender: 'NA',
            target: 'NA',
        };
    }

    async Init(counter: number, step: number = 20) {
        const startCounter = counter;//Math.max(0, counter - 5);
        const endCounter = startCounter + step;
        await this.TriggerSpeakerIdentification(startCounter, endCounter);
    }

    public GetSpeaker(counter: number): Speaker {
        if (this.speakerMap[counter]) {
            console.log('GetSpeaker found ', { ...this.speakerMap[counter], text: this.paragraphs[counter]});
            if (this.processedUnitlCounter <= counter + 10) {
                console.log('call Init auto ', this.processedUnitlCounter);
                this.Init(this.processedUnitlCounter);
            }
            return this.speakerMap[counter];
        }

        console.log('GetSpeaker not found ', counter);
        this.Init(counter);
        return SpeakerIdentification.Default();
    }

    private async TriggerSpeakerIdentification(startCounter: number, endCounter: number) {
        if (this.restCallLock) {
            return;
        }

        console.log('TriggerSpeakerIdentification ', startCounter, endCounter);
        this.restCallLock = true;
        // [startCounter, endCounter)
        const processingParagraphs = this.paragraphs.slice(startCounter, endCounter);
        try {
            const speakers = await this.appService.IdentifySpeakers(this.availableCharacters, processingParagraphs);
            this.processedUnitlCounter = endCounter;
            for (let i = 0; i < speakers.length; i++) {
                const paragraphIndex = startCounter + i;
                this.speakerMap[paragraphIndex] = speakers[i];
            }
        } catch (error) {
            console.log('TriggerSpeakerIdentification error ', error);
        }

        console.log('TriggerSpeakerIdentification done');
        this.restCallLock = false;
    }
}
