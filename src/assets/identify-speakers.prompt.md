As an AI assistant specializing in literary analysis, your task is to identify the speaker for each line of text that I will provide to you in my next message.

# Input Definition

The input will be a JSON object containing four arrays:

1. `characters`: an array of objects, each representing a character with their name, gender, and aliases:
   ```json
   {
     "name": "character's name",
     "gender": "character's gender - 'male', 'female', or 'NA'",
     "alias": ["alias1", "alias2", ...]
   }
   ```
2. `textsBefore`: an array of strings, contains a few paragraphs before the `texts` that provide context to better understand the texts to be identified.
3. `texts`: an array of strings, each string being a line of text from the literary work.
4. `textAfter`: an array of strings, contains a few paragraphs after the `texts` that provide context to better understand the texts to be identified.

# Task Definition

Define `textElement` as the element of the `texts` array.

Define a `textElement` as "speech" ONLY when it is entirely enclosed in quotes like 『』or「」. This can be determined by this condition: `(text[0] == '『' && text[-1] == '』') || (text[0] == '「' && text[-1] == '」')`

Define a `textElement` as "narration" when it is NOT entirely quoted. This can be determined by this condition: `!(text[0] == '『' && text[-1] == '』') || (text[0] == '「' && text[-1] == '」')`

For each `textElement` in the `texts` array, identify the following:

1. `textElement` is "speech":
   1. The name of the speaker, referring to (but not limited to) the character names and aliases from the provided `characters` array.
   2. The speaker's gender to be eigher "male" or "female".
   3. Who the speaker is talking to (a character name if talking to someone, or "NA" if not talking to anyone)
2. `textElement` is "narration":
   1. The name is "narration"
   2. The gender is "NA"
   3. The target is "NA"

Note that the speaker for a line may not always be explicitly listed in the "characters" array. In such cases, try to infer the speaker from context.
Note that the "textsBefore" and "textsAfter" are providing context for better identify "texts". Only do speaker identification for "texts" array.

## Examples

### Text ending with colon

When the text is ending with ：, that implies that the current text is "narration" and the next text is "speech".

For example:

```json
texts: [
  "茵蒂克丝看着画面上的影像，纳闷地问道：",
  "「当麻，那是哪一台啊～？报纸上没提到那种节目耶。」",
]
```

In the given example, `texts[0]` is "narration" and `text[1]` is "speech". And from the information in `texts[0]`, we can tell the speaker of `texts[1]` is "茵蒂克丝".

Example result:

```json
[
  { "textIndex": "0", "name": "narration", "gender": "NA", "target": "NA" },
  { "textIndex": "1", "name": "茵蒂克丝", "gender": "female", "target": "上条当麻" }
]
```

### Continuous dialogue

When dialogue happens continuously between two speakers, try to identify the name of two speakers and the beginning or ending of the dialogue. Usually, one `textElement` before or after the dialogue provides hints about the speaker. When the hint is in the `textElement` after the dialogue, we need to back trace to idenify the speaker.

For example:

```json
texts: [
  "御坂美琴气得两手乱挥，路上的行人都不禁转头看她。会引人侧目也是理所当然，毕竟美琴身上所穿的那件看来平凡的夏季制服，可是学园都市中的明星学校前五名之一，常盘台中学的制服。以气质优雅著称的常盘台中学大小姐们，即使在拥挤的车站中也特别显眼。但是眼前这少女的言行，感觉起来却像是会坐在电车地板上玩手机的那种学生，当然会让周围的人觉得惊讶。",
  "「咦？对了，哔哩哔哩你干嘛？今天不是七月二十日？你怎么穿着制服？去学校补课？」",
  "「呜……你、你管我！」",
  "「我知道了，一定是放心不下动物饲养区的小兔子吧？」",
  "「你不要随便把动物加进我的人物设定里啦！臭小子，今天一定要让你好看！等一下你就会像被通电的青蛙两脚发抖，趁现在赶快写遗言跟分配财产吧！」",
  "「不要。」",
  "「为什么？」",
  "「因为我不是动物股长。」",
  "「你——这家伙还敢继续戏弄我！」",
  "咚的一声，初中少女的脚用力踏在人行道的红砖上。",
  "那一瞬间，周围行人的手机都发出刺耳的破裂声。商店街的有线电视立刻断线，连附近的警备机器人都发出嘎嘎的诡异声响。",
  "初中少女的头发发出如同静电般的劈啪声。"
  "明明是血肉之躯，却可以发出超电磁炮的超能力少女，如同野兽般露出虎牙笑了。"
  "「哼！如何？这样有没有让你的脑袋清醒点……呜……！」"
  "上条慌慌张张地，用手把自信满满的御坂美琴整张脸给盖住。"
]
```

From the `texts`, the two speakers are "御坂美琴" and "上条当麻". The continuous dialogue starts at `texts[1]` and ends at `texts[8]`. The `textElement` before the dialogue is `text[0]` and the one after the dialogue is `text[9]`.

From `text[0]`, this narration describes the scene; however, it may not provide enough information to infer the speaker of text[1].

From `text[9]`, "咚的一声，初中少女的脚用力踏在人行道的红砖上。", the "初中少女" matches the trait of "御坂美琴", then this infers that this action is made by "御坂美琴". Combine the the content of `text[8]`, the action is happened after "御坂美琴" says "「你——这家伙还敢继续戏弄我！」".

Therefore, start from `text[8]` by "御坂美琴", backtrace the entire dialogue and assign two speaker to each `textElement`.

Example result:

```json
[
  { "textIndex": "0", "name": "narration", "gender": "NA", "target": "NA" },
  { "textIndex": "1", "name": "上条当麻", "gender": "male", "target": "御坂美琴" },
  { "textIndex": "2", "name": "御坂美琴", "gender": "female", "target": "上条当麻" },
  { "textIndex": "3", "name": "上条当麻", "gender": "male", "target": "御坂美琴" },
  { "textIndex": "4", "name": "御坂美琴", "gender": "female", "target": "上条当麻" },
  { "textIndex": "5", "name": "上条当麻", "gender": "male", "target": "御坂美琴" },
  { "textIndex": "6", "name": "御坂美琴", "gender": "female", "target": "上条当麻" },
  { "textIndex": "7", "name": "上条当麻", "gender": "male", "target": "御坂美琴" },
  { "textIndex": "8", "name": "御坂美琴", "gender": "female", "target": "上条当麻" },
  { "textIndex": "9", "name": "narration", "gender": "NA", "target": "NA" },
  { "textIndex": "10", "name": "narration", "gender": "NA", "target": "NA" },
  { "textIndex": "11", "name": "narration", "gender": "NA", "target": "NA" },
  { "textIndex": "12", "name": "narration", "gender": "NA", "target": "NA" },
  { "textIndex": "13", "name": "御坂美琴", "gender": "female", "target": "上条当麻" },
  { "textIndex": "14", "name": "narration", "gender": "NA", "target": "NA" }
]
```

# Output Definition

Return the analysis as a JSON object containing a `speakers` array. Each element of `speakers` should be an object corresponding to a line of text, in the following format:

```json
{
  "textIndex": "index of the line of text",
  "name": "speaker's name or 'narration'",
  "gender": "speaker's gender - 'male', 'female', or 'NA'",
  "target": "who the speaker is talking to - a name, or 'NA' if not talking to anyone or if narration"
}
```

The `speakers` array in the response should have the same number of elements as the "texts" array in the input. The length of "text" array will be 10, please make sure the length of the returned `speakers` array is also 10.

Please respond with ONLY the complete JSON object, without any additional explanations or comments.

Example input:

```json
{
  "characters": [
    {
      "name": "奈芙蒂斯",
      "gender": "female",
      "alias": ["「奈芙蒂斯」"]
    },
    {
      "name": "僧正",
      "gender": "male",
      "alias": ["「僧正」"]
    },
    {
      "name": "娘娘",
      "gender": "female",
      "alias": ["「娘娘」"]
    },
    {
      "name": "欧提努斯",
      "gender": "NA",
      "alias": ["「欧提努斯」"]
    },
    {
      "name": "亚雷斯塔",
      "gender": "NA",
      "alias": []
    },
    {
      "name": "上条当麻",
      "gender": "male",
      "alias": []
    }
  ],
  "textsBefore": ["黑暗。", "伸手不见五指。不仅如此，面前充斥的黑暗甚至浓厚得能跳过眼球压迫自身意识。", "但在此处晃荡的居留者们并未露出半点畏惧的模样。他们仿佛在说，这就是世界的自然面貌，如果不是某处的谁说了句「要有光」，就该是这个样子。", "在这个不知方位与深浅的漆黑空间里，有三股明确的气息存在。", "『所以说，你们勉强赶上了是吧，「奈芙蒂斯」。』"],
  "texts": ["满面皱纹……应该说干瘪的老人低语。", "回应他的声音听起来无比娇嫩，属于一名妖艳的美女。", "『是呀。这种时候「僵尸」可就派上用场了呢。毕竟她积极吸收各式各样的文化，所以不管碰上什么环境都能展现亲和力。』", "『不过啊～「僧正」。』", "这时，一个更为年轻，甚至已经可说稚嫩的少女声音从旁插嘴。", "『「僵尸」带来的理论，说穿了就是无限镜吧？故意将我们的「力量」分割成无限份导致其弱化，以免挥舞手脚就会把世界给毁了。』", "『「娘娘」，那又怎么样？』", "『哎呀，人家是说，把「无限大」分割成好几份真的能确实弱化吗？我可不想踏出一步就让整个世界像彩绘玻璃一样变成碎片。毕竟我们呢，和「欧提努斯」那种货色不一样。』", "『如果有效，就算只是个冒牌货也无妨。就跟莫比乌斯环和克莱因瓶一样，也有些概念虽然无法定义，却能够存在哟，「娘娘」。』", "『毕竟我主张实践重于理论，比较偏向发明家而非学者嘛。这种「合乎理论所以现实应该也没问题吧」之类的话那能相信啊。应该说不实际试试看或亲眼见证就没办法放心。』", "『既然如此，你就去试呀。』", "『这么轻率地把世界当成玩具，真的好吗？』", "名唤「娘娘」的少女尽管掩嘴轻笑，脸上却没有半分犹豫。", "三股气息有意地看向同一处。", "这让铺天盖地的沉重黑暗产生了方向。", "方向形成深浅，于是定义了整个空间。", "叫做「奈芙蒂斯」的女子，以能让听者心神荡漾的甜腻声音歌唱。", "『哈喽，世界。』", "沉重的金属声响「轰」地炸裂。", "『哈喽，科学阵营。』"],
  "textsAfter": ["无尽的黑暗中，产生一道纵向的细微白光。", "『哈喽，学园都市。』", "", "于是，双扇门开启。", "三位「魔神」尽情地呼吸学园都市的空气。"]
}
```

Example output:

```json
{
  "speakers": [
    { "textIndex": "0", "name": "narration", "gender": "NA", "target": "NA" },
    { "textIndex": "1", "name": "narration", "gender": "NA", "target": "NA" },
    { "textIndex": "2", "name": "奈芙蒂斯", "gender": "female", "target": "僧正" },
    { "textIndex": "3", "name": "娘娘", "gender": "female", "target": "僧正" },
    { "textIndex": "4", "name": "narration", "gender": "NA", "target": "NA" },
    { "textIndex": "5", "name": "娘娘", "gender": "female", "target": "僧正" },
    { "textIndex": "6", "name": "僧正", "gender": "male", "target": "娘娘" },
    { "textIndex": "7", "name": "娘娘", "gender": "female", "target": "僧正" },
    { "textIndex": "8", "name": "僧正", "gender": "male", "target": "娘娘" },
    { "textIndex": "9", "name": "娘娘", "gender": "female", "target": "僧正" },
    { "textIndex": "10", "name": "僧正", "gender": "male", "target": "娘娘" },
    { "textIndex": "11", "name": "娘娘", "gender": "female", "target": "僧正" },
    { "textIndex": "12", "name": "narration", "gender": "NA", "target": "NA" },
    { "textIndex": "13", "name": "narration", "gender": "NA", "target": "NA" },
    { "textIndex": "14", "name": "narration", "gender": "NA", "target": "NA" },
    { "textIndex": "15", "name": "narration", "gender": "NA", "target": "NA" },
    { "textIndex": "16", "name": "narration", "gender": "NA", "target": "NA" },
    { "textIndex": "17", "name": "奈芙蒂斯", "gender": "female", "target": "NA" },
    { "textIndex": "18", "name": "narration", "gender": "NA", "target": "NA" },
    { "textIndex": "19", "name": "奈芙蒂斯", "gender": "female", "target": "NA" }
  ]
}
```
