import { supabase } from '@/lib/supabase';

export interface Usuario {
  id_usuario: number;
  nome: string;
  email: string;
  perfil: string;
  cpf?: string;
  telefone?: string;
  created_at: string;
  updated_at: string;
}

export interface LoginCredentials {
  email: string;
  senha: string;
}

export interface RegisterData {
  nome: string;
  email: string;
  senha: string;
  cupom?: string;
}

export interface AuthResponse {
  success: boolean;
  data?: Usuario;
  error?: string;
}

class AuthService {
  private currentUser: Usuario | null = null;

  // Validação de email
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validação de senha
  private isValidPassword(senha: string): boolean {
    return senha.length >= 6;
  }

  // Validação de nome
  private isValidName(nome: string): boolean {
    return nome.trim().length >= 2;
  }

  // Hash da senha usando Web Crypto API
  private async hashPassword(senha: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(senha);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Verificar senha
  private async verifyPassword(senha: string, hashedPassword: string): Promise<boolean> {
    const hashedInput = await this.hashPassword(senha);
    return hashedInput === hashedPassword;
  }

  // Cadastrar usuário
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      // Validações
      if (!this.isValidName(data.nome)) {
        return { success: false, error: 'Nome deve ter pelo menos 2 caracteres' };
      }

      if (!this.isValidEmail(data.email)) {
        return { success: false, error: 'Email inválido' };
      }

      if (!this.isValidPassword(data.senha)) {
        return { success: false, error: 'Senha deve ter pelo menos 6 caracteres' };
      }

      // Verificar se email já existe
      const { data: existingUser } = await supabase
        .from('usuarios')
        .select('id_usuario')
        .eq('email', data.email.toLowerCase())
        .single();

      if (existingUser) {
        return { success: false, error: 'Email já está em uso' };
      }

      // Hash da senha
      const hashedPassword = await this.hashPassword(data.senha);

      // Regras de cupom:
      // - Se cupom foi informado: só cadastra se existir e estiver ativo (perfil analista).
      //   Caso contrário, retornar erro de cupom inválido/inativo.
      // - Se cupom vazio: cadastra como cliente.
      let perfil: 'analista' | 'cliente' = 'cliente';
      const cupomValor = data.cupom?.trim();
      if (cupomValor && cupomValor.length > 0) {
        const { data: cupomRow, error: cupomError } = await supabase
          .from('cupom')
          .select('id, active')
          .eq('cupom', cupomValor)
          .eq('active', true)
          .single();

        if (cupomError || !cupomRow) {
          return { success: false, error: 'Cupom inválido ou inativo' };
        }

        perfil = 'analista';
      } else {
        perfil = 'cliente';
      }

      // Inserir usuário
      const { data: newUser, error } = await supabase
        .from('usuarios')
        .insert({
          nome: data.nome.trim(),
          email: data.email.toLowerCase(),
          senhahash: hashedPassword,
          perfil
        })
        .select('id_usuario, nome, email, perfil, cpf, telefone, createdat, lastupdate')
        .single();

      if (error) {
        console.error('Erro ao cadastrar usuário:', error);
        return { success: false, error: 'Erro ao cadastrar usuário' };
      }

      // Mapear os campos do banco para a interface Usuario
      const mappedUser: Usuario = {
        id_usuario: newUser.id_usuario,
        nome: newUser.nome,
        email: newUser.email,
        perfil: newUser.perfil,
        cpf: newUser.cpf,
        telefone: newUser.telefone,
        created_at: newUser.createdat,
        updated_at: newUser.lastupdate
      };

      this.currentUser = mappedUser;
      this.saveUserToStorage(mappedUser);

      return { success: true, data: mappedUser };
    } catch (error) {
      console.error('Erro no cadastro:', error);
      return { success: false, error: 'Erro interno do servidor' };
    }
  }

  // Login do usuário
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      // Validações
      if (!this.isValidEmail(credentials.email)) {
        return { success: false, error: 'Email inválido' };
      }

      if (!credentials.senha) {
        return { success: false, error: 'Senha é obrigatória' };
      }

      // Buscar usuário
      const { data: user, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('email', credentials.email.toLowerCase())
        .single();

      if (error || !user) {
        return { success: false, error: 'Email ou senha incorretos' };
      }

      // Verificar senha
      const isPasswordValid = await this.verifyPassword(credentials.senha, user.senhahash);
      if (!isPasswordValid) {
        return { success: false, error: 'Email ou senha incorretos' };
      }

      // Mapear os campos do banco para a interface Usuario
      const mappedUser: Usuario = {
        id_usuario: user.id_usuario,
        nome: user.nome,
        email: user.email,
        perfil: user.perfil,
        cpf: user.cpf,
        telefone: user.telefone,
        created_at: user.createdat,
        updated_at: user.lastupdate
      };

      this.currentUser = mappedUser;
      this.saveUserToStorage(mappedUser);

      return { success: true, data: mappedUser };
    } catch (error) {
      console.error('Erro no login:', error);
      return { success: false, error: 'Erro interno do servidor' };
    }
  }

  // Logout
  logout(): void {
    this.currentUser = null;
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
  }

  // Verificar se está autenticado
  isAuthenticated(): boolean {
    return this.currentUser !== null || this.getUserFromStorage() !== null;
  }

  // Obter usuário atual
  getCurrentUser(): Usuario | null {
    if (this.currentUser) {
      return this.currentUser;
    }
    return this.getUserFromStorage();
  }

  // Salvar usuário no localStorage
  private saveUserToStorage(user: Usuario): void {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('authToken', `user_${user.id_usuario}_${Date.now()}`);
  }

  // Recuperar usuário do localStorage
  private getUserFromStorage(): Usuario | null {
    try {
      const userStr = localStorage.getItem('user');
      const token = localStorage.getItem('authToken');

      if (userStr && token) {
        const user = JSON.parse(userStr);
        this.currentUser = user;
        return user;
      }
    } catch (error) {
      console.error('Erro ao recuperar usuário do storage:', error);
    }
    return null;
  }

  // Validar sessão
  async validateSession(): Promise<AuthResponse> {
    const user = this.getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: 'Usuário não encontrado na sessão'
      };
    }

    try {
      // Verificar se usuário ainda existe no banco
      const { data, error } = await supabase
        .from('usuarios')
        .select('id_usuario, nome, email, perfil, cpf, telefone, createdat, lastupdate')
        .eq('id_usuario', user.id_usuario)
        .single();

      if (error || !data) {
        this.logout();
        return {
          success: false,
          error: 'Sessão inválida'
        };
      }

      // Atualizar dados do usuário na sessão
      const updatedUser: Usuario = {
        id_usuario: data.id_usuario,
        nome: data.nome,
        email: data.email,
        perfil: data.perfil,
        cpf: data.cpf,
        telefone: data.telefone,
        created_at: data.createdat,
        updated_at: data.lastupdate
      };

      this.currentUser = updatedUser;
      this.saveUserToStorage(updatedUser);

      return {
        success: true,
        data: updatedUser
      };
    } catch (error) {
      console.error('Erro ao validar sessão:', error);
      this.logout();
      return {
        success: false,
        error: 'Erro interno do servidor'
      };
    }
  }

  // Atualizar dados do usuário
  async updateUser(updates: Partial<Pick<Usuario, 'nome' | 'email'>>): Promise<AuthResponse> {
    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    try {
      const { data: updatedUser, error } = await supabase
        .from('usuarios')
        .update(updates)
        .eq('id_usuario', currentUser.id_usuario)
        .select('id_usuario, nome, email, perfil, cpf, telefone, createdat, lastupdate')
        .single();

      if (error) {
        return { success: false, error: 'Erro ao atualizar usuário' };
      }

      // Mapear os campos do banco para a interface Usuario
      const mappedUser: Usuario = {
        id_usuario: updatedUser.id_usuario,
        nome: updatedUser.nome,
        email: updatedUser.email,
        perfil: updatedUser.perfil,
        cpf: updatedUser.cpf,
        telefone: updatedUser.telefone,
        created_at: updatedUser.createdat,
        updated_at: updatedUser.lastupdate
      };

      this.currentUser = mappedUser;
      this.saveUserToStorage(mappedUser);

      return { success: true, data: mappedUser };
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      return { success: false, error: 'Erro interno do servidor' };
    }
  }

  // Métodos utilitários para controle de acesso baseado em perfil
  canViewAllUsers(): boolean {
    const user = this.getCurrentUser();
    return user?.perfil === 'admin' || user?.perfil === 'analista';
  }

  canViewUserNames(): boolean {
    const user = this.getCurrentUser();
    return user?.perfil === 'admin' || user?.perfil === 'analista';
  }

  isClient(): boolean {
    const user = this.getCurrentUser();
    return user?.perfil === 'cliente';
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.perfil === 'admin';
  }

  isAnalyst(): boolean {
    const user = this.getCurrentUser();
    return user?.perfil === 'analista';
  }
}

export const authService = new AuthService();