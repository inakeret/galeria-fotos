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
 * @type {HTMLElement}
 */
const cardContainerFavoritos = document.querySelector("#cardContainerFavoritos")

/**
 * @type {HTMLDivElement}
 */
const paginadoContainer = document.querySelector("#paginadoContainer")

/**
 * @type {HTMLDivElement}
 */
const select= document.querySelector("#select")

/**
 * @type {string} guarda la categoria actual
 */
let categoriaActual

/**
 * @type {string} key del localStorage para guardar favoritos
 */
const key = "pexels.favorites:v1"; 
let ejeActual = ""





class FotoFavorito {
    constructor(id,src,alt,autor, categoria, height, width){
        this.id = id 
        this.src = src
        this.alt = alt
        this.photographer = autor
        this.categoria = categoria
        this.height = height
        this.width = width
    }

    esIgual(id){
        return this.id == id
    }

}


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
    if(cardContainer){
        recibirEliminarCategoria(ev.target.buscar.value)
    }else if(cardContainerFavoritos){
        pintarCategoriaFavorito(ev.target.buscar.value)
    }
    ev.target.buscar.value = ""
    
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
        recibirFotosCategoria(categoriaActual, ev.target.id,ejeActual)
    }

    if(ev.target.classList.contains("categoriasbtn")){
        recibirEliminarCategoria(ev.target.alt)
    }

    if(ev.target.classList.contains("btn-favorito")){
        gestionarFavorito(ev.target)
    }
})


document.addEventListener("change", (ev) => {
    ev.preventDefault()
    if(ev.target.id == "eje"){
        if(cardContainer){
            gestionarEje(ev.target.value)
        }else if(cardContainerFavoritos){
            gestionarEjeFavorito(ev.target.value)
        }
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
const llamarConCategoria = async(category, pagina = 1,eje = "", per_page = 20) =>{
    try {
        //console.log(category)
        let ejes = ""
        const categoria = validarTexto(category)
        if(categoria != null){
            if(eje != ""){
                ejes = `&orientation=${eje}`
            }
            categoriaActual = categoria
            const data = await llamarApi(`${urlBase}search?query=${categoria}&page=${pagina}&per_page=${per_page}&locale=es-ES${ejes}`)
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
    return src.original
}

/**
 * Devuelve si una foto es favorito o no
 * @param {number} id 
 * @returns {boolean}
 */
const esFavorito = (id, arrayFavoritos) =>{
    if(arrayFavoritos.length == 0){
        return false
    }else{
        if(arrayFavoritos.some(element => element.id == id)){
            return true
        }
        else{
            return false
        }
    }

}

/**
 * Dado un objeto de photos deveulve un article con la foto incluida
 * @param {Object} elemento 
 * @returns {HTMLBodyElement}
 */
const pintarFoto = (elemento, arrayFavoritos, paginado) =>{
    const card = document.createElement("ARTICLE")
    const cardFoto = document.createElement("FIGURE")
    const imagen = document.createElement("IMG")
    const description = document.createElement("P")
    const autor = document.createElement("P")
    const botonContainer = document.createElement("DIV")
    const favoritos = document.createElement("BUTTON")
    if(paginado){
        imagen.src = obtenerTamaño(elemento.src)
        description.textContent = elemento.alt
        autor.textContent = elemento.photographer
    }
    else{
        imagen.src = elemento.src
    } 
    imagen.alt = elemento.alt

    botonContainer.classList.add("btn-corazon")
    favoritos.id = elemento.id
    favoritos.classList.add("btn-favorito")
    if(esFavorito(elemento.id,arrayFavoritos)){
        favoritos.style.setProperty('--color', 'red'); 
    }
    botonContainer.append(favoritos)
    cardFoto.append(imagen, description, autor, botonContainer)
    card.append(cardFoto)
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
const pintarPagina = (data, cardContainer, paginado = true) => {
    select.style.display = "flex"
    cardContainer.innerHTML = ""
    let arrayFotos
    if(paginado){
        arrayFotos = [...data.photos]
        pintarPaginado(data);
    }else{
        arrayFotos = [...data]
    }
    const arrayFavoritos = loadLocalStorage(key)
    arrayFotos.forEach(element => {
        fragment.append(pintarFoto(element, arrayFavoritos,paginado))
    });
    //Añadirlo el fragment al elemento del dom
    cardContainer.append(fragment)
}


/**
 * Recibir la categoria y si consigue el array de fotos lo manda a pintar
 * @param {string} categoria 
 */
const recibirFotosCategoria = async(categoria,pagina = 1, eje = "")=>{
   try {
        const resp = await llamarConCategoria(categoria, pagina,eje)
        if(Array.isArray(resp.photos)){
            pintarPagina(resp,cardContainer)
        }else{
            throw "No hemos recibido array"
        }
   } catch (error) {
    
   }
}

/**
 * Cambia el eje de las fotos
 * @param {string} eje 
 */
const gestionarEje = (eje) =>{
    recibirFotosCategoria(categoriaActual,1,eje)
    setTimeout( ()=>{
        /**
         * @type {HTMLElement}
         */
        const imagenCard = document.querySelectorAll(".card-container article img")
        imagenCard.forEach(img =>{
            if(eje == "landscape"){
                img.style.setProperty('--height', '150px'); 
            }else if (eje == "portrait"){
                img.style.setProperty('--height','500px')
            }else if (eje == "square"){
                img.style.setProperty('--height','250px')
            }
        })
    },900) 
}

/**
 * Cambia el eje de las fotos favoritas
 * @param {string} eje 
 */
const gestionarEjeFavorito = (eje) =>{
    const arrayFavoritos = loadLocalStorage(key)
    let array =[]
    if(eje == "landscape"){
        array = [...arrayFavoritos.filter(foto => foto.width>foto.height)]

    }else if (eje == "portrait"){
        array = [...arrayFavoritos.filter(foto => foto.width<foto.height)]
    }else{
        array = [...arrayFavoritos]
    }
    pintarPagina(array, cardContainerFavoritos, false)
    setTimeout( ()=>{
        /**
         * @type {HTMLElement}
         */
        const imagenCard = document.querySelectorAll(".card-container article img")
        imagenCard.forEach(img =>{
            if(eje == "landscape"){
                img.style.setProperty('--height', '150px'); 
            }else if (eje == "portrait"){
                img.style.setProperty('--height','500px')
            }
        })
    },500)
    
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
    const array = ["Naturaleza", "Ciudad" , "Comida", "Animales", "Parque", "Desertico", "Jungla", "Playa", "Espacio", "Personas", "Cultura", "Deportes"]
    const arrayCategorias = obtenerCategoriasAleatorias(array,3)
    const promesas = arrayCategorias.map(elemento => llamarConCategoria(elemento, 1, 1))
    const photos = await Promise.all(promesas)
    const fotosPintar = photos.map(element => element.photos[0])
    fotosPintar.forEach((foto,index) =>{
        fragment.append(pintarCategoriaUnica(foto,index, arrayCategorias))
    })
    categoriasContainer.append(fragment)
}

/**
 * obtener del localStorage
 * @param {string} clave 
 * @returns 
 */
const loadLocalStorage = (clave) => {

    return  JSON.parse(localStorage.getItem(clave) || "[]"); 
}

/**
 * Guarda el array en localStorage
 * @param {string} clave 
 * @param {Array} arr 
 * @returns 
 */
const setLocalStorage = (clave, arr) =>{
    localStorage.setItem(clave,JSON.stringify(arr));
}

/**
 * guarda en el localstorage la foto si no estaba ya
 * @param {FotoFavorito} foto 
 */
const addFavorito = (foto) => {
    const arrayFavoritos = loadLocalStorage(key)
    const arrayCategorias = loadLocalStorage("categorias")
    if (!arrayFavoritos.some(element => foto.id == element.id)){
        arrayFavoritos.push(foto)
        if(!arrayFavoritos.includes(foto.categoria.toLowerCase())){
            arrayCategorias.push(foto.categoria.toLowerCase())
        }
    }

    setLocalStorage(key,arrayFavoritos)
    setLocalStorage("categorias",arrayCategorias)
    console.log("foto AÑADIDA de favoritos")
}

/**
 * Elimina el elemento con el id igual
 * @param {number} id 
 */
const removeFavorito = (id) =>{
    const arrayFavoritos = loadLocalStorage(key)
    const arrayCategorias = loadLocalStorage("categorias")
    if(arrayFavoritos.length !== 0){
        const categoria = arrayFavoritos.find(element => element.id == id).categoria
        const array = arrayFavoritos.map(element => element.categoria == categoria)
        if (array.length<=1){
            setLocalStorage("categorias", arrayCategorias.filter(element => element == categoria))
        }
        const arrayNuevo = arrayFavoritos.filter(element => element.id != id)
        setLocalStorage(key,arrayNuevo)
    }
    console.log("foto ELIMINADA de favoritos")
}

/**
 * Guarda la foto con el id igual que el boton
 * @param {HTMLElement} btn 
 */
const guardarFavorito = async(btn) => {
    try {
        const photo = await llamarApi(`${urlBase}/photos/${btn.id}`)
        console.log(photo)
        const {id,src:{original}, alt, photographer, height, width} = photo
        console.log(alt)
        const foto = new FotoFavorito(id,original,alt,photographer, categoriaActual.toLowerCase(), height, width)
        addFavorito(foto)
    } catch (error) {
        console.log(error)
    }
}

/**
 * Elimina la foto que tenga el mismo id qe el boton
 * @param {HTMLElement} btn 
 */
const eliminarFavorito = (btn) => {
    removeFavorito(btn.id)
    if(cardContainerFavoritos){
        pintarFavoritos()
    }
}


/**
 * Si el elemento esta en localstorage lo elimina, sino lo guarda
 * @param {HTMLElement} btn 
 */
const gestionarFavorito = async (btn) =>{
    //const color = getComputedStyle(btn).getPropertyValue('--color').trim();
    arrayFavoritos = loadLocalStorage(key)
    if(arrayFavoritos.some(element => element.id == btn.id)){
        btn.style.setProperty('--color', 'rgb(206, 202, 202)'); 
        eliminarFavorito(btn)
    }
    else{
        btn.style.setProperty('--color', 'red');
        await guardarFavorito(btn)
    }
}


/**
 * pinta las fotos favoritas
 */
const pintarFavoritos = () =>{
    const arrayFavoritos = loadLocalStorage(key)
    pintarPagina(arrayFavoritos,cardContainerFavoritos,false)
}

/**
 * Pinta los favorito de la categoria categoria
 * @param {string} categoria 
 */
const pintarCategoriaFavorito = (categoria) =>{
    cardContainerFavoritos.innerHTML=""
    const arrayCategorias = loadLocalStorage("categorias")
    const arrayFavoritos = loadLocalStorage(key)
    if(arrayCategorias.includes(categoria.toLowerCase()))
        pintarPagina(arrayFavoritos.filter(element => element.categoria == categoria.toLowerCase()), cardContainerFavoritos, false)
    else{
        const titulo = document.createElement("H2")
        titulo.textContent = `No hay favoritos de la categoria: ${categoria}`
        cardContainerFavoritos.append(titulo)
    }
}

/**
 * Mira en que documento html estamos para saber que funcion invocar al cargar la pagina
 */
const mirarPaginaHTML = () =>{
    if (cardContainer){
        pintarCategorias()
    }

    if(cardContainerFavoritos){
        pintarFavoritos()
    }
}
/******************************************************
 * INVOCACIONES
 ******************************************************/
mirarPaginaHTML()