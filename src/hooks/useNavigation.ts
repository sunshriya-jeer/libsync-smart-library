import { useLocation } from 'react-router-dom'

export function useCurrentRoute() {
  const location = useLocation()

  const getPageTitle = (): string => {
    switch (location.pathname) {
      case '/':
        return 'Dashboard'
      case '/students':
        return 'Students'
      case '/seats':
        return 'Seats Management'
      case '/scanner':
        return 'Library Scanner'
      case '/sessions':
        return 'Sessions'
      case '/reports':
        return 'Reports & Analytics'
      case '/settings':
        return 'Settings'
      case '/student':
        return 'Student Home'
      case '/student/scan':
        return 'Student QR Pass'
      case '/student/seat':
        return 'Seat Assignment'
      case '/student/history':
        return 'Visit History'
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
