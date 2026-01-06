import {definePlugin, type Tool} from 'sanity'
import {RocketIcon} from '@sanity/icons'
import {useState, useCallback} from 'react'

type DeployStatus = 'idle' | 'deploying' | 'success' | 'error'

function DeployTool() {
  const [status, setStatus] = useState<DeployStatus>('idle')
  const [message, setMessage] = useState('')

  const triggerDeploy = useCallback(async () => {
    const buildHookUrl = process.env.SANITY_STUDIO_VERCEL_DEPLOY_HOOK

    if (!buildHookUrl) {
      setStatus('error')
      setMessage('Deploy hook URL not configured. Add SANITY_STUDIO_VERCEL_DEPLOY_HOOK to your environment variables.')
      return
    }

    setStatus('deploying')
    setMessage('Triggering deploy...')

    try {
      const response = await fetch(buildHookUrl, {
        method: 'POST',
      })

      if (response.ok) {
        setStatus('success')
        setMessage('Deploy triggered successfully! Your site will be updated in a few minutes.')
        setTimeout(() => {
          setStatus('idle')
          setMessage('')
        }, 10000)
      } else {
        throw new Error(`Failed to trigger deploy: ${response.statusText}`)
      }
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : 'Failed to trigger deploy')
    }
  }, [])

  const buttonStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    fontSize: '14px',
    fontWeight: 500,
    color: '#fff',
    backgroundColor: status === 'deploying' ? '#666' : '#2563eb',
    border: 'none',
    borderRadius: '6px',
    cursor: status === 'deploying' ? 'not-allowed' : 'pointer',
    opacity: status === 'deploying' ? 0.7 : 1,
  }

  const messageStyle: React.CSSProperties = {
    marginTop: '16px',
    padding: '12px 16px',
    borderRadius: '6px',
    fontSize: '14px',
    backgroundColor:
      status === 'error' ? '#fef2f2' : status === 'success' ? '#f0fdf4' : '#eff6ff',
    color: status === 'error' ? '#dc2626' : status === 'success' ? '#16a34a' : '#2563eb',
    border: `1px solid ${
      status === 'error' ? '#fecaca' : status === 'success' ? '#bbf7d0' : '#bfdbfe'
    }`,
  }

  return (
    <div style={{padding: '24px', maxWidth: '500px'}}>
      <h2 style={{fontSize: '18px', fontWeight: 600, marginBottom: '8px'}}>Deploy to Vercel</h2>
      <p style={{fontSize: '14px', color: '#666', marginBottom: '20px'}}>
        Click the button below to publish your latest changes to the live site.
      </p>

      <button onClick={triggerDeploy} disabled={status === 'deploying'} style={buttonStyle}>
        <RocketIcon />
        {status === 'deploying' ? 'Deploying...' : 'Deploy Now'}
      </button>

      {message && <div style={messageStyle}>{message}</div>}

      <p style={{marginTop: '20px', fontSize: '13px', color: '#888'}}>
        Note: Deploys typically take 1-2 minutes to complete. You can continue editing while the
        site builds.
      </p>
    </div>
  )
}

export const vercelDeployPlugin = definePlugin({
  name: 'vercel-deploy',
  tools: [
    {
      name: 'deploy',
      title: 'Deploy',
      icon: RocketIcon,
      component: DeployTool,
    } as Tool,
  ],
})