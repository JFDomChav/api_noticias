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
    let KEYWORDS = (req.query.q != undefined) ? req.query.q : null
    let category = (req.query.category != undefined) ? req.query.category : null
    let LANG = (req.query.lang != undefined) ? req.query.lang : null
    let COUNTRY = (req.query.country != undefined) ? req.query.country : null
    let FROM = (req.query.from != undefined) ? req.query.from : null
    let TO = (req.query.to != undefined) ? req.query.to : null
    let articles;
    if(req.query.q != undefined){
        articles = await obtenerRecursos(KEYWORDS, LANG, COUNTRY, FROM, TO, false, category);
    }else if(req.query.category != undefined){
        articles = await obtenerRecursos(KEYWORDS, LANG, COUNTRY, FROM, TO, true, category);
    }
    res.render('news', {articles: articles}
    );
})
// Funciones
async function obtenerRecursos(keyword, lang, country, from, to, top_news, category) {
    const NEWS = new API_NEWS();
    url = NEWS.get_url(keyword, lang, country, from, to, top_news, category)
    try {
        respuesta = await axios.get(url);
        return respuesta.data.articles;
    } catch (error) {
        console.error('Hubo un error:', error);
    }
}