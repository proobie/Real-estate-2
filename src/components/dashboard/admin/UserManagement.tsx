import React, { useEffect, useState } from 'react';
import { Users, Plus } from 'lucide-react';
import UserForm from './UserForm';
import { listUsers } from '../../../api';

const UserManagement: React.FC = () => {
  const [view, setView] = useState<'list' | 'create'>('list');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (view !== 'list') return;
    setLoading(true);
    setError(null);
    listUsers()
      .then((u) => setUsers(u))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [view]);

  if (view === 'create') {
    return <UserForm onDone={() => setView('list')} />;
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 md:mb-6">
        <h1 className="text-xl md:text-2xl font-bold">User Management</h1>
        <button
          onClick={() => setView('create')}
          className="flex items-center px-3 md:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </button>
      </div>
      <div className="bg-white rounded-lg shadow-sm border p-4 md:p-6">
        {loading && <div className="text-gray-500">Loading users...</div>}
        {error && <div className="text-red-600">{error}</div>}
        {!loading && !error && users.length === 0 && (
          <div className="text-gray-500">No users to display. Click "Add User" to create one.</div>
        )}
        {!loading && !error && users.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500">
                  <th className="py-2">Name</th>
                  <th className="py-2">Email</th>
                  <th className="py-2">Role</th>
                  <th className="py-2">Created</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t text-sm">
                    <td className="py-2">{u.user_metadata?.name || '-'}</td>
                    <td className="py-2">{u.email}</td>
                    <td className="py-2 capitalize">{u.user_metadata?.role || 'client'}</td>
                    <td className="py-2">{new Date(u.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;


