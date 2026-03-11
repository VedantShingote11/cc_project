const EC2_IP = "http://YOUR_EC2_IP";

export const getUsers = async () => {
    const res = await fetch(`${EC2_IP}:5000/users`);
    return res.json();
};

export const getProducts = async () => {
    const res = await fetch(`${EC2_IP}:5001/products`);
    return res.json();
};

export const getOrders = async () => {
    const res = await fetch(`${EC2_IP}:5002/orders`);
    return res.json();
};

export const createOrder = async (user_id, product_id) => {
    const res = await fetch(`${EC2_IP}:5002/orders`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            user_id,
            product_id,
        }),
    });

    return res.json();
};