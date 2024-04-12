import { AppService } from "./app.service";
import { Character } from "./model/character";

export class CharacterIdentification {
    appService: AppService;
    characterMap: { [key: number]: Character } = {};
    paragraphs: string[] = [];
    processedUnitlCounter: number = 0;
    restCallLock: boolean = false;

    constructor(appService: AppService, paragraphs: string[], counter: number) {
        this.appService = appService;
        this.characterMap = {};
        this.paragraphs = paragraphs;
    }

    static Default(): Character {
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
        await this.TriggerCharacterIdentification(startCounter, endCounter);
    }

    public GetCharacter(counter: number): Character {
        console.log('GetCharacter ', counter)
        if (this.characterMap[counter]) {
            console.log('GetCharacter found ', this.characterMap[counter]);
            if (this.processedUnitlCounter <= counter + 10) {
                console.log('call Init auto ', this.processedUnitlCounter);
                this.Init(this.processedUnitlCounter);
            }
            return this.characterMap[counter];
        }

        console.log('GetCharacter not found ', counter);
        this.Init(counter);
        return CharacterIdentification.Default();
    }

    private async TriggerCharacterIdentification(startCounter: number, endCounter: number) {
        console.log('TriggerCharacterIdentification ', startCounter, endCounter);
        if (this.restCallLock) {
            console.log('TriggerCharacterIdentification locked');
            return;
        }

        this.restCallLock = true;
        // [startCounter, endCounter)
        const processingParagraphs = this.paragraphs.slice(startCounter, endCounter);
        try {
            const characters = await this.appService.IdentifyCharacters(processingParagraphs);
            this.processedUnitlCounter = endCounter;
            for (let i = 0; i < characters.length; i++) {
                const paragraphIndex = startCounter + i;
                this.characterMap[paragraphIndex] = characters[i];
            }
        } catch (error) {
            console.log('TriggerCharacterIdentification error ', error);
        }

        console.log('TriggerCharacterIdentification done');
        this.restCallLock = false;
    }
}
