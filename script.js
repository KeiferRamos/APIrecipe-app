const BASE_URL = "https://api.spoonacular.com/recipes/";
const apiKey = "125b09bd8cb44ca2b3fe96ad216ed60a";

const autoCompleteSearch = async (text) => {
  const { data } = await axios.get(
    `${BASE_URL}autocomplete?number=5&query=${text}&apiKey=${apiKey}`
  );
  const searchedText = data.map((e) => {
    return `<p class="search-el" data-id=${e.id}>${e.title}</p>`;
  });

  $(".search-text").html(searchedText.join(""));
  $(".search-el").on("click", ({ target }) => {
    getRecipeInfo(target.dataset.id).then((data) => {
      displayRecipe(data).catch((err) => console.log(err));
    });
    $(".text-field").val("");
    $(".search-text").empty();
  });
};

$(".text-field").on("input", ({ target }) => {
  autoCompleteSearch(target.value);
});

const getrelatedRecipe = async (id) => {
  const { data } = await axios.get(
    `${BASE_URL}${id}/similar?apiKey=${apiKey}&number=4`
  );

  data.forEach(async (recipe) => {
    const data = await getRecipeInfo(recipe.id);
    const { id, image, title } = data;
    $(".related-recipe").append(`
      <div onclick="displaySingleRecipe(${id})">
        <img src=${image} />
        <p>${title}</p>
      </div>`);
  });
};

//display single item recipe
const displayRecipe = (data) => {
  const {
    id,
    dishTypes,
    extendedIngredients,
    analyzedInstructions,
    instructions,
    summary,
    image,
    title,
    vegan,
    vegetarian,
    veryHealthy,
    veryPopular,
    glutenFree,
    cheap,
    lowFodmap,
    pricePerServing,
    readyInMinutes,
    healthScore,
  } = data;

  const instructionsData = instructions
    ? analyzedInstructions[0].steps
        .map((steps) => {
          return `<p>${steps?.number} ${steps?.step}</p>`;
        })
        .join("")
    : `<p class="no-recipe">no instructions available😌</p>`;

  const dishTypeDisplay = dishTypes.map((dishType) => {
    return `<p>${dishType}</p>`;
  });

  const ingredients = extendedIngredients.map((ing) => {
    return `<p>${ing.original}</p>`;
  });
  console.log(data);
  getrelatedRecipe(id);

  $(".container").html(`
    <div class="recipe">
      <div class="info">
        <div>
          <h3>${title}😋</h3>
          <div class="image">
            <i id=${id} class="fas fa-bookmark" onclick="setBookmark(${id})"></i>
            <div class="other-details">
              <i class="fas fa-question"></i>
              <div>
                <p>vegan: ${vegan ? "yeah" : "nope"}</p>
                <p>vegetarian: ${vegetarian ? "yeah" : "nope"}</p>
                <p>veryHealthy: ${veryHealthy ? "yeah" : "nope"}</p>
                <p>glutenFree: ${glutenFree ? "yeah" : "nope"}</p>
                <p>lowFodmap: ${lowFodmap ? "yeah" : "nope"}</p>
                <p>veryPopular: ${veryPopular ? "yeah" : "nope"}</p>
                <p>cheap: ${cheap ? "yeah" : "nope"}</p>
                <p>pricePerServing: ₱${pricePerServing}</p>
                <p>readyInMinutes: ${readyInMinutes}</p>
                <p>healthScore: ${healthScore}</p>
              </div>
            </div>
            <img src=${image} alt="item image" class="recipe-image"/>
          </div>
          <div class="dish-type">
            ${dishTypeDisplay.join("")}
          </div>
        </div>
        <div class="ingredients">
          <h3>ingredients🍆</h3>
          ${ingredients.join("")}
        </div>
      </div>
      <div class="instructions">
        <h3>instruction🍤</h3>
        ${instructionsData}
      </div>
    </div>
    <h3 class="related-header">Related Recipe🍎</h3>
    <div class="related-recipe"></div>
    <div class="summary">
      <h2>SUMMARY</h2>
      <div>${summary}</div>
    </div>`);

  if (bookmarked.includes(id)) {
    $(`#${id}`).css("color", "red");
  } else {
    $(`#${id}`).css("color", "green");
  }
};

const returnhome = () => {
  $(".container").empty();
  displayRecipes();
};

//fetch single item
const getRecipeInfo = async (id) => {
  const { data } = await axios.get(
    `${BASE_URL}${id}/information?apiKey=${apiKey}`
  );

  return data;
};

//display all item
const displayRecipes = async () => {
  const {
    data: { results },
  } = await axios.get(`${BASE_URL}complexSearch?apiKey=${apiKey}&number=30`);

  const previewData = results.map((result) => {
    const { image, id, title } = result;
    return `
      <div class="single-item">
        <i id=${id} class="fas fa-bookmark" onclick="setBookmark(${id})"></i>
        <div class="item" data-id=${id}>
          <img src=${image} />
          <p>${title}</p>
        </div>
      </div> `;
  });
  $(".container").append("<div class='content'></div>");
  $(".content").html(previewData.join(""));

  $(".fa-bookmark").each((index, item) => {
    if (bookmarked.includes(+item.id)) {
      $(item).css("color", "red");
    }
  });

  $(".item").on("click", ({ currentTarget }) => {
    const { id } = currentTarget.dataset;
    window.scrollTo = 0;
    displaySingleRecipe(id);
  });
};

const getBookmarked = () => {
  let item = localStorage.getItem("bookmarked");
  return item ? JSON.parse(item) : [];
};

const bookmarked = getBookmarked();

const setBookmark = (id) => {
  if (!bookmarked.includes(id)) {
    $(`#${id}`).css("color", "red");
    bookmarked.push(id);
  } else {
    $(`#${id}`).css("color", "green");
    bookmarked.splice(bookmarked.indexOf(id), 1);
  }
  localStorage.setItem("bookmarked", JSON.stringify(bookmarked));
};

const displayBookmark = () => {
  $(".container").empty();
  $(".container").append("<div class='content'></div>");

  bookmarked.forEach(async (mark) => {
    const data = await getRecipeInfo(mark);
    const { image, id, title } = data;

    $(".content").append(`
      <div class="single-item" id=${id}>
        <i class="fas fa-bookmark" onclick="removeItem(${id})"></i>
        <div class="item" data-id=${id}>
          <img src=${image} onclick="displaySingleRecipe(${id})"/>
          <p>${title}</p>
        </div>
      </div>`);

    $(".fa-bookmark").css("color", "red");
  });
};

const displaySingleRecipe = (id) => {
  $("body").scrollTop(0);
  getRecipeInfo(id).then((data) => displayRecipe(data));
};

const removeItem = (id) => {
  $(`#${id}`).remove();
  bookmarked.splice(bookmarked.indexOf(+id), 1);
  localStorage.setItem("bookmarked", JSON.stringify(bookmarked));
};

$(document).ready(async () => {
  displayRecipes();
});
