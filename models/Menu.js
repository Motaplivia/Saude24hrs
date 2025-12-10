// Model: Menu
// Representa os itens do menu de navegação

class ItemMenu {
  constructor(data) {
    this.id = data.id || null;
    this.label = data.label || '';
    this.route = data.route || '';
    this.icon = data.icon || null;
    this.active = data.active || false;
  }

  toJSON() {
    return {
      id: this.id,
      label: this.label,
      route: this.route,
      icon: this.icon,
      active: this.active,
    };
  }
}

class Menu {
  constructor() {
    this.items = [];
  }

  addItem(item) {
    this.items.push(new ItemMenu(item));
  }

  getItems() {
    return this.items.map(item => item.toJSON());
  }

  getItemById(id) {
    return this.items.find(item => item.id === id);
  }

  setActiveItem(id) {
    this.items.forEach(item => {
      item.active = item.id === id;
    });
  }
}

export default Menu;
