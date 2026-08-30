export const shouldRedirectProductCreate = (pathname: string) =>
  /\/products\/create\/?$/.test(pathname)
