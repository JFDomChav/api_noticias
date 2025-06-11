// Clase para las apis
class API_NEWS{
    constructor(){
        this.API_KEY = ""; 
        this.MAX_NEWS = 20;
    }   
    get_url(KEYWORDS, LANG, COUNTRY, FROM, TO, top_news, category){
        let url = "";
        if(top_news){
            url = `https://gnews.io/api/v4/top-headlines?category=${category}&lang=${LANG}&country=${COUNTRY}${(FROM != null && FROM != "") ? "&from="+FROM:""}${(TO != null && TO != "") ? "&to="+TO:""}&max=${this.MAX_NEWS}&apikey=${this.API_KEY}`;
        }else{
            url = `https://gnews.io/api/v4/search?${ /* q= */(KEYWORDS == "" || KEYWORDS == null ? "q=None":"q="+KEYWORDS)}&lang=${/* lang = */LANG}&country=${/*country = */ COUNTRY}&max=${/* max= */this.MAX_NEWS}${(FROM != null && FROM != "") ? "&from="+FROM:""}${(TO != null && TO != "") ? "&to="+TO:""}&apikey=${/*api key= */ this.API_KEY}`;
        }
        return url;
    }
}
// Clase para la informacion de la busqueda
class Search_new_info{
    /*
     let KEYWORDS = (req.query.q != undefined) ? req.query.q : null
    let category = (req.query.category != undefined) ? req.query.category : null
    let LANG = (req.query.lang != undefined) ? req.query.lang : null
    let COUNTRY = (req.query.country != undefined) ? req.query.country : null
    let FROM = (req.query.from != undefined) ? req.query.from : null
    let TO = (req.query.to != undefined) ? req.query.to : null
    */
    constructor(){
        this.KEYWORDS = null;
        this.category = null;
        this.LANG = null;
        this.COUNTRY = null;
        this.FROM = null;
        this.TO = null;
    }
    
    get keywords() {
        return this.KEYWORDS;
    }

    set keywords(value) {
        this.KEYWORDS = (value != undefined) ? value : null;
    }

    get category() {
        return this.category;
    }

    set category(value) {
        this.category = (value != undefined) ? value : null;
    }

    get lang() {
        return this.LANG;
    }

    set lang(value) {
        this.LANG = (value != undefined) ? value : null;
    }

    get country() {
        return this.COUNTRY;
    }

    set country(value) {
        this.COUNTRY = (value != undefined) ? value : null;
    }

    get from() {
        return this.FROM;
    }

    set from(value) {
        this.FROM = (value != undefined) ? value : null;
    }

    get to() {
        return this.TO;
    }

    set to(value) {
        this.TO = (value != undefined) ? value : null;
    }
}
// Configuraciones
const express = require('express')
const https = require('https');
const app = express()
const port = 3000
const expressLayouts = require('express-ejs-layouts');
const axios = require('axios');
app.use(express.static('public'));
app.set('views', __dirname + '/Views');
app.set('view engine', 'ejs');
app.use(expressLayouts);
// Control de url
app.listen(port, () => {
  console.log(`Puerto: ${port}`)
})
app.get('/', (req, res) => {
    res.render('search')
})
app.get('/search', async (req, res) =>{
    Search_info = Search_new_info();
    Search_info.KEYWORDS = req.query.q;
    Search_info.category = req.query.category;
    Search_info.LANG = req.query.lang;
    Search_info.COUNTRY = req.query.country;
    Search_info.FROM = req.query.from;
    Search_info.TO = req.query.to;
    
    let articles;
    if(Search_info.KEYWORDS != null){
        articles = await obtenerRecursos(Search_info, false);
    }else if(req.query.category != undefined){
        articles = await obtenerRecursos(Search_info, true);
    }
    res.render('news', {articles: articles}
    );
})
// Funciones
async function obtenerRecursos(Search_info, top_news) {
    const NEWS = new API_NEWS();
    url = NEWS.get_url(Search_info.KEYWORDS, Search_info.LANG, Search_info.COUNTRY, Search_info.FROM, Search_info.TO, top_news, Search_info.category)
    try {
        respuesta = await axios.get(url);
        return respuesta.data.articles;
    } catch (error) {
        console.error('Hubo un error:', error);
    }
}