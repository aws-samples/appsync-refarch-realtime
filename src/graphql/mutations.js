// eslint-disable
// this is an auto generated file. This will be overwritten

export const createMessage = `mutation CreateMessage($message: String!) {
  createMessage(message: $message) {
    name
    message
  }
}
`;
export const createMovies = `mutation CreateMovies($input: CreateMoviesInput!) {
  createMovies(input: $input) {
    id
    name
    poster
    date
    plot
  }
}
`;
export const updateMovies = `mutation UpdateMovies($input: UpdateMoviesInput!) {
  updateMovies(input: $input) {
    id
    name
    poster
    date
    plot
  }
}
`;
export const deleteMovies = `mutation DeleteMovies($input: DeleteMoviesInput!) {
  deleteMovies(input: $input) {
    id
    name
    poster
    date
    plot
  }
}
`;
export const createReviews = `mutation CreateReviews($input: CreateReviewsInput!) {
  createReviews(input: $input) {
    id
    type
    votes
    topMovie
    topVotes
  }
}
`;
export const updateReviews = `mutation UpdateReviews($input: UpdateReviewsInput!) {
  updateReviews(input: $input) {
    id
    type
    votes
    topMovie
    topVotes
  }
}
`;
export const deleteReviews = `mutation DeleteReviews($input: DeleteReviewsInput!) {
  deleteReviews(input: $input) {
    id
    type
    votes
    topMovie
    topVotes
  }
}
`;
