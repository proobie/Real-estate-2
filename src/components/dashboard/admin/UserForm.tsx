import React, { useEffect, useState } from 'react';
import { createUser, listRoles, RoleRecord } from '../../../api';

interface UserFormProps {
  onDone?: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ onDone }) => {
  const [kycChecks, setKycChecks] = useState({
    aadhaar: false,
    pan: false,
    dl: false,
    passport: false,
  });

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'employee',
    role_key: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [roles, setRoles] = useState<RoleRecord[]>([]);

  useEffect(() => {
    listRoles().then(setRoles).catch(() => setRoles([]));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setSubmitting(true);
    try {
      const roleKeyFinal = form.role === 'admin' ? 'admin' : (form.role_key || roles[0]?.key || 'employee_sales');
      await createUser({ email: form.email, password: form.password, name: form.name, phone: form.phone, role: form.role as any, role_key: roleKeyFinal });
      setMessage('User created successfully');
      setTimeout(() => { onDone && onDone(); }, 1000);
    } catch (err: any) {
      setMessage(err?.message || 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="h-[calc(100vh-4rem)] max-h-[calc(100vh-4rem)] overflow-y-auto">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Add Employee/Admin</h1>
            <p className="text-gray-600">Fill the details below to create a new user</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Info</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                <input value={form.name} onChange={(e)=>setForm(s=>({...s,name:e.target.value}))} type="text" placeholder="Full name" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contact *</label>
                <input value={form.phone} onChange={(e)=>setForm(s=>({...s,phone:e.target.value}))} type="tel" placeholder="Primary contact number" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">E-mail</label>
                <input value={form.email} onChange={(e)=>setForm(s=>({...s,email:e.target.value}))} type="email" placeholder="name@example.com" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Alt. Contact</label>
                <input type="tel" placeholder="Alternate contact number" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">DOB (dd-mm-yyyy)</label>
                <input type="date" placeholder="dd-mm-yyyy" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <input type="text" placeholder="Street address, area, landmark" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                <input type="text" placeholder="City" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                <input type="text" placeholder="State" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">PIN Code</label>
                <input type="text" placeholder="e.g., 400001" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                <input type="text" placeholder="Country" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="md:col-span-2 lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Deals In</label>
                <input type="text" placeholder="e.g., Residential, Commercial, Rentals" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </div>

          {/* Remark */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Remark</h2>
            <textarea placeholder="Add any remarks..." rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
          </div>

          {/* KYC Details */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">KYC Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="inline-flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={kycChecks.aadhaar}
                    onChange={(e) => setKycChecks((p) => ({ ...p, aadhaar: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">Aadhaar Card</span>
                </label>
                {kycChecks.aadhaar && (
                  <div className="mt-2">
                    <input type="file" accept="image/*,application/pdf" className="block w-full text-sm text-gray-700" />
                  </div>
                )}
              </div>

              <div>
                <label className="inline-flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={kycChecks.pan}
                    onChange={(e) => setKycChecks((p) => ({ ...p, pan: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">Pan Card</span>
                </label>
                {kycChecks.pan && (
                  <div className="mt-2">
                    <input type="file" accept="image/*,application/pdf" className="block w-full text-sm text-gray-700" />
                  </div>
                )}
              </div>

              <div>
                <label className="inline-flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={kycChecks.dl}
                    onChange={(e) => setKycChecks((p) => ({ ...p, dl: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">Driving Licence</span>
                </label>
                {kycChecks.dl && (
                  <div className="mt-2">
                    <input type="file" accept="image/*,application/pdf" className="block w-full text-sm text-gray-700" />
                  </div>
                )}
              </div>

              <div>
                <label className="inline-flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={kycChecks.passport}
                    onChange={(e) => setKycChecks((p) => ({ ...p, passport: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">Passport</span>
                </label>
                {kycChecks.passport && (
                  <div className="mt-2">
                    <input type="file" accept="image/*,application/pdf" className="block w-full text-sm text-gray-700" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Account Details */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">KYC Status</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="unverified">Un-Verified</option>
                  <option value="verified">Verified</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                <input type="text" placeholder="Username" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
                <input value={form.password} onChange={(e)=>setForm(s=>({...s,password:e.target.value}))} type="password" placeholder="Set a password" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Set Status</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="active">Active</option>
                  <option value="block">Block</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select value={form.role} onChange={(e)=>setForm(s=>({...s,role:e.target.value}))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="employee">Employee</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              {form.role !== 'admin' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Role Key</label>
                  <select value={form.role_key} onChange={(e)=>setForm(s=>({...s,role_key:e.target.value}))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {roles.map(r => (
                      <option key={r.id} value={r.key}>{r.name} ({r.key})</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="md:col-span-2 lg:col-span-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Remarks</label>
                <input type="text" placeholder="Remarks for account status or KYC" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="sticky bottom-0 left-0 right-0 bg-white z-10 flex justify-end pt-6 pb-6 border-t border-gray-200">
            {message && <div className={`mr-4 ${message.includes('success')? 'text-green-600':'text-red-600'}`}>{message}</div>}
            <button disabled={submitting} type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
              {submitting ? 'Creating...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;


