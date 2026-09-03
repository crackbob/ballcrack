import Module from "../../Module";
import NeverLoseGUI from "./neverlose-gui/NeverLoseGUI";
import neverloseCss from "./styles/neverlose-gui.css";

export default class NeverLoseGUIModule extends Module {
    constructor() {
        super("NeverLose GUI", "visual", true);
        this.gui = null;
    }

    onEnable() {
        // Load CSS
        const style = document.createElement('style');
        style.textContent = neverloseCss;
        document.head.appendChild(style);

        // Initialize GUI
        this.gui = new NeverLoseGUI();

        // Create example windows
        this.createExampleWindows();
    }

    createExampleWindows() {
        // Settings Window
        const settingsWindow = this.gui.createWindow('Settings', 'visual');
        settingsWindow.addToggle('Enable GUI', true, (val) => console.log('GUI Enabled:', val));
        settingsWindow.addCombobox('Theme', ['Dark', 'Light'], 0, (val) => {
            this.gui.setTheme(val === 'Light' ? 'light' : 'dark');
        });
        settingsWindow.addColorPicker('Accent Color', '#00d4ff', (color) => {
            this.gui.setAccentColor(color);
        });
        settingsWindow.addSlider('Scale', 0.5, 2, 1, (val) => {
            this.gui.setScale(parseFloat(val));
        });
        settingsWindow.addSlider('Opacity', 0.3, 1, 0.95, (val) => {
            this.gui.settings.opacity = parseFloat(val);
        });

        // Render Window
        const renderWindow = this.gui.createWindow('Render', 'visual');
        renderWindow.addToggle('ESP', false, (val) => console.log('ESP:', val));
        renderWindow.addToggle('Tracers', false, (val) => console.log('Tracers:', val));
        renderWindow.addToggle('Box ESP', false, (val) => console.log('Box ESP:', val));
        renderWindow.addToggle('Skeleton', false, (val) => console.log('Skeleton:', val));
        renderWindow.addCombobox('ESP Type', ['Box', 'Skeleton', 'Both'], 0, (val) => console.log('ESP Type:', val));

        // Combat Window
        const combatWindow = this.gui.createWindow('Combat', 'combat');
        combatWindow.addToggle('Aimbot', false, (val) => console.log('Aimbot:', val));
        combatWindow.addSlider('FOV', 0, 180, 90, (val) => console.log('FOV:', val));
        combatWindow.addSlider('Smooth', 0, 100, 50, (val) => console.log('Smooth:', val));
        combatWindow.addCombobox('Bone', ['Head', 'Chest', 'Pelvis'], 0, (val) => console.log('Bone:', val));
        combatWindow.addToggle('Predict', true, (val) => console.log('Predict:', val));

        // Misc Window
        const miscWindow = this.gui.createWindow('Misc', 'misc');
        miscWindow.addToggle('Auto Clicker', false, (val) => console.log('Auto Clicker:', val));
        miscWindow.addToggle('Chat Spam', false, (val) => console.log('Chat Spam:', val));
        miscWindow.addButton('Teleport Home', () => console.log('Teleport Home'));
        miscWindow.addButton('Drop Items', () => console.log('Drop Items'));
    }

    onDisable() {
        if (this.gui && this.gui.container) {
            this.gui.container.remove();
        }
    }
}
