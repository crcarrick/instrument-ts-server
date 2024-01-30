export function isExtensionConfigUpdate(config: unknown): config is {
  scriptPath: string
} {
  return typeof config === 'object' && config !== null && 'scriptPath' in config
}
