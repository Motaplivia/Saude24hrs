// Model: Usuario
// Representa os dados do usuário do sistema

class Usuario {
  constructor(data) {
    this.id = data.id || null;
    this.name = data.name || '';
    this.email = data.email || '';
    this.role = data.role || '';
    this.avatar = data.avatar || null;
    this.initials = data.initials || '';
  }

  getInitials() {
    if (this.initials) return this.initials;
    if (!this.name) return '';
    const names = this.name.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return this.name.substring(0, 2).toUpperCase();
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      role: this.role,
      avatar: this.avatar,
      initials: this.getInitials(),
    };
  }
}

export default Usuario;



