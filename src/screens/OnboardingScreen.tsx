import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  Dimensions,
  FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';

// Get screen dimensions
const { width } = Dimensions.get('window');

// Define onboarding slides
const slides = [
  {
    id: '1',
    title: 'Welcome to NFC Wallet',
    description: 'The secure way to manage and spend your crypto with physical NFC cards.',
    image: '📱' // In a real app, this would be an actual image
  },
  {
    id: '2',
    title: 'Offline Transactions',
    description: 'Send and receive crypto even without internet. Perfect for everyday use.',
    image: '📶' // In a real app, this would be an actual image
  },
  {
    id: '3',
    title: 'Secure by Design',
    description: 'Your keys, your crypto. Full control with maximum security.',
    image: '🔐' // In a real app, this would be an actual image
  }
];

const OnboardingScreen = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigation = useNavigation();
  const { isDark } = useTheme();
  
  // Handle skip button press
  const handleSkip = () => {
    navigation.navigate('CreateWallet' as never);
  };
  
  // Handle next button press
  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      // Go to next slide
      setCurrentIndex(currentIndex + 1);
    } else {
      // Go to create wallet screen
      navigation.navigate('CreateWallet' as never);
    }
  };
  
  // Render slide item
  const renderItem = ({ item, index }: { item: typeof slides[0], index: number }) => {
    return (
      <View style={styles.slideContainer}>
        <View style={styles.imageContainer}>
          <Text style={styles.imageText}>{item.image}</Text>
        </View>
        
        <Text style={[styles.title, isDark && styles.titleDark]}>{item.title}</Text>
        <Text style={[styles.description, isDark && styles.descriptionDark]}>{item.description}</Text>
      </View>
    );
  };
  
  // Render pagination dots
  const renderPagination = () => {
    return (
      <View style={styles.paginationContainer}>
        {slides.map((_, index) => (
          <View 
            key={index} 
            style={[
              styles.paginationDot, 
              index === currentIndex && styles.paginationDotActive,
              isDark && styles.paginationDotDark,
              index === currentIndex && isDark && styles.paginationDotActiveDark
            ]} 
          />
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <View style={styles.skipContainer}>
        <TouchableOpacity onPress={handleSkip}>
          <Text style={[styles.skipText, isDark && styles.skipTextDark]}>Skip</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={slides}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        keyExtractor={(item) => item.id}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
      />
      
      {renderPagination()}
      
      <View style={styles.bottomContainer}>
        <TouchableOpacity 
          style={[styles.button, isDark && styles.buttonDark]} 
          onPress={handleNext}
        >
          <Text style={styles.buttonText}>
            {currentIndex < slides.length - 1 ? 'Next' : 'Get Started'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  containerDark: {
    backgroundColor: '#1F2937',
  },
  skipContainer: {
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  skipText: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '500',
  },
  skipTextDark: {
    color: '#60A5FA',
  },
  slideContainer: {
    width,
    alignItems: 'center',
    padding: 20,
  },
  imageContainer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  imageText: {
    fontSize: 80,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  titleDark: {
    color: '#F9FAFB',
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  descriptionDark: {
    color: '#9CA3AF',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  paginationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 5,
  },
  paginationDotActive: {
    backgroundColor: '#3B82F6',
    width: 20,
  },
  paginationDotDark: {
    backgroundColor: '#4B5563',
  },
  paginationDotActiveDark: {
    backgroundColor: '#60A5FA',
  },
  bottomContainer: {
    padding: 20,
    marginTop: 'auto',
  },
  button: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDark: {
    backgroundColor: '#2563EB',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default OnboardingScreen;