import Module from '../../Module.js';
import moduleManager from '../../moduleManager.js';
import events from '../../../events.js';
import Panel from './components/Panel.js';
import colorUtils from '../../../utils/colorUtils.js';
import shadowWrapper from '../../../shadowWrapper.js';

export default class ClickGUI extends Module {
    constructor() {
        super(ClickGUI, 'Visual', {
            // Цветовая палитра Neverlose
            'Accent Color 1': '#00bfff',
            'Accent Color 2': '#0055ff',
            'Background Color': 'rgba(8, 10, 16, 0.95)',
            'Panel Color': 'rgba(13, 17, 23, 0.90)',
            'Header Color': 'rgba(18, 24, 33, 0.95)',
            'Button Color': 'rgba(23, 30, 42, 0.8)',
            'Hover Color': 'rgba(32, 42, 59, 0.9)',
            'Text Color': '#e6f2ff',
            'Text Muted': '#5a687d',
            'Border Color': 'rgba(0, 191, 255, 0.2)',
            
            // Настройки кастомизации эффектов
            'Glow Alpha': 0.6,
            'Glow Blur Radius': '12px',
            'Border Radius': '8px',
            'Blur Strength': '10px',
            'Header Height': '40px',
            'Scale Factor': 1.0,
            
            // Переключатели
            'Enable Animations': true,
            'Enable Glow': true,
            'Enable Blur Background': true,
            'Custom Font': 'Inter'
        }, 'ShiftRight');

        this.GUILoaded = false;
        this.panels = [];
        this.blurredBackground = null;
        this.updateColors();
    }

    updateAnimations() {
        const wrapper = shadowWrapper.wrapper;
        if (this.options['Enable Animations']) {
            wrapper.classList.add('nl-animations');
        } else {
            wrapper.classList.remove('nl-animations');
        }
    }

    updateColors() {
        const wrapper = shadowWrapper.wrapper;
        const opts = this.options;

        // Генерация градиентов в стиле Neverlose
        const accentGradient = `linear-gradient(135deg, ${opts['Accent Color 1']} 0%, ${opts['Accent Color 2']} 100%)`;
        const borderGradient = `linear-gradient(135deg, ${opts['Border Color']} 0%, rgba(0, 0, 0, 0) 100%)`;
        const glowRGBA = colorUtils.hexToRGBA(opts['Accent Color 1'], parseFloat(opts['Glow Alpha']), 1.2);

        // Установка CSS переменных
        wrapper.style.setProperty('--nl-accent-gradient', accentGradient);
        wrapper.style.setProperty('--nl-accent-1', opts['Accent Color 1']);
        wrapper.style.setProperty('--nl-accent-2', opts['Accent Color 2']);
        wrapper.style.setProperty('--nl-bg-color', opts['Background Color']);
        wrapper.style.setProperty('--nl-panel-bg', opts['Panel Color']);
        wrapper.style.setProperty('--nl-header-bg', opts['Header Color']);
        wrapper.style.setProperty('--nl-button-bg', opts['Button Color']);
        wrapper.style.setProperty('--nl-hover-bg', opts['Hover Color']);
        wrapper.style.setProperty('--nl-text-color', opts['Text Color']);
        wrapper.style.setProperty('--nl-text-muted', opts['Text Muted']);
        wrapper.style.setProperty('--nl-border-color', opts['Border Color']);
        wrapper.style.setProperty('--nl-glow-color', glowRGBA);
        
        // Переменные геометрии и эффектов
        wrapper.style.setProperty('--nl-glow-blur', opts['Glow Blur Radius']);
        wrapper.style.setProperty('--nl-border-radius', opts['Border Radius']);
        wrapper.style.setProperty('--nl-blur-strength', opts['Blur Strength']);
        wrapper.style.setProperty('--nl-header-height', opts['Header Height']);
        wrapper.style.setProperty('--nl-scale', opts['Scale Factor']);
        wrapper.style.setProperty('--nl-font-family', `'${opts['Custom Font']}', 'Segoe UI', sans-serif`);

        // Состояние размытия заднего фона
        if (this.blurredBackground) {
            this.blurredBackground.style.backdropFilter = opts['Enable Blur Background'] 
                ? `blur(${opts['Blur Strength']})` 
                : 'none';
        }
    }

    onEnable() {
        if (document.pointerLockElement) {
            document.exitPointerLock();
        }

        if (!this.GUILoaded) {
            this.setupBackground();
            this.createPanels();
            this.setupEventListeners();
            this.GUILoaded = true;
        }

        this.showGUI();
        this.updateColors();
        this.updateAnimations();
    }

    setupBackground() {
        this.blurredBackground = document.createElement('div');
        this.blurredBackground.className = 'nl-gui-background';
        shadowWrapper.wrapper.appendChild(this.blurredBackground);
    }

    createPanels() {
        const panelConfigs = [
            { title: 'Combat', position: { top: '80px', left: '80px' } },
            { title: 'Movement', position: { top: '80px', left: '320px' } },
            { title: 'Visual', position: { top: '80px', left: '560px' } },
            { title: 'World', position: { top: '80px', left: '800px' } },
            { title: 'Misc', position: { top: '80px', left: '1040px' } },
        ];

        // Очистка старых панелей
        this.panels.forEach(panel => {
            if (panel.panel && panel.panel.parentNode) {
                panel.panel.parentNode.removeChild(panel.panel);
            }
        });
        this.panels = [];

        // Инициализация новых панелей
        panelConfigs.forEach(config => {
            const panel = new Panel(config.title, config.position);
            this.panels.push(panel);
        });

        // Группировка модулей по категориям
        const modulesByCategory = {};
        Object.values(moduleManager.modules).forEach(module => {
            if (!modulesByCategory[module.category]) {
                modulesByCategory[module.category] = [];
            }
            modulesByCategory[module.category].push(module);
        });

        // Сортировка и добавление элементов на панели
        Object.entries(modulesByCategory).forEach(([category, modules]) => {
            const panel = this.panels.find(p => p.header && p.header.textContent === category);
            if (!panel) return;

            const measure = document.createElement('span');
            measure.style.visibility = 'hidden';
            measure.style.position = absolute;
            measure.style.font = `14px '${this.options['Custom Font']}', sans-serif`;
            shadowWrapper.wrapper.appendChild(measure);

            // Сортировка модулей по ширине названия
            modules.sort((a, b) => {
                measure.textContent = a.name;
                const widthA = measure.getBoundingClientRect().width;
                measure.textContent = b.name;
                const widthB = measure.getBoundingClientRect().width;
                return widthB - widthA;
            });

            measure.remove();
            modules.forEach(module => panel.addButton(module));
        });
    }

    setupEventListeners() {
        events.on('module.update', (module) => {
            const panel = this.panels.find(p => p.header && p.header.textContent === module.category);
            if (!panel) return;
            
            const button = panel.buttons.find(btn => btn.textContent === module.name);
            if (button) {
                button.classList.toggle('enabled', module.isEnabled);
            }
        });
    }

    showGUI() {
        this.panels.forEach(panel => panel.show());
        if (this.blurredBackground) {
            this.blurredBackground.style.display = 'block';
        }
    }

    returnToGame() {
        // Логика возврата фокуса в игру при закрытии меню
    }

    onDisable() {
        this.panels.forEach(panel => panel.hide());
        if (this.blurredBackground) {
            this.blurredBackground.style.display = 'none';
        }
        this.returnToGame();
    }

    onSettingUpdate() {
        this.updateColors();
        this.updateAnimations();
    }
}
