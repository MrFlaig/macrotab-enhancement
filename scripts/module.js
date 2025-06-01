// Left-click: execute macro, not open config
Hooks.on("renderMacroDirectory", (app, html) => {
    for (const li of html.querySelectorAll("li.macro")) {
        li.addEventListener("click", async (event) => {
            if (event.button !== 0) return;
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            const macroId = li.dataset.entryId;
            const macro = game.macros.get(macroId);
            if (macro && macro.testUserPermission(game.user, "OBSERVER")) await macro.execute();
        });
    }
});

class PatchedMacroDirectory extends foundry.applications.sidebar.tabs.MacroDirectory {
    _getEntryContextOptions() {
        const options = super._getEntryContextOptions?.() || [];
        const editEntry = {
            name: "Edit Macro",
            icon: '<i class="fas fa-edit"></i>',
            condition: ctx => {
                const macroId = ctx.dataset.entryId;
                const macro = game.macros.get(macroId);
                return macro && macro.testUserPermission(game.user, "OWNER", { exact: false });
            },
            callback: ctx => {
                const macroId = ctx.dataset.entryId;
                const macro = game.macros.get(macroId);
                if (macro) macro.sheet.render(true);
            }
        };
        options.unshift(editEntry); // <-- This puts it at the top!
        return options;
    }
}
Hooks.once("setup", () => {
    CONFIG.ui.macros = PatchedMacroDirectory;
});
Hooks.once("ready", () => {
    if (ui.macros) ui.macros.render(true);
});
