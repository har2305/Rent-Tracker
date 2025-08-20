import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function AddExpensePage() {
  const { id } = useParams(); // group id from URL
  const navigate = useNavigate();

  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    // Fetch group name for display
    async function fetchGroup() {
      try {
        const res = await fetch(`http://localhost:5000/groups/${id}`);
        if (!res.ok) throw new Error("Failed to fetch group");
        const data = await res.json();
        setGroupName(data.NAME || "");
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchGroup();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Simple validation
    if (!title.trim() || !totalAmount || !category.trim()) {
      alert("Please fill all fields");
      return;
    }

    const expenseData = {
      group_id: Number(id),
      title: title.trim(),
      total_amount: Number(totalAmount),
      category: category.trim(),
      // no paid_by included here
    };

    try {
      const res = await fetch("http://localhost:5000/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(expenseData),
      });

      if (!res.ok) {
        throw new Error("Failed to add expense");
      }

      alert("Expense added successfully!");
      navigate(`/groups/${id}`);
    } catch (error) {
      console.error("Error adding expense:", error);
      alert("Error adding expense");
    }
  };

  if (loading) return <div className="text-center mt-10">Loading group info...</div>;

  return (
    <div className="max-w-md mx-auto p-6 bg-gray-800 text-white rounded-lg shadow-lg mt-10">
      <h2 className="text-xl font-bold mb-4">Add Expense to {groupName}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full p-2 rounded bg-gray-900 border border-gray-700"
            placeholder="Expense title"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Total Amount</label>
          <input
            type="number"
            value={totalAmount}
            onChange={e => setTotalAmount(e.target.value)}
            className="w-full p-2 rounded bg-gray-900 border border-gray-700"
            placeholder="Total amount"
            min="0"
            step="0.01"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Category</label>
          <input
            type="text"
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="w-full p-2 rounded bg-gray-900 border border-gray-700"
            placeholder="Category (e.g. Utilities)"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
        >
          Add Expense
        </button>
      </form>
    </div>
  );
}
