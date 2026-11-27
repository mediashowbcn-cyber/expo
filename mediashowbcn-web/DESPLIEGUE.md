# Media Show BCN — Despliegue en IONOS Hosting Plus

Esta guía publica la web en `https://www.mediashowbcn.com` desde la carpeta `/public/mediashowbcn` de IONOS.

> Los nombres de los menús de IONOS y DonWeb cambian a veces. Si un botón no se llama exactamente igual, busca el más parecido.

## 0. Antes de empezar

- [ ] **Completa los 3 datos legales.** Están marcados en amarillo con «PENDIENTE» en `aviso-legal.html` y `privacidad.html`:
  1. Nombre y apellidos o razón social del titular.
  2. NIF o CIF.
  3. Dirección postal completa (calle, número y código postal).

  La ley (LSSI y RGPD) obliga a publicarlos. Si es una sociedad, añade también los datos del Registro Mercantil. Para encontrar todas las marcas: busca `PENDIENTE` en los archivos.
- [ ] **Revisa `condiciones-reserva.html`.** Los plazos de cancelación y de pago son una propuesta. Ajústalos a tu forma de trabajar.
- [ ] **Averigua dónde está el correo `info@mediashowbcn.com`** (DonWeb, IONOS u otro). Lo necesitas en el paso 3 para no perder el correo.
- [ ] **(Opcional) Sube tus fotos** a `img/` con estos nombres: `galeria-01.jpg` … `galeria-08.jpg`. Usa JPG de 1600 px de ancho como máximo y menos de 400 KB cada una. La sección «Trabajos recientes» aparece sola cuando hay al menos una foto.

## 1. Crear la carpeta y subir los archivos

1. Entra en IONOS y abre **Hosting → Espacio web** (Webspace Explorer).
2. Crea la carpeta `public`, si no existe, y dentro la carpeta `mediashowbcn`. Resultado: `/public/mediashowbcn`.
3. Sube **todo el contenido** de la carpeta `public/` de este paquete dentro de `/public/mediashowbcn`:
   ```
   /public/mediashowbcn/
   ├── .htaccess
   ├── index.html
   ├── 404.html
   ├── aviso-legal.html
   ├── privacidad.html
   ├── condiciones-reserva.html
   ├── legal.css
   ├── robots.txt
   ├── sitemap.xml
   └── img/
   ```
4. **El archivo `.htaccess` está oculto** porque empieza por punto.
   - Si el Explorer no lo muestra después de subirlo, activa «mostrar archivos ocultos».
   - Si no puedes, súbelo por **SFTP** con FileZilla. Los datos de acceso están en **Hosting → SFTP y SSH**.
   - Otra opción: súbelo como `htaccess.txt` y renómbralo a `.htaccess` desde el Explorer.
5. **No subas** `DESPLIEGUE.md`. Es solo para ti.

## 2. Añadir `mediashowbcn.com` a IONOS como dominio externo

1. En IONOS, ve a **Dominios y SSL → Añadir dominio → Usar un dominio que ya tienes** (dominio externo).
2. Escribe `mediashowbcn.com`.
3. IONOS te mostrará **qué cambiar en DonWeb**: unos servidores DNS o un registro de verificación. Apúntalo.

## 3. Apuntar el dominio desde DonWeb (elige UNA opción)

### Opción A — Recomendada: usar los DNS de IONOS

Con esta opción, IONOS gestiona el DNS y el certificado SSL de forma automática.

1. En DonWeb, entra en **Mis dominios → mediashowbcn.com → Servidores DNS** (delegación).
2. Sustituye los DNS actuales por los **4 servidores de nombres que te indica IONOS**. Normalmente terminan en `ui-dns.com`, `ui-dns.de`, `ui-dns.org` y `ui-dns.biz`. Copia los de tu panel; no uses estos de ejemplo.
3. ⚠️ **Si el correo está en DonWeb:** antes de cambiar los DNS, copia en IONOS (**Dominios → mediashowbcn.com → DNS**) los registros **MX**, **SPF (TXT)**, **DKIM** y **DMARC** que tienes ahora en DonWeb. Si no lo haces, el correo `info@` deja de funcionar.

### Opción B — Mantener el DNS en DonWeb

1. En IONOS, mira la **IP del espacio web**. La encuentras en la configuración DNS del dominio dentro de IONOS, en el registro A (y AAAA, si aparece).
2. En DonWeb, en **Zona DNS** de `mediashowbcn.com`, crea o edita:

   | Tipo | Nombre | Valor |
   |---|---|---|
   | A | `@` | IP IPv4 que muestra IONOS |
   | AAAA | `@` | IP IPv6 que muestra IONOS (si hay) |
   | CNAME | `www` | `mediashowbcn.com` |

3. No toques los registros MX ni TXT del correo.
4. Con esta opción, el certificado SSL de IONOS solo se activa cuando IONOS detecta que el dominio ya apunta a su servidor.

**Antes de cambiar nada:** baja el TTL a 300 s si DonWeb te lo permite. La propagación tarda entre unos minutos y 48 horas.

## 4. Conectar el dominio a la carpeta

1. En IONOS: **Dominios y SSL → mediashowbcn.com → Destino** (o «Uso del dominio»).
2. Elige **Espacio web** y selecciona la carpeta **`/public/mediashowbcn`**.
3. Haz lo mismo con **`www.mediashowbcn.com`**. Si no aparece, créalo como subdominio `www` y apúntalo a la misma carpeta.

## 5. Activar el certificado SSL

1. En IONOS: **Dominios y SSL → mediashowbcn.com → SSL**.
2. Asigna el certificado incluido en Hosting Plus (SSL Starter o similar) a `mediashowbcn.com` **y** a `www.mediashowbcn.com`.
3. Espera a que el estado sea **Activo**.

El `.htaccess` deja pasar las rutas `/.well-known/` para no bloquear la validación del certificado.

## 6. Redirigir `.online`, `.site` y `.store`

Para cada uno de los tres dominios en IONOS:

1. **Destino → Redirección (HTTP 301)** a `https://www.mediashowbcn.com`.
2. Activa también su **certificado SSL**. Si no lo haces, `https://mediashowbcn.online` mostrará un error de seguridad antes de redirigir.

Alternativa: apuntarlos a la misma carpeta `/public/mediashowbcn`. El `.htaccess` ya los redirige a `www.mediashowbcn.com` con un 301, pero igualmente necesitan su certificado SSL activo.

## 7. Comprobaciones finales

| Prueba | Resultado esperado |
|---|---|
| `http://mediashowbcn.com` | Redirige a `https://www.mediashowbcn.com/` |
| `https://mediashowbcn.com` | Redirige a `https://www.mediashowbcn.com/` |
| `https://www.mediashowbcn.com` | Candado cerrado y web visible |
| `https://www.mediashowbcn.com/#cotizador` | Abre el cotizador 3D |
| `https://www.mediashowbcn.com/img/` | Error 403, sin listado de archivos |
| `https://www.mediashowbcn.com/no-existe` | Página 404 propia |
| `mediashowbcn.online`, `.site` y `.store` | Redirigen a `https://www.mediashowbcn.com/` |
| Botón del asistente de IA | Aparece abajo y responde. Comprueba en el panel del AI Receptionist que el dominio autorizado es `www.mediashowbcn.com` |
| Correo `info@mediashowbcn.com` | Envía y recibe |

Desde un ordenador puedes comprobarlo con estos comandos:

```sh
curl -I http://mediashowbcn.com            # 301 → https://www.mediashowbcn.com/
curl -I https://www.mediashowbcn.com       # 200
dig +short mediashowbcn.com                # IP de IONOS
```

**Cuando todo funcione durante 1 o 2 semanas**, activa HSTS: quita el `#` de la línea `Strict-Transport-Security` en `.htaccess`.

## 8. Después de publicar

- [ ] **Google Search Console:** añade la propiedad `https://www.mediashowbcn.com` y envía `sitemap.xml`.
- [ ] **Google Business Profile:** actualiza la web, el teléfono y la zona de servicio (Nou Barris, Barcelona).
- [ ] **Instagram:** pon el enlace de la web en la bio.
- [ ] **Desactiva la web antigua de MyWebsite Now** para no tener dos webs con el mismo dominio.
