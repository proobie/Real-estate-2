import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../supabaseClient';
import { Camera, User, Mail, Save, Phone } from 'lucide-react';

const ProfileSettings: React.FC = () => {
  const { user, setUser } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [newAvatar, setNewAvatar] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setAvatarUrl(user.avatar || null);
      // Load extended metadata
      (async () => {
        // Prefer profiles table if available
        const { data: profile } = await supabase
          .from('profiles')
          .select('name, avatar_url, contact_email, contact_phone')
          .eq('id', user.id)
          .single();
        if (profile) {
          if (profile.name) setName(profile.name);
          if (profile.avatar_url) setAvatarUrl(profile.avatar_url);
          setContactEmail(profile.contact_email || '');
          setContactPhone(profile.contact_phone || '');
        } else {
          // Fallback to auth metadata if no profile row yet
          const { data } = await supabase.auth.getUser();
          const md = data.user?.user_metadata || {};
          setContactEmail(md.contact_email || '');
          setContactPhone(md.contact_phone || '');
        }
      })();
    }
  }, [user]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewAvatar(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      let avatar_url = user?.avatar;

      if (newAvatar) {
        const fileExt = newAvatar.name.split('.').pop();
        const fileName = `${user!.id}.${fileExt}`;
        const filePath = fileName;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, newAvatar, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
        avatar_url = urlData.publicUrl;
      }

      // 1) Upsert into profiles table (source of truth)
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user!.id,
          name,
          avatar_url,
          contact_email: contactEmail,
          contact_phone: contactPhone,
          updated_at: new Date().toISOString(),
        });
      if (profileError) throw profileError;

      // 2) Optionally mirror basic fields to auth metadata for convenience
      const { data, error: updateError } = await supabase.auth.updateUser({
        data: { name, avatar_url, contact_email: contactEmail, contact_phone: contactPhone },
      });

      if (updateError) throw updateError;

      if (data.user) {
        setUser({
          name: data.user.user_metadata.name,
          avatar: data.user.user_metadata.avatar_url,
          phone: data.user.user_metadata.contact_phone,
        });
      }

      setSuccess('Profile updated successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6 pb-24 bg-gray-50 min-h-full overflow-y-auto">
      <div className="max-w-xl mx-auto bg-white p-8 pb-16 rounded-lg shadow-md border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Profile Settings</h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <img
                src={avatarUrl || `https://ui-avatars.com/api/?name=${name || 'U'}&background=random`}
                alt="Avatar"
                className="w-24 h-24 rounded-full object-cover"
              />
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-all"
              >
                <Camera size={16} />
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            </div>
            <div className="flex-1">
              <p className="text-xl font-bold text-gray-800">{name}</p>
              <p className="text-gray-500">{email}</p>
            </div>
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your full name"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="email"
                id="email"
                value={email}
                disabled
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Email address cannot be changed.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-1">
                Contact Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  id="contactEmail"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Public contact email"
                />
              </div>
            </div>
            <div>
              <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-1">
                Contact Phone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="tel"
                  id="contactPhone"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Public contact phone"
                />
              </div>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && <p className="text-green-500 text-sm">{success}</p>}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300"
            >
              <Save size={18} className="mr-2" />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileSettings; 