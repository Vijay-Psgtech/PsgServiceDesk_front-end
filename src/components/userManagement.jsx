"use client";
import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, CheckCircle, XCircle, Users } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent } from "./ui/card";

const UserManagement = () => {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([
    {
      id: 1,
      name: "Arjun Mehta",
      department: "IT Services",
      role: "Developer",
      active: true,
    },
    {
      id: 2,
      name: "Priya Sharma",
      department: "HR",
      role: "Manager",
      active: false,
    },
  ]);

  const [newUser, setNewUser] = useState({ name: "", department: "", role: "" });
  const [editingUser, setEditingUser] = useState(null);

  const filteredUsers = useMemo(() => {
    return users.filter((u) =>
      [u.name, u.department, u.role]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [users, search]);

  const handleAddUser = () => {
    if (!newUser.name || !newUser.department || !newUser.role) return;
    const newEntry = {
      id: Date.now(),
      ...newUser,
      active: true,
    };
    setUsers([...users, newEntry]);
    setNewUser({ name: "", department: "", role: "" });
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
  };

  const handleSaveEdit = () => {
    setUsers(
      users.map((u) => (u.id === editingUser.id ? editingUser : u))
    );
    setEditingUser(null);
  };

  const handleDeleteUser = (id) => {
    setUsers(users.filter((u) => u.id !== id));
  };

  const handleToggleStatus = (id) => {
    setUsers(
      users.map((u) =>
        u.id === id ? { ...u, active: !u.active } : u
      )
    );
  };

  return (
    <div className="min-h-screen bg-[#0a0f1f] text-[#e0e0ff] p-6 md:p-10">
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
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-[#101426] border border-cyan-400/30 text-cyan-200 placeholder-cyan-600 rounded-xl focus:ring-2 focus:ring-fuchsia-500 transition-all"
          />
          <Button
            onClick={handleAddUser}
            className="bg-gradient-to-r from-cyan-500 to-fuchsia-600 hover:opacity-90 text-white rounded-xl shadow-[0_0_20px_rgba(0,255,255,0.4)] flex items-center gap-2 px-4 py-2"
          >
            <Plus size={18} /> Add User
          </Button>
        </div>
      </motion.div>

      {/* Add User Form */}
      <Card className="bg-[#101426]/70 border border-cyan-400/20 rounded-2xl shadow-[0_0_25px_rgba(0,255,255,0.1)] mb-8">
        <CardContent className="flex flex-col md:flex-row gap-3 p-4">
          <Input
            placeholder="Name"
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            className="bg-[#0c1325] border border-cyan-500/30 text-cyan-200 rounded-xl"
          />
          <Input
            placeholder="Department"
            value={newUser.department}
            onChange={(e) =>
              setNewUser({ ...newUser, department: e.target.value })
            }
            className="bg-[#0c1325] border border-cyan-500/30 text-cyan-200 rounded-xl"
          />
          <Input
            placeholder="Role"
            value={newUser.role}
            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            className="bg-[#0c1325] border border-cyan-500/30 text-cyan-200 rounded-xl"
          />
        </CardContent>
      </Card>

      {/* User Table */}
      <div className="overflow-x-auto rounded-2xl border border-cyan-400/20 shadow-[0_0_30px_rgba(0,255,255,0.08)]">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-[#0f182f] border-b border-cyan-500/20">
            <tr className="text-cyan-300 text-left">
              <th className="py-3 px-4">ID</th>
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4">Department</th>
              <th className="py-3 px-4">Role</th>
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
                  <td className="py-3 px-4">{user.id}</td>
                  <td className="py-3 px-4 font-semibold text-cyan-200">
                    {editingUser?.id === user.id ? (
                      <Input
                        value={editingUser.name}
                        onChange={(e) =>
                          setEditingUser({
                            ...editingUser,
                            name: e.target.value,
                          })
                        }
                        className="bg-[#0c1325] border border-cyan-500/40 text-cyan-200 rounded-lg"
                      />
                    ) : (
                      user.name
                    )}
                  </td>
                  <td className="py-3 px-4 text-gray-300">
                    {editingUser?.id === user.id ? (
                      <Input
                        value={editingUser.department}
                        onChange={(e) =>
                          setEditingUser({
                            ...editingUser,
                            department: e.target.value,
                          })
                        }
                        className="bg-[#0c1325] border border-cyan-500/40 text-cyan-200 rounded-lg"
                      />
                    ) : (
                      user.department
                    )}
                  </td>
                  <td className="py-3 px-4 text-gray-300">
                    {editingUser?.id === user.id ? (
                      <Input
                        value={editingUser.role}
                        onChange={(e) =>
                          setEditingUser({
                            ...editingUser,
                            role: e.target.value,
                          })
                        }
                        className="bg-[#0c1325] border border-cyan-500/40 text-cyan-200 rounded-lg"
                      />
                    ) : (
                      user.role
                    )}
                  </td>
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
                      {editingUser?.id === user.id ? (
                        <Button
                          size="sm"
                          onClick={handleSaveEdit}
                          className="bg-cyan-500/30 hover:bg-cyan-500/50 text-cyan-200 rounded-lg"
                        >
                          <CheckCircle size={16} />
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleEditUser(user)}
                          className="bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-300 rounded-lg"
                        >
                          <Pencil size={16} />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        onClick={() => handleToggleStatus(user.id)}
                        className="bg-fuchsia-500/20 hover:bg-fuchsia-500/40 text-fuchsia-300 rounded-lg"
                      >
                        {user.active ? <XCircle size={16} /> : <CheckCircle size={16} />}
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleDeleteUser(user.id)}
                        className="bg-red-500/20 hover:bg-red-500/40 text-red-300 rounded-lg"
                      >
                        <Trash2 size={16} />
                      </Button>
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