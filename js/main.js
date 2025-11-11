/******************************************************
 * VARIABLES
 ******************************************************/
/**
 * @type {string} urlBase url base de la api
 */
const urlBase = "https://api.pexels.com/v1/"

/**
 * @type {string} key de la api
 */
const apiKey = "HKLxOHGFJLAhYKSc7I1LwKdj74AWmuf9TUOhENxiC1giUHbZP8Ar4o7N"

/**
 * @type {HTMLFormElement}
 */
const buscador = document.querySelector("#buscador")

/**
 * @type {DocumentFragment}
 */
const fragment = document.createDocumentFragment()

/**
 * @type {HTMLElement}
 */
const categoriasContainer = document.querySelector("#categoriasContainer")

/**
 * @type {HTMLElement}
 */
const cardContainer = document.querySelector("#cardContainer")

/**
 * @type {HTMLDivElement}
 */
const paginadoContainer = document.querySelector("#paginadoContainer")

/**
 * @type {HTMLDivElement}
 */
const select= document.querySelector("#select")
let categoriaActual


/******************************************************
 * EVENTOS
 ******************************************************/
/**
 * Evento submit del formulario al buscar por categoria
 * @event buscarCategoria
 * @param {SubmitEvent} ev formulario
 */
buscador.addEventListener("submit", (ev)=>{
    ev.preventDefault()
    recibirEliminarCategoria(ev.target.buscar.value)
})

/**
 * Evento global de clicks del documento
 * 
 *  - Si se pulsa un boton de paginado dispara recibirFotos con categoria
 * 
 *  - Si se pulsa un boton de categorias dispara la funcion recibirEliminarCategoria
 * 
 * 
 * @param {MouseEvent} ev evento de click 
 */
document.addEventListener("click", (ev)=>{
    if(ev.target.classList.contains("btn-paginado") && ev.target.id != "notSelect"){
        recibirFotosCategoria(categoriaActual, ev.target.id)
    }

    if(ev.target.classList.contains("categoriasbtn")){
        recibirEliminarCategoria(ev.target.alt)
    }
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
const llamarConCategoria = async(category, pagina = 1, per_page = 20) =>{
    try {
        //console.log(category)
        const categoria = validarTexto(category)
        if(categoria != null){
            categoriaActual = categoria
            const data = await llamarApi(`${urlBase}search?query=${categoria}&page=${pagina}&per_page=${per_page}&locale=es-ES`)
            return data
        }
    } catch (error) {
        console.log(error)
    }
}


/**
 * Obtener tamaño del src
 * @param {Object} src con tamños distintos de la foto
 */
const obtenerTamaño = (src) =>{
    return src.portrait
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
    const botonContainer = document.createElement("DIV")
    const favoritos = document.createElement("BUTTON")
    imagen.src = obtenerTamaño(elemento.src)
    imagen.alt = elemento.alt
    description.textContent = elemento.alt
    autor.textContent = elemento.photografer
    botonContainer.classList.add("btn-corazon")
    favoritos.id = elemento.id
    favoritos.classList.add("btn-favorito")
    botonContainer.append(favoritos)
    cardFoto.append(imagen, description, autor, botonContainer)
    card.append(cardFoto)
    console.log(card)
    return card
}

/**
 * Pinta el paginado para poder pasar de paginas y ver distintas fotos
 * @param {Object} data 
 */
const pintarPaginado = (data) =>{
    paginadoContainer.innerHTML=""
    numPaginas = Math.round(data.total_results / data.per_page)
    let page = data.page
    if(data.page == 1 || data.page == 2){
        page = 3
    }
    else if(data.page == numPaginas || data.page == numPaginas-1){
        page = numPaginas-2
    }
    const lista = document.createElement("UL")
    const previo = document.createElement("LI")
    const botonPrevio = document.createElement("BUTTON")
    botonPrevio.classList.add("btn-paginado")
    botonPrevio.id = data.page==1? "notSelect" :data.page -1
    botonPrevio.textContent = "<"
    previo.append(botonPrevio)
    lista.append(previo)
    for(let i = page - 2;i<=page+2; i++){
        const pagina = document.createElement("LI")
        const boton = document.createElement("BUTTON")
        boton.classList.add("btn-paginado")
        boton.id = i
        boton.textContent = i
        pagina.append(boton)
        lista.append(pagina)
    }
    const siguiente = document.createElement("LI")
    const botonSiguiente = document.createElement("BUTTON")
    botonSiguiente.classList.add("btn-paginado")
    botonSiguiente.id = data.page==numPaginas? "notSelect" :data.page+1
    botonSiguiente.textContent = ">"
    siguiente.append(botonSiguiente)
    lista.append(siguiente)
    paginadoContainer.append(lista)
}

/**
 * Pinta las fotos del array en el dom
 * @param {Object} data
 */
const pintarPagina = (data) => {
    select.style.display = "flex"
    cardContainer.innerHTML = ""
    const arrayFotos = [...data.photos]
    arrayFotos.forEach(element => {
        fragment.append(pintarFoto(element))
    });
    //Añadirlo el fragment al elemento del dom
    cardContainer.append(fragment)
    pintarPaginado(data);
}


/**
 * Recibir la categoria y si consigue el array de fotos lo manda a pintar
 * @param {string} categoria 
 */
const recibirFotosCategoria = async(categoria,pagina = 1)=>{
   try {
        const resp = await llamarConCategoria(categoria, pagina)
        if(Array.isArray(resp.photos)){
            pintarPagina(resp)
        }else{
            throw "No hemos recibido array"
        }
   } catch (error) {
    
   }
}

/**
 * Vaciar el container de las categorias y llamar a la api para ke nos de las fotos de la categoria seleccionada
 * @param {string} categoria el nombre de la categoria
 */
const recibirEliminarCategoria = (categoria) =>{
    categoriasContainer.innerHTML = ""
    recibirFotosCategoria(categoria)
}

/**
 * Funcion para obtener n cantidad de elementos aleatorios de un array
 * @param {Array} arr array de categorias
 * @param {number} n cantidad de elementos que queremos
 */
const obtenerCategoriasAleatorias = (arr, n) => {
    const copia = [...arr];
    copia.sort(() => Math.random() - 0.5);
    return copia.slice(0, n);
}

/**
 * Pinta una unica categoria 
 * @param {Object} foto
 * @param {index} index indice de la foto en el arrayCategorias
 * @param {Array} arrayCategorias array de fotos
 */
const pintarCategoriaUnica = (foto,index, arrayCategorias) =>{
    const card = document.createElement("ARTICLE")
    card.classList.add("categoria-container")
    const cardFoto = document.createElement("FIGURE")
    cardFoto.classList.add("card")
    const imagen = document.createElement("IMG")
    const categoria = document.createElement("P")
    imagen.src = foto.src.portrait
    imagen.alt = arrayCategorias[index]
    imagen.classList.add("categoriasbtn")
    categoria.textContent = arrayCategorias[index]
    cardFoto.append(imagen, categoria)
    card.append(cardFoto)
    return card
}

/**
 * Pinta las categorias preseleccionadas aleatoriamente
 */
const pintarCategorias = async() => {
    const array = ["Naturaleza", "Ciudad" , "Comida", "Animales", "Parque", "Desertico", "Jungla", "Playa", "Espacio"]
    const arrayCategorias = obtenerCategoriasAleatorias(array,3)
    const promesas = arrayCategorias.map(elemento => llamarConCategoria(elemento, 1, 1))
    const photos = await Promise.all(promesas)
    const fotosPintar = photos.map(element => element.photos[0])
    fotosPintar.forEach((foto,index) =>{

        fragment.append(pintarCategoriaUnica(foto,index, arrayCategorias))
    })
    categoriasContainer.append(fragment)
}







/******************************************************
 * INVOCACIONES
 ******************************************************/
pintarCategorias()