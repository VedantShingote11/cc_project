from flask import Flask, jsonify

app = Flask(__name__)

users = [
    {"id": 1, "name": "Vedant"},
    {"id": 2, "name": "Rahul"}
]

@app.route("/users", methods=["GET"])
def get_users():
    return jsonify(users)

@app.route("/users/<int:user_id>", methods=["GET"])
def get_user(user_id):
    for user in users:
        if user["id"] == user_id:
            return jsonify(user)
    return jsonify({"error": "User not found"}), 404


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)