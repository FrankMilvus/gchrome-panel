import Gio from "gi://Gio";
import Meta from "gi://Meta";
import Shell from "gi://Shell";
import { Extension } from "resource:///org/gnome/shell/extensions/extension.js";
import * as Main from "resource:///org/gnome/shell/ui/main.js";

const APP_ID = "google-chrome.desktop";

export default class ToggleAppExtension extends Extension {
    enable() {
        // Use the built-in helper to load settings from your schemas folder
        this._settings = this.getSettings();

        Main.wm.addKeybinding(
            "toggle-app",
            this._settings,
            Meta.KeyBindingFlags.NONE,
            Shell.ActionMode.ALL,
            () => this._toggle()
        );
    }

    disable() {
        Main.wm.removeKeybinding("toggle-app");
        this._settings = null;
    }

    _toggle() {
        const app = Shell.AppSystem.get_default().lookup_app(APP_ID);
        
        if (!app) {
            console.warn(`Toggle App: ${APP_ID} not found.`);
            return;
        }

        const windows = app.get_windows();
        const focused = global.display.focus_window;

        // 1. If not running -> Launch
        if (windows.length === 0) {
            app.activate();
            return;
        }

        // 2. If focused -> Minimize
        if (focused && windows.some(w => w === focused)) {
            focused.minimize();
            return;
        }

        // 3. If running but not focused -> Activate first window
        // We use the last accessed window for a better user experience
        const lastWindow = windows[0]; 
        lastWindow.activate(global.get_current_time());
    }
}