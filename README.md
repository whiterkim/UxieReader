# ReaderApp

https://whiterkim.github.io/UxieReader

This app is an epub reader that enables audio playback and character identification.
* The audio playback used Text-to-Speech (TTS) service from [Azure Cognitive Services](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/)
* The character identification used Chat Completions service from [Azure OpenAI Service](https://learn.microsoft.com/en-us/azure/ai-services/openai/)
* Focused on ebooks from [index-X](https://github.com/1204244136/index-X)

Run server in local network
```
ng serve --host 0.0.0.0
```

Deploy to GitHub pages
```
ng deploy --repo=git@github.com:whiterkim/UxieReader.git --base-href=/UxieReader/
```
