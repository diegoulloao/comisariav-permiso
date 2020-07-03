# comisariav-permiso

> Chile: Automatización tipo Chrome headless que obtiene un salvoconducto en [comisariavirtual.cl](https://comisariavirtual.cl) basado en tus datos personales.

<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Flag_of_Chile.svg/1280px-Flag_of_Chile.svg.png" width="400px">

## Requerimientos
- Node.js
- Captcha solver api-key

## Instalación

```
git clone https://github.com/diegoulloao/comisariav-permiso
```

### Instalar dependencias y generar enlace simbólico al sistema

**npm:**

`npm i` && `npm link`

**yarn:**

`yarn` && `yarn link`

## Configuración
**1. Datos personales**

* Completar datos en `src/data.json`

**2. App**

- Dirigirse a un servicio como http://2captcha.com/ (recomendado) y obtener una **api-key** (1000 resoluciones por $2.99usd = $2.300CLP aprox sólo 1 pago)
- Abrir `src/config.json` agregar **provider** y **api-key** del captcha solver
- Añadir `download-path` con ruta absoluta al directorio de descarga del salvoconducto

## Ejecución
`permisov`

## Consideraciones

* Los valores de los campos `comuna` y `región` deben ser **exactamente iguales** (case-sensitive) a como aparecen en el formulario de [comisariavirtual.cl](https://comisariavirtual.cl), de otra manera no se producirá coincidencia al rellenar automáticamente los datos.

* Puedes **activar/desactivar** que se envíe una **copia** del salvoconducto a tu **email** `src/config.json`
* Puedes cambiar la opción `headless-process` de la aplicación a `false` para **visualizar** el proceso en `src/config.json`
* 2Captcha y otros servicios tienen **rango de error** por lo que la resolución en algunas pocas ocasiones puede fallar.
* **No se hace uso de tus datos personales para otros fines mas que obtener el salvoconducto**.

## Licencia
Apache-2.0

---
**@diegoulloao · 2020 · Chile**