export function wazeUrl(location: string): string {
  return `https://waze.com/ul?q=${encodeURIComponent(location)}&navigate=yes`;
}
