# Media Show BCN en WordPress — Guía de puesta en marcha

Con esta guía, la web y el cotizador 3D funcionan en WordPress con WooCommerce. Los packs, los extras y sus equipos se gestionan desde el panel, con fotos reales.

## Qué incluye `mediashow-bcn.zip` (plugin propio)

- **Plantilla de página «Media Show BCN — Web completa».** Es la web que ya conoce: inicio, cotizador 3D, tótems con logo y propuesta en tono Crudo.
- **Packs, extras y equipos.** Son productos de WooCommerce:
  - Si añade, edita o borra uno, el cotizador cambia solo.
  - La **imagen del producto** es la foto real que se ve en la web.
  - En la pestaña **General** de cada producto hay un bloque **«Cotizador Media Show»**. Ahí elige el uso (pack, extra o equipo), el modelo 3D, la cantidad máxima y el aforo.
- **Reserva online del 50 %.** El servidor recalcula el precio con los precios de WooCommerce y lleva al cliente al checkout. El pedido guarda:
  - el desglose completo;
  - la fecha y el aforo;
  - el resto pendiente;
  - el logo del cliente para los tótems.
- **Envío por WhatsApp.** Sigue funcionando como alternativa.
- **Instalación automática** al activar el plugin:
  - crea las páginas Inicio, Aviso legal, Política de privacidad y Condiciones de reserva;
  - crea los 4 packs, los 8 extras y el producto «Reserva de evento»;
  - pone Inicio como portada.

  No sobrescribe nada que ya exista.
- **Menú «Media Show BCN» en el panel:**
  - teléfonos, WhatsApp, correo;
  - IVA, porcentaje de reserva, horas incluidas y precio de la hora extra;
  - el widget de voz y chat de IONOS (activado, con su ID `ebc6fb14-…`).

## Tema recomendado: **Kadence** (gratis)

- Es de los temas gratuitos más rápidos y funciona muy bien con WooCommerce.
- Trae constructor de cabecera y pie, y modo oscuro.
- La portada usa la plantilla del plugin, con su propio diseño. Kadence se usa en la tienda, el carrito, el checkout, la cuenta del cliente y las páginas legales.
- **Configúrelo así:** Apariencia → Personalizar → Colores. Fondo `#0A0A0A`, acento `#E65837` y texto `#F4F0E8`. Tipografías: Bebas Neue en los títulos y Work Sans en el texto.
- **Alternativas gratuitas:** Blocksy o Astra.

## Plugins

| Plugin | Para qué | ¿Obligatorio? |
|---|---|---|
| **Jetpack** | Conectar el sitio con Claude, para que yo instale y configure lo demás | Sí |
| **WooCommerce** | Productos, carrito, pagos y pedidos | Sí |
| **Media Show BCN — Web y Cotizador 3D** | Este plugin (`mediashow-bcn.zip`) | Sí |
| **WooPayments** o **WooCommerce Stripe Gateway** | Tarjeta, Apple Pay y Google Pay | Sí, uno de los dos |
| **Complianz – GDPR/CCPA Cookie Consent** | Banner de cookies conforme a la ley española | Recomendado |
| **UpdraftPlus** | Copias de seguridad automáticas | Recomendado |

No hace falta un plugin de WhatsApp: la web ya tiene sus botones y la barra para el móvil. Para **Bizum**, su banco tiene que darle un TPV Redsys con Bizum activado, y después se añade el plugin de Redsys que le indique el banco.

## Paso a paso

### 1. Instalar WordPress en IONOS (lo hace usted, unos 10 minutos)
1. En IONOS, entre en **Hosting → WordPress** (o «Click & Build»).
2. Pulse **Instalar WordPress** y elija la versión gestionada o la estándar.
3. **Carpeta:** `/public/mediashowbcn`. **Dominio:** `www.mediashowbcn.com`.
4. ⚠️ Si ya subió la web estática a esa carpeta, **borre antes `index.html`**. Si no, se mostraría en lugar de WordPress.
5. Apunte el usuario y la contraseña del administrador. No me los dé: no los necesito.

### 2. Conectar Jetpack (lo hace usted, unos 3 minutos)
1. En su WordPress: **Plugins → Añadir nuevo**, busque **Jetpack**, pulse **Instalar** y después **Activar**.
2. Pulse **Configurar Jetpack** y conecte con la cuenta de WordPress.com **mediashowbcn@gmail.com**. Es la misma cuenta que usa esta conexión.
3. Escríbame **«listo»**. Desde aquí podré hacer lo siguiente:
   - instalar y activar **Kadence**;
   - instalar **WooCommerce**, **WooPayments**, **Complianz** y **UpdraftPlus**;
   - subir y activar el plugin **Media Show BCN**.

### 3. Si prefiere instalarlo usted mismo
- **Plugin:** Plugins → Añadir nuevo → **Subir plugin** → `mediashow-bcn.zip` → Activar.
- **Tema:** Apariencia → Temas → Añadir nuevo → busque «Kadence» → Instalar → Activar.

### 4. Ajustes de WordPress
- **Ajustes → Enlaces permanentes:** elija «Nombre de la entrada» y guarde.
- **Ajustes → Generales:** idioma Español y zona horaria Madrid.
- **WooCommerce → Ajustes → General:** dirección en Barcelona, venta a España y moneda Euro (€).
- **WooCommerce → Ajustes → Impuestos:** el IVA ya va incluido en la reserva, porque el producto «Reserva de evento» no suma impuestos. Revise con su gestor cómo emitir la factura.
- **WooCommerce → Ajustes → Pagos:** active WooPayments o Stripe y siga el asistente.

### 5. Seguridad y HTTPS
Sustituya el `.htaccess` de la carpeta `/public/mediashowbcn` por el contenido de **`htaccess-wordpress.txt`**. Incluye la redirección a HTTPS y a www, la compresión, la caché y las reglas de WordPress. El resto (DNS, SSL y dominios .online, .site y .store) es igual que en `DESPLIEGUE.md`.

### 6. Subir sus equipos con fotos reales
**Uno a uno:**
1. **Productos → Añadir nuevo.**
2. Escriba el nombre (por ejemplo, «RCF EVOX 12»).
3. Ponga la **imagen del producto**: una foto real, horizontal, de unos 1600 px.
4. Escriba una descripción corta.
5. En **General → Cotizador Media Show**, elija **Uso: Equipo**.
6. En **Inventario**, puede activar la gestión de stock y poner cuántas unidades tiene. La web mostrará «X uds. disponibles».

**Varios a la vez:**
1. Descargue la **plantilla CSV** desde *Media Show BCN → Descargar plantilla CSV* y rellénela.
2. En la columna `Images`, pegue la URL de cada foto. Primero súbalas en *Medios → Añadir nuevo* y copie la URL de cada una.
3. Importe el archivo en *Productos → Importar*.

**Añadir o quitar opciones del cotizador:**
1. Cree un producto con **Uso: Extra del cotizador**, su precio, la cantidad máxima y, si existe, su modelo 3D.
2. Para quitar uno, pase el producto a **Borrador**.
3. Para un pack nuevo, elija **Uso: Pack**, su aforo y el escenario 3D más parecido.

### 7. Antes de publicar
- [ ] Complete los **3 datos marcados como PENDIENTE** en Aviso legal y Política de privacidad: titular, NIF y dirección postal.
- [ ] Revise los plazos de las **Condiciones de reserva**.
- [ ] Haga un pedido de prueba con el modo de pruebas de WooPayments o Stripe.
- [ ] En **Inicio**, puede añadir una **Galería** con fotos de sus eventos. Aparece en la portada, encima de Contacto.
