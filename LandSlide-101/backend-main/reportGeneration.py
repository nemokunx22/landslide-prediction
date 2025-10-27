import json
import csv
import os

class ReportGeneration:
    def generateReport(self,data,Floodprediction,Landslideprediction,csv_file_path):
        
        # data = json.loads(json_data)  # str to JSON if needed (if i/p parameter data not json)

        csv_file = csv_file_path
        file_exists = os.path.exists(csv_file)

        new_column_name1 = 'Floodprediction'
        new_column_name2 = 'Landslideprediction'

        with open(csv_file, mode='a', newline='') as file:
            fieldnames = data[0].keys()  # Existing columns from JSON
            fieldnames = list(fieldnames) + [new_column_name1]  # Add the new column name
            fieldnames = list(fieldnames) + [new_column_name2]
            
            writer = csv.DictWriter(file, fieldnames=fieldnames)
            
            if not file_exists:
                writer.writeheader()
            
            for row in data:
                row[new_column_name1] = Floodprediction
                row[new_column_name2] = Landslideprediction
                writer.writerow(row)

        # print(f"Rows with new column '{new_column_name}' have been appended to '{csv_file}'.")


# obj = ReportGeneration()
# json_data = '''
# [
#     {"name": "Alice", "age": 30, "city": "New York"}
# ]
# '''
# data = json.loads(json_data)
# obj.generateReport(data,0,'output3.csv')