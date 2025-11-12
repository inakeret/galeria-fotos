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
import { apiKey } from "./config.js";

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
let paginaActual = "1"

/**
 * @type
 */
const selectBuscador = document.querySelector("#buscador-categorias")




/**
 * Representa una foto almacenada en la lista de favoritos.
 *
 * @class
 */
class FotoFavorito {
    /**
     * Crea una nueva instancia de FotoFavorito.
     * @param {string} id - Identificador único de la foto.
     * @param {string} src - URL o ruta de la imagen.
     * @param {string} alt - Texto alternativo de la imagen.
     * @param {string} autor - Nombre del fotógrafo o autor.
     * @param {string} categoria - Categoría a la que pertenece la imagen.
     * @param {number} height - Altura de la imagen en píxeles.
     * @param {number} width - Anchura de la imagen en píxeles.
     */
    constructor(id,src,alt,autor, categoria, height, width){
        this.id = id 
        this.src = src
        this.alt = alt
        this.photographer = autor
        this.categoria = categoria
        this.height = height
        this.width = width
    }
}


/******************************************************
 * EVENTOS
 ******************************************************/

if(buscador){
    /**
     * Evento submit del formulario al buscar por categoria
     */
    buscador.addEventListener("submit", (ev)=>{
        ev.preventDefault()
        const form =  /** @type {HTMLFormElement} */ (ev.target);
        if(cardContainer){
            recibirEliminarCategoria(form.buscar.value)
        }
        form.buscar.value = ""
        
    })
}


/**
 * Evento global de clicks del documento
 * 
 *  - Si se pulsa un boton de paginado dispara recibirFotos con categoria
 * 
 *  - Si se pulsa un boton de categorias dispara la funcion recibirEliminarCategoria
 * 
 *  - Si se pulsa el boton favorito se dispara la funcion gestionarFavorito
 * 
 *  - Si se pulsa una imagen se dispara la funcion crearFotoAgrandada
 * 
 *  - Si se pulsa fuera de la imagen grande se dispara la funcion eliminarFotoAgrandada
 * 
 * @param {MouseEvent} ev evento de click 
 */
document.addEventListener("click", (ev)=>{
    const target = /** @type {HTMLElement} */ (ev.target);
    if(target.classList.contains("btn-paginado") && target.id != "notSelect"){
        cambiarPagina(categoriaActual, target.id,ejeActual)
    }

    if(target.classList.contains("categoriasbtn")){
        const img = /** @type {HTMLImageElement} */ (ev.target);
        recibirEliminarCategoria(img.alt)
    }

    if(target.classList.contains("btn-favorito")){
        gestionarFavorito(target)
    }

    if(target.classList.contains("miniatura")){
        const img = /** @type {HTMLImageElement} */ (ev.target);
        crearFotoAgrandada(img)
        console.log("Agrandar")
    }

    if (target.classList.contains('overlay')) {
        eliminarFotoAgrandada()
    }
})


/**
 * Evento change para los selectores
 * 
 *  - Si es el selector de orientacion llama a gestionarEje() o gestionarEjeFavorito depende del documento en el que estemos
 * 
 *  - Si es el selector de categorias favoritas llama a pintarCategoriaFavorito
 */
document.addEventListener("change", (ev) => {
    ev.preventDefault()
    const target = /** @type {HTMLSelectElement} */ (ev.target);
    if(target.id == "eje"){
        if(cardContainer){
            gestionarEje(target.value,categoriaActual,paginaActual)
        }else if(cardContainerFavoritos){
            gestionarEjeFavorito(target.value)
        }
    }  
    
    if(target.id == "buscador-categorias"){
        if(cardContainerFavoritos && target.value!= "none"){
            pintarCategoriaFavorito(target.value)
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
 * @param {string | number} [pagina]
 * @param {string} [eje]
 * @param {number | string} [per_page]
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
        throw error
    }
}

const pintarError = (error) => {
    if(cardContainer){
        const titulo = document.createElement("h1")
        titulo.textContent = "Lo sentimos, no podemos conseguir las fotos ahora mismo por este error : " + error
        categoriasContainer.append(titulo)
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
 * @returns {HTMLElement}
 */
const pintarFoto = (elemento, arrayFavoritos, paginado) =>{
    const card = document.createElement("ARTICLE")
    const cardFoto = document.createElement("FIGURE")
    const imagen = /** @type {HTMLImageElement}*/ document.createElement("img")
    const span = document.createElement("SPAN")
    const description = document.createElement("P")
    const autor = document.createElement("P")
    const botonContainer = document.createElement("DIV")
    const favoritos = document.createElement("BUTTON")
    if(paginado){
        imagen.src = obtenerTamaño(elemento.src)
        description.textContent = elemento.alt
        autor.textContent = elemento.photographer
        span.append(description, autor)
    }
    else{
        imagen.src = elemento.src
    } 
    imagen.alt = elemento.alt
    imagen.classList.add("miniatura")

    botonContainer.classList.add("btn-corazon")
    favoritos.id = elemento.id
    favoritos.classList.add("btn-favorito")
    if(esFavorito(elemento.id,arrayFavoritos)){
        favoritos.style.setProperty('--color', 'red'); 
    }
    botonContainer.append(favoritos)
    if(paginado){
        cardFoto.append(imagen,span, botonContainer)
    }
    else{
        cardFoto.append(imagen, botonContainer)
    }
    
    card.append(cardFoto)
    return card
}

/**
 * Pinta el paginado para poder pasar de paginas y ver distintas fotos
 * @param {Object} data 
 */
const pintarPaginado = (data) =>{
    paginadoContainer.innerHTML=""
    const numPaginas = Math.round(data.total_results / data.per_page)
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
    botonPrevio.id = data.page==1? "notSelect" :`${data.page -1}`
    botonPrevio.textContent = "<"
    previo.append(botonPrevio)
    lista.append(previo)
    for(let i = page - 2;i<=page+2; i++){
        const pagina = document.createElement("LI")
        const boton = document.createElement("BUTTON")
        boton.classList.add("btn-paginado")
        boton.id = String(i)
        boton.textContent = String(i)
        pagina.append(boton)
        lista.append(pagina)
    }
    if(data.page != numPaginas){
        const puntitos = document.createElement("LI")
        const botonPuntitos = document.createElement("BUTTON")
        botonPuntitos.classList.add("btn-paginado")
        botonPuntitos.id = "notSelect"
        botonPuntitos.textContent = "..."
        puntitos.append(botonPuntitos)
        lista.append(puntitos)
    }
    const siguiente = document.createElement("LI")
    const botonSiguiente = document.createElement("BUTTON")
    botonSiguiente.classList.add("btn-paginado")
    botonSiguiente.id = data.page==numPaginas? "notSelect" :String(data.page+1)
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
 * @param {string} categoria nombre de la categoria
 * @param {string | number} [pagina] numero de página
 * @param {string} [eje] orientacíon
 */
const recibirFotosCategoria = async(categoria,pagina = "1", eje = "")=>{
   try {
        const resp = await llamarConCategoria(categoria, pagina,eje)
        if(Array.isArray(resp.photos)){
            pintarPagina(resp,cardContainer)
        }else{
            throw "No hemos recibido array"
        }
   } catch (error) {
        pintarError(error)
   }
}

/**
 * Cambia el eje de las fotos
 * @param {string} eje eje de las fotos
 * @param {string} [categoria] nombre de la categoria
 * @param {number | string} [pag] numero de pagina
 * @param {number} [seg] milisegundos que tarde el pograma en cambiar las fotos de forma
 */
const gestionarEje = ( eje,categoria = categoriaActual, pag = 1, seg = 1800) =>{
    recibirFotosCategoria(categoria, pag, eje)
    setTimeout( ()=>{
        /**
         * @type {NodeListOf<HTMLElement>}
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
    },1800) 
    ejeActual = eje
}

/**
 * Funcion para cambiar de pagina en base al eje
 * @param {string} categoria nombre de la categoria
 * @param {string | number} pag numero de pagina
 * @param {string} eje 
 */
const cambiarPagina = (categoria, pag, eje) =>{
    let paginaActual
    if(eje==""){
        recibirFotosCategoria(categoria, pag)
        paginaActual = pag
    }else{
        gestionarEje( eje, categoria, pag, 2500)
        paginaActual = pag
    }
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
         * @type {NodeListOf<HTMLElement>}
         */
        const imagenCard = document.querySelectorAll(".card-container article img")
        imagenCard.forEach(img =>{
            if(eje == "landscape"){
                img.style.setProperty('--height', '150px'); 
            }else if (eje == "portrait"){
                img.style.setProperty('--height','500px')
            }
        })
    },1000)
    
}

/**
 * Vaciar el container de las categorias y llamar a la api para ke nos de las fotos de la categoria seleccionada
 * @param {string} categoria el nombre de la categoria
 */
const recibirEliminarCategoria = (categoria) =>{
    //categoriasContainer.innerHTML = ""
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
 * @param {number} index indice de la foto en el arrayCategorias
 * @param {Array} arrayCategorias array de fotos
 */
const pintarCategoriaUnica = (foto, index, arrayCategorias) =>{
    const card = document.createElement("ARTICLE")
    card.classList.add("categoria-container")
    const cardFoto = document.createElement("FIGURE")
    cardFoto.classList.add("card")
    const imagen = document.createElement("img")
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
    const promesas = arrayCategorias.map(elemento => llamarConCategoria(elemento, 1,"", 1))
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
        if(!arrayCategorias.includes(foto.categoria.toLowerCase())){
            arrayCategorias.push(foto.categoria.toLowerCase())
        }
    }

    setLocalStorage(key,arrayFavoritos)
    setLocalStorage("categorias",arrayCategorias)
    console.log("foto AÑADIDA de favoritos")
}

/**
 * Elimina el elemento con el id igual
 * @param {number | string} id 
 */
const removeFavorito = (id) =>{
    const arrayFavoritos = loadLocalStorage(key)
    const arrayCategorias = loadLocalStorage("categorias")
    if(arrayFavoritos.length !== 0){
        const categoria = arrayFavoritos.find(element => element.id == id).categoria
        const array = arrayFavoritos.filter(element => element.categoria == categoria)
        if (array.length<=1){
            setLocalStorage("categorias", arrayCategorias.filter(element => element != categoria))
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
 * @returns {Promise<undefined>} Promesa que se resuelve cuando termina la acción.
 */
const gestionarFavorito = async (btn) =>{
    //const color = getComputedStyle(btn).getPropertyValue('--color').trim();
    const arrayFavoritos = loadLocalStorage(key)
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
 * dada una imagen coge su src y lo pone en grande
 * @param {HTMLImageElement} img 
 */
const crearFotoAgrandada = (img) => {
    const fondo = document.createElement('DIV');
    fondo.classList.add('fondo');
    const overlay = document.createElement('DIV');
    overlay.classList.add('overlay');
    
    const imgBig = document.createElement('img');
    imgBig.classList.add('imagen-grande');
    imgBig.src = img.src
    
    const cerrar = document.createElement('SPAN');
    cerrar.classList.add('cerrar');
    // cerrar.textContent = "X";
    
    overlay.append(imgBig);
    overlay.append(cerrar);
    fondo.append(overlay)
    document.body.append(fondo);
    console.log("foto grande creada")
}

/**
 * Elimina la foto Agrandada
 */
const eliminarFotoAgrandada = () =>{
    const fondo = document.querySelector('.fondo');
    if (fondo) fondo.remove();
}

/**
 * crea el selector del buscador de favoritos
 */
const crearSelectBuscador = () => {
    selectBuscador.innerHTML = ""
    const fragment = document.createDocumentFragment()
    const arrayCategorias = loadLocalStorage("categorias")
    const option = document.createElement("option")
    option.value = "none"
    option.textContent = "Selecciona categoría"
    fragment.append(option)
    if (arrayCategorias.length != 0){
        arrayCategorias.forEach(element => {
            const option = document.createElement("option")
            option.value = element
            option.textContent = element
            fragment.append(option)
        })
    }
    selectBuscador.append(fragment)
}

/**
 * pinta las fotos favoritas
 */
const pintarFavoritos = () =>{
    const arrayFavoritos = loadLocalStorage(key)
    crearSelectBuscador()
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