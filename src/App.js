import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import {Animated} from "react-animated-css";
import ScrollToBottom from 'react-scroll-to-bottom';
import {listMoviess,listReviewss} from './graphql/queries'; 
import {updateReviews,createMessage} from './graphql/mutations';
import {onUpdateMovies,onUpdateReviews,onCreateMessage} from './graphql/subscriptions';
import Amplify, {API,graphqlOperation} from 'aws-amplify';
import aws_exports from './aws-exports'; // specify the location of aws-exports.js file on your project

Amplify.configure({
  Auth: {
    identityPoolId: aws_exports.aws_cognito_identity_pool_id,
    region: aws_exports.aws_cognito_region ,
  },
  aws_appsync_graphqlEndpoint: aws_exports.aws_appsync_graphqlEndpoint,
  aws_appsync_region: aws_exports.aws_appsync_region,
  aws_appsync_authenticationType: 'AWS_IAM'
});


class App extends Component {

  constructor(props){
    super(props);
    this.state={
      user:"",
      name:"",
      poster:"",
      plot:"",
      date:"",
      love: 0,
      like: 0,
      meh: 0,
      unknown: 0,
      hate: 0,
      topLovedMovie:"Waiting for votes...",
      topLikedMovie:"Waiting for votes...",
      topMehMovie:"Waiting for votes...",
      topUnknownMovie:"Waiting for votes...",
      topHatedMovie:"Waiting for votes...",
      topLove: 0,
      topLike: 0,
      topMeh: 0,
      topUnknown: 0,
      topHate: 0,
      clickLove: 0,
      clickLike: 0,
      clickMeh: 0,
      clickUnknown: 0,
      clickHate: 0,
      value:"",
      display:false,
      player:"",
      animation:false,
      messages:[]
    };
  }

  async componentDidMount(){
    let firstMovies = await API.graphql(graphqlOperation(listMoviess));
    let existingReviews = await API.graphql(graphqlOperation(listReviewss));
    let reviews = existingReviews.data.listReviewss.items;
    reviews.map((review) => {
      switch(review.id){
        case "1": 
          this.setState({ love: review.votes});
          break;
        case "2": 
          this.setState({ like: review.votes});
          break;
        case "3": 
          this.setState({ meh: review.votes});
          break;
        case "4": 
          this.setState({ unknown: review.votes});
          break;
        case "5": 
          this.setState({ hate: review.votes});
          break;
        default:
          console.log("Unknown ID, unable to resolve");
          break;
      };
      return this.state;
    });
    this.setState({poster: firstMovies.data.listMoviess.items[0].poster, name:firstMovies.data.listMoviess.items[0].name, plot:firstMovies.data.listMoviess.items[0].plot, date:firstMovies.data.listMoviess.items[0].date});
    this.subscription = API.graphql(graphqlOperation(onUpdateMovies)).subscribe({
      next: (event) => { 
          this.setState({poster: event.value.data.onUpdateMovies.poster,name: event.value.data.onUpdateMovies.name, plot:event.value.data.onUpdateMovies.plot, date:event.value.data.onUpdateMovies.date, clickLove:0, clickLike:0, clickMeh:0, clickUnknown:0, clickHate:0, timer:10});
          console.log("Subscription for Movie " + event.value.data.onUpdateMovies.name);  
          setInterval(this.aggVotes,3300);
      }
    });
    this.subscription = API.graphql(graphqlOperation(onUpdateReviews)).subscribe({
      next: (event) => {  
          switch(event.value.data.onUpdateReviews.id){
            case "1": 
              this.setState({ love: event.value.data.onUpdateReviews.votes, topLovedMovie: event.value.data.onUpdateReviews.topMovie, topLove: event.value.data.onUpdateReviews.topVotes, player: '1', animation: !this.state.animation});
              if (this.state.love === 0 ) this.setState({display:false,player:'0'});
              break;
            case "2": 
              this.setState({ like: event.value.data.onUpdateReviews.votes, topLikedMovie: event.value.data.onUpdateReviews.topMovie, topLike: event.value.data.onUpdateReviews.topVotes, player: '2', animation: !this.state.animation});
              if (this.state.like === 0 ) this.setState({display:false,player:'0'});
              break;
            case "3": 
              this.setState({ meh: event.value.data.onUpdateReviews.votes, topMehMovie: event.value.data.onUpdateReviews.topMovie, topMeh: event.value.data.onUpdateReviews.topVotes,player: '3', animation: !this.state.animation});
              if (this.state.meh === 0 ) this.setState({display:false,player:'0'});
              break;
            case "4": 
              this.setState({ unknown: event.value.data.onUpdateReviews.votes, topUnknownMovie: event.value.data.onUpdateReviews.topMovie, topUnknown: event.value.data.onUpdateReviews.topVotes,player: '4', animation: !this.state.animation});
              if (this.state.unknown === 0 ) this.setState({display:false,player:'0'});
              break;
            case "5": 
              this.setState({ hate: event.value.data.onUpdateReviews.votes, topHatedMovie: event.value.data.onUpdateReviews.topMovie, topHate: event.value.data.onUpdateReviews.topVotes,player: '5', animation: !this.state.animation});
              if (this.state.hate === 0 ) this.setState({display:false,player:'0'});
              break;
            default:
              console.log("Unknown ID, unable to resolve");
              break;
          };
        }
    });
    this.subscription = API.graphql(graphqlOperation(onCreateMessage)).subscribe({
      next: (event) => {
          this.setState({
            messages: [...this.state.messages, event.value.data.onCreateMessage.message]
          });
        }
    });
  }

  aggVotes = async () => {
    if(this.state.clickLove > 1){
      let consolidated1 = await API.graphql(graphqlOperation(updateReviews, 
        {input: {
          id: "1",
          votes: this.state.love + this.state.clickLove
        }}));
      console.log("Total "+ consolidated1.data.updateReviews.votes + " aggregated votes for people who loved this movie");
      this.setState({clickLove:0, love: this.state.love + this.state.clickLove });
    };
    if(this.state.clickLike > 1){
      let consolidated2 = await API.graphql(graphqlOperation(updateReviews, 
        {input: {
          id: "2",
          votes: this.state.like + this.state.clickLike
        }}));
      console.log("Total "+ consolidated2.data.updateReviews.votes + " aggregated votes for people who liked this movie");
      this.setState({clickLike:0, like: this.state.like + this.state.clickLike });
    };
    if(this.state.clickMeh > 1){
      let consolidated3 = await API.graphql(graphqlOperation(updateReviews, 
        {input: {
          id: "3",
          votes: this.state.meh + this.state.clickMeh
        }}));
      console.log("Total "+ consolidated3.data.updateReviews.votes + " aggregated votes for people who think this movie is meh");
      this.setState({clickMeh:0, meh: this.state.meh + this.state.clickMeh});
    };
    if(this.state.clickUnknown > 1){
      let consolidated4 = await API.graphql(graphqlOperation(updateReviews, 
        {input: {
          id: "4",
          votes: this.state.unknown + this.state.clickUnknown
        }}));
      console.log("Total "+ consolidated4.data.updateReviews.votes + " aggregated votes for people who didn't know this movie");
      this.setState({clickUnknown:0, unknown: this.state.unknown + this.state.clickUnknown});
    };
    if(this.state.clickHate > 1){
      let consolidated5 = await API.graphql(graphqlOperation(updateReviews, 
        {input: {
          id: "5",
          votes: this.state.hate + this.state.clickHate
        }}));
      console.log("Total "+ consolidated5.data.updateReviews.votes + " aggregated votes for people who hated this movie");
      this.setState({clickHate:0, hate: this.state.hate + this.state.clickHate });
    }
  }

  handleVote1 = async(e) => {
    e.preventDefault();
    e.stopPropagation();
    let vote1 = {
        id: "1"
    };
    let click1 = this.state.clickLove + 1;
    this.setState({clickLove:click1});
    if (this.state.clickLove < 1){
      await API.graphql(graphqlOperation(updateReviews, {input: vote1}));
      console.log("Love vote - Direct Mutation");
    };
  }

  handleVote2 = async(e) => {
    e.preventDefault();
    e.stopPropagation();
    let vote2 = {
      id: "2"
    };
    let click2 = this.state.clickLike + 1;
    this.setState({clickLike:click2});
    if (this.state.clickLike < 1){
      await API.graphql(graphqlOperation(updateReviews, {input: vote2}));
      console.log("Like vote - Direct Mutation");
    };
  }

  handleVote3 = async(e) => {
    e.preventDefault();
    e.stopPropagation();
    let vote3 = {
      id: "3"
    };
    let click3 = this.state.clickMeh + 1;
    this.setState({clickMeh:click3});
    if (this.state.clickMeh < 1){
      await API.graphql(graphqlOperation(updateReviews, {input: vote3}));
      console.log("Meh vote - Direct Mutation");
    };
  }

  handleVote4 = async(e) => {
    e.preventDefault();
    e.stopPropagation();
    let vote4 = {
      id: "4"
    };
    let click4 = this.state.clickUnknown + 1;
    this.setState({clickUnknown:click4});
    if (this.state.clickUnknown < 1){
      await API.graphql(graphqlOperation(updateReviews, {input: vote4}));
      console.log("Unknown vote - Direct Mutation");
    };
  }

  handleVote5 = async(e) => {
    e.preventDefault();
    e.stopPropagation();
    let vote5 = {
      id: "5"
    };
    let click5 = this.state.clickHate + 1;
    this.setState({clickHate:click5});
    if (this.state.clickHate < 1){
      await API.graphql(graphqlOperation(updateReviews, {input: vote5}));
      console.log("Hate vote - Direct Mutation");
    };
  }

  handleChange = (e) => {
    this.setState({value:e.target.value});
  }

  handleSendMessage = async(e) => {
    e.preventDefault();
    e.stopPropagation();
    const message = {
      "message":"["+this.state.user+"]: "+this.state.value
    }
    await API.graphql(graphqlOperation(createMessage, message));
    this.setState({value:""});
  }

  handleUser = (e) => {
    e.preventDefault();
    e.stopPropagation();
    this.setState({user:this.state.value}, ()=>{
      this.setState({value:""});
    });
  }

  render() {
    const currentUser = "["+this.state.user+"]: ";
    const messages = [].concat(this.state.messages)
      .map((msg,i)=> 
      msg.includes(currentUser) ?
      <div className="alert alert-primary">
        <span key={i} >{msg}</span>
      </div> :
      <div className="alert alert-secondary">
        <span key={i} >{msg}</span>
      </div> 
      );
    const disabled = !this.state.user ? { disabled: 'disabled' } : {}
    return (
      <div>
        <nav className="navbar navbar-dark bg-dark">
          <p className="navbar-brand p-0">TMDb Popular Movies - Vote and Discuss in Real-Time</p>
        </nav>
        <div className="container-fluid mx-auto">
          <br/>
          <div className="card p-3 shadow">
            <div className="p-2">
              <div className="row align-items-top p-0">
                <div className="col-md-4 p-1 card-body">
                  <div className="mx-auto text-center rounded bg-dark rounded col-height">
                    <br/>
                    {this.state.poster && (<img className="img-fluid rounded align-middle p-2" src={this.state.poster} alt="Poster"/>)}
                  </div>
                </div>
                <div className="col-md-4 p-1 card-body">
                  <div className="mx-auto bg-light rounded col-height">
                      <table className="table table-borderless bg-dark text-white rounded">
                      <tbody>
                          <tr>
                            <td className="p-3 d-inline-block text-truncate"><h5 className="float-left">{this.state.name}</h5></td>
                            <td className="p-3 text-truncate" style={{width: "35%"}}><h6 className="float-right">{this.state.date}</h6></td> 
                          </tr>
                        </tbody>
                      </table>
                    <div className="bg-light text-justify align-middle d-flex p-0 plot rounded">
                      <p className="p-3 lead">{this.state.plot}</p>
                    </div>
                    <div className="text-white mx-auto text-center p-0 mb-4">
                      <table className="table p-1 rounded">
                        <tbody>
                          <tr>
                            <td><button type="button" id="1" className="btn btn-primary rounded-circle p-1 tooltip-toggle" data-tooltip="Love" onClick={this.handleVote1}><i className="fas fa-heart fa-2x text-white"></i></button></td>
                            <td><button type="button" id="2" className="btn btn-primary rounded-circle p-1 tooltip-toggle" data-tooltip="Like" onClick={this.handleVote2}><i className="fas fa-grin fa-2x text-white"></i></button></td> 
                            <td><button type="button" id="3" className="btn btn-primary rounded-circle p-1 tooltip-toggle" data-tooltip="Meh" onClick={this.handleVote3}><i className="fas fa-meh fa-2x text-white"></i></button></td>
                            <td><button type="button" id="4" className="btn btn-primary rounded-circle p-1 tooltip-toggle" data-tooltip="Unknown" onClick={this.handleVote4}><i className="fas fa-question-circle fa-2x text-white"></i></button></td>
                            <td><button type="button" id="5" className="btn btn-primary rounded-circle p-1 tooltip-toggle" data-tooltip="Hate" onClick={this.handleVote5}><i className="fas fa-angry fa-2x text-white"></i></button></td>
                          </tr>
                          <tr className="bg-light text-dark rounded">
                            <td>{this.state.love}</td>
                            <td>{this.state.like}</td> 
                            <td>{this.state.meh}</td>
                            <td>{this.state.unknown}</td> 
                            <td>{this.state.hate}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                <div className="col-md-4 p-1 card-body">
                  <div className="mx-auto bg-light rounded col-height">
                  {this.state.user ? 
                    <table className="table table-borderless bg-dark text-white rounded p-0">
                      <tbody>
                        <tr>
                          <td className="p-3">
                            <h5 className="float-left">Chat</h5> 
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    : 
                    <table className="table table-borderless bg-dark text-white rounded p-0">
                      <tbody>
                          <tr>
                            <td className="p-2">
                              <form onSubmit={this.handleUser}>
                                <div className="input-group ">
                                  <input type="text" className="form-control form-control-lg" name="user" placeholder="Choose your Handle to Chat" aria-label=">" aria-describedby="basic-addon2" value={this.state.value} onChange={this.handleChange}/>
                                  <div className="input-group-append">
                                    <button className="btn btn-dark border-light" type="submit"><i className="fas fa-user"></i></button>
                                  </div>
                                </div>
                              </form>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                  }
                    <div className="bg-light p-0 rounded p-2">
                      <ScrollToBottom className="chat">
                        {messages}
                      </ScrollToBottom>
                    </div>
                    <form onSubmit={this.handleSendMessage}>
                    <fieldset {...disabled}>
                      <div className="input-group mb-4">
                        <input type="text" className="form-control form-control-lg" name="message" placeholder="Send Message" aria-label=">" aria-describedby="basic-addon2" value={this.state.value} onChange={this.handleChange}/>
                        <div className="input-group-append">
                          <button className="btn btn-primary" type="submit"><i className="fas fa-comment"></i></button>
                        </div>
                      </div>
                      </fieldset>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mx-auto text-center">
            {this.state.display===true || this.state.player==="1" ? <Animated animationIn="fadeOutUp" animationOut="slideOutUp" isVisible={this.state.animation}><i className="fas fa-heart fa-2x text-primary p-2"></i></Animated> : null}
            {this.state.display===true || this.state.player==="2" ? <Animated animationIn="fadeOutUp" animationOut="slideOutUp" isVisible={this.state.animation}><i className="fas fa-grin fa-2x text-primary p-2"></i></Animated>  : null}
            {this.state.display===true || this.state.player==="3" ? <Animated animationIn="fadeOutUp" animationOut="slideOutUp" isVisible={this.state.animation}><i className="fas fa-meh fa-2x text-primary p-2"></i></Animated>  : null}
            {this.state.display===true || this.state.player==="4" ? <Animated animationIn="fadeOutUp" animationOut="slideOutUp" isVisible={this.state.animation}><i className="fas fa-question-circle fa-2x text-primary p-2"></i></Animated>  : null}
            {this.state.display===true || this.state.player==="5" ? <Animated animationIn="fadeOutUp" animationOut="slideOutUp" isVisible={this.state.animation}><i className="fas fa-angry fa-2x text-primary p-2"></i></Animated>  : null}
          </div>
        </div>
        <br/>
        <table className="table table-striped">
          <thead className="thead-dark">
            <tr>
              <th className="bg-white text-dark text-center text-uppercase border-top-0"><strong><h4>Leaderboard</h4></strong></th>
              <th className="bg-dark text-center"><h5>Movie</h5></th>
              <th className="bg-dark text-center"><h5>Votes</h5></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="bg-dark text-white"><strong>Top Loved <i className="fas fa-heart"></i></strong></td>
              <td className="text-center">{this.state.topLovedMovie}</td>
              <td className="text-center">{this.state.topLove}</td>
            </tr>
            <tr>
              <td className="bg-dark text-white"><strong>Top Liked <i className="fas fa-grin"></i></strong></td>
              <td className="text-center">{this.state.topLikedMovie}</td>
              <td className="text-center">{this.state.topLike}</td>
            </tr>
            <tr>
              <td className="bg-dark text-white"><strong>Top Meh <i className="fas fa-meh"></i></strong></td>
              <td className="text-center">{this.state.topMehMovie}</td>
              <td className="text-center">{this.state.topMeh}</td>
            </tr>
            <tr>
              <td className="bg-dark text-white"><strong>Top Unknown <i className="fas fa-question-circle"></i></strong></td>
              <td className="text-center">{this.state.topUnknownMovie}</td>
              <td className="text-center">{this.state.topUnknown}</td>
            </tr>
            <tr>
              <td className="bg-dark text-white"><strong>Top Hated <i className="fas fa-angry"></i></strong></td>
              <td className="text-center">{this.state.topHatedMovie}</td>
              <td className="text-center">{this.state.topHate}</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
}

export default App;
