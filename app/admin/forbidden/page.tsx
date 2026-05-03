export default function AdminForbiddenPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-900">
      <div className="max-w-md text-center">
        <p className="text-lg font-medium text-gray-800 dark:text-gray-200">Not found</p>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          If you are an admin, open your admin URL with the{' '}
          <code className="rounded bg-gray-200 px-1 font-mono text-xs dark:bg-gray-700">token</code>{' '}
          query parameter, then bookmark the page after you are in.
        </p>
      </div>
    </div>
  )
}
