from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

DUMMY_PRODUCTS = []

@app.route('/api/products', methods=['GET'])
def get_products():
    return jsonify({"status": "success", "data": DUMMY_PRODUCTS})

@app.route('/api/products', methods=['POST'])
def add_product():
    data = request.json
    new_id = max([int(p.get('id', 200)) for p in DUMMY_PRODUCTS] + [200]) + 1
    new_product = {
        "id": new_id,
        "name": data.get('name', ''),
        "price": float(data.get('price', 0.0)),
        "category": data.get('category', 'General'),
        "stock": int(data.get('stock', 0))
    }
    DUMMY_PRODUCTS.append(new_product)
    return jsonify({"status": "success", "data": new_product}), 201

@app.route('/api/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
    product = next((p for p in DUMMY_PRODUCTS if p["id"] == product_id), None)
    if product:
        return jsonify({"status": "success", "data": product})
    return jsonify({"status": "error", "message": "Product not found"}), 404

@app.route('/api/products/<int:product_id>', methods=['PUT'])
def update_product(product_id):
    data = request.json
    product_idx = next((i for i, p in enumerate(DUMMY_PRODUCTS) if p["id"] == product_id), None)
    if product_idx is not None:
        DUMMY_PRODUCTS[product_idx].update({
            "name": data.get('name', DUMMY_PRODUCTS[product_idx]['name']),
            "price": float(data.get('price', DUMMY_PRODUCTS[product_idx]['price'])),
            "category": data.get('category', DUMMY_PRODUCTS[product_idx]['category']),
            "stock": int(data.get('stock', DUMMY_PRODUCTS[product_idx]['stock']))
        })
        return jsonify({"status": "success", "data": DUMMY_PRODUCTS[product_idx]})
    return jsonify({"status": "error", "message": "Product not found"}), 404

@app.route('/api/products/<int:product_id>', methods=['DELETE'])
def delete_product(product_id):
    global DUMMY_PRODUCTS
    DUMMY_PRODUCTS = [p for p in DUMMY_PRODUCTS if p["id"] != product_id]
    return jsonify({"status": "success", "message": "Product deleted"})

if __name__ == '__main__':
    app.run(debug=True, port=5002)
