/******************************************************
 * VARIABLES
 ******************************************************/
const urlBase = "https://api.pexels.com/v1/"
const apiKey = "HKLxOHGFJLAhYKSc7I1LwKdj74AWmuf9TUOhENxiC1giUHbZP8Ar4o7N"
const buscador = document.querySelector("#buscador")

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
            return data.photos
        }
    } catch (error) {
        console.log(error)
    }
}



/**
 * Recibir la categoria y si consigue el array de fotos lo manda a pintar
 * @param {string} categoria 
 */
const recibirFotosCategoria = async(categoria)=>{
   try {
        const arrayFotos = await llamarConCategoria(categoria)
        if(Array.isArray(arrayFotos)){
            //intarPagina(arrayFotos)
            console.log(arrayFotos)
        }else{
            throw "No hemos recibido array"
        }
   } catch (error) {
    
   }
}







/******************************************************
 * INVOCACIONES
 ******************************************************/