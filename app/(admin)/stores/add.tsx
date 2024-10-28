import React, { useState } from 'react';
import { Stack } from 'expo-router';
import { StyleSheet, ScrollView, View } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { ThemedView } from '@/components/ThemedView';
import { Typography } from '@/components/ui/typography';
import * as Location from 'expo-location';

interface StoreForm {
  name: string;
  address: string;
  image: string;
  coordinates: {
    latitude: number;
    longitude: number;
  } | null;
}

export default function AddStoreScreen() {
  const [form, setForm] = useState<StoreForm>({
    name: '',
    address: '',
    image: '',
    coordinates: null,
  });
  const [loading, setLoading] = useState(false);

  const getCoordinates = async () => {
    try {
      setLoading(true);
      const location = await Location.geocodeAsync(form.address);
      
      if (location && location[0]) {
        setForm(prev => ({
          ...prev,
          coordinates: {
            latitude: location[0].latitude,
            longitude: location[0].longitude,
          }
        }));
      }
    } catch (error) {
      console.error('Error getting coordinates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      if (!form.coordinates) {
        await getCoordinates();
      }

      // Here you would typically make an API call to save the store
      // For now, we'll just log the form data
      console.log('Store data:', form);
      
      // Reset form after successful submission
      setForm({
        name: '',
        address: '',
        image: '',
        coordinates: null,
      });
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen 
        options={{ 
          headerTitle: "Add New Store",
          headerStyle: {
            backgroundColor: '#FFFFFF',
          },
        }} 
      />
      <ThemedView style={styles.container}>
        <ScrollView style={styles.form}>
          <Typography variant="h2" style={styles.title}>
            Add New Store
          </Typography>
          
          <TextInput
            label="Store Name"
            value={form.name}
            onChangeText={(text) => setForm(prev => ({ ...prev, name: text }))}
            style={styles.input}
            mode="outlined"
          />
          
          <TextInput
            label="Address"
            value={form.address}
            onChangeText={(text) => setForm(prev => ({ ...prev, address: text }))}
            style={styles.input}
            mode="outlined"
            multiline
          />
          
          <TextInput
            label="Image URL"
            value={form.image}
            onChangeText={(text) => setForm(prev => ({ ...prev, image: text }))}
            style={styles.input}
            mode="outlined"
          />

          <View style={styles.coordinates}>
            <Typography variant="p">
              Coordinates: {form.coordinates ? 
                `${form.coordinates.latitude}, ${form.coordinates.longitude}` : 
                'Not set'}
            </Typography>
            <Button 
              mode="contained-tonal"
              onPress={getCoordinates}
              loading={loading}
              style={styles.geocodeButton}
            >
              Get Coordinates
            </Button>
          </View>

          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={loading}
            style={styles.submitButton}
          >
            Add Store
          </Button>
        </ScrollView>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  form: {
    padding: 16,
  },
  title: {
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  coordinates: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    elevation: 2,
  },
  geocodeButton: {
    marginTop: 8,
  },
  submitButton: {
    marginTop: 16,
  },
});

