import os
import traceback
import cv2
import numpy as np
from flask import Flask, jsonify, request
from insightface.app import FaceAnalysis
from pymongo import MongoClient
from scipy.spatial.distance import cosine

app = Flask(__name__)

# ================= FOLDERS =================
UPLOAD_FOLDER = "group_uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# ================= INSIGHTFACE =================
face_app = FaceAnalysis(name="buffalo_l")
face_app.prepare(ctx_id=0, det_size=(640, 640))

print("\n===================================")
print("INSIGHTFACE RECOGNITION LOADED")
print("===================================\n")

# ================= MONGODB CONNECTION =================
client = MongoClient(
    "mongodb+srv://imkumarudi:Manish07@cluster0.r3gayg1.mongodb.net/?appName=Cluster0"
)
db = client["test"]
users_collection = db["users"]


# ================= COSINE DISTANCE =================
def compare_embeddings(embedding1, embedding2):
    return cosine(embedding1, embedding2)


# ================= RECOGNIZE GROUP =================
@app.route("/recognize-group", methods=["POST"])
def recognize_group():
    try:
        # Check image uploaded
        if "image" not in request.files:
            return jsonify({"error": "No image uploaded"}), 400

        image = request.files["image"]
        session = request.form.get("session")

        print("\n======================")
        print("ACTIVE SESSION:", session)
        print("======================")

        users = list(users_collection.find({"session": session}))

        print("USERS LOADED:", len(users))

        for u in users:
            print(u["name"], "|", u["session"])

        # Save uploaded image
        image_path = os.path.join(UPLOAD_FOLDER, image.filename)
        image.save(image_path)

        print("\n===================================")
        print("PROCESSING IMAGE:", image.filename)
        print("===================================\n")

        # ================= READ IMAGE =================
        img = cv2.imread(image_path)

        if img is None:
            return jsonify({"error": "Failed to read image"}), 400

        # ================= DETECT ALL FACES =================
        faces = face_app.get(img)

        print("TOTAL DETECTED FACES:", len(faces))

        # ================= FETCH USERS =================
        users = list(users_collection.find({"session": session}))

        print("TOTAL USERS IN DATABASE:", len(users))

        recognized_students = []

        # ================= LOOP THROUGH FACES =================
        for face in faces:
            embedding = face.embedding
            best_match = None
            lowest_distance = 999

            # ================= COMPARE WITH USERS =================
            for user in users:
                db_embeddings = user.get("faceEmbeddings", [])

                if not db_embeddings:
                    continue

                # Compare against every embedding
                for db_embedding in db_embeddings:
                    distance = compare_embeddings(embedding, db_embedding)

                    print(
                        f"Comparing with {user['name']} -> Distance: {distance}"
                    )

                    # Best match logic
                    if distance < lowest_distance:
                        lowest_distance = distance
                        best_match = user

            print("\nLOWEST DISTANCE:", lowest_distance)

            # ================= MATCH THRESHOLD =================
            if lowest_distance < 0.65 and best_match:
                print(f"MATCH FOUND -> {best_match['name']}")

                recognized_students.append(
                    {
                        "name": best_match["name"],
                        "rollNo": best_match["rollNo"],
                        "className": best_match["className"],
                        "section": best_match["section"],
                        "confidenceDistance": float(lowest_distance),
                    }
                )
            else:
                print("UNKNOWN PERSON DETECTED")

                recognized_students.append(
                    {
                        "name": "Unknown Person",
                        "confidenceDistance": float(lowest_distance),
                    }
                )

        return jsonify(
            {
                "success": True,
                "recognizedStudents": recognized_students,
                "totalDetected": len(faces),
            }
        )

    except Exception as e:
        print("\n========= RECOGNITION ERROR =========")
        traceback.print_exc()
        print("=====================================\n")

        return jsonify({"error": str(e)}), 500


# ================= RUN SERVER =================
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5002, debug=False)