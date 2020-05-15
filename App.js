import React, { Component, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Clipboard, Image, Share, StatusBar, StyleSheet, Text, TextInput, TouchableHighlight, View, ScrollView, Button } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import Accordian from './Components/Accordian.js';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      image: null,
      uploading: false,
      ingredients: null,
      foodName: '',
      accordianItems: []
    }

    this.uploadImage = this.uploadImage.bind(this);
    this.getTextFromPhoto = this.getTextFromPhoto.bind(this);
    this.postToDatabase = this.postToDatabase.bind(this);
    this.handleFoodName = this.handleFoodName.bind(this);
    this.clearText = this.clearText.bind(this);
    this.getAllFoods = this.getAllFoods.bind(this);
    this.renderAccordians = this.renderAccordians.bind(this); 
  };

  componentDidMount() {
    this.getAllFoods();
  }

  componentDidUpdate() {
    if (this.state.image !== null) {
      this.getAllFoods();
    }
  }

  getAllFoods() {
    axios.get('http://localhost:3004/api/foods')
      .then((response) => {
        // console.log(response.data)
        this.setState({
          accordianItems: response.data
        })
      })
      .catch(error => {
        console.log(error)
      })
  }

  choosePhoto = async () => {
    const options = {};
    const photo = await ImagePicker.launchImageLibraryAsync(options);

    let uploadResponse;
    let uploadResult;

    try {
      this.setState({
        uploading: true,
        foodName: this.state.foodName
      });

      if (!photo.cancelled) {
        uploadResponse = await this.uploadImage(photo.uri);
        uploadResult = await uploadResponse.json();

        this.setState({
          image: uploadResult.location
        });
      }
    } catch (error) {
      console.log(error);
      alert('Upload failed, please try again.');
    } finally {
      this.setState({
        uploading: false
      });
      // this.clearText();
    }
  };

  uploadImage = async (uri) => {
    let apiUrl = 'http://localhost:3004/uploadToAws';

    let uriParts = uri.split('.');
    let fileExtension = uriParts[uriParts.length - 1];

    let formData = new FormData();
    formData.append('photo', {
      uri,
      name: `photo.${fileExtension}`,
      type: `image/${fileExtension}`,
    });

    let options = {
      method: 'POST',
      body: formData,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'multipart/form-data',
      },
    };

    return fetch(apiUrl, options);
  };

  getTextFromPhoto(image) {
    axios.get('http://localhost:3004/api/google', {
      params: {
        imageUri: image
      }
    })
      .then(response => {
        if (this.state.ingredients !== response.data) {
          this.setState({
            ingredients: response.data,
          });
          this.cleanText(response.data)
        }
        if (!response.data) {
          this.setState({
            ingredients: null
          })
        }
      })
      .catch(error => {
        console.log(error)
      });
  }

  cleanText(words) {
    axios.get('http://localhost:3004/api/dictionary', {
      params: {
        words: words
      }
    })
      .then(response => {
        //console.log(response.data)
        this.postToDatabase(this.state.foodName, response.data);
      })
      .then(() => {
        this.clearText();
        setTimeout(() => { this.setState({ ingredients: null, image: null }) }, 0)
      })
      .catch(error => {
        console.log(error)
      })
  };

  postToDatabase(food, ingredients) {
    //console.log(food, ingredients);
    axios.post('http://localhost:3004/api/foods', {
      food: food,
      ingredientsArray: ingredients
    })
      .then(response => {
        // console.log(response)
      })
      .catch(error => {
        console.log(error)
      })
  }

  handleFoodName(text) {
    this.setState({ foodName: text })
  }

  clearText() {
    this.setState({ foodName: '' })
  }

  renderAccordians() {
    const items = [];
    for (let item of this.state.accordianItems) {
      items.push(
        <Accordian
          title={item.foodName}
          data={item.ingredients}
          id={item._id}
        />
      );
    }
    return items;
  }


  render() {
    let { image } = this.state;

    if (image) {
      this.getTextFromPhoto(image);
    }

    return (
      <View style={styles.container}>
        <StatusBar barStyle="default" />

        <ScrollView style={styles.accordianContainer}>
          <View>
            {this.renderAccordians()}
          </View>
        </ScrollView>

        <View style={styles.bottom}>
          <View style={styles.entryForm}>

            <TextInput name="foodName" style={styles.textField} placeholder="What are you eating?" onChangeText={this.handleFoodName} ref={input => { this.textInput = input }} value={this.state.foodName}></TextInput>

            <Button
              onPress={(this.state.foodName ? this.choosePhoto : () => { alert('Please enter the food name') })}
              title="Choose Photo"
            />
          </View>
        </View>

        {/* this.renderPhoto() */}
        {console.log(this.state.accordianItems)}
        {this.uploadSpinner()}
      </View>
    );
  }

  uploadSpinner = () => {
    if (this.state.uploading) {
      return (
        <View
          style={[StyleSheet.absoluteFill, styles.uploadSpinner]}>
          <ActivityIndicator color="#fff" size="large" />
        </View>
      );
    }
  };

  renderPhoto = () => {
    let { image } = this.state;

    if (!image) {
      return;
    }

    return (
      <View
        style={styles.renderContainer}>
        <View
          style={styles.photoContainer}>
          <Image source={{ uri: image }} style={styles.renderedPhoto} resizeMode="contain" />
        </View>
      </View>
    );
  };
}

const styles = StyleSheet.create({
  accordianContainer: {
    flex: 1,
    paddingTop: 100,
    backgroundColor: 'white',
    width: '100%'
  },
  bottom: {
    flex: 1,
    maxHeight: 120,
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'lightgray',
    marginBottom: 0
  },
  entryForm: {
    flex: 1,
    justifyContent: 'flex-end',
    marginBottom: 30
  },
  textField: {
    width: 200,
    height: 30,
    backgroundColor: 'white',
    borderRadius: 5,
    textAlign: 'center'
  },
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#f6f6f6'
  },
  uploadSpinner: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
  },
  renderContainer: {
    borderRadius: 3,
    elevation: 2,
    marginTop: 30,
    shadowColor: 'rgba(0,0,0,1)',
    shadowOpacity: 0.2,
    shadowOffset: {
      height: 4,
      width: 4,
    },
    shadowRadius: 5,
    width: 250,
  },
  photoContainer: {
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    overflow: 'hidden',
  },
  renderedPhoto: {
    height: undefined,
    maxHeight: 250,
    width: '100%',
    aspectRatio: 1
  }
});

export default App;