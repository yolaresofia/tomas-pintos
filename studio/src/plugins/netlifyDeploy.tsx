import {definePlugin} from 'sanity'
import {RocketIcon} from '@sanity/icons'
import {useState, useCallback} from 'react'
import {Button, Card, Stack, Text, Flex, Spinner, Badge} from '@sanity/ui'

type DeployStatus = 'idle' | 'deploying' | 'success' | 'error'

function DeployTool() {
  const [status, setStatus] = useState<DeployStatus>('idle')
  const [message, setMessage] = useState('')

  const triggerDeploy = useCallback(async () => {
    const buildHookUrl = import.meta.env.SANITY_STUDIO_NETLIFY_BUILD_HOOK

    if (!buildHookUrl) {
      setStatus('error')
      setMessage('Build hook URL not configured. Add SANITY_STUDIO_NETLIFY_BUILD_HOOK to your environment variables.')
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
        // Reset after 10 seconds
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

  return (
    <Card padding={4} style={{height: '100%'}}>
      <Stack space={4}>
        <Text size={2} weight="semibold">
          Deploy to Netlify
        </Text>
        <Text size={1} muted>
          Click the button below to publish your latest changes to the live site.
        </Text>

        <Flex gap={3} align="center">
          <Button
            icon={status === 'deploying' ? Spinner : RocketIcon}
            text={status === 'deploying' ? 'Deploying...' : 'Deploy Now'}
            tone="primary"
            onClick={triggerDeploy}
            disabled={status === 'deploying'}
          />
          {status === 'success' && (
            <Badge tone="positive" fontSize={1}>
              Success
            </Badge>
          )}
          {status === 'error' && (
            <Badge tone="critical" fontSize={1}>
              Error
            </Badge>
          )}
        </Flex>

        {message && (
          <Card
            padding={3}
            radius={2}
            tone={status === 'error' ? 'critical' : status === 'success' ? 'positive' : 'primary'}
          >
            <Text size={1}>{message}</Text>
          </Card>
        )}

        <Card padding={3} radius={2} tone="caution" marginTop={2}>
          <Text size={1} muted>
            Note: Deploys typically take 1-3 minutes to complete. You can continue editing while the site builds.
          </Text>
        </Card>
      </Stack>
    </Card>
  )
}

export const netlifyDeployPlugin = definePlugin({
  name: 'netlify-deploy',
  tools: [
    {
      name: 'deploy',
      title: 'Deploy',
      icon: RocketIcon,
      component: DeployTool,
    },
  ],
})