"use client"

import { useEffect, useState } from "react"

type Order = {
    order_id: number
    user: {
        id: number
        name: string
    }
    product: {
        id: number
        name: string
        price: number
    }
}

export default function OrdersPage() {

    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)

    const API = "http://YOUR_EC2_IP:5002/orders"

    useEffect(() => {

        async function loadOrders() {

            try {
                const res = await fetch(API)
                const data = await res.json()
                setOrders(data)
            } catch (err) {
                console.error("Error fetching orders", err)
            }

            setLoading(false)
        }

        loadOrders()

    }, [])

    return (

        <div className="min-h-screen bg-gray-100 p-10">

            <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-xl p-8">

                <div className="flex justify-between items-center mb-6">

                    <h1 className="text-3xl font-bold">
                        Orders Dashboard
                    </h1>

                    <a
                        href="/"
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Back to Home
                    </a>

                </div>

                {loading ? (

                    <p className="text-gray-500">Loading orders...</p>

                ) : orders.length === 0 ? (

                    <p className="text-gray-500">No orders found</p>

                ) : (

                    <table className="w-full border border-gray-200">

                        <thead className="bg-gray-50">

                            <tr>

                                <th className="p-3 border text-left">Order ID</th>
                                <th className="p-3 border text-left">User</th>
                                <th className="p-3 border text-left">Product</th>
                                <th className="p-3 border text-left">Price</th>

                            </tr>

                        </thead>

                        <tbody>

                            {orders.map((order) => (

                                <tr key={order.order_id} className="hover:bg-gray-50">

                                    <td className="p-3 border">
                                        {order.order_id}
                                    </td>

                                    <td className="p-3 border">
                                        {order.user.name}
                                    </td>

                                    <td className="p-3 border">
                                        {order.product.name}
                                    </td>

                                    <td className="p-3 border">
                                        ₹{order.product.price}
                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table>

                )}

            </div>

        </div>

    )
}