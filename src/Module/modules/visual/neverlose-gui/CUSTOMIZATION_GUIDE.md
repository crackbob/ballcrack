# Neverlose GUI - Руководство по кастомизации

## Основные свойства

### Цвета
```javascript
theme: 'dark' | 'light'        // Тема оформления
accentColor: '#00d4ff'          // Основной цвет акцента
```

### Размеры и масштабирование
```javascript
scale: 1                        // Масштаб интерфейса (0.5 - 2.0)
opacity: 0.95                   // Прозрачность окна
```

### Управление
```javascript
hideKey: 'INSERT'               // Клавиша для показа/скрытия GUI
animations: true                // Анимации переходов
```

## Создание окна

```javascript
const window = gui.createWindow('Title', 'category');
```

## Элементы окна

### Toggle (Переключатель)
```javascript
window.addToggle('Label', false, (value) => {
    console.log('Toggled:', value);
});
```

### Slider (Ползунок)
```javascript
window.addSlider('Label', 0, 100, 50, (value) => {
    console.log('Value:', value);
});
```

### Button (Кнопка)
```javascript
window.addButton('Click Me', () => {
    console.log('Clicked!');
});
```

### Color Picker (Выбор цвета)
```javascript
window.addColorPicker('Color', '#00d4ff', (color) => {
    console.log('Color:', color);
});
```

### Combobox (Выпадающий список)
```javascript
window.addCombobox('Option', ['Choice 1', 'Choice 2'], 0, (value) => {
    console.log('Selected:', value);
});
```

## Кастомизация стилей

### Изменение цвета акцента
```javascript
gui.setAccentColor('#FF0000');
```

### Изменение темы
```javascript
gui.setTheme('light');  // или 'dark'
```

### Масштабирование
```javascript
gui.setScale(1.5);      // 150% размер
```

## Продвинутая кастомизация

### Добавление своего стиля
```javascript
const style = document.createElement('style');
style.textContent = `
    .neverlose-window {
        box-shadow: 0 0 40px rgba(0, 212, 255, 0.3);
    }
`;
shadowWrapper.wrapper.appendChild(style);
```

### Работа с данными окна
```javascript
const window = gui.windows.get('Title');
window.position = { x: 100, y: 100 };
window.size = { width: 300, height: 400 };
```

## Примеры использования

### Простое окно с настройками
```javascript
const settingsWnd = gui.createWindow('Settings', 'visual');
settingsWnd.addToggle('Enable', true, (val) => {});
settingsWnd.addSlider('Scale', 0, 100, 50, (val) => {});
settingsWnd.addButton('Save', () => console.log('Saved'));
```

### Окно с категориями
```javascript
const espWindow = gui.createWindow('ESP', 'render');
espWindow.addToggle('Players', false, (val) => {});
espWindow.addToggle('Items', false, (val) => {});
espWindow.addToggle('Buildings', false, (val) => {});
espWindow.addCombobox('Style', ['Box', 'Skeleton', '3D'], 0, (val) => {});
```

## Горячие клавиши

| Клавиша | Действие |
|---------|----------|
| INSERT  | Показать/Скрыть GUI |
| Drag    | Перемещение окна |
| Resize  | Изменение размера окна (за угол) |

## CSS Переменные

Можно использовать в собственных стилях:
```css
:root {
    --accent-color: #00d4ff;
    --bg-dark: #1a1a1a;
    --bg-light: #ffffff;
}
```
