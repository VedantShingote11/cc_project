const BASE_IP = "http://13.219.249.103";

export async function getUsers() {
    const res = await fetch(`${BASE_IP}:5000/users`);
    return res.json();
}

export async function getProducts() {
    const res = await fetch(`${BASE_IP}:5001/products`);
    return res.json();
}

export async function createOrder(user_id: number, product_id: number) {
    const res = await fetch(`${BASE_IP}:5002/orders`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id, product_id }),
    });

    return res.json();
}