import os

# Store DeepFace models in D drive
os.environ["DEEPFACE_HOME"] = "D:/deepface-models"

from flask import Flask, request, jsonify
from deepface import DeepFace
import traceback

app = Flask(__name__)

# Temporary image storage folder
UPLOAD_FOLDER = "temp"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


# ================= HOME ROUTE =================
@app.route("/")
def home():
    return "AI Service Running"


# ================= FACE EMBEDDING EXTRACTION =================
@app.route("/extract-face", methods=["POST"])
def extract_face():

    try:

        # Check image uploaded
        if "image" not in request.files:

            return jsonify({
                "success": False,
                "message": "No image uploaded"
            }), 400

        image = request.files["image"]

        # Save image temporarily
        image_path = os.path.join(
            UPLOAD_FOLDER,
            image.filename
        )

        image.save(image_path)

        print("\n===================================")
        print("PROCESSING IMAGE:", image.filename)
        print("===================================\n")

        # ================= DETECT FACES =================

        detected_faces = DeepFace.extract_faces(

            img_path=image_path,

            detector_backend="retinaface",

            enforce_detection=True,

            align=True

        )

        # Count detected faces
        total_faces = len(detected_faces)

        print("TOTAL FACES DETECTED:", total_faces)

        # Reject if more than one face
        if total_faces > 1:

            print("MULTIPLE FACES DETECTED")

            return jsonify({

                "success": False,

                "message":
                    "Upload photo of one person only",

                "facesDetected": total_faces

            }), 400

        # Reject if no face
        if total_faces == 0:

            print("NO FACE DETECTED")

            return jsonify({

                "success": False,

                "message":
                    "No face detected"

            }), 400

        # ================= EXTRACT EMBEDDING =================

        embedding = DeepFace.represent(

            img_path=image_path,

            model_name="Facenet512",

            detector_backend="retinaface",

            align=True,

            enforce_detection=True

        )

        print(
            "FACE EMBEDDING EXTRACTED SUCCESSFULLY"
        )

        return jsonify({

            "success": True,

            "embedding":
                embedding[0]["embedding"],

            "embeddingLength":
                len(embedding[0]["embedding"])

        })

    except Exception as e:

        print("\n========= AI ERROR =========")
        traceback.print_exc()
        print("============================\n")

        return jsonify({

            "success": False,
            "error": str(e)

        }), 500


# ================= RUN SERVER =================
if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5001,
        debug=False
    )