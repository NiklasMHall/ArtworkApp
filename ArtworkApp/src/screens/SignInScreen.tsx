import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { authService } from '../services/authService';


type SignInScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'SignIn'>;
};

const SignInScreen: React.FC<SignInScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
 

  const handleSignIn = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await authService.signIn(email, password);
    } catch (error: any) {
      let errorMessage = 'Failed to sign in';
      
      if (error.message.includes('user-not-found')) {
        errorMessage = 'No account found with this email';
      } else if (error.message.includes('wrong-password')) {
        errorMessage = 'Incorrect password';
      } else if (error.message.includes('invalid-email')) {
        errorMessage = 'Invalid email address';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

 
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to ArtVista</Text>
      
      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        mode="outlined"
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        mode="outlined"
        style={styles.input}
        secureTextEntry
      />
      
      {error ? <Text style={styles.error}>{error}</Text> : null}
      
      <Button 
        mode="contained" 
        onPress={handleSignIn}
        loading={loading}
        style={styles.button}
      >
        Sign In
      </Button>

      <Button 
        mode="text" 
        onPress={() => navigation.navigate('Signup')}
        style={styles.linkButton}
      >
        Don't have an account? Sign Up
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    marginBottom: 12,
  },
  button: {
    marginTop: 16,
  },
  linkButton: {
    marginTop: 8,
  },
  error: {
    color: 'red',
    marginBottom: 12,
    textAlign: 'center',
  },
});

export default SignInScreen;