import { ReactNode } from 'react'
import type { Authors } from 'contentlayer/generated'
import SocialIcon from '@/components/social-icons'
import Image from '@/components/Image'
import BinaryFlowOverlay from '@/components/BinaryFlowOverlay'

interface Props {
  children: ReactNode
  content: Omit<Authors, '_id' | '_raw' | 'body'>
  hideHeading?: boolean
}

export default function AuthorLayout({ children, content, hideHeading }: Props) {
  const { name, avatar, occupation, company, email, twitter, bluesky, linkedin, github } = content
  const avatarImage = avatar ? (
    <Image src={avatar} alt="avatar" width={192} height={192} className="h-48 w-48 rounded-full" />
  ) : null
  const avatarWithGlow = avatarImage ? (
    <div className="group/avatar relative isolate inline-flex">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-[-10px] rounded-full bg-cyan-500/25 blur-xl transition-opacity duration-300 group-hover/avatar:opacity-95"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-[-3px] rounded-full bg-cyan-400/45 blur-md transition-opacity duration-300 group-hover/avatar:opacity-100"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-cyan-300/50"
      />
      <span className="relative z-10 inline-flex rounded-full">{avatarImage}</span>
    </div>
  ) : null

  return (
    <>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {!hideHeading && (
          <div className="space-y-2 pt-6 pb-8 md:space-y-5">
            <h1 className="text-3xl leading-9 font-extrabold tracking-tight text-gray-900 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14 dark:text-gray-100">
              Team
            </h1>
          </div>
        )}
        <div className="items-start space-y-2 xl:grid xl:grid-cols-3 xl:space-y-0 xl:gap-x-8">
          <div className="relative overflow-hidden rounded-2xl border border-gray-200/70 bg-white/70 px-6 pt-8 pb-6 dark:border-gray-700/70 dark:bg-gray-900/60">
            <BinaryFlowOverlay accentColor="#0891b2" />
            <div className="relative z-10 flex flex-col items-center space-x-2">
              {avatarWithGlow &&
                (linkedin ? (
                  <a
                    href={linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cursor-pointer transition-opacity hover:opacity-80"
                  >
                    {avatarWithGlow}
                  </a>
                ) : (
                  avatarWithGlow
                ))}
              <h3 className="pt-4 pb-2 text-2xl leading-8 font-bold tracking-tight">{name}</h3>
              <div className="text-gray-600 dark:text-gray-300">{occupation}</div>
              <div className="text-gray-600 dark:text-gray-300">{company}</div>
              <div className="flex space-x-3 pt-6">
                <SocialIcon kind="mail" href={`mailto:${email}`} />
                <SocialIcon kind="github" href={github} />
                <SocialIcon kind="linkedin" href={linkedin} />
                <SocialIcon kind="x" href={twitter} />
                <SocialIcon kind="bluesky" href={bluesky} />
              </div>
            </div>
          </div>
          <div className="prose dark:prose-invert max-w-none pt-8 pb-8 xl:col-span-2">
            {children}
          </div>
        </div>
      </div>
    </>
  )
}
