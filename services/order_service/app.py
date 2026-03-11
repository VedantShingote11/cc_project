from flask import Flask, jsonify, request
import requests

app = Flask(__name__)

orders = []

USER_SERVICE = "http://13.219.249.103:5000"
PRODUCT_SERVICE = "http://13.219.249.103:5001"


@app.route("/orders", methods=["POST"])
def create_order():
    data = request.json

    user_id = data["user_id"]
    product_id = data["product_id"]

    user = requests.get(f"{USER_SERVICE}/users/{user_id}")
    product = requests.get(f"{PRODUCT_SERVICE}/products/{product_id}")

    if user.status_code != 200:
        return jsonify({"error": "Invalid user"}), 400

    if product.status_code != 200:
        return jsonify({"error": "Invalid product"}), 400

    order = {
        "order_id": len(orders) + 1,
        "user": user.json(),
        "product": product.json()
    }

    orders.append(order)

    return jsonify(order)


@app.route("/orders", methods=["GET"])
def get_orders():
    return jsonify(orders)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5002)