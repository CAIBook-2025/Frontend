"use client"

export default function NotLoggedIn() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold mb-4 text-gray-800">
        You are not logged in
      </h1>
      <p className="text-gray-600 mb-6">
        Please log in to access this page.
      </p>
      <a href="/auth/login?returnTo=/Callback-check">
        Login
      </a>
    </div>
    )
}