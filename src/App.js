import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import ipfs from './ipfs';
import { Form, TextInput } from 'react-minimal-form';
import Room from 'ipfs-pubsub-room';


class App extends Component {
  constructor() {
    super();
    this.state = {
      loading: true,
      name: '',
      messages: [],
      formData: {
      },
      nameForm: {
      },
      nickname: false
    }
    this.peerNameHashMap = {}
  }
  componentDidMount() {
    // IPFS node is ready, so we can start using ipfs-pubsub-room
    ipfs.on('ready', () => {
      this.room = Room(ipfs, 'room-name', {pollInterval: 100})
      ipfs.id().then(data => {
        this.setState({
          id: data.id
        })
      })

      console.log('room.getPeers()',this.room.getPeers());
      this.room.on('peer joined', (peer) => {
        console.log('Peer joined the room', peer)
        // wait for peers to be connected. Ideally, we should wait for all peers, so everyone gets the message.
        // for more reliability, see this thread https://github.com/ipfs/js-ipfs/issues/1097
        this.setState({
          loading: false,
        })
      })

      this.room.on('peer left', (peer) => {
        console.log('Peer left...', peer)
      })

      // now started to listen to room
      this.room.on('subscribed', () => {
        console.log('Now connected!')

      })

      this.room.on('message', (message) => {
        const dataArray = message.data.toString().split('.');
        console.log('dataArray', dataArray);
        // silly way of going about things, but hey...
        if (dataArray[0] === 'peer-name') {
          this.mapPeerNamesToHashes(dataArray[1], message.from);
        } else {
          const theMessage = {
            author: this.getPeerNameFromHash(message.from),
            message: dataArray.length > 1 ? dataArray.join('.') : dataArray[0],
          }
          const newMessages = this.state.messages;
          newMessages.push(theMessage);
          this.setState({
            messages: newMessages
          })
        }
      })
    })
  }

  mapPeerNamesToHashes = (nickName, hash) => {
    this.peerNameHashMap[hash] = nickName;
  }

  getPeerNameFromHash = (hash) => {
    return this.peerNameHashMap[hash] || "anoniempje"
  }

  handleSubmit = data => {
    const dataArray = data.message.split('.');

    if (dataArray[0] !== 'peer-name') {
      this.room.broadcast(dataArray.join('.'));
    }
    this.setState({ formData: {}})
  }

  handleNameSubmit = data => {
    const message = 'peer-name.' + data.name;
    if (!this.state.nickname) {
      this.room.broadcast(message);
    }
    this.setState({ nameData: {}, nickname: data.name})
  }

  handleChange = formData => {
    this.setState({
      formData,
    });
  }

  handleNameChange = nameForm => {
    this.setState({
      nameForm
    })
  }

  render() {
    if (this.state.loading) {
      return <div>connecting to the room, please be patient...</div>
    }
    return (
      <div className="App">
        {this.state.messages.filter(o => o).map(item => item && (<div>from: {item.author}, message: {item.message}</div>))}
        {this.state.nickname ? (
          <Form
            formData={this.state.formData}
            onChange={this.handleChange}
            onSubmit={this.handleSubmit}
          >
            {this.state.nickname}<TextInput id="message" placeholder="type a message..." /><button>send</button>
          </Form>
        ) : (
          <Form
            formData={this.state.nameForm}
            onChange={this.handleNameChange}
            onSubmit={this.handleNameSubmit}
          >
            <TextInput id="name" placeholder="choose a nickname"/><button>set</button>
          </Form>
        )}
      </div>
    );
  }
}

export default App;
