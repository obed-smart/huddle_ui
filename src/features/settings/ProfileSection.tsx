"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Pencil } from "@/components/ui/icons";
import { useAuthStore } from "@/store/useAuthStore";

export function ProfileSection() {
  const { user, updateProfile } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(user?.name ?? "");
  const [username, setUsername] = useState(user?.username ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [about, setAbout] = useState(user?.about ?? "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl);

  if (!user) return null;

  const dirty =
    name !== user.name ||
    username !== user.username ||
    bio !== (user.bio ?? "") ||
    about !== (user.about ?? "") ||
    avatarUrl !== user.avatarUrl;

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUrl(URL.createObjectURL(file));
  }

  function handleSave() {
    if (!user) return;
    const trimmedUsername = username.trim().replace(/^@/, "");
    updateProfile({
      name: name.trim() || user.name,
      username: trimmedUsername.length >= 3 ? trimmedUsername : user.username,
      bio: bio.trim(),
      about: about.trim(),
      avatarUrl,
    });
    toast.success("Profile updated");
  }

  return (
    <section className="space-y-5 rounded-(--radius-lg) border border-border bg-surface p-5 sm:p-6">
      <h2 className="font-heading text-base font-semibold text-foreground">Profile</h2>

      <div className="flex items-center gap-4">
        <div className="relative">
          <Avatar name={name || user.name} imageUrl={avatarUrl} size="xl" />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Change photo"
            className="absolute -right-1 -bottom-1 flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground ring-2 ring-surface transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Pencil className="size-3.5" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoChange}
          />
        </div>
        <div className="text-sm text-muted-foreground">
          <p>Upload a square photo for the best fit.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="settings-name">Display name</Label>
          <Input id="settings-name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="settings-username">Username</Label>
          <Input
            id="settings-username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            leadingIcon={<span className="font-medium">@</span>}
            minLength={3}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="settings-bio">Bio</Label>
        <Input
          id="settings-bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="A short tagline about you"
          maxLength={80}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="settings-about">About</Label>
        <Textarea
          id="settings-about"
          value={about}
          onChange={(e) => setAbout(e.target.value)}
          placeholder="Tell people a bit more about yourself"
          rows={4}
          maxLength={300}
        />
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={!dirty}>
          Save changes
        </Button>
      </div>
    </section>
  );
}
