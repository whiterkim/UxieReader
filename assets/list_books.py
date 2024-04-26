import os
import json

def list_files_recursively_to_file(root_dir, output_file):
    """Recursively lists all files in the directory specified by root_dir and writes them to output_file in a structured JSON format."""
    def add_to_dict(path_dict, path_parts):
        """Helper function to add paths to the dictionary."""
        if len(path_parts) == 1:
            # Insert file into the sorted position
            path_dict.setdefault('files', []).append(path_parts[0])
            path_dict['files'].sort()
        else:
            sub_dir = path_parts[0]
            if sub_dir not in path_dict:
                path_dict[sub_dir] = {}
            add_to_dict(path_dict[sub_dir], path_parts[1:])

    file_structure = {}
    for root, dirs, files in os.walk(root_dir):
        for file in files:
            if file.startswith('.'):
                continue
            # Relative path from root_dir to the file
            rel_path = os.path.relpath(os.path.join(root, file), root_dir)
            path_parts = rel_path.split(os.sep)
            add_to_dict(file_structure, path_parts)

    with open(output_file, "w") as f:
        json.dump(file_structure, f, indent=2, ensure_ascii=False)

# Specify the directory to list files from and the output file
root_directory = "./books"
output_filename = "book_list.json"
list_files_recursively_to_file(root_directory, output_filename)
