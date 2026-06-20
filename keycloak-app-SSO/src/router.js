import { useState, useEffect, useCallback } from 'react'

/** Read the current browser path */
export function getCurrentPath() {
  return window.location.pathname || '/'
}

/** Navigate to a path */
export function navigateTo(path) {
  window.history.pushState({}, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

/** Hook: returns [currentPath, navigateFn] */
export function useRouter() {
  const [path, setPath] = useState(getCurrentPath)

  useEffect(() => {
    const handler = () => setPath(getCurrentPath())
    window.addEventListener('popstate', handler)
    return () => window.removeEventListener('popstate', handler)
  }, [])

  return [path, navigateTo]
}

/** Hook: returns just the navigate function */
export function useNavigate() {
  return useCallback(navigateTo, [])
}
