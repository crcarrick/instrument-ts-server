import tsModule from 'typescript/lib/tsserverlibrary'

/** Log to the TS Server log */
function log(info: ts.server.PluginCreateInfo, message: string) {
  info.project.projectService.logger.info(`[Instrument TS Server] ${message}`)
}

export default function init({
  typescript: ts,
}: {
  typescript: typeof tsModule
}) {
  return {
    create(info: ts.server.PluginCreateInfo): ts.LanguageService {
      log(info, 'tsserver plugin create start')

      if (info.project.projectKind !== ts.server.ProjectKind.Configured) {
        return info.languageService
      }

      // @ts-expect-error
      const originalEventHandler = info.project.projectService.eventHandler

      let loadingStartedAt: number | null = Date.now()

      const projectEventHandler: ts.server.ProjectServiceEventHandler = (
        event,
      ) => {
        return originalEventHandler(event)
      }

      // @ts-expect-error
      info.project.projectService.eventHandler = projectEventHandler

      log(info, 'tsserver plugin create finish')

      return info.languageService
    },
  }
}

// switch (event.eventName) {
//   case ts.server.ProjectLoadingStartEvent:
//     // These events are triggered on all projects, but we only want to
//     // handle the events for this project.
//     if (
//       event.data.project.getProjectName() ===
//       info.project.getProjectName()
//     ) {
//       loadingStartedAt = Date.now()
//     }
//     break

//   case ts.server.ProjectLoadingFinishEvent:
//     if (
//       loadingStartedAt &&
//       // These events are triggered on all projects, but we only want to
//       // handle the events for this project.
//       event.data.project.getProjectName() ===
//         info.project.getProjectName()
//     ) {
//       const duration = Date.now() - loadingStartedAt

//       loadingStartedAt = null

//       log(info, `${event.data.project.getProjectName()} ${duration}`)
//     }
//     break

//   default: // We don't care about other events here, so do nothing
// }
