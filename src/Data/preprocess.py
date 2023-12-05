#/usr/bin/env python3
import pandas as pd
import numpy as np
import os
import json

script_dir = os.path.dirname(os.path.abspath(__file__))

# Assume the csv is in the same directory
csv_file = script_dir + "/globalterrorismdb_0718dist.csv"
df = pd.read_csv(csv_file)

columns_to_keep = [
    "iyear","country_txt","region_txt","city","latitude","longitude",
    "summary","attacktype1_txt","target1","targtype1_txt","gname","motive","weaptype1_txt","nkill","nwound"
]
df = df[columns_to_keep]
df.eval('Casualties = nkill + nwound', inplace=True)
df['Casualties'] = df['Casualties'].fillna(0)
print(f"Total Casualties: {np.sum(df['Casualties'])}")
df['nkill'] = df['nkill'].fillna(0)
df['nwound'] = df['nwound'].fillna(0)
df.replace({pd.NA: ""}, inplace=True)
df.dropna(inplace=True)
columns_to_rename = {
    "iyear": "Year",
    "imonth": "Month",
    "iday": "Day",
    "country_txt": "Country",
    "region_txt": "Region",
    "attacktype1_txt": "Attack_Type",
    "targtype1_txt": "Target_Type",
    "target1": "Target",
    "gname": "Group",
    "weaptype1_txt": "Weapon_Type",
    "nkill": "Killed",
    "nwound": "Wounded"
}
df = df.rename(columns=columns_to_rename)
df["Region"] = df["Region"].replace(["East Asia", "Central Asia", "Australasia & Oceania"], "Asia, Australia, and Oceania")
data_list = df.to_dict(orient='records')

with open(os.path.join(script_dir, 'data.json'), 'w') as json_file:
    json_file.write(json.dumps(data_list, indent=2))
