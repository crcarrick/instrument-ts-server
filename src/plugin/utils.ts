export interface ExtensionConfigUpdate {
  scriptPath: string
}

export function isExtensionConfigUpdate(
  config: unknown,
): config is ExtensionConfigUpdate {
  return typeof config === 'object' && config !== null && 'scriptPath' in config
}
