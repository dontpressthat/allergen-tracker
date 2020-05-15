import React, { Component, useState } from 'react';
import { ActivityIndicator, Button, Alert, Modal, Clipboard, Image, Share, StatusBar, StyleSheet, Text, TextInput, TouchableHighlight, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

class UploadPhoto extends Component {
  constructor(props) {
    super(props);

    this.state = {
      image: null,
      uploading: false,
      ingredients: null,
      foodName: '',
      modalVisible: false,
      setModalVisible: false
    }

    this.uploadImage = this.uploadImage.bind(this);
    this.getTextFromPhoto = this.getTextFromPhoto.bind(this);
    this.postToDatabase = this.postToDatabase.bind(this);
    this.handleFoodName = this.handleFoodName.bind(this);
    this.clearText = this.clearText.bind(this);
  };

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
      this.clearText();
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
        // this.clearText();
        this.setState({ ingredients: null, image: null })
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

  render() {
    let { image } = this.state;

    if (image) {
      this.getTextFromPhoto(image);
    }

    return (
      <View style={styles.container}>
        <StatusBar barStyle="default" />

        <TextInput name="foodName" style={styles.textField} placeholder="What are you eating?" onChangeText={this.handleFoodName} ref={input => { this.textInput = input }} value={this.state.foodName}></TextInput>

        <Button
          onPress={(this.state.foodName ? this.choosePhoto : () => { alert('Please enter the food name') })}
          title="Choose Photo"
        />

        {this.renderPhoto()}
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

export default UploadPhoto;