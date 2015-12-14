var ReactDOM = require('react-dom')
var React = require('react')
var cardIdCounter = 1;
var	listIdCounter = 1;
var appData = [
				{
					taskId	: listIdCounter++,
					taskName: "To Do",
					cards: [
						{text: "Read about React", cardId: cardIdCounter++},
						{text: "Read about Backbone", cardId: cardIdCounter++}
					]
				},
				{
					taskId	: listIdCounter++,
					taskName: "Done",
					cards: [
						{text: "Read about jQuery", cardId: cardIdCounter++},
						{text: "Read about CSS3", cardId: cardIdCounter++}
					]
				},
			];



var CardForm = React.createClass({
	getInitialState: function(){
		return {cardId: cardIdCounter++ , text: ""}
	},

	changeText: function(e){
		this.setState({text: e.target.value})
	},
	render: function(){
		return(
			<form className={this.props.hidden ? "add-card": "add-card hidden"} onSubmit={this.props.onSubmit.bind(null, this)}>
	    		<textarea value={this.state.text} onChange={this.changeText}></textarea>
	    		<input type="submit" value="Add" className="btn btn-success" />
		    </form>

		)
	}
});

var CardItem = React.createClass({
	getInitialState: function(){
		return {editable: false, text: this.props.data.text, cardId: this.props.data.cardId}
	},

	editCard: function(){
		this.setState({editable: true});
		$(ReactDOM.findDOMNode(this)).find("p").focus();
	},
	submitEdit: function(){
		var cardText = this.state.text;
		this.setState({editable: false, text: cardText});
	},
	handleChange: function(e){
		this.setState({editable: true, text: e.target.innerHTML})
	},
	drag: function(ev){
		this.props.dragCard(ev, this.state.cardId, this.state.text);
	},
	render: function(){
		return(
			<div className="card-item" key={this.state.cardId} draggable="true" onDragStart={this.drag}>
				<p contentEditable={this.state.editable} onKeyUp={this.handleChange}>{this.state.text}</p>
				<div className="actions">
					<button onClick={this.submitEdit} hidden={!this.state.editable} className="ok-btn">
						<span className="glyphicon glyphicon-ok" aria-hidden="true"></span> 
					</button>
					<button onClick={this.editCard} hidden={this.state.editable}  className="edit-btn">
						<span className="glyphicon glyphicon-pencil" aria-hidden="true"></span> 
					</button>
					<button onClick={this.props.deleteCard.bind(null,this)} className="delete-btn"> 
						<span className="glyphicon glyphicon-trash" aria-hidden="true"></span> 
					</button>
				</div>
				<div className="clearfix"></div>
			</div>

			)
	}
});

var CardList = React.createClass({
	getInitialState: function(){
		return {}
	},
	deleteCard: function(a){
		this.props.deleteCard(a.props.data.cardId);
	},
	dragCard: function(ev, cardId, cardText){
		this.props.dragCard(ev, cardId, cardText);
	},
	render: function(){
		var self = this;
		var cards = this.props.data.map(function(cardData){
			return (
				<CardItem key={cardData.cardId} data={cardData} deleteCard={self.deleteCard} dragCard={self.dragCard}></CardItem>
			);
		});

		return (
			<div className="cards-container">
				{cards}
			</div>
			);
	}
});

var TaskHeader = React.createClass({
	getInitialState: function(){
		return {}
	},
	show: function(){
		this.props.menuClicked("add");
	},
	deleteCards: function(){
		this.props.menuClicked("deleteAll");
	},
	deleteList: function(){
		this.props.menuClicked("deleteList");
	},
	render: function(){
		return (
			<div className="task-header">
				<h2>{this.props.title}</h2>
				<div className="dropdown">
						<span className="btn btn-primary dropdown-toggle glyphicon glyphicon-cog"  data-toggle="dropdown" aria-hidden="true"></span>
						<ul className="dropdown-menu">
						    <li><a href="#" onClick={this.show}>Add Card</a></li>
						    <li><a href="#" onClick={this.deleteCards}>Delete All Cards</a></li>
						    <li><a href="#" onClick={this.deleteList}>Delete List</a></li>
						</ul>
				</div>
			</div>
		);
	}
});

var TaskList = React.createClass({
	getInitialState: function(){
		return {showForm: false, cards: [], taskId: ""}
	},
	componentDidMount: function(){
		this.setState({showForm: false, cards: this.props.data.cards, taskId: this.props.data.taskId})
	},
	drop: function(ev){
		ev.preventDefault();
		this.props.handleDrop(ev.dataTransfer.getData("cardText"), ev.dataTransfer.getData("cardId"), ev.dataTransfer.getData("prevTaskListId"), this.state.taskId);
	},
	allowDrop: function(ev){
		ev.preventDefault();
	},
	handleCardDrag: function(ev, cardId, cardText){
		ev.dataTransfer.setData("cardText", cardText);
		ev.dataTransfer.setData("cardId", cardId);
		ev.dataTransfer.setData("prevTaskListId", this.state.taskId);
	},
	handleDeleteCard: function(cardId){
		var self = this;
		this.state.cards.forEach(function(el,i){
			if(el.cardId == cardId){
				self.state.cards.splice(i,1);
				return 
			}
		});
		this.setState({showForm:false, cards: this.state.cards});
	},
	handleMenuClick: function(action){
		if(action =="add"){
			var newState = $.extend(this.state,{showForm: true})
			this.setState(newState);
		}else if (action == "deleteAll"){
			this.state.cards.splice(0,this.state.cards.length)
			this.setState(this.state);
		}else if (action == "deleteList"){
			this.props.deleteList(this.state.taskId);
		}
	},
	handleCardSubmit: function(childComponent){
		var newState = this.state;
		newState["showForm"] = false;
		newState.cards.push(childComponent.state)
		childComponent.setState({cardId: cardIdCounter++, text: ""})
		this.setState(newState)
		return false;
	},


	render: function(){
		return	(
			<div className="task-list"  onDrop={this.drop} onDragOver={this.allowDrop}>
				<TaskHeader title={this.props.data.taskName} menuClicked={this.handleMenuClick}></TaskHeader>
				<CardList data={this.props.data.cards} deleteCard={this.handleDeleteCard} dragCard={this.handleCardDrag}></CardList>
				<CardForm hidden={this.state.showForm} onSubmit={this.handleCardSubmit}></CardForm>
			</div>
		);
	}
});

var ListForm = React.createClass({
	getInitialState: function(){
		return {mode: "", text: ""}
	},
	changeText: function(e){
		this.setState({text: e.target.value})
	},
	showListForm: function(){
		this.state.mode = "add";
		this.setState(this.state);
	},
	handleListFormSubmit: function(ev){
		this.props.addNewList(this.state.text)
		this.setState({mode: "", text: ""})
		ev.preventDefault();
		return false
	},
	render: function(){
		return (
				<div className={this.state.mode == "add" ? "list-form-wrapper adding" : "list-form-wrapper"}>
					<span className="placeholder-add-list" onClick={this.showListForm}>Add List ...</span>
					<div>
						<form className="add-list-form" onSubmit={this.handleListFormSubmit}>
							<input type="text" value={this.state.text} placeholder="Add List ..." onChange={this.changeText}/> 
							<input type="submit" value="Save" className="btn btn-success"/>
						</form>
					</div>
				</div>
			)
	}
		
})
var MainBox = React.createClass({
	getInitialState: function(){
		return {data: []}
	},

	componentDidMount: function(){
		/*if(localStorage.getItem("appData") == null){
			localStorage.setItem("appData", appData)
		}*/
		this.setState({data: appData});
	},
	handleAddNewList: function(val){
		this.state.data.push({taskId: listIdCounter++ , taskName: val, cards:[]})
		this.setState({data: this.state.data});
	},
	handleDrop: function(cardText, cardId, prevTaskListId, newTaskListId){
		this.state.data.forEach(function(taskList){
			if(taskList.taskId == prevTaskListId){
				taskList.cards.forEach(function(card, index){
					if(card.cardId == cardId){
						taskList.cards.splice(index,1);
						return
					}
				})
			}
			if(taskList.taskId == newTaskListId){
				taskList.cards.push({text: cardText, cardId: cardIdCounter++})
			}
		});

		this.setState(this.state);
	},
	handleDeleteList: function(taskId){
		var self = this;
		this.state.data.forEach(function(taskList, index){
			if(taskList.taskId == taskId){
				self.state.data.splice(index,1);
				return
			}
		});
		this.setState(this.state);
	},
	deleteAllCards: function(){
		this.state.data.forEach(function(taskList){
			taskList.cards.splice(0, taskList.cards.length);
		});
		this.setState(this.state);
	},
	handleDropToTrash: function(ev){
		var cardText = ev.dataTransfer.getData("cardText");
		var cardId = ev.dataTransfer.getData("cardId");
		var prevTaskListId= ev.dataTransfer.getData("prevTaskListId");
		this.state.data.forEach(function(taskList){
			if(taskList.taskId == prevTaskListId){
				taskList.cards.forEach(function(card, index){
					if(card.cardId == cardId){
						taskList.cards.splice(index,1)
						return
					} 
				});
				return
			}
		});
		this.setState(this.state);
	},
	allowDrop: function(ev){
		ev.preventDefault();
	},
	render: function(){
		var self = this;
		var allTaskLists = this.state.data.map(function(taskData){
			return (
				<TaskList data={taskData} key={taskData.taskId} handleDrop={self.handleDrop} deleteList={self.handleDeleteList}></TaskList>
				)
		});

		return	(
			<div clasName="main-container">
				<div className="header">
					<span>All Projects</span>
					<div className="top-btn-container">
						<button onClick={this.deleteAllCards} onDrop={this.handleDropToTrash} onDragOver={this.allowDrop} className="delete-all-btn">
							<span className="glyphicon glyphicon-trash" aria-hidden="true"></span> 
						</button>
						<span> Delete All Cards | Trash</span>
					</div>
					<div className="clearfix"></div>
				</div>
				{allTaskLists}
				<ListForm addNewList={this.handleAddNewList} ></ListForm>
			</div>
		);
	}
});

ReactDOM.render(
  <MainBox />,
  document.getElementById('app')
);