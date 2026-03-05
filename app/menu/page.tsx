"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/db";
import { MenuItem, MenuItemTypes } from "@/lib/types";
import { addMenuItem, deleteMenuItem, toggleMenuItemVisibility } from "@/lib/db";

const menuTypes: MenuItemTypes[] = ["bar", "primi", "secondi", "contorni", "dolci", "varie"];

const typeColors: Record<MenuItemTypes, string> = {
  bar: "bg-blue-100 text-blue-800",
  primi: "bg-green-100 text-green-800",
  secondi: "bg-orange-100 text-orange-800",
  contorni: "bg-purple-100 text-purple-800",
  dolci: "bg-pink-100 text-pink-800",
  varie: "bg-gray-100 text-gray-800",
};

export default function MenuManagement() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    price: "",
    type: "bar" as MenuItemTypes,
  });

  useEffect(() => {
    loadMenuItems();
  }, []);

  const loadMenuItems = async () => {
    try {
      const items = await db.menu_items.toArray();
      setMenuItems(items.sort((a, b) => parseInt(a.id || '0') - parseInt(b.id || '0')));
    } catch (error) {
      console.error("Error loading menu items:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name || !newItem.price) return;

    try {
      await addMenuItem({
        name: newItem.name,
        price: parseFloat(newItem.price),
        type: newItem.type,
      });
      setNewItem({ name: "", price: "", type: "bar" });
      setShowAddForm(false);
      loadMenuItems();
    } catch (error) {
      console.error("Error adding menu item:", error);
    }
  };

  const handleToggleVisibility = async (id: string) => {
    try {
      await toggleMenuItemVisibility(id);
      loadMenuItems();
    } catch (error) {
      console.error("Error toggling visibility:", error);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    
    try {
      await deleteMenuItem(id);
      loadMenuItems();
    } catch (error) {
      console.error("Error deleting menu item:", error);
    }
  };

  const groupedItems = menuItems.reduce((acc, item) => {
    if (!acc[item.type]) {
      acc[item.type] = [];
    }
    acc[item.type].push(item);
    return acc;
  }, {} as Record<MenuItemTypes, MenuItem[]>);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading menu...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Menu Management</h1>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add New Item
          </button>
        </div>

        {showAddForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Add Menu Item</h2>
            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newItem.price}
                  onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={newItem.type}
                  onChange={(e) => setNewItem({ ...newItem, type: e.target.value as MenuItemTypes })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {menuTypes.map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                >
                  Add Item
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-8">
          {menuTypes.map((type) => {
            const items = groupedItems[type];
            if (!items || items.length === 0) return null;

            return (
              <div key={type} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-gray-100 px-6 py-4 border-b">
                  <h2 className="text-xl font-semibold capitalize">{type}</h2>
                </div>
                <div className="divide-y divide-gray-200">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className={`px-6 py-4 flex items-center justify-between ${
                        item.visible === false ? "bg-gray-50 opacity-60" : ""
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <span className="text-sm text-gray-500">#{item.id}</span>
                          <h3 className="font-medium text-gray-900">{item.name}</h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${typeColors[item.type]}`}>
                            {item.type}
                          </span>
                          {item.visible === false && (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                              Hidden
                            </span>
                          )}
                        </div>
                        <p className="text-lg font-semibold text-gray-900 mt-1">
                          €{item.price.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleToggleVisibility(item.id!)}
                          className={`px-3 py-1 text-sm rounded-md transition-colors ${
                            item.visible === false
                              ? "bg-green-100 text-green-700 hover:bg-green-200"
                              : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                          }`}
                        >
                          {item.visible === false ? "Show" : "Hide"}
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id!)}
                          className="bg-red-100 text-red-700 px-3 py-1 text-sm rounded-md hover:bg-red-200 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {menuItems.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500">No menu items found. Add your first item to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
