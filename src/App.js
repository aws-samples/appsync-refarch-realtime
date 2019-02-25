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
      love:"0",
      like:"0",
      meh:"0",
      unknown:"0",
      hate:"0",
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
          this.setState({poster: event.value.data.onUpdateMovies.poster,name: event.value.data.onUpdateMovies.name, plot:event.value.data.onUpdateMovies.plot, date:event.value.data.onUpdateMovies.date});
          console.log("Subscription for Movie " + event.value.data.onUpdateMovies.name);  
        }
    });
    this.subscription = API.graphql(graphqlOperation(onUpdateReviews)).subscribe({
      next: (event) => { 
          console.log("Subscription for vote " + event.value.data.onUpdateReviews.type + " with last count of " + event.value.data.onUpdateReviews.votes);  
          switch(event.value.data.onUpdateReviews.id){
            case "1": 
              this.setState({ love: event.value.data.onUpdateReviews.votes, player: '1', animation: !this.state.animation});
              break;
            case "2": 
              this.setState({ like: event.value.data.onUpdateReviews.votes, player: '2', animation: !this.state.animation});
              break;
            case "3": 
              this.setState({ meh: event.value.data.onUpdateReviews.votes, player: '3', animation: !this.state.animation});
              break;
            case "4": 
              this.setState({ unknown: event.value.data.onUpdateReviews.votes, player: '4', animation: !this.state.animation});
              break;
            case "5": 
              this.setState({ hate: event.value.data.onUpdateReviews.votes, player: '5', animation: !this.state.animation});
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

   handleVote1 = async(e) => {
    e.preventDefault();
    e.stopPropagation();
    let vote1 = {
        id: "1"
    };
    await API.graphql(graphqlOperation(updateReviews, {input: vote1}));
  }

  handleVote2 = async(e) => {
    e.preventDefault();
    e.stopPropagation();
    let vote2 = {
      id: "2"
  };
    await API.graphql(graphqlOperation(updateReviews, {input: vote2}));
  }

  handleVote3 = async(e) => {
    e.preventDefault();
    e.stopPropagation();
    let vote3 = {
      id: "3"
    };
    await API.graphql(graphqlOperation(updateReviews, {input: vote3}));
  }

  handleVote4 = async(e) => {
    e.preventDefault();
    e.stopPropagation();
    let vote4 = {
      id: "4"
    };
    await API.graphql(graphqlOperation(updateReviews, {input: vote4}));
  }

 handleVote5 = async(e) => {
    e.preventDefault();
    e.stopPropagation();
    let vote5 = {
      id: "5"
    };
    await API.graphql(graphqlOperation(updateReviews, {input: vote5}));
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
                    {this.state.poster && (<img className="rounded align-middle p-2" src={this.state.poster} alt="Poster"/>)}
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
                            <td><button type="button" id="1" className="btn btn-primary rounded-circle p-2 tooltip-toggle" data-tooltip="Love" onClick={this.handleVote1}><i className="fas fa-heart fa-2x text-white"></i></button></td>
                            <td><button type="button" id="2" className="btn btn-primary rounded-circle p-2 tooltip-toggle" data-tooltip="Like" onClick={this.handleVote2}><i className="fas fa-grin fa-2x text-white"></i></button></td> 
                            <td><button type="button" id="3" className="btn btn-primary rounded-circle p-2 tooltip-toggle" data-tooltip="Meh" onClick={this.handleVote3}><i className="fas fa-meh fa-2x text-white"></i></button></td>
                            <td><button type="button" id="4" className="btn btn-primary rounded-circle p-2 tooltip-toggle" data-tooltip="Unknown" onClick={this.handleVote4}><i className="fas fa-question-circle fa-2x text-white"></i></button></td>
                            <td><button type="button" id="5" className="btn btn-primary rounded-circle p-2 tooltip-toggle" data-tooltip="Hate" onClick={this.handleVote5}><i className="fas fa-angry fa-2x text-white"></i></button></td>
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
      </div>
    );
  }
}

export default App;
