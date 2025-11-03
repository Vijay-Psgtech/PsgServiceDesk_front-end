"use client";
import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, CheckCircle, XCircle, Users, Eye } from "lucide-react";
import { Link } from "react-router-dom";

const UserManagement = () => {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([
    {
      id: 1,
      name: "Arjun Mehta",
      institution: "Tech University",
      department: "IT Services",
      userId: "U001",
      email: "arjun@techuni.edu",
      password: "********",
      active: true,
    },
  ]);

  const [newUser, setNewUser] = useState({
    name: "",
    institution: "",
    department: "",
    userId: "",
    email: "",
    password: "",
  });

  const [editingUser, setEditingUser] = useState(null);

  const filteredUsers = useMemo(() => {
    return users.filter((u) =>
      [u.name, u.department, u.email, u.userId, u.institution]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [users, search]);

  const handleAddUser = () => {
    if (
      !newUser.name ||
      !newUser.department ||
      !newUser.email ||
      !newUser.userId ||
      !newUser.password ||
      !newUser.institution
    )
      return alert("Please fill all fields!");

    const newEntry = {
      id: Date.now(),
      ...newUser,
      active: true,
    };
    setUsers([...users, newEntry]);
    setNewUser({
      name: "",
      institution: "",
      department: "",
      userId: "",
      email: "",
      password: "",
    });
  };

  const handleEditUser = (user) => setEditingUser(user);

  const handleSaveEdit = () => {
    setUsers(users.map((u) => (u.id === editingUser.id ? editingUser : u)));
    setEditingUser(null);
  };

  const handleDeleteUser = (id) => setUsers(users.filter((u) => u.id !== id));

  const handleToggleStatus = (id) => {
    setUsers(
      users.map((u) => (u.id === id ? { ...u, active: !u.active } : u))
    );
  };

  return (
    <div className="min-h-screen bg-[#050716] text-[#e0e0ff] p-6 md:p-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between mb-8"
      >
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-purple-500 bg-clip-text text-transparent flex items-center gap-2">
          <Users className="text-cyan-400" /> User Management
        </h1>

        <div className="flex gap-3 mt-4 md:mt-0">
          <input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-[#101426] border border-cyan-400/30 text-cyan-200 placeholder-cyan-600 rounded-xl focus:ring-2 focus:ring-fuchsia-500 px-3 py-2 transition-all"
          />
          <button
            onClick={handleAddUser}
            className="bg-gradient-to-r from-cyan-500 to-fuchsia-600 hover:opacity-90 text-white rounded-xl shadow-[0_0_20px_rgba(0,255,255,0.4)] flex items-center gap-2 px-4 py-2 font-medium"
          >
            <Plus size={18} /> Add User
          </button>
        </div>
      </motion.div>

      {/* Add User Form */}
      <div className="bg-[#101426]/70 border border-cyan-400/20 rounded-2xl shadow-[0_0_25px_rgba(0,255,255,0.1)] mb-8 p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        {["name", "institution", "department", "userId", "email", "password"].map(
          (field) => (
            <input
              key={field}
              placeholder={
                field.charAt(0).toUpperCase() +
                field.slice(1).replace("Id", " ID")
              }
              type={field === "password" ? "password" : "text"}
              value={newUser[field]}
              onChange={(e) =>
                setNewUser({ ...newUser, [field]: e.target.value })
              }
              className="bg-[#0c1325] border border-cyan-500/30 text-cyan-200 placeholder-cyan-700 rounded-xl px-3 py-2 focus:ring-2 focus:ring-cyan-500 transition-all"
            />
          )
        )}
      </div>

      {/* User Table */}
      <div className="overflow-x-auto rounded-2xl border border-cyan-400/20 shadow-[0_0_30px_rgba(0,255,255,0.08)]">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-[#0f182f] border-b border-cyan-500/20">
            <tr className="text-cyan-300 text-left">
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4">Institution</th>
              <th className="py-3 px-4">Department</th>
              <th className="py-3 px-4">User ID</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {filteredUsers.map((user, i) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b border-cyan-400/10 hover:bg-[#141b35] transition-all"
                >
                  {["name", "institution", "department", "userId", "email"].map(
                    (field) => (
                      <td
                        key={field}
                        className="py-3 px-4 font-medium text-cyan-100"
                      >
                        {editingUser?.id === user.id ? (
                          <input
                            value={editingUser[field]}
                            onChange={(e) =>
                              setEditingUser({
                                ...editingUser,
                                [field]: e.target.value,
                              })
                            }
                            className="bg-[#0c1325] border border-cyan-500/40 text-cyan-200 rounded-lg px-2 py-1 w-full"
                          />
                        ) : (
                          user[field]
                        )}
                      </td>
                    )
                  )}
                  <td className="py-3 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.active
                          ? "bg-cyan-500/20 text-cyan-300"
                          : "bg-fuchsia-500/20 text-fuchsia-300"
                      }`}
                    >
                      {user.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        to={`/users/${user.id}`}
                        className="bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 rounded-lg p-2"
                      >
                        <Eye size={16} />
                      </Link>
                      {editingUser?.id === user.id ? (
                        <button
                          onClick={handleSaveEdit}
                          className="bg-cyan-500/30 hover:bg-cyan-500/50 text-cyan-200 rounded-lg p-2"
                        >
                          <CheckCircle size={16} />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleEditUser(user)}
                          className="bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-300 rounded-lg p-2"
                        >
                          <Pencil size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => handleToggleStatus(user.id)}
                        className="bg-fuchsia-500/20 hover:bg-fuchsia-500/40 text-fuchsia-300 rounded-lg p-2"
                      >
                        {user.active ? (
                          <XCircle size={16} />
                        ) : (
                          <CheckCircle size={16} />
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="bg-red-500/20 hover:bg-red-500/40 text-red-300 rounded-lg p-2"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;

