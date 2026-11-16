import type { IconType } from 'react-icons'
import { FaAmazon } from 'react-icons/fa'
import { FiFacebook, FiInstagram, FiTwitter, FiYoutube } from 'react-icons/fi'
import { PiTiktokLogo } from 'react-icons/pi'
import {
  SiApplemusic,
  SiBandcamp,
  SiDeezer,
  SiSoundcloud,
  SiSpotify,
  SiTidal,
  SiYoutube,
  SiYoutubemusic,
} from 'react-icons/si'
import type { StreamingPlatform } from '../../../content/schema'

export const platformInfo: Record<StreamingPlatform, { label: string; Icon: IconType; color: string }> = {
  spotify: { label: 'Spotify', Icon: SiSpotify, color: '#1DB954' },
  appleMusic: { label: 'Apple Music', Icon: SiApplemusic, color: '#FA2D48' },
  youtubeMusic: { label: 'YouTube Music', Icon: SiYoutubemusic, color: '#FF0000' },
  youtube: { label: 'YouTube', Icon: SiYoutube, color: '#FF0000' },
  soundcloud: { label: 'SoundCloud', Icon: SiSoundcloud, color: '#FF5500' },
  tidal: { label: 'TIDAL', Icon: SiTidal, color: '#000000' },
  deezer: { label: 'Deezer', Icon: SiDeezer, color: '#A238FF' },
  amazonMusic: { label: 'Amazon Music', Icon: FaAmazon, color: '#25D1DA' },
  bandcamp: { label: 'Bandcamp', Icon: SiBandcamp, color: '#1DA0C3' },
}

export const socialIcons: Record<string, { label: string; Icon: IconType }> = {
  instagram: { label: 'Instagram', Icon: FiInstagram },
  tiktok: { label: 'TikTok', Icon: PiTiktokLogo },
  twitter: { label: 'Twitter', Icon: FiTwitter },
  youtube: { label: 'YouTube', Icon: FiYoutube },
  facebook: { label: 'Facebook', Icon: FiFacebook },
}
