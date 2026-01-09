import { useState, useEffect } from 'react'
import { SignedIn, SignedOut } from '@clerk/clerk-react'
import { Link } from 'react-router-dom'
import apiClient from '../api/client'

function Home() {
  const [publicData, setPublicData] = useState<{ message: string; app: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiClient.get('/api/public/info')
      .then(res => {
        setPublicData(res.data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch public data:', err)
        setLoading(false)
      })
  }, [])

  return (
    <div className="page home">
      <h1>Welcome to the Clerk + Java Demo</h1>
      <p className="subtitle">
        This demo shows how to integrate Clerk authentication with a Java Spring Boot backend.
      </p>

      <div className="card">
        <h2>Public API Response</h2>
        {loading ? (
          <p>Loading...</p>
        ) : publicData ? (
          <pre>{JSON.stringify(publicData, null, 2)}</pre>
        ) : (
          <p className="error">Failed to fetch from backend. Is the server running?</p>
        )}
      </div>

      <SignedOut>
        <div className="cta">
          <p>Sign in to access protected endpoints and see your user data.</p>
        </div>
      </SignedOut>

      <SignedIn>
        <div className="cta">
          <p>You're signed in! Visit the dashboard to see protected data.</p>
          <Link to="/dashboard" className="btn btn-primary">
            Go to Dashboard
          </Link>
        </div>
      </SignedIn>
    </div>
  )
}

export default Home
