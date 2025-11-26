import React, { useEffect, useState } from 'react';
import { listRoles, createRole, updateRole, deleteRole, RoleRecord } from '../../../api';

const defaultPerms = {
  properties: { view: true, create: false, edit: false, delete: false },
  projects:   { view: true, create: false, edit: false, delete: false },
  leads:      { view: true, create: false, edit: false, delete: false },
  roles:      { view: false, create: false, edit: false, delete: false },
};

export default function RolesManagement() {
  const [roles, setRoles] = useState<RoleRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<RoleRecord | null>(null);
  const [form, setForm] = useState<{ name: string; key: string; permissions: any }>({ name: '', key: '', permissions: defaultPerms });

  const load = async () => {
    setLoading(true); setError(null);
    try { setRoles(await listRoles()); } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm({ name: '', key: '', permissions: defaultPerms }); setShowModal(true); };
  const openEdit = (r: RoleRecord) => { setEditing(r); setForm({ name: r.name, key: r.key, permissions: r.permissions || defaultPerms }); setShowModal(true); };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.key) return;
    if (editing) await updateRole(editing.id, form); else await createRole(form);
    setShowModal(false); await load();
  };

  const remove = async (r: RoleRecord) => {
    if (!confirm(`Delete role ${r.name}?`)) return;
    await deleteRole(r.id); await load();
  };

  const sections: Array<keyof typeof defaultPerms> = ['properties','projects','leads','roles'];
  const actions: Array<'view'|'create'|'edit'|'delete'> = ['view','create','edit','delete'];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Roles & Permissions</h1>
        <button onClick={openNew} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">+ New Role</button>
      </div>
      {loading ? <div>Loading...</div> : error ? <div className="text-red-500">{error}</div> : (
        <div className="bg-white rounded shadow-sm overflow-hidden">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Key</th>
                <th className="px-4 py-2 text-left">Permissions (summary)</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {roles.map(r => (
                <tr key={r.id} className="border-t">
                  <td className="px-4 py-2">{r.name}</td>
                  <td className="px-4 py-2">{r.key}</td>
                  <td className="px-4 py-2 text-sm text-gray-600">{JSON.stringify(r.permissions)}</td>
                  <td className="px-4 py-2">
                    <button className="text-blue-600 hover:underline mr-3" onClick={() => openEdit(r)}>Edit</button>
                    <button className="text-red-600 hover:underline" onClick={() => remove(r)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow p-6 w-full max-w-3xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">{editing ? 'Edit Role' : 'Create Role'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500">×</button>
            </div>
            <form onSubmit={save} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} className="w-full border px-3 py-2 rounded" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Key</label>
                  <input value={form.key} onChange={e=>setForm(f=>({...f,key:e.target.value}))} className="w-full border px-3 py-2 rounded" placeholder="e.g., employee_sales" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Permissions</label>
                <div className="overflow-auto">
                  <table className="min-w-full border">
                    <thead>
                      <tr>
                        <th className="px-3 py-2 text-left">Section</th>
                        {actions.map(a=> <th key={a} className="px-3 py-2 text-left capitalize">{a}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {sections.map(sec => (
                        <tr key={sec} className="border-t">
                          <td className="px-3 py-2 capitalize">{sec}</td>
                          {actions.map(act => (
                            <td key={act} className="px-3 py-2">
                              <input type="checkbox" checked={Boolean(form.permissions?.[sec]?.[act])} onChange={e=>{
                                setForm(f=>{
                                  const p:any = { ...(f.permissions || {}) };
                                  p[sec] = { ...(p[sec] || {}) , [act]: e.target.checked };
                                  return { ...f, permissions: p };
                                });
                              }} />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="flex justify-end">
                <button type="button" onClick={()=>setShowModal(false)} className="px-4 py-2 border rounded mr-2">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}



