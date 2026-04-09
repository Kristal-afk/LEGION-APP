// Конструктор Instagram Stories
class StoryBuilder {
    constructor() {
        this.canvas = document.getElementById('storyCanvas');
        this.selectedElement = null;
        this.elementCounter = 0;
        this.elements = [];
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupDragAndDrop();
    }

    setupEventListeners() {
        // Фон
        document.getElementById('bgColor').addEventListener('input', (e) => {
            this.canvas.style.background = e.target.value;
        });

        document.getElementById('gradientBtn').addEventListener('click', () => {
            const colors = [
                'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
                'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
            ];
            const randomGradient = colors[Math.floor(Math.random() * colors.length)];
            this.canvas.style.background = randomGradient;
        });

        document.getElementById('resetBgBtn').addEventListener('click', () => {
            this.canvas.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            document.getElementById('bgColor').value = '#667eea';
        });

        // Добавление элементов
        document.getElementById('addTextBtn').addEventListener('click', () => this.addText());
        document.getElementById('addImageBtn').addEventListener('click', () => {
            document.getElementById('imageUpload').click();
        });
        document.getElementById('imageUpload').addEventListener('change', (e) => this.addImage(e));

        // Стикеры
        document.querySelectorAll('.sticker-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const sticker = e.target.dataset.sticker;
                this.addSticker(sticker);
            });
        });

        // Управление элементами
        document.getElementById('deleteElementBtn').addEventListener('click', () => this.deleteSelected());
        document.getElementById('duplicateElementBtn').addEventListener('click', () => this.duplicateSelected());
        document.getElementById('bringForwardBtn').addEventListener('click', () => this.bringForward());
        document.getElementById('sendBackwardBtn').addEventListener('click', () => this.sendBackward());

        // Экспорт
        document.getElementById('exportBtn').addEventListener('click', () => this.export());

        // Панель свойств
        this.setupPropertiesPanel();

        // Клик по канвасу для снятия выделения
        this.canvas.addEventListener('click', (e) => {
            if (e.target === this.canvas) {
                this.deselectAll();
            }
        });

        // Горячие клавиши
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Delete' || e.key === 'Backspace') {
                if (this.selectedElement && document.activeElement.tagName !== 'TEXTAREA' && document.activeElement.tagName !== 'INPUT') {
                    this.deleteSelected();
                }
            }
            if (e.ctrlKey || e.metaKey) {
                if (e.key === 'd') {
                    e.preventDefault();
                    this.duplicateSelected();
                }
            }
        });
    }

    setupPropertiesPanel() {
        // Текстовые свойства
        document.getElementById('textContent').addEventListener('input', (e) => {
            if (this.selectedElement && this.selectedElement.type === 'text') {
                this.selectedElement.element.querySelector('.text-content').textContent = e.target.value;
            }
        });

        document.getElementById('fontFamily').addEventListener('change', (e) => {
            if (this.selectedElement && this.selectedElement.type === 'text') {
                this.selectedElement.element.querySelector('.text-content').style.fontFamily = e.target.value;
            }
        });

        document.getElementById('fontSize').addEventListener('input', (e) => {
            const size = e.target.value;
            document.getElementById('fontSizeValue').textContent = `${size}px`;
            if (this.selectedElement && this.selectedElement.type === 'text') {
                this.selectedElement.element.querySelector('.text-content').style.fontSize = `${size}px`;
            }
        });

        document.getElementById('textColor').addEventListener('input', (e) => {
            if (this.selectedElement && this.selectedElement.type === 'text') {
                this.selectedElement.element.querySelector('.text-content').style.color = e.target.value;
            }
        });

        document.getElementById('fontWeight').addEventListener('change', (e) => {
            if (this.selectedElement && this.selectedElement.type === 'text') {
                this.selectedElement.element.querySelector('.text-content').style.fontWeight = e.target.checked ? 'bold' : 'normal';
            }
        });

        document.getElementById('fontStyle').addEventListener('change', (e) => {
            if (this.selectedElement && this.selectedElement.type === 'text') {
                this.selectedElement.element.querySelector('.text-content').style.fontStyle = e.target.checked ? 'italic' : 'normal';
            }
        });

        // Свойства изображения
        document.getElementById('imageOpacity').addEventListener('input', (e) => {
            const opacity = e.target.value;
            document.getElementById('opacityValue').textContent = `${opacity}%`;
            if (this.selectedElement && (this.selectedElement.type === 'image' || this.selectedElement.type === 'sticker')) {
                this.selectedElement.element.style.opacity = opacity / 100;
            }
        });

        document.getElementById('borderRadius').addEventListener('input', (e) => {
            const radius = e.target.value;
            document.getElementById('radiusValue').textContent = `${radius}px`;
            if (this.selectedElement && this.selectedElement.type === 'image') {
                this.selectedElement.element.querySelector('img').style.borderRadius = `${radius}%`;
            }
        });

        // Общие свойства
        document.getElementById('rotation').addEventListener('input', (e) => {
            const rotation = e.target.value;
            document.getElementById('rotationValue').textContent = `${rotation}°`;
            if (this.selectedElement) {
                this.selectedElement.element.style.transform = `rotate(${rotation}deg)`;
            }
        });
    }

    setupDragAndDrop() {
        let isDragging = false;
        let startX, startY, initialLeft, initialTop;
        let currentElement = null;

        this.canvas.addEventListener('mousedown', (e) => {
            const element = e.target.closest('.canvas-element');
            if (element && element !== this.canvas) {
                e.preventDefault();
                currentElement = element;
                this.selectElement(element);
                
                isDragging = true;
                startX = e.clientX;
                startY = e.clientY;
                initialLeft = element.offsetLeft;
                initialTop = element.offsetTop;

                // Обработка изменения размера колесом мыши
                element.addEventListener('wheel', (e) => {
                    e.preventDefault();
                    const delta = e.deltaY > 0 ? -10 : 10;
                    const newWidth = element.offsetWidth + delta;
                    const newHeight = element.offsetHeight + delta;
                    
                    if (newWidth > 20 && newHeight > 20) {
                        element.style.width = `${newWidth}px`;
                        element.style.height = `${newHeight}px`;
                        
                        if (element.type === 'text') {
                            element.querySelector('.text-content').style.fontSize = `${newWidth / 10}px`;
                        }
                    }
                }, { passive: false });
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging && currentElement) {
                const dx = e.clientX - startX;
                const dy = e.clientY - startY;
                
                currentElement.style.left = `${initialLeft + dx}px`;
                currentElement.style.top = `${initialTop + dy}px`;
            }
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
            currentElement = null;
        });
    }

    createElement(type, content = '') {
        const element = document.createElement('div');
        element.className = 'canvas-element';
        element.id = `element-${this.elementCounter++}`;
        element.type = type;
        
        // Начальная позиция
        element.style.left = '50px';
        element.style.top = '50px';
        element.style.width = '150px';
        element.style.height = 'auto';
        element.style.zIndex = this.elements.length;

        // Ручка изменения размера
        const resizeHandle = document.createElement('div');
        resizeHandle.className = 'resize-handle';
        element.appendChild(resizeHandle);

        return element;
    }

    addText(content = 'Новый текст') {
        const element = this.createElement('text');
        
        const textContent = document.createElement('div');
        textContent.className = 'text-content';
        textContent.textContent = content;
        textContent.style.fontSize = '32px';
        textContent.style.color = '#ffffff';
        textContent.style.fontFamily = 'Arial';
        textContent.style.textShadow = '2px 2px 4px rgba(0,0,0,0.5)';
        
        element.appendChild(textContent);
        this.canvas.appendChild(element);
        this.elements.push({ id: element.id, element, type: 'text' });
        
        this.selectElement(element);
    }

    addImage(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const element = this.createElement('image');
            
            const img = document.createElement('img');
            img.src = e.target.result;
            img.style.borderRadius = '0%';
            
            element.appendChild(img);
            element.style.width = '200px';
            element.style.height = '200px';
            
            this.canvas.appendChild(element);
            this.elements.push({ id: element.id, element, type: 'image' });
            
            this.selectElement(element);
        };
        reader.readAsDataURL(file);
        
        // Сброс input для возможности повторной загрузки того же файла
        event.target.value = '';
    }

    addSticker(sticker) {
        const element = this.createElement('sticker');
        
        const stickerContent = document.createElement('div');
        stickerContent.className = 'sticker-content';
        stickerContent.textContent = sticker;
        
        element.appendChild(stickerContent);
        element.style.width = '80px';
        element.style.height = '80px';
        
        this.canvas.appendChild(element);
        this.elements.push({ id: element.id, element, type: 'sticker' });
        
        this.selectElement(element);
    }

    selectElement(element) {
        this.deselectAll();
        
        this.selectedElement = this.elements.find(el => el.element === element);
        element.classList.add('selected');
        
        // Показываем панель свойств
        document.getElementById('propertiesPanel').style.display = 'block';
        
        // Обновляем кнопки
        this.updateButtons();
        
        // Заполняем панель свойств
        if (this.selectedElement) {
            this.populatePropertiesPanel();
        }
    }

    deselectAll() {
        if (this.selectedElement) {
            this.selectedElement.element.classList.remove('selected');
            this.selectedElement = null;
        }
        document.getElementById('propertiesPanel').style.display = 'none';
        this.updateButtons();
    }

    updateButtons() {
        const hasSelection = !!this.selectedElement;
        document.getElementById('deleteElementBtn').disabled = !hasSelection;
        document.getElementById('duplicateElementBtn').disabled = !hasSelection;
        document.getElementById('bringForwardBtn').disabled = !hasSelection;
        document.getElementById('sendBackwardBtn').disabled = !hasSelection;
    }

    populatePropertiesPanel() {
        if (!this.selectedElement) return;

        const { type, element } = this.selectedElement;

        // Скрываем все группы свойств
        document.getElementById('textProperties').style.display = 'none';
        document.getElementById('imageProperties').style.display = 'none';
        document.getElementById('commonProperties').style.display = 'block';

        if (type === 'text') {
            document.getElementById('textProperties').style.display = 'block';
            
            const textEl = element.querySelector('.text-content');
            document.getElementById('textContent').value = textEl.textContent;
            document.getElementById('fontFamily').value = textEl.style.fontFamily || 'Arial';
            document.getElementById('fontSize').value = parseInt(textEl.style.fontSize) || 32;
            document.getElementById('fontSizeValue').textContent = `${document.getElementById('fontSize').value}px`;
            document.getElementById('textColor').value = this.rgbToHex(textEl.style.color) || '#ffffff';
            document.getElementById('fontWeight').checked = textEl.style.fontWeight === 'bold';
            document.getElementById('fontStyle').checked = textEl.style.fontStyle === 'italic';
        } else if (type === 'image' || type === 'sticker') {
            document.getElementById('imageProperties').style.display = 'block';
            
            document.getElementById('imageOpacity').value = Math.round((element.style.opacity || 1) * 100);
            document.getElementById('opacityValue').textContent = `${document.getElementById('imageOpacity').value}%`;
            
            if (type === 'image') {
                const img = element.querySelector('img');
                document.getElementById('borderRadius').value = parseInt(img.style.borderRadius) || 0;
                document.getElementById('radiusValue').textContent = `${document.getElementById('borderRadius').value}%`;
            }
        }

        // Общие свойства
        const transform = element.style.transform;
        const rotationMatch = transform ? transform.match(/rotate\((\d+)deg\)/) : null;
        const rotation = rotationMatch ? parseInt(rotationMatch[1]) : 0;
        document.getElementById('rotation').value = rotation;
        document.getElementById('rotationValue').textContent = `${rotation}°`;
    }

    rgbToHex(rgb) {
        if (!rgb || rgb === 'transparent') return '#ffffff';
        if (rgb.startsWith('#')) return rgb;
        
        const rgbValues = rgb.match(/\d+/g);
        if (!rgbValues) return '#ffffff';
        
        return '#' + rgbValues.map(x => {
            const hex = parseInt(x).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    }

    deleteSelected() {
        if (!this.selectedElement) return;
        
        const { element } = this.selectedElement;
        element.remove();
        
        this.elements = this.elements.filter(el => el.element !== element);
        this.deselectAll();
    }

    duplicateSelected() {
        if (!this.selectedElement) return;
        
        const { element, type } = this.selectedElement;
        const clone = element.cloneNode(true);
        clone.id = `element-${this.elementCounter++}`;
        clone.classList.remove('selected');
        clone.style.left = `${element.offsetLeft + 20}px`;
        clone.style.top = `${element.offsetTop + 20}px`;
        clone.style.zIndex = this.elements.length;
        
        // Удаляем обработчики событий с клона
        const newResizeHandle = clone.querySelector('.resize-handle');
        if (newResizeHandle) newResizeHandle.remove();
        
        const resizeHandle = document.createElement('div');
        resizeHandle.className = 'resize-handle';
        clone.appendChild(resizeHandle);
        
        this.canvas.appendChild(clone);
        this.elements.push({ id: clone.id, element: clone, type });
        
        this.selectElement(clone);
    }

    bringForward() {
        if (!this.selectedElement) return;
        
        const { element } = this.selectedElement;
        const currentZ = parseInt(element.style.zIndex) || 0;
        
        if (currentZ < this.elements.length - 1) {
            element.style.zIndex = currentZ + 1;
            
            // Находим элемент с большим z-index и уменьшаем его
            const elementAbove = this.elements.find(el => 
                parseInt(el.element.style.zIndex) === currentZ + 1 && el.element !== element
            );
            
            if (elementAbove) {
                elementAbove.element.style.zIndex = currentZ;
            }
        }
    }

    sendBackward() {
        if (!this.selectedElement) return;
        
        const { element } = this.selectedElement;
        const currentZ = parseInt(element.style.zIndex) || 0;
        
        if (currentZ > 0) {
            element.style.zIndex = currentZ - 1;
            
            // Находим элемент с меньшим z-index и увеличиваем его
            const elementBelow = this.elements.find(el => 
                parseInt(el.element.style.zIndex) === currentZ - 1 && el.element !== element
            );
            
            if (elementBelow) {
                elementBelow.element.style.zIndex = currentZ;
            }
        }
    }

    async export() {
        try {
            // Используем html2canvas для экспорта
            const script = document.createElement('script');
            script.src = 'https://html2canvas.hertzen.com/dist/html2canvas.min.js';
            document.head.appendChild(script);
            
            script.onload = async () => {
                const canvas_element = await html2canvas(this.canvas, {
                    backgroundColor: null,
                    scale: 2,
                    useCORS: true
                });
                
                const link = document.createElement('a');
                link.download = `instagram-story-${Date.now()}.png`;
                link.href = canvas_element.toDataURL('image/png');
                link.click();
            };
        } catch (error) {
            alert('Ошибка при экспорте. Попробуйте сделать скриншот.');
            console.error(error);
        }
    }
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    window.storyBuilder = new StoryBuilder();
});
