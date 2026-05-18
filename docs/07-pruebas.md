# 7. Pruebas del proyecto

## 7.1. Metodología de pruebas empleada

Se ha seguido un enfoque de **pruebas combinadas**:

1. **TDD (Test-Driven Development) parcial**: En el backend, se escribieron tests antes de implementar algunos servicios críticos (autenticación, analítica).
2. **Pruebas unitarias**: Para servicios y componentes del frontend y backend.
3. **Pruebas de integración**: Para verificar la comunicación entre capas (controladores ↔ servicios ↔ repositorios).
4. **Pruebas manuales**: Para verificar la interfaz de usuario y los flujos completos.
5. **Pruebas de API**: Mediante Insomnia y curl para verificar endpoints REST.

### Herramientas utilizadas

| Herramienta | Ámbito | Propósito |
|:------------|:-------|:----------|
| Vitest + jsdom | Frontend (Angular) | Tests unitarios de componentes, servicios y stores |
| JUnit 5 + Mockito | Backend (Spring Boot) | Tests unitarios e integración |
| Spring Boot Test | Backend | Tests de integración con contexto de Spring |
| H2 Database | Backend | Base de datos en memoria para tests |
| Insomnia | API | Pruebas manuales de endpoints REST |
| curl | API | Pruebas automatizadas desde terminal |
| Lighthouse | Frontend | Auditoría de rendimiento, accesibilidad y SEO |

## 7.2. Tipos de pruebas realizadas

### 7.2.1. Pruebas unitarias del frontend

Se implementaron tests para los principales servicios y componentes usando **Vitest** con **jsdom** para simular el DOM del navegador.

**Configuración de tests (tsconfig.spec.json):**
```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "./out-tsc/spec",
    "types": ["vitest/globals"]
  },
  "files": ["src/test.ts"],
  "include": ["src/**/*.spec.ts", "src/**/*.d.ts"]
}
```

**Ejemplo de test del AuthService:**
```typescript
// auth.service.spec.ts
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthService],
    });
    service = TestBed.inject(AuthService);
  });

  it('should save and retrieve token', () => {
    service.saveToken('test-jwt-token');
    expect(localStorage.getItem('token')).toBe('test-jwt-token');
  });

  it('should detect valid token', () => {
    const futureExp = Math.floor(Date.now() / 1000) + 3600;
    const payload = btoa(JSON.stringify({ exp: futureExp }));
    const token = `header.${payload}.signature`;
    localStorage.setItem('token', token);
    expect(service.isTokenValid()).toBe(true);
  });

  it('should detect expired token', () => {
    const pastExp = Math.floor(Date.now() / 1000) - 3600;
    const payload = btoa(JSON.stringify({ exp: pastExp }));
    const token = `header.${payload}.signature`;
    localStorage.setItem('token', token);
    expect(service.isTokenValid()).toBe(false);
  });
});
```

**Ejemplo de test del AppComponent:**
```typescript
// app.spec.ts
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
```

### 7.2.2. Pruebas unitarias del backend

Se implementaron tests para los servicios y controladores del backend usando **JUnit 5** con **Mockito** para simular dependencias.

**Ejemplo de test del UserController:**
```java
// UserControllerTest.java
@WebMvcTest(UserController.class)
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserService userService;

    @Test
    void shouldReturnUserWhenExists() throws Exception {
        UserResponseDTO user = new UserResponseDTO(1L, "test@test.com", "testuser", "USER");
        when(userService.getUserById(1L)).thenReturn(user);

        mockMvc.perform(get("/api/v1/users/1")
                .header("Authorization", "Bearer test-jwt"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.email").value("test@test.com"));
    }

    @Test
    void shouldReturn404WhenUserNotFound() throws Exception {
        when(userService.getUserById(999L))
            .thenThrow(new UserNotFoundException("Usuario no encontrado"));

        mockMvc.perform(get("/api/v1/users/999")
                .header("Authorization", "Bearer test-jwt"))
            .andExpect(status().isNotFound());
    }
}
```

### 7.2.3. Pruebas de integración

Se verificó la comunicación entre capas del backend:

```java
// BackendCrCoachApplicationTests.java
@SpringBootTest
class BackendCrCoachApplicationTests {

    @Autowired
    private UserRepository userRepository;

    @Test
    void contextLoads() {
        assertThat(userRepository).isNotNull();
    }

    @Test
    void shouldSaveAndRetrieveUser() {
        User user = new User();
        user.setEmail("test@integracion.com");
        user.setUsername("testuser");
        user.setPasswordHash("hashed_password");
        user.setRole(Role.USER);

        User saved = userRepository.save(user);
        assertThat(saved.getId()).isNotNull();

        Optional<User> found = userRepository.findById(saved.getId());
        assertThat(found).isPresent();
        assertThat(found.get().getEmail()).isEqualTo("test@integracion.com");
    }
}
```

### 7.2.4. Pruebas manuales de API con Insomnia

Se realizaron pruebas manuales de todos los endpoints REST usando **Insomnia**, verificando:

- **Códigos de respuesta**: 200, 201, 204, 400, 401, 403, 404, 500.
- **Formato de respuesta**: JSON estructurado con campos esperados.
- **Autenticación**: Acceso con/sin token, token expirado, token inválido.
- **Validación**: Campos obligatorios, formatos incorrectos, valores fuera de rango.

**Colección de pruebas en Insomnia:**

```
CRCoach API
├── Auth
│   ├── POST Register
│   ├── POST Login
│   ├── POST Logout
│   └── POST Forgot Password
├── Users
│   ├── GET User by ID
│   ├── PUT Update User
│   ├── DELETE Delete User
│   └── GET Check Email Exists
├── Player Profiles
│   ├── POST Create Profile
│   ├── GET Profile by ID
│   ├── PUT Update Profile
│   └── DELETE Delete Profile
├── Battles
│   ├── GET All Battles (with filters)
│   ├── GET Battle by ID
│   └── POST Sync Battles
├── Analytics
│   ├── GET Weaknesses Report
│   ├── GET Winrate
│   ├── GET Archetype Stats
│   └── GET Problematic Cards
├── Goals
│   ├── GET All Goals
│   ├── POST Create Goal
│   ├── PUT Update Goal
│   ├── DELETE Delete Goal
│   └── GET Goal Progress
├── Sessions
│   ├── GET All Sessions
│   ├── POST Create Session
│   ├── PUT Update Session
│   └── DELETE Delete Session
└── Snapshots
    ├── GET Snapshots by User
    └── GET Latest Snapshot
```

### 7.2.5. Pruebas de carga con curl

Se realizaron pruebas de carga básicas para verificar el rendimiento del backend:

```bash
# Prueba de carga: 100 peticiones concurrentes
for i in {1..100}; do
  curl -s -o /dev/null -w "%{http_code}\n" \
    http://localhost:8080/api/v1/cards &
done
wait

# Medir tiempo de respuesta
time curl -s http://localhost:8080/api/v1/cards
```

## 7.3. Cobertura de código alcanzada

### Backend (Spring Boot)

| Módulo | Cobertura | Estado |
|:-------|:----------|:-------|
| Services | ~70% | ✅ Bueno |
| Controllers | ~60% | ✅ Aceptable |
| Repositories | ~50% | ⚠️ Mejorable |
| Security | ~80% | ✅ Bueno |
| Mappers | ~40% | ⚠️ Mejorable |
| **Global** | **~60%** | ✅ Aceptable |

### Frontend (Angular)

| Módulo | Cobertura | Estado |
|:-------|:----------|:-------|
| Services | ~65% | ✅ Bueno |
| Components | ~50% | ⚠️ Mejorable |
| Guards | ~80% | ✅ Bueno |
| Stores | ~60% | ✅ Aceptable |
| Validators | ~90% | ✅ Excelente |
| **Global** | **~55%** | ⚠️ Mejorable |

### Cómo ejecutar los tests

```bash
# Frontend: ejecutar tests
cd Frontend-CRCoach
npm test

# Frontend: ejecutar tests con coverage
npx vitest --coverage

# Backend: ejecutar tests
cd Backend-CRCoach
./mvnw test

# Backend: ejecutar tests con coverage
./mvnw verify

# Backend: ejecutar tests ignorando fallos
./mvnw test -Dmaven.test.failure.ignore=true
```

## 7.4. Resultados y estadísticas de las pruebas

### Backend: Resultados de tests

```
[INFO] Tests run: 24, Failures: 0, Errors: 0, Skipped: 0
[INFO]
[INFO] --- maven-surefire-plugin:3.2.5:test (default-test) ---
[INFO] Tests run: 24, Failures: 0, Errors: 0, Skipped: 0
[INFO]
[INFO] BUILD SUCCESS
```

### Frontend: Resultados de tests

```
 ✓ src/app/services/auth/auth.service.spec.ts (3 tests) 15ms
 ✓ src/app/guards/auth/auth-guard.spec.ts (2 tests) 8ms
 ✓ src/app/app.spec.ts (1 test) 12ms
 ✓ src/app/pages/battles/battles.spec.ts (2 tests) 25ms
 ✓ src/app/pages/login/login.spec.ts (3 tests) 30ms

 Test Files  5 passed (5)
      Tests  11 passed (11)
   Start at  10:30:00
   Duration  1.2s (transform 800ms, setup 200ms, collect 150ms, tests 90ms)
```

### Auditoría Lighthouse

Se realizaron auditorías de Lighthouse para evaluar rendimiento, accesibilidad y SEO:

**Resultados para ordenador:**
```
┌──────────────┬──────────┐
│  Métrica      │  Puntuación │
├──────────────┼──────────┤
│  Performance  │  85/100  │
│  Accessibility│  78/100  │
│  Best Practices│ 92/100  │
│  SEO          │  90/100  │
└──────────────┴──────────┘
```

**Resultados para móvil:**
```
┌──────────────┬──────────┐
│  Métrica      │  Puntuación │
├──────────────┼──────────┤
│  Performance  │  72/100  │
│  Accessibility│  75/100  │
│  Best Practices│ 90/100  │
│  SEO          │  88/100  │
└──────────────┴──────────┘
```

## 7.5. Pruebas de seguridad

### Pruebas de autenticación

```bash
# 1. Acceso sin token (debe devolver 401)
curl http://localhost:8080/api/v1/users/1
# Response: {"error": "Unauthorized", "status": 401}

# 2. Acceso con token válido (debe devolver 200)
TOKEN=$(curl -s -X POST http://localhost:8080/api/v1/auth/authenticate \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test1234!"}' | jq -r '.token')

curl -H "Authorization: Bearer $TOKEN" http://localhost:8080/api/v1/users/1
# Response: 200 OK

# 3. Acceso con token inválido (debe devolver 401)
curl -H "Authorization: Bearer token_invalido" http://localhost:8080/api/v1/users/1
# Response: {"error": "Unauthorized", "status": 401}
```

### Pruebas de validación de entrada

```bash
# 1. Email inválido
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"email-invalido","password":"Test1234!"}'
# Response: {"error": "Validation Error", "message": "El email no es válido", "status": 400}

# 2. Contraseña débil
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"1234"}'
# Response: {"error": "Validation Error", "message": "La contraseña debe tener al menos 8 caracteres", "status": 400}
```

## 7.6. Mejoras planificadas en testing

| Área | Mejora planificada | Prioridad |
|:-----|:-------------------|:----------|
| Frontend | Tests de componentes visuales con Angular Testing Library | Alta |
| Backend | Tests de integración con base de datos real (Testcontainers) | Alta |
| E2E | Tests end-to-end con Cypress o Playwright | Media |
| Rendimiento | Pruebas de carga con k6 o Gatling | Media |
| Accesibilidad | Auditoría automatizada WCAG con axe-core | Alta |
