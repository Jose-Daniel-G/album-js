import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// ¡CORRECCIÓN AQUI!: Importa BehaviorSubject
import { Observable, switchMap, tap, catchError, throwError, BehaviorSubject } from 'rxjs';
import { LoginRequest, AuthUser, UsuarioLoginResponse } from '../models/login.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = environment.URL_SERVICIOS;
  private csrfUrl = `${this.baseUrl.replace('/api', '')}/sanctum/csrf-cookie`;

  private loginUrl = `${this.baseUrl}/login`;
  private logoutUrl = `${this.baseUrl}/logout`;
  private userUrl = `${this.baseUrl}/user`;

  // Se inicializa con el usuario actual desde localStorage
  private currentUserSubject: BehaviorSubject<AuthUser | null> = new BehaviorSubject<AuthUser | null>(this.getCurrentUser());
  currentUser$: Observable<AuthUser | null> = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Realiza el login usando Laravel Sanctum.
   * Flujo completo:
   * 1. Petición GET para obtener la cookie CSRF.
   * 2. Envía las credenciales al endpoint de login (POST /api/login).
   * Laravel devuelve el access_token si las credenciales son válidas.
   * 3. Guarda el access_token y los datos del usuario en localStorage.
   * 4. Realiza una petición GET a /api/user para obtener los datos completos del usuario (protegida por el token).
   * @param credentials Las credenciales de login (email y password).
   * @returns Un Observable que emite los datos del usuario autenticado.
   */
  login(credentials: LoginRequest): Observable<AuthUser> {
    console.log('AuthService - Iniciando login para:', credentials.email);
    console.log('AuthService - CSRF URL:', this.csrfUrl);
    console.log('AuthService - Login URL:', this.loginUrl);

    // Paso 1: Obtener la cookie CSRF. Es vital para las peticiones POST/PUT/DELETE en Laravel.
    return this.http.get(this.csrfUrl, { withCredentials: true }).pipe(
      tap(() => console.log('AuthService - CSRF cookie request successful.')),
      // Paso 2: Encadenar la petición POST de login. Se ejecuta solo si la petición CSRF fue exitosa.
      switchMap(() => {
        console.log('AuthService - Sending login POST request...');
        return this.http.post<UsuarioLoginResponse>(
          this.loginUrl,
          credentials,
          { withCredentials: true }
        );
      }),
      // Paso 3: Usar 'tap' para manejar la respuesta del login y guardar el token.
      tap(response => {
        if (response.access_token && response.user) {
          localStorage.setItem('access_token', response.access_token);
          this.setCurrentUser(response.user); // Usa el método actualizado
          console.log('AuthService - Login POST successful. Token and user data saved.');
          console.log('AuthService - Token guardado:', response.access_token);
        } else {
          console.error('AuthService - Login successful but server response missing access_token or user data:', response);
          throw new Error('Invalid login response from server: access_token or user data missing.');
        }
      }),
      // Paso 4: Encadenar la petición GET /api/user para obtener los datos completos del usuario.
      // El interceptor ya tendrá el token en localStorage y lo adjuntará automáticamente.
      switchMap(() => {
        const tokenForUserRequest = this.getToken();
        console.log('AuthService - Token before /user request:', tokenForUserRequest ? 'Present' : 'Absent');
        return this.http.get<AuthUser>(this.userUrl, { withCredentials: true });
      }),
      tap(user => {
        this.setCurrentUser(user); // ¡Actualiza el usuario en localStorage con todos sus permisos! Y emite a través de BehaviorSubject
        console.log('AuthService - User data retrieved from /user endpoint:', user);
      }),
      catchError(error => {
        console.error('AuthService - Error in login flow:', error);
        
        // ¡CRÍTICO!: Llama a setCurrentUser(null) para limpiar el estado reactivo también.
        this.setCurrentUser(null); // Limpiar cualquier estado de autenticación parcial en caso de error.
        localStorage.removeItem('access_token'); // Esto ya se hace en setCurrentUser(null) si se llama antes
        return throwError(() => error);
      })
    );
  }

  /**
   * Cierra sesión en el backend de Laravel y limpia el almacenamiento local.
   * @returns Un Observable que emite la respuesta de la petición de logout.
   */
  logout(): Observable<any> {
    console.log('AuthService - Initiating logout.');
    // La petición de logout. El interceptor debe adjuntar el token aquí.
    return this.http.post(this.logoutUrl, {}, { withCredentials: true }).pipe(
      tap(() => {
        // ¡CRÍTICO!: Llama a setCurrentUser(null) para limpiar el estado reactivo también.
        this.setCurrentUser(null); // Limpia el usuario y emite null
        localStorage.removeItem('access_token'); // Esto ya se limpia dentro de setCurrentUser(null) si se llama antes
        console.log('AuthService - Logout successful. Token and user cleared from localStorage.');
      }),
      catchError(error => {
        console.error('AuthService - Error during logout:', error);
        this.setCurrentUser(null);
        localStorage.removeItem('access_token'); // Esto ya se limpia dentro de setCurrentUser(null) si se llama antes
        return throwError(() => error);
      })
    );
  }

  /**
   * Guarda los datos del usuario autenticado en localStorage y emite el nuevo valor a través de currentUserSubject.
   * @param user El objeto AuthUser o null si se está cerrando sesión.
   */
  setCurrentUser(user: AuthUser | null): void {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
    this.currentUserSubject.next(user); // Emite el nuevo estado del usuario para todos los suscriptores
  }

  /**
   * Recupera los datos del usuario actual desde localStorage.
   * @returns El objeto AuthUser si está presente, o null si no hay usuario guardado.
   */
  getCurrentUser(): AuthUser | null {
    const user = localStorage.getItem('user');
    try {
      return user ? JSON.parse(user) : null;
    } catch (e) {
      console.error("Error parsing user from localStorage:", e);
      localStorage.removeItem('user');
      return null;
    }
  }

  /**
   * Recupera el token de acceso (Bearer Token) del localStorage.
   * Este método es crucial para que el interceptor pueda adjuntar el token a las solicitudes.
   * @returns El token de acceso como string, o null si no está presente.
   */
  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  /**
   * Verifica si el usuario está actualmente autenticado.
   * Considera que un usuario está autenticado si hay datos de usuario Y un token de acceso guardados.
   * @returns True si el usuario está autenticado, false en caso contrario.
   */
  isAuthenticated(): boolean {
    // Se usa currentUserSubject.value para una verificación sincrónica
    return !!this.currentUserSubject.value && !!this.getToken();
  }

  hasPermission(permissionToCheck: string): boolean {
    const user = this.currentUserSubject.value; // ¡CORRECCIÓN AQUI!: Obtener el usuario del BehaviorSubject
    console.log('[AuthService] Usuario actual:', user);

    if (!user || !user.permissions || user.permissions.length === 0) {
      console.log(`[AuthService] hasPermission('${permissionToCheck}'): Usuario no logueado o no tiene permisos en el objeto de usuario. Resultado: false`);
      return false;
    }

    const hasPerm = user.permissions.includes(permissionToCheck);
    console.log(`[AuthService] hasPermission('${permissionToCheck}'): El permiso ${hasPerm ? 'FUE ENCONTRADO' : 'NO FUE ENCONTRADO'}. Resultado: ${hasPerm}`);
    return hasPerm;
  }
}