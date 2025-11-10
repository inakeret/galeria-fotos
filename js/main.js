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
let categoriaActual


/******************************************************
 * EVENTOS
 ******************************************************/
buscador.addEventListener("submit", (ev)=>{
    ev.preventDefault()
    //console.log()
    recibirFotosCategoria(ev.target.buscar.value)
})


document.addEventListener("click", (ev)=>{
    if(ev.target.classList.contains("btn-paginado") && ev.target.id != "notSelect"){
        recibirFotosCategoria(categoriaActual, ev.target.id)
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
const llamarConCategoria = async(category, pagina = 1) =>{
    try {
        //console.log(category)
        const categoria = validarTexto(category)
        if(categoria != null){
            categoriaActual = categoria
            const data = await llamarApi(`${urlBase}search?query=${categoria}&page=${pagina}&per_page=20&locale=es-ES`)
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
    imagen.src = elemento.src.portrait
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







/******************************************************
 * INVOCACIONES
 ******************************************************/