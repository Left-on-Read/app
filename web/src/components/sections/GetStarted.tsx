/** @jsx jsx */
import { jsx } from '@emotion/core'

import { Navbar } from '../Navbar'
import Button from '../Button'
import { belowBreakpoint } from '../../theme'
import { Gradient } from '../Gradient'
import { DefaultContentContainer } from '../DefaultContentContainer'
import { Text } from '../Text'

const DISPLAY_TEXT = 'What can you learn from your texts?'
const DESCRIPTION_TEXT =
  'Trillions of text messages are sent every day. Learn about yourself with Left on Read, a free text message analyzer built on open source for Mac Desktop.'

export function GetStarted({
  ctaRef,
}: {
  ctaRef: React.RefObject<HTMLDivElement>
}) {
  const handleGetStarted = () => {
    if (ctaRef.current) {
      ctaRef.current?.scrollIntoView()
    }
  }

  return (
    <DefaultContentContainer>
      <div
        css={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Gradient />
        <Navbar />
        <div
          css={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            [belowBreakpoint.sm]: {
              alignItems: 'center',
            },
          }}
        >
          <div
            css={{
              width: '60%',
              [belowBreakpoint.md]: {
                width: '80%',
              },
              [belowBreakpoint.sm]: {
                width: '100%',
              },
            }}
          >
            <Text type="display">{DISPLAY_TEXT}</Text>
            <Text type="paragraph">{DESCRIPTION_TEXT}</Text>
            <Button
              label="Download →"
              css={{
                marginTop: '64px',
                [belowBreakpoint.sm]: { marginTop: '32px' },
              }}
              onClick={handleGetStarted}
            />
          </div>
        </div>
      </div>
    </DefaultContentContainer>
  )
}
