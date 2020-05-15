import React, { Component } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, TextInput, Button } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import axios from 'axios';

export default class Accordian extends Component {

  constructor(props) {
    super(props);
    this.state = {
      data: props.data,
      id: props.id,
      expanded: false,
      effect: '',
      allergy: ''
    }
    this.handleEffectChange = this.handleEffectChange.bind(this);
    this.updateFood = this.updateFood.bind(this);
    this.handleOnPress = this.handleOnPress.bind(this);
    this.getFromDatabase = this.getFromDatabase.bind(this);
  }

  render() {
    let allergy = this.state.allergy !== '' ? this.state.allergy : '';
    let sentence = this.state.allergy ? `Ingredients that may make you ${allergy}:` : '';
    let list = this.state.allergy ? 'canola\nsugar\nmilk' : '';
    return (
      <View>
        <TouchableOpacity style={styles.row} onPress={() => this.toggleExpand()}>
          <Text style={[styles.title, styles.font]}>{this.props.title}</Text>
          <Icon name={this.state.expanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} size={30} color='white' />
        </TouchableOpacity>
        <View style={styles.parentHr} />
        {
          this.state.expanded &&
          <View style={styles.child}>
            <Text style={styles.titleBlack}>Ingredients:</Text>
            <Text>{this.props.data.sort().join(', ')}</Text>

          <View style={styles.effectInput}>
            <TextInput placeholder="Effect" value={this.state.effect} onChangeText={this.handleEffectChange} autoCapitalize="none" style={styles.textInput}></TextInput>
            <Icon style={styles.check} name="check" size={30} color='black' onPress={this.handleOnPress}/>
          </View>

            <Text style={styles.titleBlack}>{sentence}</Text> 
          </View>
        }
      </View>
    )
  }

  componentDidMount() {
    //console.log(this.state.id)
    this.getFromDatabase(this.state.id)
  }

  getFromDatabase(id) { 
    axios.get('http://localhost:3004/api/foods', { 
      params: {
        id: id
      }
    }) 
    .then(response => {
      console.log(response.data[0].effect)
      this.setState({allergy: response.data[0].effect})
    })
    .catch(error => {
      console.log(error)
    })
  };

  handleEffectChange(text) { 
    this.setState({ effect: text })
  };

  handleOnPress = async () => {
      await this.updateFood() 
  }

  toggleExpand() { 
    this.setState({ expanded: !this.state.expanded })
  }

  updateFood() {
    const effect = this.state.effect;
    const foodId = this.state.id; 
    // console.log(effect, foodId)
    axios.put('http://localhost:3004/api/foods', {
      effect: effect,
      foodId: foodId
    })
      .then(response => {
        // console.log(response.data)
        this.setState({allergy: response.data.effect})
        //this.getFromDatabase()
      })
      .catch(error => {
        console.log(error)
      })
  }

}

const styles = StyleSheet.create({
  titleBlack: {
    fontWeight: 'bold',
    paddingBottom: 5,
    paddingTop: 5
  },
  check: {
    paddingLeft: 10
  },
  textInput: {
    flex: 1,
    width: 50,
    height: 30,
    paddingLeft: 10,
    backgroundColor: '#f8f8f8'
  },
  effectInput: {
    flex: 1,
    flexDirection: 'row'
  },
  childHeader: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 56,
    paddingLeft: 25,
    paddingRight: 18,
    alignItems: 'center',
    backgroundColor: '#669999',
  },
  parentHr: {
    height: 1,
    color: 'white',
    width: '100%'
  },
  child: {
    backgroundColor: '#cadde0',
    padding: 16,
  }

});