import { AppService } from "./app.service";
import { AppSettings } from "./app.settings";
import { Speaker } from "./model/speaker";

export class SpeakerIdentification {
    appService: AppService;
    availableCharacters: any[];
    speakerMap: { [key: number]: Speaker } = {};
    paragraphs: string[] = [];
    processedUnitlCounter: number = 0;
    restCallLock: boolean = false;

    static processStep: number = 10;
    static autoCallStep: number = 10;
    static textsBeforeStep: number = 5;
    static textsAfterStep: number = 5;

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

    async Init(counter: number) {
        if (!this.GetEnabled()) {
            throw new Error('SpeakerIdentification is disabled');
        }

        // Clear lock on init
        this.restCallLock = false;
        await this.TriggerSpeakerIdentification(counter);
    }

    public GetSpeaker(counter: number): Speaker {
        if (!this.GetEnabled()) {
            return SpeakerIdentification.Default();
        }

        if (this.speakerMap[counter]) {
            console.log('GetSpeaker found ', { ...this.speakerMap[counter], text: this.paragraphs[counter]});
            if (this.processedUnitlCounter <= counter + SpeakerIdentification.autoCallStep) {
                console.log('TriggerSpeakerIdentification call auto', this.processedUnitlCounter);
                this.TriggerSpeakerIdentification(this.processedUnitlCounter);
            }
            return this.speakerMap[counter];
        }

        console.log('GetSpeaker not found ', counter);
        this.TriggerSpeakerIdentification(counter);
        return SpeakerIdentification.Default();
    }

    private async TriggerSpeakerIdentification(counter: number): Promise<boolean> {
        if (!this.GetEnabled()) {
            throw new Error('SpeakerIdentification is disabled');
        }

        if (this.restCallLock) {
            console.log('TriggerSpeakerIdentification locked');
            return false;
        }

        const startCounter = counter;
        const endCounter = startCounter + SpeakerIdentification.processStep;
        console.log('TriggerSpeakerIdentification ', startCounter, endCounter);
        this.restCallLock = true;
        // [startCounter - 5, startCounter)
        const paragraphsBefore = this.paragraphs.slice(startCounter - SpeakerIdentification.textsBeforeStep, startCounter);
        // [startCounter, endCounter)
        const processingParagraphs = this.paragraphs.slice(startCounter, endCounter);
        // [endCounter, endCounter + 5)
        const paragraphsAfter = this.paragraphs.slice(endCounter, endCounter + SpeakerIdentification.textsAfterStep);
        try {
            const speakers = await this.appService.IdentifySpeakers(
                this.availableCharacters,
                paragraphsBefore,
                processingParagraphs,
                paragraphsAfter);
            this.processedUnitlCounter = endCounter;
            for (let i = 0; i < speakers.length; i++) {
                const paragraphIndex = startCounter + i;
                this.speakerMap[paragraphIndex] = speakers[i];
            }
        } catch (error) {
            console.log('TriggerSpeakerIdentification error ', error);
            this.restCallLock = false;
            return false;
        }

        console.log('TriggerSpeakerIdentification done');
        this.restCallLock = false;
        return true;
    }

    public GetEnabled(): boolean {
        return AppSettings.GetSpeakerIdentificationEnabled();
    }

    public ToggleEnabled(): void {
        AppSettings.SetSpeakerIdentificationEnabled(!this.GetEnabled());
    }
}
