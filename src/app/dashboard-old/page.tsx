export default function DashboardPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p>Welcome to your dashboard!</p>
      
      <div className="mt-4">
        <a href="/test" className="text-blue-500 hover:underline">
          Visit Test Page
        </a>
      </div>
    </div>
  )
}

