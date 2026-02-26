import { useRef, useEffect } from 'react'
import { useNavigation } from 'react-router'
import LoadingBar, { type LoadingBarRef } from 'react-top-loading-bar'

export default function TopLoadingBar() {
  const ref = useRef<LoadingBarRef>(null)
  const navigation = useNavigation()

  useEffect(() => {
    if (navigation.state === 'loading' || navigation.state === 'submitting') {
      ref.current?.continuousStart()
    } else {
      ref.current?.complete()
    }
  }, [navigation.state])

  return <LoadingBar color="var(--primary)" ref={ref} shadow={true} height={2} />
}
