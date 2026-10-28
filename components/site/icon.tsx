import {
  BookOpen,
  Briefcase,
  Camera,
  Code,
  Database,
  FileText,
  Film,
  Gamepad2,
  Globe,
  GraduationCap,
  Heart,
  Lightbulb,
  Link,
  type LucideIcon,
  Mail,
  MapPin,
  Rocket,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  Trophy,
  Users,
} from 'lucide-react'
import type { IconName } from '@/lib/content/constants'

// Icônes proposées dans l'admin. Seules celles-ci sont incluses dans le site.
const ICONS: Record<IconName, LucideIcon> = {
  'graduation-cap': GraduationCap,
  users: Users,
  briefcase: Briefcase,
  trophy: Trophy,
  'shopping-bag': ShoppingBag,
  'map-pin': MapPin,
  'file-text': FileText,
  'gamepad-2': Gamepad2,
  'book-open': BookOpen,
  'trending-up': TrendingUp,
  database: Database,
  code: Code,
  film: Film,
  mail: Mail,
  globe: Globe,
  rocket: Rocket,
  lightbulb: Lightbulb,
  heart: Heart,
  camera: Camera,
  sparkles: Sparkles,
  link: Link,
}

export function Icon({ name, size = 18, className }: { name: IconName; size?: number; className?: string }) {
  const Component = ICONS[name]
  return <Component size={size} strokeWidth={2} aria-hidden="true" className={className} />
}
