'use client'

import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'

export default function ClerkAuthNav() {
  return (
    <div className="flex items-center gap-2">
      <Show when="signed-out">
        <SignInButton mode="modal">
          <button
            type="button"
            className="hover:text-primary-500 dark:hover:text-primary-400 text-sm font-medium text-gray-700 dark:text-gray-200"
          >
            Sign in
          </button>
        </SignInButton>
        <SignUpButton mode="modal">
          <button
            type="button"
            className="bg-primary-500 hover:bg-primary-600 rounded-md px-3 py-1.5 text-sm font-medium text-white"
          >
            Sign up
          </button>
        </SignUpButton>
      </Show>
      <Show when="signed-in">
        <UserButton />
      </Show>
    </div>
  )
}
