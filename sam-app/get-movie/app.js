let env = require('process').env;
let axios = require('axios');
let AWS = require('aws-sdk');
let url = 'https://api.themoviedb.org/3/movie/popular?api_key=35440259b50e646a6485055c83367ccd&language=en-US&page=';
let response;
let endpoint = process.env.ENDPOINT;
let appsyncUrl = "https://"+endpoint+"/graphql";
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

    const createMovie = await invokeCreateAppSync(response[0]);
    const updateMovie = await invokeUpdateAppSync(response[0]);
    return updateMovie.data;
};


const invokeCreateAppSync = async (input) => {
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

const invokeUpdateAppSync = async (input) => {
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
