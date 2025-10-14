# SportsMatch Backend

Este repositorio contiene el código fuente del backend de **SportsMatch**, desarrollado en **Node.js con Express y TypeScript**. Se encarga de gestionar la autenticación, usuarios, reservas, pagos e interacción con la base de datos en **PostgreSQL** a través de **Supabase**.

## Tecnologías utilizadas

- **Node.js + Express**: Framework para la gestión de API REST.
- **TypeScript**: Tipado fuerte para mejorar la mantenibilidad del código.
- **PostgreSQL**: Base de datos relacional alojada en Supabase.
- **Autenticación**: JWT para control de acceso.
- **Pagos**: Integración con Mercado Pago.
- **Almacenamiento**: Amazon S3 para imágenes de usuarios.
- **Correo electrónico**: Envío de notificaciones mediante Gmail.

## Configuración

Para ejecutar la aplicación localmente, sigue estos pasos:

1. **Instalar las dependencias**:

   ```sh
   npm install
   ```

2. **Crear un archivo `.env`** en el directorio raíz del proyecto y configurar las siguientes variables:


| Variable                      | Descripción |
|--------------------------------|------------|
| `DB_USER`                      | Usuario de la base de datos |
| `DB_HOST`                      | Dirección del servidor de la base de datos |
| `DB_NAME`                      | Nombre de la base de datos |
| `DB_PASS`                      | Contraseña del usuario de la base de datos |
| `DB_PORT`                      | Puerto en el que corre PostgreSQL |
| `LAN_HOST`                     | IP local del servidor |
| `NAME`                         | Nombre de la aplicación |
| `PORT`                         | Puerto en el que corre el backend |
| `IS_LOCAL`                     | Indica si el entorno es local (`true` o `false`) |
| `DB_SSL`                       | Habilita la conexión segura a la base de datos |
| `MERCADO_PAGO_ACCESS_TOKEN`    | Token de acceso de Mercado Pago |
| `DATABASE_URL`                 | URL de conexión completa a la base de datos |
| `MAIL_HOST`                    | Servidor SMTP para correos |
| `MAIL_USERNAME`                | Usuario de la cuenta de correo |
| `MAIL_PASSWORD`                | Contraseña de la cuenta de correo |
| `FRONTEND_URI`                 | URL del frontend |
| `S3_ACCESS_KEY`                | Clave de acceso a Amazon S3 |
| `S3_SECRET_KEY`                | Clave secreta de Amazon S3 |
| `S3_SESSION_TOKEN`             | Token de sesión para Amazon S3 (si aplica) |
| `S3_REGION`                    | Región del bucket de Amazon S3 |
| `S3_BUCKET`                    | Nombre del bucket en Amazon S3 |

## Ejecución

1. **Ejecutar el servidor en modo desarrollo**:

   ```sh
   npm run dev
   ```

2. **Acceder a la API**:

   El backend estará disponible en:  
   ```
   http://localhost:3000
   ```

3. **Explorar la documentación de la API** (Swagger):

   ```
   http://localhost:3000/api-docs
   ```

---

## Documentación

Puedes encontrar la documentación completa de la API en el archivo [`swagger.yaml`](../swagger.yaml), que describe los endpoints disponibles, parámetros y respuestas esperadas.

---

## Funcionalidades principales

✅ **Autenticación** de usuarios y clubes mediante JWT  
✅ **Gestión de reservas** con verificación de disponibilidad  
✅ **Pagos seguros** con Mercado Pago  
✅ **Geolocalización** con Geohash para búsqueda de canchas  
✅ **Envío de emails** con notificaciones de estado de reservas  
✅ **Almacenamiento en la nube** de imágenes de usuarios en S3  

---
