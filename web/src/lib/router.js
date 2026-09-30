import { useEffect, useState } from 'react'

// Tiny hash router: #/dashboard, #/calls/0482, ... No dependency needed for a demo.
export function useRoute() {
  const read = () => window.location.hash.replace(/^#\/?/, '') || 'dashboard'
  const [route, setRoute] = useState(read)
  useEffect(() => {
    const onChange = () => {
      setRoute(read())
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  const [page, ...params] = route.split('/')
  return { page, params }
}

export function go(path) {
  window.location.hash = `/${path}`
}
