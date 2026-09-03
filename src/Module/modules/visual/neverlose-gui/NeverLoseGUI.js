import events from "../../../events";
import shadowWrapper from "../../../shadowWrapper";

export default class NeverLoseGUI {
    constructor() {
        this.enabled = true;
        this.container = null;
        this.windows = new Map();
        this.settings = {
            theme: 'dark',
            accentColor: '#00d4ff',
            scale: 1,
            opacity: 0.95,
            hideKey: 'INSERT',
            animations: true
        };
        this.draggingWindow = null;
        this.resizingWindow = null;
        this.init();
    }

    init() {
        this.createContainer();
        this.setupEventListeners();
    }

    createContainer() {
        this.container = document.createElement('div');
        this.container.id = 'neverlose-gui-container';
        this.container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 999999;
        `;
        shadowWrapper.wrapper.appendChild(this.container);
    }

    createWindow(title, category = 'misc') {
        const window = new NeverLoseWindow(title, category, this);
        this.windows.set(title, window);
        this.container.appendChild(window.element);
        return window;
    }

    setupEventListeners() {
        events.on('keydown', (key) => {
            if (key === this.settings.hideKey) {
                this.toggle();
            }
        });
    }

    toggle() {
        this.enabled = !this.enabled;
        this.container.style.display = this.enabled ? 'block' : 'none';
    }

    setTheme(theme) {
        this.settings.theme = theme;
        this.windows.forEach(window => window.updateTheme());
    }

    setAccentColor(color) {
        this.settings.accentColor = color;
        this.windows.forEach(window => window.updateTheme());
    }

    setScale(scale) {
        this.settings.scale = Math.max(0.5, Math.min(2, scale));
        this.container.style.transform = `scale(${this.settings.scale})`;
        this.container.style.transformOrigin = 'top left';
    }
}

class NeverLoseWindow {
    constructor(title, category, gui) {
        this.title = title;
        this.category = category;
        this.gui = gui;
        this.elements = [];
        this.position = { x: Math.random() * 300, y: Math.random() * 300 };
        this.size = { width: 250, height: 300 };
        this.collapsed = false;
        this.element = this.createWindow();
    }

    createWindow() {
        const window = document.createElement('div');
        window.className = 'neverlose-window';
        window.style.cssText = `
            position: fixed;
            left: ${this.position.x}px;
            top: ${this.position.y}px;
            width: ${this.size.width}px;
            min-height: 30px;
            background: ${this.gui.settings.theme === 'dark' ? '#1a1a1a' : '#ffffff'};
            border: 1px solid ${this.gui.settings.accentColor};
            border-radius: 4px;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
            font-family: 'Inter', sans-serif;
            color: ${this.gui.settings.theme === 'dark' ? '#ffffff' : '#000000'};
            pointer-events: auto;
            user-select: none;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            z-index: 1000;
        `;

        // Header
        const header = document.createElement('div');
        header.style.cssText = `
            padding: 8px 12px;
            background: ${this.gui.settings.accentColor}20;
            border-bottom: 1px solid ${this.gui.settings.accentColor}40;
            cursor: move;
            display: flex;
            justify-content: space-between;
            align-items: center;
            transition: all 0.2s ease;
        `;

        const titleText = document.createElement('span');
        titleText.textContent = this.title;
        titleText.style.cssText = `
            font-weight: 600;
            font-size: 12px;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            color: ${this.gui.settings.accentColor};
        `;

        const controls = document.createElement('div');
        controls.style.cssText = `
            display: flex;
            gap: 4px;
        `;

        // Collapse button
        const collapseBtn = this.createButton('−');
        collapseBtn.addEventListener('click', () => this.toggleCollapse());

        // Close button
        const closeBtn = this.createButton('×');
        closeBtn.addEventListener('click', () => this.close());

        controls.appendChild(collapseBtn);
        controls.appendChild(closeBtn);

        header.appendChild(titleText);
        header.appendChild(controls);

        // Content
        const content = document.createElement('div');
        content.className = 'neverlose-window-content';
        content.style.cssText = `
            padding: 8px;
            flex: 1;
            overflow-y: auto;
            overflow-x: hidden;
            max-height: ${this.size.height - 35}px;
        `;
        content.id = `content-${this.title}`;

        window.appendChild(header);
        window.appendChild(content);

        // Drag functionality
        this.setupDrag(window, header);
        // Resize functionality
        this.setupResize(window);

        return window;
    }

    createButton(label) {
        const btn = document.createElement('button');
        btn.textContent = label;
        btn.style.cssText = `
            background: transparent;
            border: 1px solid ${this.gui.settings.accentColor}40;
            color: ${this.gui.settings.accentColor};
            padding: 2px 6px;
            cursor: pointer;
            font-size: 12px;
            border-radius: 2px;
            transition: all 0.15s ease;
            font-weight: bold;
        `;
        btn.addEventListener('mouseenter', () => {
            btn.style.background = this.gui.settings.accentColor + '20';
            btn.style.borderColor = this.gui.settings.accentColor;
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.background = 'transparent';
            btn.style.borderColor = this.gui.settings.accentColor + '40';
        });
        return btn;
    }

    setupDrag(window, header) {
        let isMouseDown = false;
        let offset = { x: 0, y: 0 };

        header.addEventListener('mousedown', (e) => {
            isMouseDown = true;
            offset.x = e.clientX - window.offsetLeft;
            offset.y = e.clientY - window.offsetTop;
            window.style.zIndex = '10000';
        });

        document.addEventListener('mousemove', (e) => {
            if (!isMouseDown) return;
            window.style.left = (e.clientX - offset.x) + 'px';
            window.style.top = (e.clientY - offset.y) + 'px';
        });

        document.addEventListener('mouseup', () => {
            isMouseDown = false;
        });
    }

    setupResize(window) {
        const resizeHandle = document.createElement('div');
        resizeHandle.style.cssText = `
            position: absolute;
            bottom: 0;
            right: 0;
            width: 12px;
            height: 12px;
            background: ${this.gui.settings.accentColor}40;
            cursor: nwse-resize;
            border-radius: 0 0 4px 0;
        `;

        window.style.position = 'relative';
        window.appendChild(resizeHandle);

        let isResizing = false;
        let startX, startY, startWidth, startHeight;

        resizeHandle.addEventListener('mousedown', (e) => {
            isResizing = true;
            startX = e.clientX;
            startY = e.clientY;
            startWidth = window.offsetWidth;
            startHeight = window.offsetHeight;
        });

        document.addEventListener('mousemove', (e) => {
            if (!isResizing) return;
            const newWidth = Math.max(150, startWidth + (e.clientX - startX));
            const newHeight = Math.max(100, startHeight + (e.clientY - startY));
            window.style.width = newWidth + 'px';
            window.style.height = newHeight + 'px';
        });

        document.addEventListener('mouseup', () => {
            isResizing = false;
        });
    }

    addElement(element) {
        const content = this.element.querySelector('.neverlose-window-content');
        content.appendChild(element);
        this.elements.push(element);
    }

    addToggle(label, defaultValue = false, callback) {
        const container = document.createElement('div');
        container.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 6px 0;
            border-bottom: 1px solid ${this.gui.settings.accentColor}15;
        `;

        const labelEl = document.createElement('span');
        labelEl.textContent = label;
        labelEl.style.cssText = `
            font-size: 11px;
            color: ${this.gui.settings.theme === 'dark' ? '#aaa' : '#666'};
        `;

        const toggle = document.createElement('input');
        toggle.type = 'checkbox';
        toggle.checked = defaultValue;
        toggle.style.cssText = `
            cursor: pointer;
            accent-color: ${this.gui.settings.accentColor};
        `;
        toggle.addEventListener('change', () => callback(toggle.checked));

        container.appendChild(labelEl);
        container.appendChild(toggle);
        this.addElement(container);
        return toggle;
    }

    addSlider(label, min, max, defaultValue = 50, callback) {
        const container = document.createElement('div');
        container.style.cssText = `
            padding: 6px 0;
            border-bottom: 1px solid ${this.gui.settings.accentColor}15;
        `;

        const labelEl = document.createElement('div');
        labelEl.style.cssText = `
            font-size: 11px;
            color: ${this.gui.settings.theme === 'dark' ? '#aaa' : '#666'};
            margin-bottom: 4px;
            display: flex;
            justify-content: space-between;
        `;
        labelEl.innerHTML = `<span>${label}</span><span id="value-${label}">${defaultValue}</span>`;

        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = min;
        slider.max = max;
        slider.value = defaultValue;
        slider.style.cssText = `
            width: 100%;
            cursor: pointer;
            accent-color: ${this.gui.settings.accentColor};
        `;
        slider.addEventListener('input', (e) => {
            labelEl.querySelector(`#value-${label}`).textContent = e.target.value;
            callback(e.target.value);
        });

        container.appendChild(labelEl);
        container.appendChild(slider);
        this.addElement(container);
        return slider;
    }

    addButton(label, callback) {
        const btn = document.createElement('button');
        btn.textContent = label;
        btn.style.cssText = `
            width: 100%;
            padding: 6px;
            margin: 4px 0;
            background: ${this.gui.settings.accentColor}20;
            border: 1px solid ${this.gui.settings.accentColor}40;
            color: ${this.gui.settings.accentColor};
            border-radius: 3px;
            cursor: pointer;
            font-size: 11px;
            font-weight: 600;
            transition: all 0.15s ease;
        `;
        btn.addEventListener('mouseenter', () => {
            btn.style.background = this.gui.settings.accentColor + '40';
            btn.style.borderColor = this.gui.settings.accentColor;
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.background = this.gui.settings.accentColor + '20';
            btn.style.borderColor = this.gui.settings.accentColor + '40';
        });
        btn.addEventListener('click', callback);
        this.addElement(btn);
        return btn;
    }

    addColorPicker(label, defaultColor = '#00d4ff', callback) {
        const container = document.createElement('div');
        container.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 6px 0;
            border-bottom: 1px solid ${this.gui.settings.accentColor}15;
        `;

        const labelEl = document.createElement('span');
        labelEl.textContent = label;
        labelEl.style.cssText = `
            font-size: 11px;
            color: ${this.gui.settings.theme === 'dark' ? '#aaa' : '#666'};
        `;

        const colorInput = document.createElement('input');
        colorInput.type = 'color';
        colorInput.value = defaultColor;
        colorInput.style.cssText = `
            cursor: pointer;
            width: 30px;
            height: 20px;
            border: 1px solid ${this.gui.settings.accentColor};
            border-radius: 2px;
        `;
        colorInput.addEventListener('change', () => callback(colorInput.value));

        container.appendChild(labelEl);
        container.appendChild(colorInput);
        this.addElement(container);
        return colorInput;
    }

    addCombobox(label, options, defaultValue = 0, callback) {
        const container = document.createElement('div');
        container.style.cssText = `
            padding: 6px 0;
            border-bottom: 1px solid ${this.gui.settings.accentColor}15;
        `;

        const labelEl = document.createElement('div');
        labelEl.textContent = label;
        labelEl.style.cssText = `
            font-size: 11px;
            color: ${this.gui.settings.theme === 'dark' ? '#aaa' : '#666'};
            margin-bottom: 4px;
        `;

        const select = document.createElement('select');
        select.style.cssText = `
            width: 100%;
            padding: 4px;
            background: ${this.gui.settings.theme === 'dark' ? '#2a2a2a' : '#f0f0f0'};
            color: ${this.gui.settings.theme === 'dark' ? '#fff' : '#000'};
            border: 1px solid ${this.gui.settings.accentColor}40;
            border-radius: 2px;
            cursor: pointer;
            font-size: 11px;
        `;

        options.forEach((opt, idx) => {
            const option = document.createElement('option');
            option.value = idx;
            option.textContent = opt;
            if (idx === defaultValue) option.selected = true;
            select.appendChild(option);
        });

        select.addEventListener('change', (e) => callback(options[e.target.value]));

        container.appendChild(labelEl);
        container.appendChild(select);
        this.addElement(container);
        return select;
    }

    toggleCollapse() {
        this.collapsed = !this.collapsed;
        const content = this.element.querySelector('.neverlose-window-content');
        if (this.collapsed) {
            content.style.display = 'none';
            this.element.style.height = '30px';
        } else {
            content.style.display = 'block';
            this.element.style.height = this.size.height + 'px';
        }
    }

    close() {
        this.element.remove();
        this.gui.windows.delete(this.title);
    }

    updateTheme() {
        // Update theme styling
        this.element.style.background = this.gui.settings.theme === 'dark' ? '#1a1a1a' : '#ffffff';
        this.element.style.color = this.gui.settings.theme === 'dark' ? '#ffffff' : '#000000';
    }
}
