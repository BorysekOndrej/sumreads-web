import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
// import { cloneDeep } from 'lodash';

// rightfully stolen from
// https://stackoverflow.com/questions/1779013/check-if-string-contains-only-digits
function digitsOnly(str) {
  return /^\d*$/.test(str);
}

const VIEWS = ["characters", "aspects", "sentimental"];

class DescriptionsCard extends React.Component {
  render() {    
    return (
      <div className="col">
      <div className="card description-card">
        {/* <img src="..." className="card-img-top" alt="..."/> */}
        <div className="card-body">
          <h5 className="card-title">{this.props.word}</h5>
          <h6 className="card-subtitle mb-2 text-muted small">{this.props.descs.length} descriptions</h6>
          <div>
            {this.props.descs.map((desc, i) => <p className="card-text" key={i}>{desc}</p>)}
          </div>
        </div>
      </div>
      </div>
    );

  }
}

class DescriptionsPanel extends React.Component {
  render() {
    return (
      <div className="row row-cols-1 row-cols-md-3 g-4" style={{display: this.props.display}}>
        {this.props.descss.map((entry, i) => <DescriptionsCard key={i} word={entry[0]} descs={entry[1]} />)}
      </div>
    );
  }
}

class AllDescriptionsPanel extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      currentView: "characters",
    };
  }

  render() {
    let descriptions = this.props.descriptions;
    return (
    <div className="card text-center">
      <div className="card-header">
        <ul className="nav nav-tabs card-header-tabs">
          {VIEWS.map((view, i) =>
            <li className="nav-item" key={i}>
              <button className={"nav-link " + (view == this.state.currentView ? 'active' : '')} onClick={() => this.setState({currentView: view})}>
                {view}
              </button>
            </li>
          )}
        </ul>
      </div>
      <div className="card-body">
        {VIEWS.map((view, i) => 
          <DescriptionsPanel key={i} descss={descriptions[view]} display={view == this.state.currentView ? "flex" : "none"}/>
        )}
      </div>
    </div>
    );
  }
}

class BookInfoPanel extends React.Component {
  render() {
    return (
      <div className="card">
        <div className='card-body'>
          <span>{this.props.title}</span>{this.props.series ? <span className='text-muted'> ({this.props.series} series)</span> : ""}
        </div>
      </div>
    );
  }
}

class GetSummaryForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      bookId: ''
    };
  }

  updateBookId(e) {
    const newBookId = e.target.value;

    if (!digitsOnly(newBookId)) {
      alert("Input digits only.")
      return;
    }

    this.setState({
      bookId: newBookId
    });
  }

  requestBookSummary() {
    if (this.state.bookId.length === 0 || !digitsOnly(this.state.bookId)) {
      alert("Input digits only.");
      return;
    }

    this.props.requestBookSummary(this.state.bookId)
  }

  render() {
    return (
      <div className="input-group mb-3">
        <input
          type="number" className="form-control" placeholder="Input book id" aria-label="Book id" aria-describedby="getSummaryButton"
          value={this.state.bookId} onChange={e => this.updateBookId(e)}
        />
        <button
          className="btn btn-outline-secondary" type="button" id="getSummaryButton"
          onClick={() => this.requestBookSummary()}
        >
          Get summary
        </button>
      </div>
    );
  }
}

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
    };
  }

  prepareDescriptions(descriptions) {
    for (let view of VIEWS) {
      let entries = Object.entries(descriptions[view]);
      entries.forEach(entry => {
        entry[1].sort((a, b) => b.length - a.length);
      });

      entries.sort((ea, eb) => eb[1].length - ea[1].length);
      descriptions[view] = entries;

    }
    return descriptions;
  }

  requestBookSummary(bookId) {
    fetch("http://172.24.158.129:5000/summaries/"+bookId)
    .then(response => response.json())
    .then(descriptions => {
        this.setState({
          descriptions: this.prepareDescriptions(descriptions)
        });
      }
    );
  }

  render() {
    let descriptions = this.state.descriptions;
    return (
      <div>
        <GetSummaryForm requestBookSummary={book_id => this.requestBookSummary(book_id)}/>
        {descriptions && descriptions.title ? <BookInfoPanel title={descriptions["title"]} series={descriptions["series"]} /> : ""}
        {descriptions ? <AllDescriptionsPanel descriptions={descriptions}/> : ""}
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <App />,
  document.getElementById('root')
);
