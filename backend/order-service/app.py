from flask import Flask, jsonify, request
from flask_cors import CORS
import random

app = Flask(__name__)
CORS(app)

DUMMY_ORDERS = []

@app.route('/api/orders', methods=['GET'])
def get_orders():
    # Return orders reversed to simulate newest first
    return jsonify({"status": "success", "data": list(reversed(DUMMY_ORDERS))})

@app.route('/api/orders', methods=['POST'])
def add_order():
    data = request.json
    new_id = max([int(o.get('id', 100)) for o in DUMMY_ORDERS] + [100]) + 1
    new_order = {
        "id": new_id,
        "user_id": data.get('user_id'),
        "product_id": data.get('product_id'),
        "status": "processing",
        "total": data.get('total', 0.0)
    }
    DUMMY_ORDERS.append(new_order)
    return jsonify({"status": "success", "data": new_order}), 201

@app.route('/api/orders/user/<int:user_id>', methods=['GET'])
def get_user_orders(user_id):
    orders = [o for o in DUMMY_ORDERS if o["user_id"] == user_id]
    return jsonify({"status": "success", "data": orders})

@app.route('/api/orders/<int:order_id>', methods=['PUT'])
def update_order(order_id):
    data = request.json
    order_idx = next((i for i, o in enumerate(DUMMY_ORDERS) if o["id"] == order_id), None)
    if order_idx is not None:
        DUMMY_ORDERS[order_idx].update({
            "status": data.get('status', DUMMY_ORDERS[order_idx]['status'])
        })
        return jsonify({"status": "success", "data": DUMMY_ORDERS[order_idx]})
    return jsonify({"status": "error", "message": "Order not found"}), 404

@app.route('/api/orders/<int:order_id>', methods=['DELETE'])
def delete_order(order_id):
    global DUMMY_ORDERS
    DUMMY_ORDERS = [o for o in DUMMY_ORDERS if o["id"] != order_id]
    return jsonify({"status": "success", "message": "Order deleted"})

if __name__ == '__main__':
    app.run(debug=True, port=5001)
