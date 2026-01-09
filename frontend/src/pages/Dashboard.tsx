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

interface TokenResponse {
  jwt: string
  userId: string
  sessionId: string
  expiresInSeconds: number
}

function Dashboard() {
  const { user } = useUser()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [protectedData, setProtectedData] = useState<ProtectedData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [tokenData, setTokenData] = useState<TokenResponse | null>(null)
  const [tokenLoading, setTokenLoading] = useState(false)
  const [tokenError, setTokenError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

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

  async function generateLongLivedToken() {
    setTokenLoading(true)
    setTokenError(null)
    setCopied(false)
    try {
      const response = await apiClient.post('/api/protected/generate-long-lived-token')
      if (response.data.error) {
        setTokenError(response.data.error)
      } else {
        setTokenData(response.data)
      }
    } catch (err) {
      setTokenError(err instanceof Error ? err.message : 'Failed to generate token')
    } finally {
      setTokenLoading(false)
    }
  }

  function getCurlCommand(jwt: string) {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080'
    return `curl -X GET "${apiUrl}/api/protected/user" \\
  -H "Authorization: Bearer ${jwt}"`
  }

  async function copyToClipboard(text: string) {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

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

        <div className="card">
          <h2>Long-Lived Token</h2>
          <p className="hint">Generate a token that expires in 1 month</p>
          <button
            onClick={generateLongLivedToken}
            disabled={tokenLoading}
            style={{
              padding: '10px 20px',
              marginTop: '10px',
              cursor: tokenLoading ? 'not-allowed' : 'pointer',
            }}
          >
            {tokenLoading ? 'Generating...' : 'Generate Token'}
          </button>
          {tokenError && (
            <p style={{ color: 'red', marginTop: '10px' }}>{tokenError}</p>
          )}
          {tokenData && (
            <>
              <pre style={{ marginTop: '10px', wordBreak: 'break-all', whiteSpace: 'pre-wrap' }}>
                {JSON.stringify(tokenData, null, 2)}
              </pre>
              <div style={{ marginTop: '20px' }}>
                <h3 style={{ marginBottom: '10px' }}>Test with curl:</h3>
                <pre style={{
                  background: '#1a1a2e',
                  color: '#eee',
                  padding: '15px',
                  borderRadius: '8px',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                  fontSize: '13px',
                }}>
                  {getCurlCommand(tokenData.jwt)}
                </pre>
                <button
                  onClick={() => copyToClipboard(getCurlCommand(tokenData.jwt))}
                  style={{
                    marginTop: '10px',
                    padding: '8px 16px',
                    cursor: 'pointer',
                  }}
                >
                  {copied ? 'Copied!' : 'Copy curl command'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
