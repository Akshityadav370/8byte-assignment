import { Mail, Phone } from 'lucide-react'

const LinkedInIcon = ({
  size = 24,
  color = 'currentColor',
}: {
  size?: number
  color?: string
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={color}
    role="img"
    aria-label="LinkedIn"
  >
    <path d="M4.98 3.5C4.98 4.88 3.86 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5zM.5 8h4V24h-4V8zM8.5 8h3.8v2.2h.05c.53-1 1.84-2.2 3.8-2.2 4.07 0 4.82 2.68 4.82 6.16V24h-4v-8.7c0-2.08-.04-4.76-2.9-4.76-2.9 0-3.35 2.27-3.35 4.61V24h-4V8z" />
  </svg>
)

const GitHubIcon = ({
  size = 24,
  color = 'currentColor',
}: {
  size?: number
  color?: string
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={color}
    role="img"
    aria-label="GitHub"
  >
    <path d="M12 0.5C5.65 0.5.5 5.85.5 12.46c0 5.29 3.44 9.78 8.2 11.37.6.11.82-.27.82-.6 0-.3-.01-1.08-.02-2.12-3.34.75-4.04-1.66-4.04-1.66-.55-1.44-1.34-1.82-1.34-1.82-1.1-.78.08-.76.08-.76 1.22.09 1.86 1.28 1.86 1.28 1.08 1.9 2.84 1.35 3.53 1.03.11-.8.42-1.35.76-1.66-2.67-.32-5.48-1.38-5.48-6.14 0-1.36.46-2.48 1.22-3.35-.12-.31-.53-1.57.12-3.27 0 0 1-.33 3.3 1.28.96-.27 1.98-.4 3-.4s2.04.13 3 .4c2.3-1.61 3.3-1.28 3.3-1.28.65 1.7.24 2.96.12 3.27.76.87 1.22 1.99 1.22 3.35 0 4.77-2.82 5.82-5.5 6.13.43.38.81 1.12.81 2.25 0 1.62-.02 2.92-.02 3.32 0 .33.22.72.83.6 4.76-1.6 8.19-6.08 8.19-11.37C23.5 5.85 18.35.5 12 .5z" />
  </svg>
)

const MyInfo = () => {
  return (
    <div className="flex gap-3 items-center">
      <span>Akshit Yadav Aesham</span>
      <span>|</span>
      <a
        href="https://www.linkedin.com/in/akshit-yadav/"
        target="_blank"
        rel="noopener noreferrer"
        className=" text-gray-700 hover:text-gray-900"
      >
        <LinkedInIcon size={18} color="#0A66C2" />
      </a>
      <span>|</span>
      <a
        href="https://github.com/Akshityadav370"
        target="_blank"
        rel="noopener noreferrer"
        className=" text-gray-700 hover:text-gray-900"
      >
        <GitHubIcon size={18} />
      </a>
      <span>|</span>
      <span className="flex items-center gap-2">
        <Mail size={14} />
        akshit07032001@gmail.com
      </span>
      <span>|</span>
      <span className="flex items-center gap-2">
        <Phone size={14} /> 9704590423
      </span>
    </div>
  )
}

export default MyInfo
