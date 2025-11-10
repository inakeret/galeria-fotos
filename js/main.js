/******************************************************
 * VARIABLES
 ******************************************************/
const urlBase = "https://api.pexels.com/v1/"
const apiKey = "HKLxOHGFJLAhYKSc7I1LwKdj74AWmuf9TUOhENxiC1giUHbZP8Ar4o7N"
const buscador = document.querySelector("#buscador")
const fragment = document.createDocumentFragment()
const cardContainer = document.querySelector("#cardContainer")
const paginadoContainer = document.querySelector("#paginadoContainer")
const select= document.querySelector("#select")



/******************************************************
 * EVENTOS
 ******************************************************/
buscador.addEventListener("submit", (ev)=>{
    ev.preventDefault()
    //console.log()
    recibirFotosCategoria(ev.target.buscar.value)
})

/******************************************************
 * FUNCIONES
 ******************************************************/

/**
 * @async
 * Llamar a la api y conseguir datos
 * @param {string} url url de la api
 * @returns {Promise<Object>}
 */
const llamarApi = async(url) =>{
    try {
        const resp = await fetch(url, {
            method: 'GET', // GET para coger datos
            headers: {
                'Authorization': apiKey,
                'Content-Type': 'application/json'
            }
        })
        if(resp.ok){
            const data = await resp.json()
            return data
        }else{
            throw "Error" + resp.status        
        }
    } catch (error) {
        throw error
    }
}

/**
 * Valida y prepara el texto del buscador para usarlo el la url
 * Permite letras (con tildes y ñ), espacios, guiones y guiones bajos.
 * Devuelve la cadena codificada en formato URI lista para fetch().
 * 
 * @param {string} texto - Texto introducido por el usuario.
 * @returns {string|null} - Texto codificado si es válido, o null si no lo es.
 */
const validarTexto = (texto) => {
  const regex = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s_-]+$/;
  const limpio = texto.trim();

  if (regex.test(limpio) && limpio.length > 0) {
    return encodeURIComponent(limpio);
  } else {
    return null; // No válido
  }
}

/**
 * Llamar a la api para conseguir los datos por la categoria
 * @async
 * @param {string} category 
 * @returns {Promise<Object>}
 */
const llamarConCategoria = async(category) =>{
    try {
        //console.log(category)
        const categoria = validarTexto(category)
        if(categoria != null){
            const data = await llamarApi(`${urlBase}search?query=${categoria}&locale=es-ES`)
            console.log(data)
            return data
        }
    } catch (error) {
        console.log(error)
    }
}

const obtenerTamaño = (src) =>{
    return src.original
}

/**
 * Dado un objeto de photos deveulve un article con la foto incluida
 * @param {Object} elemento 
 * @returns {HTMLBodyElement}
 */
const pintarFoto = (elemento) =>{
    const card = document.createElement("ARTICLE")
    const cardFoto = document.createElement("FIGURE")
    const imagen = document.createElement("IMG")
    const description = document.createElement("P")
    const autor = document.createElement("P")
    const favoritos = document.createElement("BUTTON")
    imagen.src = elemento.src.original
    imagen.alt = elemento.alt
    description.textContent = elemento.alt
    autor.textContent = elemento.photografer
    favoritos.id = elemento.id
    favoritos.classList.add("btn-favorito")
    cardFoto.append(imagen, description, autor, favoritos)
    card.append(cardFoto)
    console.log(card)
    return card
}

/**
 * Pinta las fotos del array en el dom
 * @param {Object} data
 */
const pintarPagina = (data) => {
    select.style.display = "flex"
    const arrayFotos = [...data.photos]
    arrayFotos.forEach(element => {
        fragment.append(pintarFoto(element))
    });
    //Añadirlo el fragment al elemento del dom
    cardContainer.append(fragment)
    //pintarPaginado(data);
}


/**
 * Recibir la categoria y si consigue el array de fotos lo manda a pintar
 * @param {string} categoria 
 */
const recibirFotosCategoria = async(categoria)=>{
   try {
        const resp = await llamarConCategoria(categoria)
        if(Array.isArray(resp.photos)){
            pintarPagina(resp)
        }else{
            throw "No hemos recibido array"
        }
   } catch (error) {
    
   }
}







/******************************************************
 * INVOCACIONES
 ******************************************************/