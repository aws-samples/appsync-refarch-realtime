let env = require('process').env;
let axios = require('axios');
let AWS = require('aws-sdk');
let urlParse = require('url').URL;
let appsyncUrl = process.env.ENDPOINT;
let tmdbApiKey = process.env.TMDBKEY;
let url = 'https://api.themoviedb.org/3/movie/popular?api_key='+tmdbApiKey+'&language=en-US&page=';
let response;

let endpoint = (new urlParse(appsyncUrl)).hostname.toString();
let getMovies = `query GetMovies{
  getMovies(id: 0) {
    id
    name
    poster
    date
    plot
  }
}
`;
let createMovies = `mutation CreateMovies($input: CreateMoviesInput!) {
    createMovies(input: $input) {
      id
      name
      poster
      date
      plot
    }
  }
  `;
let updateMovies = `mutation UpdateMovies($input: UpdateMoviesInput!) {
    updateMovies(input: $input) {
      id
      name
      poster
      date
      plot
    }
  }
  `;

let listReviewss = `query ListReviewss{
  listReviewss {
    items {
      id
      type
      votes
      topMovie
      topVotes
    }
  }
}
`;

let updateReviews = `mutation UpdateReviews($input: UpdateReviewsInput!) {
  updateReviews(input: $input) {
    id
    type
    votes
    topMovie
    topVotes
  }
}
`;

AWS.config.update({
  region: env.AWS_REGION,
  credentials: new AWS.Credentials(env.AWS_ACCESS_KEY_ID, env.AWS_SECRET_ACCESS_KEY, env.AWS_SESSION_TOKEN)
});

exports.lambdaHandler = async (event, context) => {
    try {
        let ret = await axios(url+"1");
        let page = Math.floor(Math.random() * (ret.data.total_pages + 1));
        let random = await axios(url+page.toString());
        let results = random.data.results;
        response = results.map((result, index) => {
            let movies = {
                input:{
                    id: index,
                    name: result.title,
                    poster: "http://image.tmdb.org/t/p/w342" + result.poster_path,
                    plot: result.overview,
                    date: result.release_date
                }
            };
            return movies;
        });
    } catch (err) {
        console.log(err);
        return err;
    };
    const getMovie = await invokeGetMovie();
    const createMovie = await invokeCreateMovie(response[0]);
    const updateMovie = await invokeUpdateMovie(response[0]);
    const listReviews = await invokeListReviews();
    for (let i = 1; i < 6; i++) { 
      let topMovie;
      let topVotes;
      let currentId;
      for (let j = 0; j < 5; j++){
        currentId = listReviews.data.data.listReviewss.items[j].id;
        if (i == currentId){
          if (listReviews.data.data.listReviewss.items[j].votes > listReviews.data.data.listReviewss.items[j].topVotes){
            topVotes = listReviews.data.data.listReviewss.items[j].votes;
            topMovie = getMovie.data.data.getMovies.name;
          } else {
            topVotes = listReviews.data.data.listReviewss.items[j].topVotes;
            topMovie = listReviews.data.data.listReviewss.items[j].topMovie;
          }
          let votes = {
              input: {
                "id": i,
                "votes": 0,
                "topMovie": topMovie,
                "topVotes": topVotes
              }
          };
          const updateReview = await invokeUpdateReviews(votes);
        }
      }
    }
    return listReviews.data;
    
};

const invokeGetMovie = async () => {
  let req = new AWS.HttpRequest(appsyncUrl, env.AWS_REGION);
  req.method = 'POST';
  req.headers.host = endpoint;
  req.headers['Content-Type'] = 'multipart/form-data';
  req.body = JSON.stringify({
    query: getMovies,
    operationName: 'GetMovies'
  });
  let signer = new AWS.Signers.V4(req, 'appsync', true);
  signer.addAuthorization(AWS.config.credentials, AWS.util.date.getDate());
  const result = await axios({
      method: 'post',
      url: appsyncUrl,
      data: req.body,
      headers: req.headers
  });
  return result;
};

const invokeCreateMovie = async (input) => {
  let req = new AWS.HttpRequest(appsyncUrl, env.AWS_REGION);
  req.method = 'POST';
  req.headers.host = endpoint;
  req.headers['Content-Type'] = 'multipart/form-data';
  req.body = JSON.stringify({
    query: createMovies,
    operationName: 'CreateMovies',
    variables: input
  });
  let signer = new AWS.Signers.V4(req, 'appsync', true);
  signer.addAuthorization(AWS.config.credentials, AWS.util.date.getDate());
  const result = await axios({
      method: 'post',
      url: appsyncUrl,
      data: req.body,
      headers: req.headers
  });
  return result;
};

const invokeUpdateMovie = async (input) => {
  let req = new AWS.HttpRequest(appsyncUrl, env.AWS_REGION);
  req.method = 'POST';
  req.headers.host = endpoint;
  req.headers['Content-Type'] = 'multipart/form-data';
  req.body = JSON.stringify({
    query: updateMovies,
    operationName: 'UpdateMovies',
    variables: input
  });
  let signer = new AWS.Signers.V4(req, 'appsync', true);
  signer.addAuthorization(AWS.config.credentials, AWS.util.date.getDate());
  const result = await axios({
      method: 'post',
      url: appsyncUrl,
      data: req.body,
      headers: req.headers
  });
  return result;
};

const invokeListReviews = async (input) => {
  let req = new AWS.HttpRequest(appsyncUrl, env.AWS_REGION);
  req.method = 'POST';
  req.headers.host = endpoint;
  req.headers['Content-Type'] = 'multipart/form-data';
  req.body = JSON.stringify({
    query: listReviewss,
    operationName: 'ListReviewss'
  });
  let signer = new AWS.Signers.V4(req, 'appsync', true);
  signer.addAuthorization(AWS.config.credentials, AWS.util.date.getDate());
  const result = await axios({
      method: 'post',
      url: appsyncUrl,
      data: req.body,
      headers: req.headers
  });
  return result;
};

const invokeUpdateReviews = async (input) => {
  let req = new AWS.HttpRequest(appsyncUrl, env.AWS_REGION);
  req.method = 'POST';
  req.headers.host = endpoint;
  req.headers['Content-Type'] = 'multipart/form-data';
  req.body = JSON.stringify({
    query: updateReviews,
    operationName: 'UpdateReviews',
    variables: input
  });
  let signer = new AWS.Signers.V4(req, 'appsync', true);
  signer.addAuthorization(AWS.config.credentials, AWS.util.date.getDate());
  const result = await axios({
      method: 'post',
      url: appsyncUrl,
      data: req.body,
      headers: req.headers
  });
  return result;
};