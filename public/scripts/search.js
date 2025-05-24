const toggleDates = document.getElementById('toggleDates');
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
}