import os
import re
import json

def list_and_categorize_epubs(output_file="books_nested.json"):
    """
    1. Look in the current directory for *.epub files.
    2. Extract the bracketed portion at the start, e.g. [S1_01],
       splitting into top-level "S1" and sub-category "01".
    3. Skip any file whose top-level category is "S0".
    4. Build a structure that can be converted into:
       [
         {
           "key": "S1",
           "value": [
             {
               "key": "01",
               "book_name": "某魔法的禁书目录 01",
               "file_name": "[S1_01]某魔法的禁书目录 01X.epub"
             },
             ...
           ]
         },
         ...
       ]
    5. Sort the final data by top-level "key" and also by sub-category "key".
    6. Remove a trailing 'X' in the extracted book_name if present.
    """

    bracket_pattern = re.compile(r'^\[(S\d[^]]*)\]')
    
    # We'll store the data in a dict of dicts, e.g.:
    # {
    #   "S1": {
    #       "01": {
    #           "book_name": "...",
    #           "file_name": "..."
    #       },
    #       "02": {
    #           ...
    #       }
    #   },
    #   ...
    # }
    data = {}

    for filename in os.listdir("./books"):
        if not filename.lower().endswith(".epub"):
            continue

        match = bracket_pattern.match(filename)
        if not match:
            # Skip files that do not start with [S\d...]
            continue

        bracket_content = match.group(1)  # e.g. "S1_01", "S3_09", etc.
        # Split on the first underscore only
        if "_" not in bracket_content:
            continue  # If there's no underscore after S#, skip or handle differently

        top_level, sub_category = bracket_content.split("_", 1)  # e.g. top_level="S3", sub_category="09"

        # Skip S0
        if top_level == "S0":
            continue

        # Derive book_name by removing the bracketed portion and .epub
        # Example: "[S3_01]创约 某魔法的禁书目录 01X.epub" -> "创约 某魔法的禁书目录 01X"
        bracket_end_index = filename.find(']')
        book_name = filename[bracket_end_index+1:].rstrip(".epub").strip()

        # Remove a trailing 'X' if it exists.
        # For instance, "创约 某魔法的禁书目录 01X" -> "创约 某魔法的禁书目录 01"
        if book_name.endswith("X"):
            book_name = book_name[:-1]

        # Insert into our data structure
        if top_level not in data:
            data[top_level] = {}
        data[top_level][sub_category] = {
            "book_name": book_name,
            "file_name": filename
        }

    # Convert this dict structure into the desired list structure
    # and sort by "key" at both levels.
    top_level_keys = sorted(data.keys())  # e.g. ["S1", "S2", "S3", ...]

    output_list = []
    for tl_key in top_level_keys:
        sub_data = data[tl_key]  # dictionary of sub_category -> {book_name, file_name}
        sub_keys = sorted(sub_data.keys())  # sort sub-categories

        value_list = []
        for sk in sub_keys:
            value_list.append({
                "key": sk,
                "book_name": sub_data[sk]["book_name"],
                "file_name": sub_data[sk]["file_name"]
            })

        output_list.append({
            "key": tl_key,
            "value": value_list
        })

    # Write to JSON
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(output_list, f, ensure_ascii=False, indent=2)

    print(f"Output written to {output_file}")


if __name__ == "__main__":
    list_and_categorize_epubs("book_list.json")
