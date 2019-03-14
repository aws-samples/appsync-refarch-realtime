// eslint-disable
// this is an auto generated file. This will be overwritten

export const getMovies = `query GetMovies($id: ID!) {
  getMovies(id: $id) {
    id
    name
    poster
    date
    plot
  }
}
`;
export const listMoviess = `query ListMoviess(
  $filter: ModelMoviesFilterInput
  $limit: Int
  $nextToken: String
) {
  listMoviess(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      id
      name
      poster
      date
      plot
    }
    nextToken
  }
}
`;
export const getReviews = `query GetReviews($id: ID!) {
  getReviews(id: $id) {
    id
    type
    votes
    topMovie
    topVotes
  }
}
`;
export const listReviewss = `query ListReviewss(
  $filter: ModelReviewsFilterInput
  $limit: Int
  $nextToken: String
) {
  listReviewss(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      id
      type
      votes
      topMovie
      topVotes
    }
    nextToken
  }
}
`;
