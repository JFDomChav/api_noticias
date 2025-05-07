class API_NEWS{
    constructor(){
        this.API_KEY = ""; 
        this.MAX_NEWS = 20;
    }   
    get_url(KEYWORDS, LANG, COUNTRY, FROM, TO, top_news, category){
        let url = "";
        if(top_news){
            url = `https://gnews.io/api/v4/top-headlines?category=${category}&lang=${LANG}&country=${COUNTRY}&from="+FROM:""}${(TO != null && TO != "") ? "&to="+TO:""}&max=${this.MAX_NEWS}&apikey=${this.API_KEY}`;
        }else{
            url = `https://gnews.io/api/v4/search?${ /* q= */(KEYWORDS == "" || KEYWORDS == null ? "q=None":"q="+KEYWORDS)}&lang=${/* lang = */LANG}&country=${/*country = */ COUNTRY}&max=${/* max= */this.MAX_NEWS}${(FROM != null && FROM != "") ? "&from="+FROM:""}${(TO != null && TO != "") ? "&to="+TO:""}&apikey=${/*api key= */ this.API_KEY}`;
        }
        console.log("URL: "+url);
        return url;
    }
}

const express = require('express')
const https = require('https');
const app = express()
const port = 3000

app.get('/', (req, res) => {
    res.send(construct_principal_page());
})

app.get('/scripts/principal_script.js', (req, res) =>{
    let js = `const toggleDates = document.getElementById('toggleDates');
const dateRangeFields = document.getElementById('dateRangeFields');
const toggleKeywords = document.getElementById('toggleKeywords');
const keywordsSection = document.getElementById('keywords-section');
const categoryList = document.getElementById('category-list');
const keywordsContainer = document.getElementById('keywords-container');
const addKeywordBtn = document.getElementById('addKeywordBtn');
const removeKeywordBtn = document.getElementById('removeKeywordBtn');

toggleDates.addEventListener('change', function() {
    dateRangeFields.classList.toggle('hidden', !this.checked);
});

toggleKeywords.addEventListener('change', function() {
    keywordsSection.classList.toggle('hidden', !this.checked);
    categoryList.classList.toggle('hidden', this.checked);
    updateRemoveButtonVisibility();
});

addKeywordBtn.addEventListener('click', function() {
    const newKeywordInputGroup = document.createElement('div');
    newKeywordInputGroup.classList.add('keyword-input-group');
    newKeywordInputGroup.innerHTML = '<input type="text" class="keyword-input" name="keywords[]" placeholder="Otro keyword">';
    keywordsContainer.appendChild(newKeywordInputGroup);
    updateRemoveButtonVisibility();
});

removeKeywordBtn.addEventListener('click', function() {
    const keywordInputGroups = keywordsContainer.querySelectorAll('.keyword-input-group');
    if (keywordInputGroups.length > 1) {
        keywordsContainer.removeChild(keywordInputGroups[keywordInputGroups.length - 1]);
        updateRemoveButtonVisibility();
    }
});

function updateRemoveButtonVisibility() {
    const keywordInputGroups = keywordsContainer.querySelectorAll('.keyword-input-group');
    removeKeywordBtn.classList.toggle('hidden', keywordInputGroups.length <= 2);
}

document.getElementById('newsFilterForm').addEventListener('submit', function(event) {
    event.preventDefault();
    if (toggleKeywords.checked) {
        handleKeywordsSearch(this);
    } else {
        handleCategorySearch(this);
    }
});

function handleKeywordsSearch(form) {
    let params_url = "?q=";
    let keywords = document.getElementsByClassName("keyword-input");
    for(let i=0; i<keywords.length; i++){
        params_url += keywords[i].value+" AND ";
    }
    params_url = params_url.slice(0,-5);
    params_url += (document.getElementById("language").value != '') ? "&lang="+document.getElementById("language").value: "";
    params_url += (document.getElementById("country").value != '') ? "&country="+document.getElementById("country").value: "";
    if(toggleDates.checked){
        params_url += (document.getElementById("startDate").value != '') ? "&from="+document.getElementById("startDate").value+"T00:00:00Z" : "";
        params_url += (document.getElementById("endDate").value != '') ? "&to="+document.getElementById("endDate").value+"T00:00:00Z" : "";
    } 
    window.location.href = "/search"+params_url;
}

function handleCategorySearch(form) {
    let params_url = "?category=";
    let category = document.getElementsByName("category");
    for(let i=0; i<category.length; i++){
        if(category[i].checked){
            params_url +=category[i].value;
            break;
        }
    }
    params_url += (document.getElementById("language").value != '') ? "&lang="+document.getElementById("language").value: "";
    params_url += (document.getElementById("country").value != '') ? "&country="+document.getElementById("country").value: "";
    if(toggleDates.checked){
        params_url += (document.getElementById("startDate").value != '') ? "&from="+document.getElementById("startDate").value+"T00:00:00Z" : "";
        params_url += (document.getElementById("endDate").value != '') ? "&to="+document.getElementById("endDate").value+"T00:00:00Z" : "";
    } 
    window.location.href = "/search"+params_url;    
}`;
    res.send(js);
})

function get_data(keyword, lang, country, from, to, top_news, category){
    return new Promise((resolve, reject) =>{
        let raw_data = '';
        console.log("KEYWORDS: "+keyword);
        const NEWS = new API_NEWS();
        https.get(
            NEWS.get_url(keyword, lang, country, from, to, top_news, category)
            , res => {
            console.log('code: '+res.statusCode);
            res.on('data', (chunk) => {
                try{
                    raw_data += chunk;
                }catch(e){
                    reject(e)
                }
            });
    
            res.on('end', () => {
                try{
                    const json_response = JSON.parse(raw_data);
                    let table_res;
                    if(json_response.articles.length != 0){
                        table_res = construct_search_page(json_response.articles);
                    }else{
                        table_res = construct_head()+"<h1>No hay noticias con la configuración deseada</h1>";
                    }
                    resolve(table_res);
                }catch(e){
                    reject(e)
                }
            });
        });
    });
}

app.get('/search', async (req, res) =>{
    let KEYWORDS = (req.query.q != undefined) ? req.query.q : null
    let category = (req.query.category != undefined) ? req.query.category : null
    let LANG = (req.query.lang != undefined) ? req.query.lang : null
    let COUNTRY = (req.query.country != undefined) ? req.query.country : null
    let FROM = (req.query.from != undefined) ? req.query.from : null
    let TO = (req.query.to != undefined) ? req.query.to : null
    let table_res = "";
    if(req.query.q != undefined){
        table_res = await get_data(KEYWORDS, LANG, COUNTRY, FROM, TO, false, category);
    }else if(req.query.category != undefined){
        table_res = await get_data(KEYWORDS, LANG, COUNTRY, FROM, TO, true, category);
    }
    res.send(table_res);
})

app.listen(port, () => {
  console.log(`Puerto: ${port}`)
})

function construct_principal_page(){
    return construct_head()+construct_search_content();
}

function construct_search_page(articles){
    return construct_head()+construct_table(articles);
}

function construct_head(){
    return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Noticias</title>
    <style>
        body {
            font-family: sans-serif;
            margin: 20px;
            background-color: #f4f4f4;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            background-color: #fff;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }
        th, td {
            padding: 10px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        th {
            background-color: #f2f2f2;
        }
        tr:hover {
            background-color: #f9f9f9;
        }
        .filter-row th {
            padding: 15px;
        }
        .filter-row select,
        .filter-row input[type="date"],
        .filter-row input[type="text"] {
            padding: 8px;
            margin-right: 10px;
            border: 1px solid #ccc;
            border-radius: 4px;
        }
        .news-item {
            display: flex;
            align-items: center;
        }
        .news-image {
            width: 80px;
            height: 60px;
            margin-right: 10px;
            object-fit: cover;
            border-radius: 4px;
        }
        .news-details {
            flex-grow: 1;
        }
        .news-title {
            font-weight: bold;
            color: #333;
            margin-bottom: 5px;
        }
        .news-date {
            color: #777;
            font-size: 0.9em;
            margin-bottom: 3px;
        }
        .news-country {
            font-style: italic;
            color: #555;
        }
        .news-description {
            color: #444;
            font-size: 0.95em;
        }
            .form-container {
            background-color: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
            margin-bottom: 20px;
        }
        .form-group {
            margin-bottom: 15px;
        }
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }
        select,
        input[type="date"],
        input[type="text"] {
            width: calc(100% - 12px);
            padding: 8px;
            border: 1px solid #ccc;
            border-radius: 4px;
            box-sizing: border-box;
        }
        .switch-container {
            display: flex;
            align-items: center;
        }
        .switch {
            position: relative;
            display: inline-block;
            width: 40px;
            height: 20px;
        }
        .switch input {
            opacity: 0;
            width: 0;
            height: 0;
        }
        .slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #ccc;
            transition: .4s;
            border-radius: 20px;
        }
        .slider:before {
            position: absolute;
            content: "";
            height: 16px;
            width: 16px;
            left: 2px;
            bottom: 2px;
            background-color: white;
            transition: .4s;
            border-radius: 50%;
        }
        input:checked + .slider {
            background-color: #2196F3;
        }
        input:focus + .slider {
            box-shadow: 0 0 1px #2196F3;
        }
        input:checked + .slider:before {
            transform: translateX(20px);
        }
        #keywords-container {
            margin-top: 10px;
        }
        .keyword-input-group {
            display: flex;
            margin-bottom: 5px;
        }
        .keyword-input {
            flex-grow: 1;
            margin-right: 5px;
        }
        .add-keyword-btn,
        .remove-keyword-btn,
        button[type="submit"] {
            padding: 8px 12px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            background-color: #007bff;
            color: white;
        }
        .remove-keyword-btn {
            background-color: #dc3545;
            margin-left: 5px;
        }
        #category-list {
            margin-top: 10px;
            padding: 8px;
            border: 1px solid #ccc;
            border-radius: 4px;
        }
        #category-list label {
            font-weight: normal;
            margin-right: 15px;
        }
        #category-list input[type="radio"] {
            margin-right: 5px;
        }
        .hidden {
            display: none;
        }
    </style>
</head>
<body>`;
}
function construct_search_content(){
    return `
    <h1>Noticias</h1>
    <div class="form-container">
        <h2>Filtrar Noticias</h2>
        <form id="newsFilterForm">
            <div class="form-group">
                <label for="language">Idioma:</label>
                <select id="language" name="language">
                    <option value="">Seleccionar idioma</option>
                    <option value="ar">Arabic</option>
                    <option value="zh">Chinese</option>
                    <option value="nl">Dutch</option>
                    <option value="en">English</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="el">Greek</option>
                    <option value="he">Hebrew</option>
                    <option value="hi">Hindi</option>
                    <option value="it">Italian</option>
                    <option value="ja">Japanese</option>
                    <option value="ml">Malayalam</option>
                    <option value="mr">Marathi</option>
                    <option value="no">Norwegian</option>
                    <option value="pt">Portuguese</option>
                    <option value="ro">Romanian</option>
                    <option value="ru">Russian</option>
                    <option value="es">Spanish</option>
                    <option value="sv">Swedish</option>
                    <option value="ta">Tamil</option>
                    <option value="te">Telugu</option>
                    <option value="uk">Ukrainian</option>
                </select>
            </div>

            <div class="form-group">
                <label for="country">País:</label>
                <select id="country" name="country">
                    <option value="">Seleccionar país</option>
                    <option value="au">Australia</option>
                    <option value="br">Brazil</option>
                    <option value="ca">Canada</option>
                    <option value="cn">China</option>
                    <option value="eg">Egypt</option>
                    <option value="fr">France</option>
                    <option value="de">Germany</option>
                    <option value="gr">Greece</option>
                    <option value="hk">Hong Kong</option>
                    <option value="in">India</option>
                    <option value="ie">Ireland</option>
                    <option value="il">Israel</option>
                    <option value="it">Italy</option>
                    <option value="jp">Japan</option>
                    <option value="nl">Netherlands</option>
                    <option value="no">Norway</option>
                    <option value="pk">Pakistan</option>
                    <option value="pe">Peru</option>
                    <option value="ph">Philippines</option>
                    <option value="pt">Portugal</option>
                    <option value="ro">Romania</option>
                    <option value="ru">Russian Federation</option>
                    <option value="sg">Singapore</option>
                    <option value="es">Spain</option>
                    <option value="se">Sweden</option>
                    <option value="ch">Switzerland</option>
                    <option value="tw">Taiwan</option>
                    <option value="ua">Ukraine</option>
                    <option value="gb">United Kingdom</option>
                    <option value="us">United States</option>
                </select>
            </div>

            <div class="form-group">
                <label>Rango de Fechas:</label>
                <div class="switch-container">
                    <label class="switch">
                        <input type="checkbox" id="toggleDates">
                        <span class="slider round"></span>
                    </label>
                    <label for="toggleDates" style="margin-left: 10px; font-weight: normal;">Activar rango de fechas</label>
                </div>
                <div id="dateRangeFields" class="hidden">
                    <label for="startDate">Desde:</label>
                    <input type="date" id="startDate" name="startDate">
                    <label for="endDate">Hasta:</label>
                    <input type="date" id="endDate" name="endDate">
                </div>
            </div>

            <div class="form-group">
                <label>Keywords:</label>
                <div class="switch-container">
                    <label class="switch">
                        <input type="checkbox" id="toggleKeywords">
                        <span class="slider round"></span>
                    </label>
                    <label for="toggleKeywords" style="margin-left: 10px; font-weight: normal;">Usar keywords</label>
                </div>
                <div id="keywords-section" class="hidden">
                    <div id="keywords-container">
                        <div class="keyword-input-group">
                            <input type="text" class="keyword-input" name="keywords[]" placeholder="Keyword">
                        </div>
                    </div>
                    <button type="button" id="addKeywordBtn" class="add-keyword-btn">Añadir otro keyword</button>
                    <button type="button" id="removeKeywordBtn" class="remove-keyword-btn hidden">Eliminar keyword</button>
                </div>
                <div id="category-list" class="">
                    <label><input type="radio" name="category" value="general"> General</label>
                    <label><input type="radio" name="category" value="world"> Mundial</label>
                    <label><input type="radio" name="category" value="nation"> Nación</label>
                    <label><input type="radio" name="category" value="business"> Negocios</label>
                    <label><input type="radio" name="category" value="technology"> Tecnología</label>
                    <label><input type="radio" name="category" value="entertainment"> Entretenimiento</label>
                    <label><input type="radio" name="category" value="sports"> Deportes</label>
                    <label><input type="radio" name="category" value="science"> Ciencia</label>
                    <label><input type="radio" name="category" value="health"> Salud</label>
                </div>
            </div>

            <button type="submit">Filtrar Noticias</button>
        </form>
    </div>
    <script type="text/javascript" src="/scripts/principal_script.js"></script>
</body>
</html>`;
}

function construct_table(articles){
    let table = `<table id="tableRes">`;
    for(let i=0; i<articles.length; i++){
        let article = articles[i];
        table += construct_new(article.title, article.description, article.publishedAt, article.image, article.url);
    }
    table += "</table>";
    return table;
}

function construct_new(title, desc, date, image, url){
    return `<tr>
            <td colspan="2"><a href="`+url+`">
                <div class="news-item">
                    <img src="`+image+`" class="news-image">
                    <div class="news-details">
                        <div class="news-title">`+title+`</div>
                        <div class="news-date">`+date+`</div>
                        <div class="news-description">`+desc+`</div>
                    </div>
                </div></a>
            </td>
        </tr>`;
}