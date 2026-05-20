import os
import cv2
import traceback

from flask import Flask, request, jsonify
from insightface.app import FaceAnalysis

app = Flask(__name__)

# ================= FOLDERS =================
UPLOAD_FOLDER = "temp"

os.makedirs(
    UPLOAD_FOLDER,
    exist_ok=True
)

# ================= INSIGHTFACE =================
face_app = FaceAnalysis(
    name="buffalo_l"
)

face_app.prepare(
    ctx_id=0,
    det_size=(640, 640)
)

print("\n===================================")
print("INSIGHTFACE LOADED SUCCESSFULLY")
print("===================================\n")


# ================= HOME ROUTE =================
@app.route("/")
def home():

    return "InsightFace AI Service Running"


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

        # ================= READ IMAGE =================
        img = cv2.imread(image_path)

        if img is None:

            return jsonify({

                "success": False,
                "message": "Failed to read image"

            }), 400

        # ================= DETECT FACES =================
        faces = face_app.get(img)

        total_faces = len(faces)

        print("TOTAL FACES DETECTED:", total_faces)

        # Reject if more than one face
        if total_faces > 1:

            print("MULTIPLE FACES DETECTED")

            return jsonify({

                "success": False,

                "message":
                    "Upload photo of one person only",

                "facesDetected":
                    total_faces

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
        embedding = faces[0].embedding

        embedding = embedding.tolist()

        print(
            "FACE EMBEDDING EXTRACTED SUCCESSFULLY"
        )

        return jsonify({

            "success": True,

            "embedding": embedding,

            "embeddingLength":
                len(embedding)

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