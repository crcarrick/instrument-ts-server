import ts_module from "typescript/lib/tsserverlibrary";

/** Log to the TS Server log */
function log(info: ts.server.PluginCreateInfo, message: string) {
  info.project.projectService.logger.info(`[My TS Server Plugin] ${message}`);
}

export default function init({
  typescript: ts,
}: {
  typescript: typeof ts_module;
}) {
  return {
    create(info: ts.server.PluginCreateInfo): ts.LanguageService {
      log(info, "tsserver plugin create start");

      // Configured projects are defined by a configuration file, which can be
      // either tsconfig.json file or a jsconfig.json file. That configuration
      // file marks the project root path and defines what files to include.
      //
      // https://github.com/microsoft/TypeScript/wiki/Standalone-Server-%28tsserver%29#project-system
      //
      // We currently are only interested in information about configured
      // projects here, so if this is one of the other kinds, just bounce early.
      if (info.project.projectKind !== ts.server.ProjectKind.Configured) {
        return info.languageService;
      }

      // We want to subscribe to some events on the project. Unfortunately,
      // there is no public API for this, so we need to override the project's
      // projectService's eventHandler with a pass-through event handler so we
      // can add our logging. This property is marked as private readonly, so
      // we need to ignore TypeScript here so that we can actually override
      // it.
      // @ts-expect-error
      const originalEventHandler = info.project.projectService.eventHandler;

      // The first time a project is opened, the ProjectLoadingStartEvent is
      // emitted before this plugin is created, so we want to start the clock
      // immediately.
      let loadingStartedAt: number | null = Date.now();

      const projectEventHandler: ts.server.ProjectServiceEventHandler = (
        event
      ) => {
        switch (event.eventName) {
          case ts.server.ProjectLoadingStartEvent:
            // These events are triggered on all projects, but we only want to
            // handle the events for this project.
            if (
              event.data.project.getProjectName() ===
              info.project.getProjectName()
            ) {
              loadingStartedAt = Date.now();
            }
            break;

          case ts.server.ProjectLoadingFinishEvent:
            if (
              loadingStartedAt &&
              // These events are triggered on all projects, but we only want to
              // handle the events for this project.
              event.data.project.getProjectName() ===
                info.project.getProjectName()
            ) {
              const duration = Date.now() - loadingStartedAt;

              loadingStartedAt = null;

              log(info, `${event.data.project.getProjectName()} ${duration}`);
            }
            break;

          default: // We don't care about other events here, so do nothing
        }

        // Call the original handler, so we don't break anything
        return originalEventHandler(event);
      };

      // @ts-expect-error
      info.project.projectService.eventHandler = projectEventHandler;

      log(info, "tsserver plugin create finish");

      return info.languageService;
    },
  };
}
