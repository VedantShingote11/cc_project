"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { ShoppingBag, Search, ExternalLink, Filter, Plus, X, Edit2, Trash2 } from "lucide-react";
import { API_URLS } from "@/lib/config";
import { syncEntity } from "@/lib/storageSync";

type Order = { id: number; user_id: number; product_id: number; status: string; total: number; };
type User = { id: number; name: string; email: string; };
type Product = { id: number; name: string; price: number; stock: number; };

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newOrder, setNewOrder] = useState({ userId: '', productId: '', quantity: '1' });
  
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [ordersData, usersData, productsData] = await Promise.all([
        syncEntity<Order>('orders_cache', API_URLS.ORDERS),
        syncEntity<User>('users_cache', API_URLS.USERS),
        syncEntity<Product>('products_cache', API_URLS.PRODUCTS)
      ]);
      setOrders(ordersData);
      setUsers(usersData);
      setProducts(productsData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getUserName = (userId: number) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : `User #${userId}`;
  };

  const getProductName = (productId: number) => {
    const product = products.find(p => p.id === productId);
    return product ? product.name : `Product #${productId}`;
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const selectedProduct = products.find(p => p.id === parseInt(newOrder.productId));
      const totalAmount = selectedProduct ? selectedProduct.price * parseInt(newOrder.quantity) : 0;
      
      await axios.post(API_URLS.ORDERS, {
        user_id: parseInt(newOrder.userId),
        product_id: parseInt(newOrder.productId),
        quantity: parseInt(newOrder.quantity),
        total: totalAmount
      });
      setIsModalOpen(false);
      setNewOrder({ userId: '', productId: '', quantity: '1' });
      fetchData();
    } catch (error) {
      console.error("Error placing order:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;
    setSubmitting(true);
    try {
      await axios.put(`${API_URLS.ORDERS}/${editingOrder.id}`, {
        status: editingOrder.status
      });
      setEditingOrder(null);
      fetchData();
    } catch (error) {
      console.error("Error updating order:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteOrder = async (id: number) => {
    if (!confirm('Are you sure you want to delete this order?')) return;
    try {
      await axios.delete(`${API_URLS.ORDERS}/${id}`);
      const localStr = localStorage.getItem('orders_cache');
      if (localStr) {
        let localData = JSON.parse(localStr);
        localData = localData.filter((o: any) => o.id !== id);
        localStorage.setItem('orders_cache', JSON.stringify(localData));
      }
      fetchData();
    } catch (error) {
      console.error("Error deleting order:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <ShoppingBag className="h-8 w-8 text-primary" />
            Orders
          </h2>
          <p className="text-slate-500 mt-2">Track, edit, and manage customer orders.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-lg shadow-primary/20 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Place Order
        </button>
      </div>

      <div className="rounded-2xl bg-white border border-slate-200 shadow-md overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50">
          <div className="relative w-full sm:max-w-sm">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              className="bg-white border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-primary focus:border-primary block w-full pl-10 p-2.5 transition-all shadow-sm"
              placeholder="Search by Order ID..."
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-colors w-full sm:w-auto shadow-sm">
            <Filter className="h-4 w-4" />
            Filter Status
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead>
              <tr className="bg-white">
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Order</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50 transition-colors duration-150 group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-900">#{order.id}</span>
                      <ExternalLink className="h-3 w-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:text-primary" />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-600">{getUserName(order.user_id)}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-600 line-clamp-1">{getProductName(order.product_id)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border ${
                      order.status === 'delivered' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                      order.status === 'shipped' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                      'bg-amber-50 text-amber-600 border-amber-200'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-slate-900">
                    ${order.total.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                       <button onClick={() => setEditingOrder(order)} className="text-slate-400 hover:text-indigo-600 transition-colors p-1.5 rounded-lg hover:bg-slate-100"><Edit2 className="h-4 w-4" /></button>
                       <button onClick={() => handleDeleteOrder(order.id)} className="text-slate-400 hover:text-rose-600 transition-colors p-1.5 rounded-lg hover:bg-slate-100"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-500">
                    No orders found in Local Storage or Backend. Place one!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Place Order Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Place New Order</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handlePlaceOrder} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Select User</label>
                <select required value={newOrder.userId} onChange={e => setNewOrder({...newOrder, userId: e.target.value})} className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all appearance-none bg-white">
                  <option value="" disabled>Select a user</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Select Product</label>
                <select required value={newOrder.productId} onChange={e => setNewOrder({...newOrder, productId: e.target.value})} className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all appearance-none bg-white">
                  <option value="" disabled>Select a product</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id} disabled={product.stock <= 0}>
                      {product.name} - ${product.price} ({product.stock} in stock)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
                <input required type="number" min="1" value={newOrder.quantity} onChange={e => setNewOrder({...newOrder, quantity: e.target.value})} className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" placeholder="1" />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-colors">Cancel</button>
                <button type="submit" disabled={submitting || !newOrder.userId || !newOrder.productId} className="bg-primary hover:bg-indigo-600 text-white px-6 py-2 rounded-xl text-sm font-medium transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
                  {submitting ? 'Placing...' : 'Place Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Order Modal */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Edit Order Status</h3>
              <button onClick={() => setEditingOrder(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleEditOrder} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select required value={editingOrder.status} onChange={e => setEditingOrder({...editingOrder, status: e.target.value})} className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all appearance-none bg-white">
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                </select>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setEditingOrder(null)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-colors">Cancel</button>
                <button type="submit" disabled={submitting} className="bg-primary hover:bg-indigo-600 text-white px-6 py-2 rounded-xl text-sm font-medium transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
                  {submitting ? 'Saving...' : 'Update Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
