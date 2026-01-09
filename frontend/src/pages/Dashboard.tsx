import { useState, useEffect } from 'react'
import { useUser } from '@clerk/clerk-react'
import apiClient from '../api/client'

interface UserData {
  message: string
  userId: string
  sessionId: string
}

interface ProtectedData {
  userId: string
  secretData: string
  items: string[]
}

function Dashboard() {
  const { user } = useUser()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [protectedData, setProtectedData] = useState<ProtectedData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProtectedData() {
      try {
        const [userRes, dataRes] = await Promise.all([
          apiClient.get('/api/protected/user'),
          apiClient.get('/api/protected/data'),
        ])

        setUserData(userRes.data)
        setProtectedData(dataRes.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchProtectedData()
  }, [])

  if (loading) {
    return (
      <div className="page dashboard">
        <h1>Dashboard</h1>
        <p>Loading protected data...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page dashboard">
        <h1>Dashboard</h1>
        <div className="card error">
          <h2>Error</h2>
          <p>{error}</p>
          <p className="hint">Make sure the Spring Boot backend is running on port 8080.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page dashboard">
      <h1>Dashboard</h1>
      <p className="subtitle">Welcome back, {user?.firstName || 'User'}!</p>

      <div className="cards">
        <div className="card">
          <h2>User Info from Backend</h2>
          <pre>{JSON.stringify(userData, null, 2)}</pre>
        </div>

        <div className="card">
          <h2>Protected Data</h2>
          <pre>{JSON.stringify(protectedData, null, 2)}</pre>
        </div>

        <div className="card">
          <h2>Clerk User Object</h2>
          <pre>
            {JSON.stringify(
              {
                id: user?.id,
                email: user?.primaryEmailAddress?.emailAddress,
                firstName: user?.firstName,
                lastName: user?.lastName,
              },
              null,
              2
            )}
          </pre>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
