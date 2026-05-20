import os

os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"
os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"
os.environ["CUDA_VISIBLE_DEVICES"] = "-1"
os.environ["DEEPFACE_HOME"] = "D:/deepface-models"

from flask import Flask, request, jsonify
from deepface import DeepFace
from pymongo import MongoClient
from scipy.spatial.distance import cosine
import traceback

app = Flask(__name__)

UPLOAD_FOLDER = "group_uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


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

            return jsonify({
                "error": "No image uploaded"
            }), 400

        image = request.files["image"]

        # Save uploaded image
        image_path = os.path.join(
            UPLOAD_FOLDER,
            image.filename
        )

        image.save(image_path)

        print("\n===================================")
        print("PROCESSING IMAGE:", image.filename)
        print("===================================\n")

        # Detect all faces
        detected_faces = DeepFace.represent(
            img_path=image_path,
            model_name="Facenet512",
            detector_backend="retinaface",
            align=True,
            enforce_detection=False
        )

        print("TOTAL DETECTED FACES:", len(detected_faces))

        # Fetch users from MongoDB
        users = list(users_collection.find())

        print("TOTAL USERS IN DATABASE:", len(users))

        recognized_students = []

        # Loop through all detected faces
        for face in detected_faces:

            embedding = face["embedding"]

            best_match = None

            lowest_distance = 999

            # Compare against all users
            for user in users:

                # MULTIPLE EMBEDDINGS
                db_embeddings = user.get(
                    "faceEmbeddings",
                    []
                )

                if not db_embeddings:
                    continue

                # Compare against every embedding
                for db_embedding in db_embeddings:

                    distance = compare_embeddings(
                        embedding,
                        db_embedding
                    )

                    print(
                        f"Comparing with {user['name']} -> Distance: {distance}"
                    )

                    # Best match logic
                    if distance < lowest_distance:

                        lowest_distance = distance
                        best_match = user

            print("\nLOWEST DISTANCE:", lowest_distance)

            # THRESHOLD
            if lowest_distance < 0.30 and best_match:

                print(
                    f"MATCH FOUND -> {best_match['name']}"
                )

                recognized_students.append({

                    "name": best_match["name"],

                    "rollNo": best_match["rollNo"],

                    "className": best_match["className"],

                    "section": best_match["section"],

                    "confidenceDistance": float(lowest_distance)
                })

            else:

                print("UNKNOWN PERSON DETECTED")

                recognized_students.append({

                    "name": "Unknown Person",

                    "confidenceDistance": float(lowest_distance)
                })

        return jsonify({

            "success": True,

            "recognizedStudents": recognized_students,

            "totalDetected": len(detected_faces)
        })

    except Exception as e:

        print("\n========= RECOGNITION ERROR =========")
        traceback.print_exc()
        print("=====================================\n")

        return jsonify({
            "error": str(e)
        }), 500


# ================= RUN SERVER =================
if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5002,
        debug=False
    )