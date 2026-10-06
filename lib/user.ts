import type { User } from './types'

export function getUserDisplayName(user: User) {
  return user.name?.trim() || user.full_name?.trim() || user.email.split('@')[0]
}

export function getUserAvatar(user: User) {
  return user.avatar_url?.trim() || user.avatarUrl?.trim()
}

export function getUserInitials(name: string) {
  const parts = name.split(/\s+/).filter(Boolean)
  if (parts.length > 1) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
  return name.slice(0, 2).toUpperCase()
}
