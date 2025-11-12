# Galería de Imágenes --- Proyecto Pexels API

Este proyecto es una galería interactiva de imágenes que consume la API
de Pexels, permitiendo buscar, visualizar y guardar fotografías
favoritas de forma dinámica.\
Cuenta con un diseño responsive, efectos visuales modernos, y un sistema de almacenamiento local para los favoritos.

## Características principales

-   Buscador dinámico por categorías o palabras clave.\
-   Galería interactiva con diferentes modos de visualización:
    -   Vertical (portrait)
    -   Horizontal (landscape)
    -   Cuadrada (square)
-   Sistema de favoritos almacenado en localStorage.
-   Paginación automática para navegar entre resultados.
-   Persistencia local: los favoritos y categorías guardadas se
    mantienen entre sesiones.
-   Integración con la API de Pexels para obtener fotos reales.
-   Diseño responsive: adaptado a móviles, tablets y pantallas grandes.
-   Efectos visuales: glassmorphism, animaciones suaves y modo de
    ampliación de fotos (overlay zoom).

## Estructura del proyecto
```
    ./ (raíz)
    ├── index.html                # Página principal (buscador y categorías)
    ├── favoritos.html            # Página de favoritos con filtros
    ├── /css/
    │   └── main.css              # Estilos generales y responsive design
    ├── /js/
    │   └── main.js               # Lógica funcional de toda la app
    ├── /assets/
    │   ├── logo.png              # Logotipo del sitio
    │   └── reloade.png           # Icono de recarga en la vista de favoritos
    ├── jsconfig.json             # Página de favoritos con filtros
    └── README.md
```

## Tecnologías utilizadas

-   HTML5 --- Estructura semántica del proyecto\
-   CSS3 --- Diseño visual, animaciones y responsive design\
-   JavaScript (ES6) --- Lógica, manejo del DOM y comunicación con la
    API\
-   Pexels API --- Fuente de imágenes (requiere apiKey)

## Principales funciones en main.js

  -----------------------------------------------------------------------
  Función                       Descripción
  ----------------------------- -----------------------------------------
  `llamarApi(url)`              Llama a la API de Pexels y devuelve los
                                datos en formato JSON.

  `validarTexto(texto)`         Valida y limpia el texto de búsqueda del
                                usuario.

  `pintarPagina(data)`          Renderiza las imágenes en el contenedor
                                principal.

  `gestionarFavorito(btn)`      Añade o elimina una imagen de los
                                favoritos (usa localStorage).

  `gestionarEje(eje)`           Cambia la orientación visual de las
                                fotos.

  `pintarCategorias()`          Muestra tres categorías aleatorias
                                iniciales.

  `pintarFavoritos()`           Carga las fotos favoritas guardadas.

  `crearFotoAgrandada(img)`     Muestra una imagen en tamaño completo
                                dentro de un overlay.
  -----------------------------------------------------------------------

## Uso y ejecución

1.  Descarga o clona el repositorio en tu ordenador:

    ``` bash
    git clone https://github.com/inakeret/galeria-fotos
    ```

2.  Abre el archivo index.html en tu navegador.

3.  Escribe una palabra clave en el buscador (por ejemplo: Naturaleza,
    Ciudad, Animales...).

4.  Explora los resultados, cambia el eje de las fotos o guarda tus
    favoritas.

5.  Accede a la pestaña Favoritos para ver tus imágenes guardadas y
    filtrarlas por categoría.

## API Key

El proyecto utiliza una API key de Pexels 
https://www.pexels.com/api/documentation/
mira el enlace para más información



Para un entorno de producción se recomienda **proteger la API key** y no dejarla visible en el código principal.

Una forma sencilla de hacerlo es crear un archivo separado que no se suba al repositorio público:

1. En la carpeta `js` de tu proyecto, crea un archivo llamado **`config.js`**.
2. Dentro del archivo, escribe lo siguiente:

   ```js
   export const apiKey = "TU_CLAVE_API";
   ```

## Autores

Proyecto desarrollado por:\
Iñaki Ruiz de Erentxun & Steven Herrera\
© 2025 --- Todos los derechos reservados.

## Mejoras futuras

-   Implementar búsqueda avanzada (por color, tamaño, orientación
    múltiple).\
-   Añadir descripciones ampliadas o etiquetas de las fotos.\
-   Modo oscuro (dark mode).\
-   Implementar backend con autenticación para guardar favoritos en la
    nube.
