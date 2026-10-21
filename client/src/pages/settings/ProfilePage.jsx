import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { authApi } from '../../api/authApi.js';
import { Card, CardHeader, CardBody } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Input, Textarea, Select } from '../../components/ui/Input.jsx';
import { User, ShieldCheck, Palette, Save } from 'lucide-react';

export function ProfilePage() {
  const { user, setUser } = useAuth();
  const { success, error: toastError } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [title, setTitle] = useState(user?.title || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [themePref, setThemePref] = useState(user?.themePreference || 'dark');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await authApi.updateProfile({
        name,
        title,
        bio,
        themePreference: themePref,
        avatarUrl,
      });
      setUser(res.user);
      success('Profile updated successfully!');
    } catch (err) {
      toastError(err.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="pb-6 border-b border-stone-300/80 dark:border-stone-800">
        <div className="text-[10px] font-mono tracking-widest uppercase text-terracotta-600 dark:text-terracotta-400 mb-1">
          PREFERENCES // IDENTITY
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-medium tracking-tight text-charcoal-900 dark:text-stone-100 flex items-center gap-3">
          <User className="w-6 h-6 text-terracotta-600 dark:text-terracotta-400 stroke-[1.5]" />
          Operator Profile & Preferences
        </h1>
        <p className="text-xs text-charcoal-600 dark:text-stone-400 mt-1">
          Manage your personal identity, on-call title, and studio theme defaults.
        </p>
      </div>

      <Card>
        <CardHeader title="Personal Information" />
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-4 mb-4">
              <img
                src={avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120'}
                alt={name}
                className="w-16 h-16 rounded-full object-cover ring-2 ring-stone-300 dark:ring-stone-700"
              />
              <div className="flex-1">
                <Input
                  label="Avatar Image URL"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <Input
                label="Role Title"
                placeholder="e.g. Principal Site Reliability Engineer"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <Input
              label="Account Email (Primary Auth)"
              value={user?.email || ''}
              disabled
              helperText="Email changes require security verification."
            />

            <Textarea
              label="Bio & Responsibilities"
              placeholder="Describe your engineering focus areas..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
            />

            <Select
              label="Interface Theme Preference"
              value={themePref}
              onChange={(e) => setThemePref(e.target.value)}
              options={[
                { value: 'dark', label: 'Dark Mode (Graphite & Warm Stone - Default)' },
                { value: 'light', label: 'Light Mode (Warm Ivory & Stone)' },
              ]}
            />

            <div className="pt-4 border-t border-stone-300 dark:border-stone-800 flex justify-end">
              <Button type="submit" variant="primary" size="md" icon={Save} isLoading={isLoading}>
                Save Profile
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}

export default ProfilePage;
