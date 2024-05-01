As an AI assistant specializing in literary analysis, your task is to identify all the characters that appear in a text I will provide to you.

# Input Definition

The text will be in CSV format, where:

1. The first column is the line index
2. The second column contains the actual text content

# Task Definition

1. From the provided texts, first list all the character names appeared. Or specific phrases that refer to character.
2. Group the names together if they belong to the same character.
3. Identify the official name from the group for the character and treat the rest as alias.
4. Identify the gender of the character to be one of: 'male', 'female', or 'NA' for unknown cases.

# Output Definition

Organize your response as a JSON object in the following format:

```json
{
  "characters": [
    {
      "name": "character’s name",
      "gender": "character’s gender - 'male', 'female', or 'NA'",
      "alias": ["a list of aliases used for the character in the text"]
    }
  ]
}
```

The character name should be specific and not include generic terms that can refer to multiple characters, such as "少年" or "少女".

Please respond with ONLY the complete JSON object, without any additional explanation or commentary.

Example input:

```csv
1,"茵蒂克丝那么想保护上条、腻着上条的原因，如今也很清楚了。在一切浑然未明的情况下，独自被丢到这世界的茵蒂克丝，这一年来所遇到的第一个「朋友」刚好就是上条。如此而已。"
2,"这样的事实让上条一点也高兴不起来。"
3,"不知道为什么，这样的「答案」让上条感觉心情非常烦躁。"
4,"「嗯？当麻，你在生气吗？」"
5,"「我没在生气啦。」吓了一跳的上条，马上假装没事一样。"
6,""
7,"后面，站着一个初中生年纪的少女。及肩的茶色长发在夕阳下，闪耀着如同正在燃烧般的红光。少女的脸颊也被染得通红。灰色的百褶裙、短袖上衣与夏季用薄毛衣……看了好久，上条才终于认出她是谁。"
8,"「……啊——又是你啊，『哔哩哔哩』。」 "
9,"「不准叫我哔哩哔哩！我的名字叫御坂美琴啦！你怎么到现在还没记住啊？我记得你从第一次见到我，就一直叫我哔哩哔哩对吧！」"
10,""
11,"用脚踢开上条抓住墙壁突起处的手，刺猬头少年顿时失去了所有支撑。"
12,"吹乱机内的强风瞬间抬起上条当麻的身体，就这样全无任何缓冲地穿过行李搬入用舱门，飞向广大的天空。"
```

Example output:

```json
{
  "characters": [
    {
      "name": "上条当麻",
      "gender": "male",
      "alias": ["当麻", "上条", "刺猬头少年"]
    },
    {
      "name": "茵蒂克丝",
      "gender": "female",
      "alias": ["白色修女"]
    },
    {
      "name": "御坂美琴",
      "gender": "female",
      "alias": ["『哔哩哔哩』"]
    }
  ]
}
```
