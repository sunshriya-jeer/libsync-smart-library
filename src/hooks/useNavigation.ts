import { useLocation } from 'react-router-dom'

export function useCurrentRoute() {
  const location = useLocation()

  const getPageTitle = (): string => {
    switch (location.pathname) {
      case '/':
        return 'Dashboard'
      case '/students':
        return 'Student Directory'
      case '/seats':
        return 'Real-Time Seat Management'
      case '/scanner':
        return 'Scan Station'
      case '/sessions':
        return 'Active Sessions'
      case '/reports':
        return 'Analytics & Reports'
      case '/settings':
        return 'System Settings'
      default:
        return 'Library OS'
    }
  }

  const isActive = (path: string): boolean => {
    if (path === '/' && location.pathname !== '/') return false
    return location.pathname.startsWith(path)
  }

  return {
    pathname: location.pathname,
    pageTitle: getPageTitle(),
    isActive,
  }
}
