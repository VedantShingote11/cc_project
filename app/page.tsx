"use client"

import { useEffect, useState } from "react"
import { getUsers, getProducts, createOrder } from "@/services/api"

type User = {
  id: number
  name: string
}

type Product = {
  id: number
  name: string
  price: number
}

export default function Home() {

  const [users, setUsers] = useState<User[]>([])
  const [products, setProducts] = useState<Product[]>([])

  const [userId, setUserId] = useState<number>()
  const [productId, setProductId] = useState<number>()

  const [message, setMessage] = useState("")

  useEffect(() => {

    async function loadData() {

      const u = await getUsers()
      const p = await getProducts()

      setUsers(u)
      setProducts(p)

    }

    loadData()

  }, [])

  async function handleOrder() {

    if (!userId || !productId) return

    const order = await createOrder(userId, productId)

    setMessage(`Order Created ID: ${order.order_id}`)

  }

  return (

    <div className="min-h-screen bg-gray-100 p-10">

      <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-xl p-8">

        <h1 className="text-3xl font-bold mb-6">
          Microservice Platform
        </h1>

        {/* Users */}

        <div className="mb-8">

          <h2 className="text-xl font-semibold mb-3">
            Users
          </h2>

          <div className="grid grid-cols-2 gap-3">

            {users.map((u) => (
              <div
                key={u.id}
                className="p-3 bg-gray-50 rounded border"
              >
                {u.id} - {u.name}
              </div>
            ))}

          </div>

        </div>

        {/* Products */}

        <div className="mb-8">

          <h2 className="text-xl font-semibold mb-3">
            Products
          </h2>

          <div className="grid grid-cols-2 gap-3">

            {products.map((p) => (
              <div
                key={p.id}
                className="p-3 bg-gray-50 rounded border"
              >
                {p.name} - ₹{p.price}
              </div>
            ))}

          </div>

        </div>

        {/* Order Form */}

        <div className="bg-gray-50 p-6 rounded-lg">

          <h2 className="text-xl font-semibold mb-4">
            Create Order
          </h2>

          <div className="flex gap-4 mb-4">

            <input
              type="number"
              placeholder="User ID"
              onChange={(e) => setUserId(Number(e.target.value))}
              className="border p-2 rounded w-full"
            />

            <input
              type="number"
              placeholder="Product ID"
              onChange={(e) => setProductId(Number(e.target.value))}
              className="border p-2 rounded w-full"
            />

          </div>

          <button
            onClick={handleOrder}
            className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700"
          >
            Create Order
          </button>

          {message && (
            <p className="mt-4 text-green-600 font-medium">
              {message}
            </p>
          )}

        </div>

      </div>

    </div>

  )
}