
import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = "web_automation_db"

print(f"Connecting to {MONGO_URI}...")
client = MongoClient(MONGO_URI)
db = client[DB_NAME]

print("Clearing pending jobs...")
result = db.jobs.delete_many({"status": "Pending"})
print(f"Deleted {result.deleted_count} pending jobs.")

result_processing = db.jobs.delete_many({"status": "Processing"})
print(f"Deleted {result_processing.deleted_count} processing/stuck jobs.")

print("Done.")
